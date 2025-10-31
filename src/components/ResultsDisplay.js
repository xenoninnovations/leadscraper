import React from 'react';
import './ResultsDisplay.css';

const ResultsDisplay = ({ results, onAnalyzeMore }) => {
  if (!results || results.length === 0) {
    return null;
  }

  const getScoreBadgeClass = (score) => {
    switch (score) {
      case 'good':
        return 'badge-good';
      case 'average':
        return 'badge-average';
      case 'poor':
      case 'error':
      case 'needs-work':
        return 'badge-poor';
      default:
        return 'badge-default';
    }
  };

  const getScoreLabel = (score) => {
    switch (score) {
      case 'good':
        return 'Good';
      case 'average':
        return 'Average';
      case 'poor':
        return 'Poor';
      case 'needs-work':
        return 'Needs Work';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="results-display">
      <div className="results-header">
        <h2>Analysis Results</h2>
        <button onClick={onAnalyzeMore} className="analyze-more-button">
          Analyze More Websites
        </button>
      </div>

      <div className="results-grid">
        {results.map((result, index) => (
          <div key={index} className="result-card">
            <div className="result-header">
              <h3 className="website-url">{result.url}</h3>
              <span className={`score-badge ${getScoreBadgeClass(result.overallScore)}`}>
                {getScoreLabel(result.overallScore)}
              </span>
            </div>

            <div className="result-summary">
              <p className="summary-text">{result.summary}</p>
            </div>

            <div className="metrics-section">
              {/* Speed Metric */}
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon">⚡</span>
                  <span className="metric-title">Speed</span>
                  <span className={`metric-badge ${getScoreBadgeClass(result.speed?.score)}`}>
                    {getScoreLabel(result.speed?.score)}
                  </span>
                </div>
                <div className="metric-details">
                  {result.speed?.loadTime && (
                    <div className="metric-stat">
                      Load Time: <strong>{result.speed.loadTime}ms</strong>
                    </div>
                  )}
                  <div className="metric-message">{result.speed?.message}</div>
                </div>
              </div>

              {/* Content Metric */}
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon">📝</span>
                  <span className="metric-title">Content Quality</span>
                  <span className={`metric-badge ${getScoreBadgeClass(result.content?.score)}`}>
                    {getScoreLabel(result.content?.score)}
                  </span>
                </div>
                <div className="metric-details">
                  <div className="metric-message">{result.content?.message}</div>
                  {result.content?.issues && result.content.issues.length > 0 && (
                    <div className="metric-issues">
                      <strong>Issues:</strong>
                      <ul>
                        {result.content.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.content?.recommendations && result.content.recommendations.length > 0 && (
                    <div className="metric-recommendations">
                      <strong>Recommendations:</strong>
                      <ul>
                        {result.content.recommendations.slice(0, 2).map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Design Metric */}
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon">🎨</span>
                  <span className="metric-title">Design Quality</span>
                  <span className={`metric-badge ${getScoreBadgeClass(result.design?.score)}`}>
                    {getScoreLabel(result.design?.score)}
                  </span>
                </div>
                <div className="metric-details">
                  <div className="metric-message">{result.design?.message}</div>
                  {result.design?.issues && result.design.issues.length > 0 && (
                    <div className="metric-issues">
                      <strong>Issues:</strong>
                      <ul>
                        {result.design.issues.slice(0, 3).map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.design?.recommendations && result.design.recommendations.length > 0 && (
                    <div className="metric-recommendations">
                      <strong>Recommendations:</strong>
                      <ul>
                        {result.design.recommendations.slice(0, 2).map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="result-footer">
              <span className="timestamp">
                Analyzed: {new Date(result.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsDisplay;

