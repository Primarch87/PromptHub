import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import PromptCard from '../components/PromptCard';
import Loader from '../components/Loader';

const formatDate = (date) => {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const UserProfile = () => {
  const { userId } = useParams();
  const uid = Number(userId);

  const [user, setUser] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for tabs logic
  const [activeTab, setActiveTab] = useState('prompts'); // 'prompts' | 'bookmarks'

  useEffect(() => {
    const fetchData = async () => {
      if (!Number.isInteger(uid) || uid <= 0) {
        setError('Invalid User ID');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const [userRes, promptsRes, bookmarksRes] = await Promise.all([
          api.get(`/users/${uid}`),
          api.get(`/prompts/user/${uid}`),
          api.get(`/bookmarks/user/${uid}`)
        ]);

        setUser(userRes.data);
        setPrompts(promptsRes.data);
        setBookmarks(bookmarksRes.data);
      } catch (err) {
        console.error('Failed to load profile data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [uid]);

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await api.delete(`/bookmarks/${bookmarkId}`);
      setBookmarks(prev => prev.filter(b => b.bookmark_id !== bookmarkId));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      alert('Failed to remove bookmark');
    }
  };

  const getReputationStyle = (score) => {
    if (score > 100) return { bg: 'var(--color-success-bg)', text: 'var(--color-success)', border: 'rgba(52, 211, 153, 0.2)' };
    if (score >= 50) return { bg: 'var(--color-warning-bg)', text: 'var(--color-warning)', border: 'rgba(251, 191, 36, 0.2)' };
    return { bg: 'var(--bg-surface-3)', text: 'var(--text-secondary)', border: 'var(--border-default)' };
  };

  if (loading) return (
    <div className="page container">
      <Loader />
    </div>
  );
  
  if (error) return (
    <div className="page container">
      <div className="pd-error-box" role="alert">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="pd-error-text">{error}</p>
      </div>
    </div>
  );
  
  if (!user) return (
    <div className="page container">
      <div className="up-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <p className="up-empty-title">User not found</p>
      </div>
    </div>
  );

  const repStyle = getReputationStyle(user.reputation_score || 0);

  return (
    <div className="page container">
      
      {/* SECTION 1 - USER INFO HEADER */}
      <header className="up-header-card">
        <div className="up-avatar" aria-hidden="true">
          {getInitials(user.username)}
        </div>
        
        <div className="up-user-info">
          <div className="up-username-row">
            <h1 className="up-username">{user.username}</h1>
            {user.is_verified && (
              <span className="up-verified" title="Verified User" aria-label="Verified User">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
            )}
          </div>
          <span className="up-email">{user.email}</span>
        </div>
        
        {user.bio && <p className="up-bio">{user.bio}</p>}

        <div className="up-meta-row">
          <span className="up-meta-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Joined {formatDate(user.registration_date)}
          </span>
          <span 
            className="up-meta-pill up-rep-pill" 
            style={{ backgroundColor: repStyle.bg, color: repStyle.text, borderColor: repStyle.border }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Reputation: {user.reputation_score || 0}
          </span>
        </div>
      </header>

      {/* TABS NAVIGATION */}
      <nav className="up-tabs-wrapper" aria-label="Profile Sections">
        <div className="up-tabs" role="tablist">
          <button 
            role="tab"
            aria-selected={activeTab === 'prompts'}
            className={`up-tab-btn ${activeTab === 'prompts' ? 'active' : ''}`}
            onClick={() => setActiveTab('prompts')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Prompts Created
            <span className="up-tab-count">{prompts.length}</span>
          </button>
          
          <button 
            role="tab"
            aria-selected={activeTab === 'bookmarks'}
            className={`up-tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Bookmarks
            <span className="up-tab-count">{bookmarks.length}</span>
          </button>
        </div>
      </nav>

      {/* TAB CONTENT AREAS */}
      <main className="up-tab-content">
        
        {/* PROMPTS TAB */}
        {activeTab === 'prompts' && (
          <div role="tabpanel" aria-label="Prompts Created">
            {prompts && prompts.length > 0 ? (
              <div className="prompt-grid">
                {prompts.map(prompt => (
                  <PromptCard key={prompt.prompt_id} {...prompt} />
                ))}
              </div>
            ) : (
              <div className="up-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <h3 className="up-empty-title">No prompts created yet</h3>
                <p className="up-empty-desc">This user hasn't shared any prompts with the community.</p>
              </div>
            )}
          </div>
        )}

        {/* BOOKMARKS TAB */}
        {activeTab === 'bookmarks' && (
          <div role="tabpanel" aria-label="Bookmarks">
            {bookmarks && bookmarks.length > 0 ? (
              <div className="up-bookmark-list">
                {bookmarks.map(bookmark => (
                  <article key={bookmark.bookmark_id} className="up-bookmark-card">
                    <div className="up-bookmark-info">
                      <Link to={`/prompt/${bookmark.prompt_id}`} className="up-bookmark-title">
                        {bookmark.title || 'Untitled Prompt'}
                      </Link>
                      <span className="up-bookmark-date">
                        Saved on {formatDate(bookmark.bookmarked_date)}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleRemoveBookmark(bookmark.bookmark_id)}
                      className="up-bookmark-remove"
                      aria-label={`Remove bookmark for ${bookmark.title || 'Untitled Prompt'}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="up-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <h3 className="up-empty-title">No bookmarks found</h3>
                <p className="up-empty-desc">This user hasn't saved any prompts to their collection.</p>
              </div>
            )}
          </div>
        )}
        
      </main>

    </div>
  );
};

export default UserProfile;
