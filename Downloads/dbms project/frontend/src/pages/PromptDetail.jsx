import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import RatingStars from '../components/RatingStars';
import TagBadge from '../components/TagBadge';
import Loader from '../components/Loader';

const formatDate = (date) => {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

/* Derive initials for avatar */
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const PromptDetail = () => {
  const { id } = useParams();
  const promptId = Number(id);

  const [prompt, setPrompt] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [comments, setComments] = useState([]);
  const [tags, setTags] = useState([]);
  const [outputs, setOutputs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [ratingMessage, setRatingMessage] = useState({ text: '', type: '' });
  const [hoveredStar, setHoveredStar] = useState(0);

  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const [copyLabel, setCopyLabel] = useState('Copy');

  /* ── DATA FETCHING (unchanged) ── */
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [promptRes, ratingsRes, commentsRes, tagsRes, outputsRes] = await Promise.all([
        api.get(`/prompts/${promptId}`),
        api.get(`/ratings/prompt/${promptId}`),
        api.get(`/comments/prompt/${promptId}`),
        api.get(`/tags/prompt/${promptId}`),
        api.get(`/ai-outputs/prompt/${promptId}`)
      ]);

      setPrompt(promptRes.data);
      setRatings(ratingsRes.data);
      setComments(commentsRes.data);
      setTags(tagsRes.data);
      setOutputs(outputsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load prompt details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/prompt/${promptId}`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (Number.isInteger(promptId) && promptId > 0) {
      fetchData();
    } else {
      setError('Invalid prompt ID.');
      setLoading(false);
    }
  }, [promptId]);

  /* ── HANDLERS (unchanged logic) ── */
  const handleCopy = () => {
    if (prompt && prompt.prompt_text) {
      navigator.clipboard?.writeText(prompt.prompt_text)
        .then(() => {
          setCopyLabel('Copied!');
          setTimeout(() => setCopyLabel('Copy'), 2000);
        })
        .catch(() => {
          setCopyLabel('Copy failed');
          setTimeout(() => setCopyLabel('Copy'), 2000);
        });
    }
  };

  const handleRate = async (value) => {
    try {
      await api.post('/ratings', { prompt_id: promptId, user_id: 1, rating_value: value });
      setRatingMessage({ text: 'Rating submitted successfully!', type: 'success' });

      const [promptRes, ratingsRes] = await Promise.all([
        api.get(`/prompts/${promptId}`),
        api.get(`/ratings/prompt/${promptId}`)
      ]);
      setPrompt(promptRes.data);
      setRatings(ratingsRes.data);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setRatingMessage({ text: 'You have already rated this prompt.', type: 'error' });
      } else {
        setRatingMessage({ text: 'Failed to submit rating.', type: 'error' });
      }
    }
  };

  const submitComment = async (e, parentId = null) => {
    e.preventDefault();
    const text = parentId ? replyText : commentText;
    if (!text.trim()) return;

    try {
      await api.post('/comments', {
        prompt_id: promptId,
        user_id: 1,
        comment_text: text,
        parent_comment_id: parentId
      });

      if (parentId) {
        setReplyText('');
        setReplyingTo(null);
      } else {
        setCommentText('');
      }

      fetchComments();
    } catch (err) {
      console.error(err);
      alert('Failed to post comment');
    }
  };

  /* ── EARLY RETURNS ── */
  if (loading) return (
    <div className="page">
      <div className="container">
        <Loader />
      </div>
    </div>
  );

  if (error) return (
    <div className="page">
      <div className="container">
        <div className="pd-error-box" role="alert">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="pd-error-text">{error}</p>
          <Link to="/" className="btn-secondary">Back to Home</Link>
        </div>
      </div>
    </div>
  );

  if (!prompt) return null;

  /* ── Quality badge helper ── */
  const qualityBadge = (val) => {
    const n = Number(val);
    if (!val || isNaN(n)) return <span className="pd-quality-none">—</span>;
    if (n >= 4) return <span className="pd-quality-badge pd-quality-high">{n}</span>;
    if (n >= 3) return <span className="pd-quality-badge pd-quality-mid">{n}</span>;
    return <span className="pd-quality-badge pd-quality-low">{n}</span>;
  };

  return (
    <div className="page">
      <div className="container">

        {/* ── BREADCRUMB ── */}
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="pd-breadcrumb-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Browse Prompts
          </Link>
        </nav>

        {/* ── PAGE HEADER ── */}
        <header className="pd-header">
          <div className="pd-header-main">
            <h1 className="pd-title">{prompt.title || 'Untitled Prompt'}</h1>
            <div className="pd-meta">
              <span className="category-badge">{prompt.category_name || 'General'}</span>
              <span className="pd-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {prompt.username || 'Unknown'}
              </span>
              <span className="pd-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formatDate(prompt.created_date)}
              </span>
              <span className={`pd-visibility-badge ${prompt.is_public ? 'pd-visibility-public' : 'pd-visibility-private'}`}>
                {prompt.is_public ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
                {prompt.is_public ? 'Public' : 'Private'}
              </span>
            </div>
          </div>
          <div className="pd-header-rating">
            <RatingStars rating={prompt.average_rating || 0} />
            <span className="pd-rating-count">
              {ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}
            </span>
          </div>
        </header>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="pd-layout">

          {/* ── MAIN COLUMN ── */}
          <main className="pd-main">

            {/* Prompt Text */}
            <section className="pd-section" aria-labelledby="prompt-text-heading">
              <div className="pd-section-header">
                <h2 id="prompt-text-heading" className="pd-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Prompt Text
                </h2>
                <button
                  onClick={handleCopy}
                  className={`pd-copy-btn ${copyLabel === 'Copied!' ? 'pd-copy-btn--success' : ''}`}
                  aria-label="Copy prompt text to clipboard"
                >
                  {copyLabel === 'Copied!' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                  {copyLabel}
                </button>
              </div>
              <pre className="prompt-text-box">{prompt.prompt_text}</pre>
            </section>

            {/* AI Outputs Table */}
            <section className="pd-section" aria-labelledby="ai-outputs-heading">
              <div className="pd-section-header">
                <h2 id="ai-outputs-heading" className="pd-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  AI Outputs
                </h2>
                {outputs.length > 0 && (
                  <span className="pd-count-chip">{outputs.length}</span>
                )}
              </div>

              {outputs && outputs.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-cell">AI Model</th>
                        <th className="table-cell">Output Preview</th>
                        <th className="table-cell">Quality</th>
                        <th className="table-cell">Response Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outputs.map(out => {
                        const text = out.output_text || '';
                        const preview = text.length > 100 ? text.slice(0, 100) + '…' : text;
                        return (
                          <tr key={out.output_id} className="table-row">
                            <td className="table-cell">
                              <span className="pd-model-chip">{out.ai_model_used}</span>
                            </td>
                            <td className="table-cell pd-output-preview">{preview}</td>
                            <td className="table-cell">{qualityBadge(out.quality_rating)}</td>
                            <td className="table-cell">
                              {out.response_time_ms
                                ? <span className="pd-time-chip">{out.response_time_ms} ms</span>
                                : <span className="pd-quality-none">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="pd-empty-state">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  <p>No AI outputs recorded yet.</p>
                </div>
              )}
            </section>

            {/* Comments */}
            <section className="pd-section" aria-labelledby="comments-heading">
              <div className="pd-section-header">
                <h2 id="comments-heading" className="pd-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Discussion
                </h2>
                {comments.length > 0 && (
                  <span className="pd-count-chip">{comments.length}</span>
                )}
              </div>

              {/* Comment list */}
              {comments && comments.length > 0 ? (
                <div className="pd-comment-list">
                  {comments.map(comment => (
                    <div key={comment.comment_id} className="pd-comment">
                      <div className="pd-comment-avatar" aria-hidden="true">
                        {getInitials(comment.username)}
                      </div>
                      <div className="pd-comment-body">
                        <div className="pd-comment-header">
                          <strong className="pd-comment-author">{comment.username || 'Unknown'}</strong>
                          <span className="pd-comment-date">{formatDate(comment.created_date)}</span>
                        </div>
                        <p className="pd-comment-text">{comment.comment_text}</p>

                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.comment_id ? null : comment.comment_id)}
                          className="pd-reply-btn"
                          aria-expanded={replyingTo === comment.comment_id}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="9 17 4 12 9 7" />
                            <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                          </svg>
                          {replyingTo === comment.comment_id ? 'Cancel' : 'Reply'}
                        </button>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="pd-replies">
                            {comment.replies.map(reply => (
                              <div key={reply.comment_id} className="pd-reply">
                                <div className="pd-reply-avatar" aria-hidden="true">
                                  {getInitials(reply.username)}
                                </div>
                                <div className="pd-reply-body">
                                  <div className="pd-comment-header">
                                    <strong className="pd-comment-author">{reply.username || 'Unknown'}</strong>
                                    <span className="pd-comment-date">{formatDate(reply.created_date)}</span>
                                  </div>
                                  <p className="pd-comment-text">{reply.comment_text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply form */}
                        {replyingTo === comment.comment_id && (
                          <form
                            onSubmit={(e) => submitComment(e, comment.comment_id)}
                            className="pd-reply-form"
                          >
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply…"
                              className="input-textarea"
                              rows={3}
                              required
                              aria-label="Reply text"
                            />
                            <button type="submit" className="btn-primary btn-small">
                              Post Reply
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pd-empty-state">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}

              {/* Add comment form */}
              <div className="pd-add-comment">
                <h3 className="pd-add-comment-title">Leave a Comment</h3>
                <form onSubmit={(e) => submitComment(e, null)} className="pd-comment-form">
                  <label htmlFor="comment-input" className="pd-form-label">Your comment</label>
                  <textarea
                    id="comment-input"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="What do you think about this prompt?"
                    className="input-textarea input-large"
                    required
                    aria-label="Comment text"
                  />
                  <div className="pd-form-actions">
                    <button type="submit" className="btn-primary">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Post Comment
                    </button>
                  </div>
                </form>
              </div>
            </section>

          </main>

          {/* ── SIDEBAR ── */}
          <aside className="pd-sidebar">

            {/* Rate this prompt */}
            <div className="pd-sidebar-card">
              <h2 className="pd-sidebar-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Rate this Prompt
              </h2>
              <div
                className="pd-star-row"
                role="group"
                aria-label="Rate from 1 to 5 stars"
              >
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className={`pd-star-btn ${star <= hoveredStar ? 'pd-star-btn--active' : ''}`}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill={star <= hoveredStar ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                ))}
              </div>
              {ratingMessage.text && (
                <p className={`feedback-message ${ratingMessage.type}`}>
                  {ratingMessage.text}
                </p>
              )}
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="pd-sidebar-card">
                <h2 className="pd-sidebar-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="4" y1="9" x2="20" y2="9" />
                    <line x1="4" y1="15" x2="20" y2="15" />
                    <line x1="10" y1="3" x2="8" y2="21" />
                    <line x1="16" y1="3" x2="14" y2="21" />
                  </svg>
                  Tags
                </h2>
                <div className="pd-tags-row">
                  {tags.map(tag => (
                    <TagBadge key={tag.tag_id} tag_name={tag.tag_name} />
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="pd-sidebar-card">
              <h2 className="pd-sidebar-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Stats
              </h2>
              <dl className="pd-stats-list">
                <div className="pd-stat-row">
                  <dt className="pd-stat-label">Avg. Rating</dt>
                  <dd className="pd-stat-value">
                    {prompt.average_rating ? Number(prompt.average_rating).toFixed(1) : '—'}
                  </dd>
                </div>
                <div className="pd-stat-row">
                  <dt className="pd-stat-label">Total Ratings</dt>
                  <dd className="pd-stat-value">{ratings.length}</dd>
                </div>
                <div className="pd-stat-row">
                  <dt className="pd-stat-label">AI Outputs</dt>
                  <dd className="pd-stat-value">{outputs.length}</dd>
                </div>
                <div className="pd-stat-row">
                  <dt className="pd-stat-label">Comments</dt>
                  <dd className="pd-stat-value">{comments.length}</dd>
                </div>
              </dl>
            </div>

          </aside>
        </div>{/* end pd-layout */}

      </div>
    </div>
  );
};

export default PromptDetail;
