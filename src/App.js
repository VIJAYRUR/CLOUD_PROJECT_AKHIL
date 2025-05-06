import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ConfirmRegistration from './components/auth/ConfirmRegistration';
import ForgotPassword from './components/auth/ForgotPassword';
import VerifyAccount from './components/auth/VerifyAccount';
import PlanGenerator from './components/plans/PlanGenerator';
import PlanDetail from './components/plans/PlanDetail';
import Profile from './components/profile/Profile';
import PrivateRoute from './components/auth/PrivateRoute';
import MiniProgressTrackerTest from './components/plans/MiniProgressTrackerTest';
import EmailJSSetup from './components/admin/EmailJSSetup';
import EmailTest from './components/admin/EmailTest';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { PlanProvider } from './context/PlanContext';

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthPage, setIsAuthPage] = useState(false);
  const location = useLocation();

  // Simulate initial loading
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Check if current page is login or register using React Router's location
  useEffect(() => {
    const path = location.pathname;
    setIsAuthPage(
      path === '/login' ||
      path === '/register' ||
      path === '/confirm' ||
      path === '/verify' ||
      path === '/forgot-password'
    );

    // Log for debugging
    console.log('Current path:', path, 'isAuthPage:',
      path === '/login' ||
      path === '/register' ||
      path === '/confirm' ||
      path === '/verify' ||
      path === '/forgot-password'
    );
  }, [location]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <PlanProvider>
        <div className={`app-container ${isAuthPage ? 'auth-page' : ''}`}>
          {!isAuthPage && (
            <div className="navbar-wrapper" style={{
              background: 'linear-gradient(90deg, var(--primary-dark), var(--primary-color))',
              boxShadow: 'var(--shadow-md)'
            }}>
              <Navbar />
            </div>
          )}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<VerifyAccount />} />
            <Route path="/confirm" element={<Navigate to="/login" replace />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={
              <PrivateRoute>
                <div className="container py-5">
                  <Dashboard />
                </div>
              </PrivateRoute>
            } />
            <Route path="/generate" element={
              <PrivateRoute>
                <div className="container py-5">
                  <PlanGenerator />
                </div>
              </PrivateRoute>
            } />
            <Route path="/plan/:planId" element={
              <PrivateRoute>
                <div className="container py-5">
                  <PlanDetail />
                </div>
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <div className="container py-5">
                  <Profile />
                </div>
              </PrivateRoute>
            } />
            <Route path="/test-progress/:planId" element={
              <PrivateRoute>
                <div className="container py-5">
                  <MiniProgressTrackerTest />
                </div>
              </PrivateRoute>
            } />
            <Route path="/setup-email" element={
              <EmailJSSetup />
            } />
            <Route path="/test-email" element={
              <EmailTest />
            } />
          </Routes>
          {!isAuthPage && (
            <footer className="py-4 mt-auto" style={{
              background: 'linear-gradient(90deg, var(--neutral-800), var(--neutral-900))',
              color: 'white'
            }}>
              <div className="container">
                <div className="row">
                  <div className="col-md-6">
                    <h5 style={{
                      fontWeight: '700',
                      background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>SkillForge</h5>
                    <p className="mb-0">AI-Powered Learning Plan Generator</p>
                    <p className="small opacity-75">© 2023 SkillForge. All rights reserved.</p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <ul className="list-inline mb-0">
                      <li className="list-inline-item">
                        <Link to="/privacy" className="text-white text-decoration-none opacity-75 hover-opacity-100">Privacy Policy</Link>
                      </li>
                      <li className="list-inline-item ms-3">
                        <Link to="/terms" className="text-white text-decoration-none opacity-75 hover-opacity-100">Terms of Service</Link>
                      </li>
                      <li className="list-inline-item ms-3">
                        <Link to="/contact" className="text-white text-decoration-none opacity-75 hover-opacity-100">Contact Us</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </footer>
          )}
        </div>
      </PlanProvider>
    </AuthProvider>
  );
}

export default App;
