import React, { useState } from 'react';
import './WebsiteInputForm.css';

const WebsiteInputForm = ({ onAnalyze, isAnalyzing }) => {
  const [urls, setUrls] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Parse URLs from textarea (split by newline or comma)
    const urlList = urls
      .split(/[\n,]+/)
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urlList.length === 0) {
      setError('Please enter at least one website URL');
      return;
    }

    // Basic URL validation
    const invalidUrls = urlList.filter(url => {
      try {
        const normalized = url.startsWith('http') ? url : `https://${url}`;
        new URL(normalized);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      setError(`Invalid URLs: ${invalidUrls.join(', ')}`);
      return;
    }

    onAnalyze(urlList);
  };

  const handleExampleClick = () => {
    setUrls('example.com\ngithub.com\nstackoverflow.com');
  };

  return (
    <div className="website-input-form">
      <h2>Website Analysis Tool</h2>
      <p className="subtitle">Enter one or more website URLs to analyze their performance, content quality, and design</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="urls">Website URLs (one per line or comma-separated):</label>
          <textarea
            id="urls"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="example.com&#10;github.com&#10;stackoverflow.com"
            rows={6}
            disabled={isAnalyzing}
            className={error ? 'error' : ''}
          />
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isAnalyzing || !urls.trim()}
            className="analyze-button"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Websites'}
          </button>
          <button 
            type="button" 
            onClick={handleExampleClick}
            disabled={isAnalyzing}
            className="example-button"
          >
            Load Example URLs
          </button>
        </div>
      </form>
    </div>
  );
};

export default WebsiteInputForm;

