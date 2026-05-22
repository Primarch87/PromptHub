import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CreatePrompt = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    prompt_text: '',
    description: '',
    tags: '',
    is_public: true
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setMessage({ text: 'Failed to load categories.', type: 'error' });
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'radio' ? value === 'true' : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.prompt_text.trim()) newErrors.prompt_text = 'Prompt text is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // 1. Create prompt
      const promptRes = await api.post('/prompts', {
        user_id: 1, // Hardcoded per instructions
        category_id: Number(formData.category_id),
        title: formData.title,
        prompt_text: formData.prompt_text,
        description: formData.description,
        is_public: formData.is_public
      });

      const promptId = promptRes.data.prompt_id;

      if (!promptId) {
        throw new Error('Did not receive prompt ID from server');
      }

      // 2. Handle Tags
      if (formData.tags.trim()) {
        const rawTags = formData.tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
        const tagNames = [...new Set(rawTags)];

        // STEP A: Create all tags
        for (const tagName of tagNames) {
          try {
            await api.post('/tags', { tag_name: tagName });
          } catch (err) {
            // Ignore 409 Conflict (duplicate tag)
            if (err.response?.status !== 409) {
              console.error(`Error creating tag ${tagName}:`, err);
            }
          }
        }

        // STEP B & C: Fetch all tags ONCE, then assign
        try {
          const allTagsRes = await api.get('/tags');
          const allTags = allTagsRes.data;

          for (const tagName of tagNames) {
            const existingTag = allTags.find(t => t.tag_name === tagName);
            if (existingTag && existingTag.tag_id) {
              try {
                await api.post('/tags/assign', {
                  prompt_id: promptId,
                  tag_id: existingTag.tag_id
                });
              } catch (err) {
                console.error(`Error assigning tag ${tagName}:`, err);
              }
            }
          }
        } catch (err) {
          console.error('Error fetching tags for assignment:', err);
        }
      }

      setMessage({ text: 'Prompt created successfully!', type: 'success' });
      setLoading(false);
      
      // Redirect to the newly created prompt
      setTimeout(() => {
        navigate(`/prompt/${promptId}`);
      }, 1000);

    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to create prompt. Please try again.', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="page container">
      
      {message.text && (
        <div className={`feedback-message ${message.type} mb-lg`} role="alert">
          {message.text}
        </div>
      )}

      <div className="cp-layout">
        
        {/* LEFT COLUMN: Info & Tips */}
        <div className="cp-info">
          <header>
            <h1 className="cp-title">Create Prompt</h1>
            <p className="cp-subtitle">Share your best AI workflows with the community.</p>
          </header>

          <aside className="cp-tips">
            <h2 className="cp-tips-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Best Practices
            </h2>
            <ul className="cp-tips-list">
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                <span><strong>Be specific:</strong> Detail exact instructions, context, and output format.</span>
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                <span><strong>Use placeholders:</strong> Use [Brackets] for variables users should replace.</span>
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                <span><strong>Tag correctly:</strong> Add 2-3 relevant tags to help others discover your work.</span>
              </li>
            </ul>
          </aside>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className="cp-form-card">
          <form onSubmit={handleSubmit} className="cp-form" noValidate>
            
            {/* Title */}
            <div className="cp-form-group">
              <label htmlFor="prompt-title" className="cp-label">Title <span aria-hidden="true" style={{color: 'var(--color-error)'}}>*</span></label>
              <input 
                id="prompt-title"
                type="text" 
                name="title"
                value={formData.title} 
                onChange={handleChange} 
                className="cp-input"
                placeholder="e.g. Generate SEO-optimized blog posts"
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <span className="cp-error-msg" role="alert">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {errors.title}
                </span>
              )}
            </div>

            {/* Category */}
            <div className="cp-form-group">
              <label htmlFor="prompt-category" className="cp-label">Category <span aria-hidden="true" style={{color: 'var(--color-error)'}}>*</span></label>
              <select 
                id="prompt-category"
                name="category_id"
                value={formData.category_id} 
                onChange={handleChange}
                className="cp-select"
                aria-invalid={!!errors.category_id}
              >
                <option value="" disabled>Select a category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <span className="cp-error-msg" role="alert">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {errors.category_id}
                </span>
              )}
            </div>

            {/* Prompt Text */}
            <div className="cp-form-group">
              <label htmlFor="prompt-text" className="cp-label">Prompt Text <span aria-hidden="true" style={{color: 'var(--color-error)'}}>*</span></label>
              <textarea 
                id="prompt-text"
                name="prompt_text"
                value={formData.prompt_text} 
                onChange={handleChange} 
                className="cp-textarea cp-textarea-code"
                placeholder="Write your prompt logic here..."
                aria-invalid={!!errors.prompt_text}
              />
              {errors.prompt_text && (
                <span className="cp-error-msg" role="alert">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {errors.prompt_text}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="cp-form-group">
              <label htmlFor="prompt-desc" className="cp-label">
                Description <span className="cp-optional">(Optional)</span>
              </label>
              <textarea 
                id="prompt-desc"
                name="description"
                value={formData.description} 
                onChange={handleChange} 
                className="cp-textarea"
                placeholder="Briefly explain what this prompt does and how to use it..."
              />
            </div>

            {/* Tags */}
            <div className="cp-form-group">
              <label htmlFor="prompt-tags" className="cp-label">
                Tags <span className="cp-optional">(Optional)</span>
              </label>
              <input 
                id="prompt-tags"
                type="text" 
                name="tags"
                value={formData.tags} 
                onChange={handleChange} 
                className="cp-input"
                placeholder="e.g. productivity, coding, python (comma separated)"
              />
            </div>

            {/* Visibility Toggle */}
            <div className="cp-form-group">
              <label className="cp-label">Visibility</label>
              <div className="cp-radio-group" role="radiogroup">
                
                <label className="cp-radio-card">
                  <input 
                    type="radio" 
                    name="is_public" 
                    value="true" 
                    checked={formData.is_public === true} 
                    onChange={handleChange} 
                    className="cp-radio-input"
                  />
                  <div className="cp-radio-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    Public
                  </div>
                  <span className="cp-radio-desc">Visible to everyone in the community</span>
                </label>

                <label className="cp-radio-card">
                  <input 
                    type="radio" 
                    name="is_public" 
                    value="false" 
                    checked={formData.is_public === false} 
                    onChange={handleChange} 
                    className="cp-radio-input"
                  />
                  <div className="cp-radio-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Private
                  </div>
                  <span className="cp-radio-desc">Only visible to you on your profile</span>
                </label>

              </div>
            </div>

            {/* Submit */}
            <div className="cp-submit-area">
              <button type="submit" disabled={loading} className="cp-submit-btn">
                {loading ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Prompt
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePrompt;
