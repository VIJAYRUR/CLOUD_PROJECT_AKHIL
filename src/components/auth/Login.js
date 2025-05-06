import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CognitoService from '../../services/cognito-service';
import CognitoConfigNotification from '../common/CognitoConfigNotification';
import AWS from 'aws-sdk';
import cognitoConfig from '../../config/cognito-config';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isCognitoConfigured, setIsCognitoConfigured] = useState(true);

  // Animation effect when component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Check if Cognito is configured
  useEffect(() => {
    setIsCognitoConfigured(CognitoService.isConfigured());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Simple login flow
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login attempt failed:', error);

      // If the user needs to confirm their account, redirect to the confirmation page
      if (error.code === 'UserNotConfirmedException') {
        navigate('/confirm');
        return;
      }

      // Display the error message
      if (error.message && error.message.includes('SECRET_HASH')) {
        setError('Authentication error: Client configuration issue. Please contact support.');
      } else if (error.message && error.message.includes('USER_PASSWORD_AUTH flow not enabled')) {
        setError('Authentication error: USER_PASSWORD_AUTH flow not enabled. Please contact support.');
      } else if (error.code === 'NotAuthorizedException') {
        setError('Incorrect username or password. Please try again.');
      } else if (error.code === 'UserNotFoundException') {
        setError('Account not found. Please check your email or sign up.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <div className={`login-container ${isVisible ? 'visible' : ''}`}>
      {!isCognitoConfigured && <CognitoConfigNotification />}
      <div className="row g-0 vh-100">
        {/* Left side - Illustration/Info */}
        <div className="col-lg-6 d-none d-lg-block login-left-panel">
          <div className="login-info-content">
            <div className="login-brand-section mb-5">
              <h1 className="display-4 fw-bold text-white mb-4">SkillForge</h1>
              <p className="lead text-white-50">Your AI-powered learning journey starts here</p>
            </div>

            <div className="login-features">
              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <i className="bi bi-lightning-charge-fill"></i>
                </div>
                <div className="login-feature-text">
                  <h5>Personalized Learning Plans</h5>
                  <p>AI-generated plans tailored to your goals and preferences</p>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="login-feature-text">
                  <h5>Track Your Progress</h5>
                  <p>Monitor your learning journey with detailed analytics</p>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <i className="bi bi-collection-play"></i>
                </div>
                <div className="login-feature-text">
                  <h5>Curated Resources</h5>
                  <p>Access the best learning materials for each topic</p>
                </div>
              </div>
            </div>
          </div>

          <div className="login-decoration">
            <div className="login-shape login-shape-1"></div>
            <div className="login-shape login-shape-2"></div>
            <div className="login-shape login-shape-3"></div>
            <div className="login-shape login-shape-4"></div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="col-lg-6 login-form-panel">
          <div className="login-form-container">
            <div className="login-form-header">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Sign in with your email and password</p>
            </div>

            {(error || authError) && (
              <div className="alert alert-danger login-alert" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error || authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="mb-4">
                <label htmlFor="email" className="form-label login-label">Email Address</label>
                <div className="login-input-group">
                  <span className="login-input-icon">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control login-input"
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <label htmlFor="password" className="form-label login-label">Password</label>
                  <Link to="/forgot-password" className="login-forgot-link">Forgot password?</Link>
                </div>
                <div className="login-input-group">
                  <span className="login-input-icon">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control login-input"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="rememberMe" />
                  <label className="form-check-label login-check-label" htmlFor="rememberMe">
                    Remember me for 30 days
                  </label>
                </div>
              </div>

              <div className="d-grid mb-4">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg login-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>

              <div className="login-signup-link">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="login-link">Create an account</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
