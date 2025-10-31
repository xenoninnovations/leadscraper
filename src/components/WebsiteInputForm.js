import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import './WebsiteInputForm.css';

const WebsiteInputForm = ({ onAnalyze, isAnalyzing }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Parse CSV file and extract URLs
  const parseCSV = (csvText) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      return [];
    }

    // Check if first line is a header (common headers: url, website, domain, etc.)
    const firstLine = lines[0].toLowerCase().trim();
    const isHeader = firstLine.includes('url') || 
                     firstLine.includes('website') || 
                     firstLine.includes('domain') ||
                     firstLine.includes('site');

    // Start from index 1 if there's a header, otherwise 0
    const startIndex = isHeader ? 1 : 0;
    const urlList = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by comma, but handle quoted values
      const columns = line.split(',').map(col => col.trim().replace(/^["']|["']$/g, ''));
      
      // Take the first column that looks like a URL/domain
      for (const cell of columns) {
        if (cell && (cell.includes('.') || cell.startsWith('http'))) {
          urlList.push(cell);
          break; // Only take the first URL-like value from each row
        }
      }
    }

    return urlList;
  };

  // Parse XLSX file and extract URLs
  const parseXLSX = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON array
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          
          if (jsonData.length === 0) {
            resolve([]);
            return;
          }

          // Check if first row is a header
          const firstRow = jsonData[0];
          const firstCell = (firstRow[0] || '').toString().toLowerCase().trim();
          const isHeader = firstCell.includes('url') || 
                           firstCell.includes('website') || 
                           firstCell.includes('domain') ||
                           firstCell.includes('site');

          const startIndex = isHeader ? 1 : 0;
          const urlList = [];

          for (let i = startIndex; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            // Take the first column that looks like a URL/domain
            for (const cell of row) {
              const cellValue = (cell || '').toString().trim();
              if (cellValue && (cellValue.includes('.') || cellValue.startsWith('http'))) {
                urlList.push(cellValue);
                break; // Only take the first URL-like value from each row
              }
            }
          }

          resolve(urlList);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading XLSX file'));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  // Process file (used by both file input and drag & drop)
  const processFile = async (file) => {
    if (!file) {
      return;
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isXLSX = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isXLSX) {
      setError('Please select a CSV or XLSX file');
      setSelectedFile(null);
      setFileName('');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setError('');

    try {
      let urlList = [];

      if (isCSV) {
        // Read and parse CSV file
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const csvText = event.target.result;
            urlList = parseCSV(csvText);

            if (urlList.length === 0) {
              setError('No URLs found in the file. Please ensure the file contains website URLs.');
              setSelectedFile(null);
              setFileName('');
              return;
            }

            // Validate URLs
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
              setError(`Found ${invalidUrls.length} invalid URL(s): ${invalidUrls.slice(0, 3).join(', ')}${invalidUrls.length > 3 ? '...' : ''}`);
              // Still allow proceeding, but warn the user
            }
          } catch (err) {
            setError(`Error reading CSV file: ${err.message}`);
            setSelectedFile(null);
            setFileName('');
          }
        };

        reader.onerror = () => {
          setError('Error reading file. Please try again.');
          setSelectedFile(null);
          setFileName('');
        };

        reader.readAsText(file);
      } else if (isXLSX) {
        // Parse XLSX file
        urlList = await parseXLSX(file);

        if (urlList.length === 0) {
          setError('No URLs found in the file. Please ensure the file contains website URLs.');
          setSelectedFile(null);
          setFileName('');
          return;
        }

        // Validate URLs
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
          setError(`Found ${invalidUrls.length} invalid URL(s): ${invalidUrls.slice(0, 3).join(', ')}${invalidUrls.length > 3 ? '...' : ''}`);
          // Still allow proceeding, but warn the user
        }
      }
    } catch (err) {
      setError(`Error reading file: ${err.message}`);
      setSelectedFile(null);
      setFileName('');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    await processFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Please select a CSV or XLSX file');
      return;
    }

    try {
      const fileName = selectedFile.name.toLowerCase();
      const isCSV = fileName.endsWith('.csv');
      const isXLSX = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

      let urlList = [];

      if (isCSV) {
        // Re-read and parse CSV file
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const csvText = event.target.result;
            urlList = parseCSV(csvText);

            if (urlList.length === 0) {
              setError('No URLs found in the file');
              return;
            }

            // Final URL validation
            const validUrlList = urlList.filter(url => {
              try {
                const normalized = url.startsWith('http') ? url : `https://${url}`;
                new URL(normalized);
                return true;
              } catch {
                return false;
              }
            });

            if (validUrlList.length === 0) {
              setError('No valid URLs found in the file');
              return;
            }

            onAnalyze(validUrlList);
          } catch (err) {
            setError(`Error processing file: ${err.message}`);
          }
        };

        reader.readAsText(selectedFile);
      } else if (isXLSX) {
        // Parse XLSX file
        urlList = await parseXLSX(selectedFile);

        if (urlList.length === 0) {
          setError('No URLs found in the file');
          return;
        }

        // Final URL validation
        const validUrlList = urlList.filter(url => {
          try {
            const normalized = url.startsWith('http') ? url : `https://${url}`;
            new URL(normalized);
            return true;
          } catch {
            return false;
          }
        });

        if (validUrlList.length === 0) {
          setError('No valid URLs found in the file');
          return;
        }

        onAnalyze(validUrlList);
      }
    } catch (err) {
      setError(`Error processing file: ${err.message}`);
    }
  };

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileName('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isAnalyzing) {
      return;
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      await processFile(file);
    }
  };

  return (
    <div className="website-input-form">
      <h2>Website Analysis Tool</h2>
      <p className="subtitle">Import a CSV or XLSX file containing website URLs to analyze their performance, content quality, and design</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="file-input">CSV or XLSX File with Website URLs:</label>
          <div 
            className={`file-input-container ${isDragging ? 'drag-over' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="file-input"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={isAnalyzing}
              className="file-input"
              style={{ display: 'none' }}
            />
            <div className="file-input-display">
              {fileName ? (
                <div className="file-selected">
                  <span className="file-name">{fileName}</span>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    disabled={isAnalyzing}
                    className="clear-file-button"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="file-drop-zone">
                  <button
                    type="button"
                    onClick={handleFileInputClick}
                    disabled={isAnalyzing}
                    className="file-select-button"
                  >
                    {isDragging ? 'Drop file here' : 'Choose CSV or XLSX File'}
                  </button>
                  <p className="drag-hint">or drag and drop a file here</p>
                </div>
              )}
            </div>
          </div>
          <p className="file-helper-text">
            CSV/XLSX format: URLs should be in the first column. Header rows (url, website, domain) are automatically detected.
          </p>
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isAnalyzing || !selectedFile}
            className="analyze-button"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Websites'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WebsiteInputForm;

