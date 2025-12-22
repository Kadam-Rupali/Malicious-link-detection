import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScans: 0,
    maliciousUrls: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
  const [apiKeys, setApiKeys] = useState({ virusTotal: '', other: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5003/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5003/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 403) {
        navigate('/dashboard');
      }
      setError('Error fetching admin data');
      setLoading(false);
    }
  };

  const handleAutoScanToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5003/api/admin/config/auto-scan',
        { enabled: !autoScanEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAutoScanEnabled(!autoScanEnabled);
    } catch (error) {
      setError('Error updating auto-scan configuration');
    }
  };

  const handleApiKeyUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5003/api/admin/config/api-keys',
        apiKeys,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setError('API keys updated successfully');
    } catch (error) {
      setError('Error updating API keys');
    }
  };

  const handleUserRoleUpdate = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5003/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdminData();
    } catch (error) {
      setError('Error updating user role');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Scans</h3>
          <p className="text-2xl font-bold">{stats.totalScans}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Malicious URLs Detected</h3>
          <p className="text-2xl font-bold">{stats.maliciousUrls}</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">System Settings</h2>
        
        {/* Auto Scan Configuration */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Automatic Scanning</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Enable automatic scanning of URLs</p>
            <label className="switch">
              <input
                type="checkbox"
                checked={autoScanEnabled}
                onChange={handleAutoScanToggle}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* API Key Management */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">API Integration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">VirusTotal API Key</label>
              <input
                type="text"
                value={apiKeys.virusTotal}
                onChange={(e) => setApiKeys({ ...apiKeys, virusTotal: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleApiKeyUpdate}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Update API Keys
            </button>
          </div>
        </div>

        {/* User Management */}
        <div>
          <h3 className="font-medium mb-2">User Management</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleUserRoleUpdate(user._id, e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;