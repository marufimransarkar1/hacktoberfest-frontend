import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await API.get('/reports');
      setReports(res.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/reports/${id}`, { status: newStatus });
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await API.delete(`/reports/${id}`);
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert('Failed to delete report');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const filteredReports =
    filter === 'All'
      ? reports
      : reports.filter((r) => (r.status || 'Pending') === filter);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Top Navbar */}
        <div className="mb-6 flex flex-col justify-between rounded-xl bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-xs text-slate-500">Manage public issue reports and resolution status</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-600 sm:mt-0"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Total Reports</span>
            <p className="text-2xl font-bold text-slate-800">{reports.length}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4 shadow-sm border border-amber-200">
            <span className="text-xs text-amber-700 font-medium">Pending</span>
            <p className="text-2xl font-bold text-amber-800">
              {reports.filter((r) => !r.status || r.status === 'Pending').length}
            </p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4 shadow-sm border border-blue-200">
            <span className="text-xs text-blue-700 font-medium">In Progress</span>
            <p className="text-2xl font-bold text-blue-800">
              {reports.filter((r) => r.status === 'In Progress').length}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4 shadow-sm border border-emerald-200">
            <span className="text-xs text-emerald-700 font-medium">Resolved</span>
            <p className="text-2xl font-bold text-emerald-800">
              {reports.filter((r) => r.status === 'Resolved').length}
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mb-4 flex gap-2">
          {['All', 'Pending', 'In Progress', 'Resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                filter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">Loading reports...</td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">No reports found.</td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      {report.imageUrl ? (
                        <img
                          src={report.imageUrl}
                          alt="Report"
                          className="h-12 w-12 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{report.category}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{report.description}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {report.location?.lat?.toFixed(3)}, {report.location?.lng?.toFixed(3)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={report.status || 'Pending'}
                        onChange={(e) => handleStatusChange(report._id, e.target.value)}
                        className="rounded-lg border border-slate-300 p-1.5 text-xs font-semibold focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(report._id)}
                        className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        title="Delete Report"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}