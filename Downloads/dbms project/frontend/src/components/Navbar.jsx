import React from 'react';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/* ── Lucide-style SVG Icons (consistent 18×18, strokeWidth 1.8) ── */
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/* ── Brand Logo ── */
const BrandLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#brand-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <defs>
      <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
    </defs>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
    <polyline points="7.5 19.79 7.5 14.6 3 12" />
    <polyline points="21 12 16.5 14.6 16.5 19.79" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { to: '/', label: 'Home', icon: <HomeIcon /> },
    { to: '/create', label: 'Create', icon: <PlusIcon /> },
    { to: '/profile/1', label: 'Profile', icon: <UserIcon />, match: '/profile' },
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container nav-content">

        {/* ── Brand ── */}
        <Link to="/" className="brand" aria-label="PromptHub Home">
          <span className="brand-icon">
            <BrandLogo />
          </span>
          <span className="brand-text">PromptHub</span>
        </Link>

        {/* ── Controls: Search + Links ── */}
        <div className="nav-controls">

          {/* Search */}
          <div className="search-wrapper">
            <span className="search-icon-wrapper" aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search prompts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              id="nav-search-input"
              aria-label="Search prompts"
            />
            <kbd className="search-kbd" aria-hidden="true">↵</kbd>
          </div>

          {/* Navigation Links */}
          <div className="nav-links">
            {navItems.map(({ to, label, icon, match }) => (
              <Link
                key={to}
                to={to}
                className={isActive(match || to) ? 'nav-link-active' : ''}
                aria-current={isActive(match || to) ? 'page' : undefined}
              >
                {icon}
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
