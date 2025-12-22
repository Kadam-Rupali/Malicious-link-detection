import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5003/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (isMalicious) => {
    return isMalicious ? (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
        Malicious
      </span>
    ) : (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        Safe
      </span>
    );
  };

  const DetailedReport = ({ report }) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow mt-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold mb-4">Detailed Analysis Report</h3>
          <button
            onClick={() => setSelectedReport(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700">URL Information</h4>
            <p className="text-sm break-all">{report.url}</p>
            <p className="text-sm text-gray-500">Analyzed at: {formatDate(report.timestamp)}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-700">Scan Results</h4>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium">Status</p>
                <p>{getStatusBadge(report.result.isMalicious)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium">Confidence Level</p>
                <p className="text-sm">{report.result.confidence}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium">Threat Type</p>
                <p className="text-sm">{report.result.threatType || 'None'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium">Detection Rate</p>
                <p className="text-sm">
                  {report.result.virusTotalData.positives} / {report.result.virusTotalData.total} engines
                </p>
              </div>
            </div>
          </div>

          {report.result.isMalicious && (
            <div>
              <h4 className="font-medium text-gray-700">Security Vendor Detections</h4>
              <div className="mt-2 max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Vendor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(report.result.virusTotalData.scans)
                      .filter(([_, scan]) => scan.detected)
                      .map(([vendor, scan]) => (
                        <tr key={vendor}>
                          <td className="px-4 py-2 text-sm">{vendor}</td>
                          <td className="px-4 py-2 text-sm text-red-600">{scan.detail}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium text-gray-700">Statistics</h4>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium">Harmless</p>
                <p className="text-sm">{report.result.virusTotalData.stats.harmless}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium">Malicious</p>
                <p className="text-sm">{report.result.virusTotalData.stats.malicious}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium">Suspicious</p>
                <p className="text-sm">{report.result.virusTotalData.stats.suspicious}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium">Undetected</p>
                <p className="text-sm">{report.result.virusTotalData.stats.undetected}</p>
              </div>
            </div>
          </div>

          {report.result.virusTotalData.permalink && (
            <div>
              <h4 className="font-medium text-gray-700">Additional Information</h4>
              <a
                href={report.result.virusTotalData.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View Full VirusTotal Report →
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Analysis Reports</h1>
      
      {loading ? (
        <div className="text-center">Loading reports...</div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(report.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="max-w-xs truncate">{report.url}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.result.isMalicious)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReport && <DetailedReport report={selectedReport} />}
    </div>
  );
};

export default Reports;