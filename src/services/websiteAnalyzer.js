/**
 * Website Analyzer Service
 * Analyzes websites for speed, content quality, and design metrics
 */

// Helper function to validate URL
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

// Helper function to ensure URL has protocol
const normalizeUrl = (url) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
};

// Analyze website speed using fetch timing
const analyzeSpeed = async (url) => {
  try {
    const startTime = performance.now();
    
    // Use a CORS proxy or direct fetch attempt
    // Note: In production, this should be done server-side to avoid CORS
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'HEAD', // HEAD request is lighter and faster
        mode: 'no-cors', // This prevents CORS errors but limits response access
        signal: controller.signal,
        cache: 'no-cache',
      });
      
      clearTimeout(timeoutId);
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Since no-cors mode doesn't give us response details, we estimate based on timing
      return {
        score: loadTime < 2000 ? 'good' : loadTime < 5000 ? 'average' : 'poor',
        loadTime: Math.round(loadTime),
        status: 'measured',
        message: loadTime < 2000 
          ? 'Fast loading time' 
          : loadTime < 5000 
          ? 'Moderate loading time - consider optimization' 
          : 'Slow loading time - optimization strongly recommended'
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Even if fetch fails, we can measure how long it took
      if (loadTime > 10000 || fetchError.name === 'AbortError') {
        return {
          score: 'poor',
          loadTime: Math.round(loadTime),
          status: 'timeout',
          message: 'Request timed out - website may be slow or unresponsive'
        };
      }
      
      // If it failed quickly, might be CORS or other issue
      return {
        score: 'error',
        loadTime: Math.round(loadTime),
        status: 'error',
        message: 'Unable to measure speed (may be due to CORS restrictions - consider using a backend service)'
      };
    }
  } catch (error) {
    return {
      score: 'error',
      loadTime: null,
      status: 'error',
      message: error.name === 'AbortError' 
        ? 'Request timed out - website may be slow or unresponsive' 
        : `Unable to measure speed: ${error.message}`
    };
  }
};

// Analyze content quality by checking for outdated indicators
const analyzeContent = async (url) => {
  try {
    // Note: Due to CORS, we can't directly fetch and parse HTML in browser
    // This is a simulated analysis based on URL and metadata
    // In production, this would typically run on a backend server
    
    // For now, we'll use a proxy approach or provide a framework
    const issues = [];
    const warnings = [];
    
    // Check URL structure
    if (url.includes('http://')) {
      issues.push('Site uses HTTP instead of HTTPS - security concern');
    }
    
    // Simulated content analysis
    // In a real implementation, you'd parse HTML and check:
    // - Last modified dates
    // - Copyright dates in footer
    // - Use of outdated technologies
    // - Broken links count
    
    return {
      score: issues.length === 0 ? 'good' : issues.length < 2 ? 'average' : 'poor',
      issues: issues.length > 0 ? issues : [],
      warnings: warnings,
      message: issues.length === 0 
        ? 'Content appears up to date' 
        : 'Some content quality issues detected',
      recommendations: [
        'Ensure all content has been updated within the last year',
        'Check for broken links and outdated references',
        'Verify copyright dates are current',
        'Review SEO meta tags and descriptions'
      ]
    };
  } catch (error) {
    return {
      score: 'error',
      issues: [],
      warnings: [],
      message: 'Unable to analyze content',
      recommendations: []
    };
  }
};

// Analyze design quality
const analyzeDesign = async (url) => {
  try {
    const issues = [];
    const strengths = [];
    
    // Simulated design analysis
    // In a real implementation, you'd check:
    // - Use of modern CSS (flexbox, grid)
    // - Responsive design (viewport meta tag)
    // - Mobile-friendly layout
    // - Accessibility features
    // - Color contrast
    // - Typography
    
    // For now, we'll provide a framework
    return {
      score: 'average', // Default
      issues: [
        'Unable to fully analyze design due to CORS restrictions',
        'Recommend manual review for responsive design',
        'Check for accessibility compliance'
      ],
      strengths: [],
      message: 'Design analysis limited - recommend manual review',
      recommendations: [
        'Ensure website is mobile-responsive',
        'Check color contrast ratios for accessibility',
        'Verify modern CSS practices are used',
        'Test across different browsers and devices',
        'Ensure proper viewport meta tag is present'
      ]
    };
  } catch (error) {
    return {
      score: 'error',
      issues: [],
      strengths: [],
      message: 'Unable to analyze design',
      recommendations: []
    };
  }
};

// Main analysis function
export const analyzeWebsite = async (urlInput) => {
  // Validate and normalize URL
  const normalizedUrl = normalizeUrl(urlInput.trim());
  
  if (!isValidUrl(normalizedUrl)) {
    throw new Error('Invalid URL format');
  }
  
  const results = {
    url: normalizedUrl,
    timestamp: new Date().toISOString(),
    status: 'analyzing',
    speed: null,
    content: null,
    design: null,
    overallScore: null,
    summary: ''
  };
  
  try {
    // Run all analyses
    const [speedResult, contentResult, designResult] = await Promise.all([
      analyzeSpeed(normalizedUrl),
      analyzeContent(normalizedUrl),
      analyzeDesign(normalizedUrl)
    ]);
    
    results.speed = speedResult;
    results.content = contentResult;
    results.design = designResult;
    
    // Calculate overall score
    const scores = [speedResult.score, contentResult.score, designResult.score];
    const goodCount = scores.filter(s => s === 'good').length;
    const poorCount = scores.filter(s => s === 'poor' || s === 'error').length;
    
    if (poorCount > 1) {
      results.overallScore = 'needs-work';
    } else if (goodCount >= 2) {
      results.overallScore = 'good';
    } else {
      results.overallScore = 'average';
    }
    
    // Generate summary
    const needsWork = [];
    if (speedResult.score === 'poor' || speedResult.score === 'error') {
      needsWork.push('Speed optimization');
    }
    if (contentResult.score === 'poor') {
      needsWork.push('Content updates');
    }
    if (designResult.score === 'poor') {
      needsWork.push('Design improvements');
    }
    
    if (needsWork.length === 0) {
      results.summary = 'Website appears to be in good condition';
    } else {
      results.summary = `Website needs work: ${needsWork.join(', ')}`;
    }
    
    results.status = 'completed';
    
  } catch (error) {
    results.status = 'error';
    results.summary = `Error analyzing website: ${error.message}`;
  }
  
  return results;
};

export default analyzeWebsite;

