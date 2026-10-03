import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import Login from './pages/AdminLogin';
import Register from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';

// Guard component to protect the Admin Dashboard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <nav className="h-16 bg-white border-b border-gray-200 px-6 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter">
          CITY<span className="text-gray-800">REPORT</span>
        </Link>
        <div className="flex gap-4 items-center font-medium text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition text-sm">
            Public Map
          </Link>
          <Link
            to="/report"
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition shadow-md text-sm"
          >
            Report Issue
          </Link>
          <Link to="/login" className="text-xs text-gray-500 hover:text-blue-600">
            Login
          </Link>
          <Link
            to="/register"
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Register Admin
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin/dashboard" // ✅ Fixed: Changed from "/admin" to "/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;