import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CognitoService from '../../services/cognito-service';
import CognitoConfigNotification from '../common/CognitoConfigNotification';

const Register = () => {
  const navigate = useNavigate();
  const { register, loginAsGuest, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isCognitoConfigured, setIsCognitoConfigured] = useState(true);
  const [showGuestWarning, setShowGuestWarning] = useState(false);

  // Animation effect when component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Check if Cognito is configured
  useEffect(() => {
    setIsCognitoConfigured(CognitoService.isConfigured());
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate form
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      // Registration successful, redirect to verification page
      setFormError('');
      navigate('/verify', {
        state: {
          email: formData.email,
          name: formData.name
        }
      });
    } catch (error) {
      // Error message is set in the AuthContext
      console.error('Registration error:', error);
    }
  };

  const handleGuestLogin = () => {
    setShowGuestWarning(true);
  };

  const confirmGuestLogin = async () => {
    try {
      await loginAsGuest();
      navigate('/');
    } catch (error) {
      console.error('Guest login failed:', error);
      setFormError('Failed to continue as guest. Please try again.');
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
              <p className="lead text-white-50">Join our community of learners today</p>
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

        {/* Right side - Register Form */}
        <div className="col-lg-6 login-form-panel">
          <div className="login-form-container">
            <div className="login-form-header">
              <h2 className="login-title">Create Your Account</h2>
              <p className="login-subtitle">Register with your email and password</p>
            </div>

            {(formError || error) && (
              <div className="alert alert-danger login-alert" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {formError || error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="mb-4">
                <label htmlFor="name" className="form-label login-label">Full Name</label>
                <div className="login-input-group">
                  <span className="login-input-icon">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control login-input"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

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
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label login-label">Password</label>
                <div className="login-input-group">
                  <span className="login-input-icon">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control login-input"
                    id="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-text small mt-1">
                  <i className="bi bi-info-circle me-1"></i>
                  Password must be at least 8 characters long.
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label login-label">Confirm Password</label>
                <div className="login-input-group">
                  <span className="login-input-icon">
                    <i className="bi bi-shield-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control login-input"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="agreeTerms" required />
                  <label className="form-check-label login-check-label" htmlFor="agreeTerms">
                    I agree to the <Link to="/terms" className="login-link">Terms of Service</Link> and <Link to="/privacy" className="login-link">Privacy Policy</Link>
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
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>



              <div className="login-signup-link">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="login-link">Sign in</Link>
                </p>
              </div>

              <div className="mt-4 text-center">
                <p className="text-muted mb-2">- OR -</p>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleGuestLogin}
                >
                  <i className="bi bi-person-badge me-2"></i>
                  Continue as Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Guest Warning Modal */}
      {showGuestWarning && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                  Guest Mode Warning
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowGuestWarning(false)}></button>
              </div>
              <div className="modal-body">
                <p>You are about to continue as a guest user. Please note:</p>
                <ul className="mb-0">
                  <li>Your data will not be saved between sessions</li>
                  <li>Your learning plans will be lost when you close the browser</li>
                  <li>You won't be able to track your progress over time</li>
                  <li>You can create an account later to save your data</li>
                </ul>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowGuestWarning(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={confirmGuestLogin}>
                  Continue as Guest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
