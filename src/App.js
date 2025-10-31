import React, { useState } from 'react';
import './App.css';
import WebsiteInputForm from './components/WebsiteInputForm';
import ResultsDisplay from './components/ResultsDisplay';
import { analyzeWebsite } from './services/websiteAnalyzer';

function App() {
  const [results, setResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingProgress, setAnalyzingProgress] = useState({ current: 0, total: 0 });

  const handleAnalyze = async (urls) => {
    setIsAnalyzing(true);
    setResults([]);
    setAnalyzingProgress({ current: 0, total: urls.length });

    const analysisResults = [];

    // Analyze each website sequentially
    for (let i = 0; i < urls.length; i++) {
      try {
        setAnalyzingProgress({ current: i + 1, total: urls.length });
        const result = await analyzeWebsite(urls[i]);
        analysisResults.push(result);
        
        // Update results as we go (for better UX)
        setResults([...analysisResults]);
      } catch (error) {
        const errorResult = {
          url: urls[i],
          timestamp: new Date().toISOString(),
          status: 'error',
          speed: { score: 'error', message: 'Analysis failed' },
          content: { score: 'error', message: 'Analysis failed' },
          design: { score: 'error', message: 'Analysis failed' },
          overallScore: 'error',
          summary: `Error analyzing website: ${error.message}`
        };
        analysisResults.push(errorResult);
        setResults([...analysisResults]);
      }
    }

    setIsAnalyzing(false);
    setAnalyzingProgress({ current: 0, total: 0 });
  };

  const handleAnalyzeMore = () => {
    setResults([]);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <h1>Website Analysis Automation</h1>
          <p className="header-subtitle">Analyze website performance, content quality, and design metrics</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {isAnalyzing && (
            <div className="analyzing-indicator">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${(analyzingProgress.current / analyzingProgress.total) * 100}%` 
                  }}
                ></div>
              </div>
              <p className="progress-text">
                Analyzing {analyzingProgress.current} of {analyzingProgress.total} websites...
              </p>
            </div>
          )}

          {results.length === 0 && !isAnalyzing && (
            <WebsiteInputForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          )}

          {results.length > 0 && (
            <>
              <ResultsDisplay results={results} onAnalyzeMore={handleAnalyzeMore} />
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <WebsiteInputForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2024 Website Analysis Automation. Analyze websites for speed, content, and design quality.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
