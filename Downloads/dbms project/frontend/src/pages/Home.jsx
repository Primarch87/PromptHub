import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import PromptCard from '../components/PromptCard';
import Loader from '../components/Loader';

const Home = () => {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories.');
    }
  };

  const fetchPrompts = async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = categoryId ? `/prompts/category/${categoryId}` : '/prompts';
      const response = await api.get(endpoint);
      setPrompts(response.data);
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
      setError('Failed to load prompts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPrompts(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setSelectedCategory(val === '' ? '' : Number(val));
  };

  const selectedCategoryName = selectedCategory
    ? categories.find(c => c.category_id === selectedCategory)?.category_name
    : null;

  return (
    <div className="page">
      <div className="container">

        {/* ── HERO ── */}
        <section className="home-hero">
          <div className="home-hero-glow" aria-hidden="true" />
          <div className="home-hero-content">
            <div className="home-hero-eyebrow">
              <span className="home-hero-eyebrow-dot" aria-hidden="true" />
              AI Prompt Library
            </div>
            <h1 className="home-hero-title">
              Discover&nbsp;&amp;&nbsp;Share
              <br />
              <span className="home-hero-gradient">Expert Prompts</span>
            </h1>
            <p className="home-hero-sub">
              Browse a curated collection of high-performance AI prompts.
              Rate, discuss, and build on the best ideas from the community.
            </p>
          </div>
        </section>

        {/* ── CONTROLS BAR ── */}
        <div className="home-controls">
          <div className="home-filter-group">
            {/* Filter icon */}
            <svg
              className="home-filter-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>

            <label htmlFor="category-filter" className="home-filter-label">
              Category
            </label>

            <div className="home-select-wrapper">
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="home-select"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
              {/* chevron */}
              <svg
                className="home-select-chevron"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Result count */}
          {!loading && !error && (
            <div className="home-count-badge">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>
                <strong>{prompts.length}</strong>{' '}
                {prompts.length === 1 ? 'Prompt' : 'Prompts'}
                {selectedCategoryName ? ` in ${selectedCategoryName}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="home-state-box home-state-error" role="alert">
            <svg
              className="home-state-icon"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2 className="home-state-title">Something went wrong</h2>
            <p className="home-state-desc">{error}</p>
            <button
              className="btn-secondary"
              onClick={() => fetchPrompts(selectedCategory)}
            >
              Try again
            </button>
          </div>
        ) : prompts.length === 0 ? (
          <div className="home-state-box home-state-empty">
            <svg
              className="home-state-icon"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <h2 className="home-state-title">No prompts found</h2>
            <p className="home-state-desc">
              {selectedCategoryName
                ? `There are no prompts in "${selectedCategoryName}" yet.`
                : 'No prompts available right now.'}
            </p>
            {selectedCategory && (
              <button
                className="btn-secondary"
                onClick={() => setSelectedCategory('')}
              >
                View all prompts
              </button>
            )}
          </div>
        ) : (
          <div className="prompt-grid">
            {prompts.map(prompt => (
              <PromptCard key={prompt.prompt_id} {...prompt} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;
