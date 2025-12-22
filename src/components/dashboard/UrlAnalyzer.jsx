import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UrlAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const analyzeUrl = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post('http://localhost:5003/api/url-analysis/analyze', 
        { url },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.result) {
        setResult(response.data.result);
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        navigate('/login');
      } else {
        setError(
          error.response?.data?.message || 
          'Error analyzing URL. Please try again.'
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">URL Analysis</h2>
      
      <form onSubmit={analyzeUrl} className="mb-6">
        <div className="flex gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to analyze"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isAnalyzing}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className={`p-4 rounded-lg ${result.isMalicious ? 'bg-red-100' : 'bg-green-100'}`}>
          <h3 className="font-semibold mb-2">Analysis Result</h3>
          <div className="space-y-2">
            <p>
              Status: 
              <span className={`font-semibold ${result.isMalicious ? 'text-red-600' : 'text-green-600'}`}>
                {result.isMalicious ? ' Malicious' : ' Safe'}
              </span>
            </p>
            <p>Confidence: {result.confidence}</p>
            <p>Detections: {result.virusTotalData.positives} / {result.virusTotalData.total}</p>
            
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>Harmless: {result.virusTotalData.stats.harmless}</div>
              <div>Malicious: {result.virusTotalData.stats.malicious}</div>
              <div>Suspicious: {result.virusTotalData.stats.suspicious}</div>
              <div>Undetected: {result.virusTotalData.stats.undetected}</div>
            </div>

            {result.virusTotalData.permalink && (
              <p>
                <a 
                  href={result.virusTotalData.permalink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Full Report
                </a>
              </p>
            )}
            
            {result.isMalicious && (
              <div className="mt-4">
                <h4 className="font-semibold">Detection Details:</h4>
                <div className="mt-2 max-h-60 overflow-y-auto">
                  {Object.entries(result.virusTotalData.scans)
                    .filter(([_, scan]) => scan.detected)
                    .map(([scanner, scan]) => (
                      <div key={scanner} className="text-sm py-1">
                        <span className="font-medium">{scanner}:</span> {scan.detail}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mt-4">
              Analyzed at: {new Date(result.virusTotalData.scan_date || result.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlAnalyzer; 