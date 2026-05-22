import React from 'react';
import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';

const PromptCard = ({ 
  prompt_id, 
  title, 
  description, 
  username, 
  category_name, 
  average_rating, 
  created_date 
}) => {
  const safeTitle = title || 'Untitled Prompt';
  const safeUsername = username || 'Unknown';
  const safeCategory = category_name || 'General';
  const truncateDesc = (text) => {
    if (!text) return '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  const formattedDate = created_date 
    ? new Date(created_date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Unknown';

  return (
    <article className="prompt-card">
      {/* Header: Category badge */}
      <div className="prompt-card-header">
        <span className="category-badge">{safeCategory}</span>
      </div>

      {/* Body: Title + description */}
      <div className="prompt-card-body">
        <Link to={`/prompt/${prompt_id}`} className="prompt-card-title-link">
          <h2 className="prompt-card-title">{safeTitle}</h2>
        </Link>
        <p className="prompt-card-desc">{truncateDesc(description)}</p>
      </div>

      {/* Meta: Author + date */}
      <div className="prompt-card-meta">
        <div className="prompt-card-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{safeUsername}</span>
        </div>
        <span className="prompt-card-meta-sep" aria-hidden="true">·</span>
        <div className="prompt-card-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Footer: Rating + CTA */}
      <div className="prompt-card-footer">
        <RatingStars rating={average_rating} />
        <Link to={`/prompt/${prompt_id}`} className="btn-primary btn-small">
          View Details
        </Link>
      </div>
    </article>
  );
};

export default PromptCard;
