import React from 'react';

const StarIcon = ({ filled }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`rating-star-icon ${filled ? 'rating-star-filled' : 'rating-star-empty'}`}
    aria-hidden="true"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const RatingStars = ({ rating = 0, maxStars = 5 }) => {
  const safeRating = Math.max(0, Math.min(Number(rating) || 0, maxStars));
  const roundedRating = Math.round(safeRating);
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    if (i <= roundedRating) {
      stars.push(<StarIcon key={i} filled />);
    } else {
      stars.push(<StarIcon key={i} filled={false} />);
    }
  }

  return (
    <div
      className="rating-stars"
      role="img"
      aria-label={`Rating: ${safeRating.toFixed(1)} out of ${maxStars} stars`}
    >
      <div className="rating-stars-row">
        {stars}
      </div>
      <span className="rating-value">{safeRating.toFixed(1)}</span>
    </div>
  );
};

export default RatingStars;
