import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import PromptCard from '../components/PromptCard';
import Loader from '../components/Loader';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!q.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/prompts/search', {
          params: { q: q.trim() }
        });
        setResults(response.data);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [q]);

  return (
    <div className="page container">
      
      {/* ── HEADER ── */}
      <header className="sr-header">
        {q ? (
          <h1 className="sr-title">
            <svg className="sr-title-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Results for <span className="sr-query-highlight">"{q}"</span>
          </h1>
        ) : (
          <h1 className="sr-title">
            <svg className="sr-title-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search Prompts
          </h1>
        )}

        {q && !loading && !error && (
          <div className="sr-count-row">
            <span className="sr-count-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <strong>{results?.length || 0}</strong> {results?.length === 1 ? 'result' : 'results'} found
            </span>
          </div>
        )}
      </header>

      {/* ── CONTENT ── */}
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="sr-state-box error" role="alert">
          <svg className="sr-state-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2 className="sr-state-title">Something went wrong</h2>
          <p className="sr-state-desc">{error}</p>
        </div>
      ) : !q.trim() ? (
        <div className="sr-state-box">
          <svg className="sr-state-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          <h2 className="sr-state-title">Start searching</h2>
          <p className="sr-state-desc">Enter a keyword in the navigation bar above to discover high-quality AI prompts.</p>
        </div>
      ) : results && results.length === 0 ? (
        <div className="sr-state-box">
          <svg className="sr-state-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          <h2 className="sr-state-title">No prompts found</h2>
          <p className="sr-state-desc">
            We couldn't find any prompts matching <span style={{fontWeight: 600, color: 'var(--text-primary)'}}>"{q}"</span>. Try using different keywords or checking for typos.
          </p>
        </div>
      ) : (
        <div className="prompt-grid">
          {results.map(prompt => (
            <PromptCard key={prompt.prompt_id} {...prompt} />
          ))}
        </div>
      )}

    </div>
  );
};

export default SearchResults;
