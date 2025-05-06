import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, confirmPassword, loading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [step, setStep] = useState(1); // 1: Request code, 2: Reset password, 3: Success

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email) {
      setFormError('Email is required');
      return;
    }

    try {
      await forgotPassword(email);
      setStep(2);
    } catch (error) {
      setFormError(error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!code) {
      setFormError('Verification code is required');
      return;
    }

    if (!newPassword) {
      setFormError('New password is required');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    try {
      await confirmPassword(email, code, newPassword);
      setStep(3);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setFormError(error.message);
    }
  };

  return (
    <div className="login-container visible">
      <div className="row g-0 vh-100">
        {/* Left side - Illustration/Info */}
        <div className="col-lg-6 d-none d-lg-block login-left-panel">
          <div className="login-info-content">
            <div className="login-brand-section mb-5">
              <h1 className="display-4 fw-bold text-white mb-4">SkillForge</h1>
              <p className="lead text-white-50">Reset your password to regain access to your account</p>
            </div>

            <div className="login-features">
              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <i className="bi bi-shield-lock"></i>
                </div>
                <div className="login-feature-text">
                  <h5>Secure Reset Process</h5>
                  <p>We use a secure verification process to protect your account</p>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <i className="bi bi-envelope-check"></i>
                </div>
                <div className="login-feature-text">
                  <h5>Check Your Email</h5>
                  <p>We'll send a verification code to your email address</p>
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

        {/* Right side - Form */}
        <div className="col-lg-6 login-form-panel">
          <div className="login-form-container">
            {step === 1 && (
              <>
                <div className="login-form-header">
                  <h2 className="login-title">Forgot Password</h2>
                  <p className="login-subtitle">Enter your email to receive a verification code</p>
                </div>

                {(formError || error) && (
                  <div className="alert alert-danger login-alert" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {formError || error}
                  </div>
                )}

                <form onSubmit={handleRequestCode} className="login-form">
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
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
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
                          Sending...
                        </>
                      ) : (
                        'Send Reset Code'
                      )}
                    </button>
                  </div>

                  <div className="login-signup-link">
                    <p>
                      Remember your password?{' '}
                      <Link to="/login" className="login-link">Sign in</Link>
                    </p>
                  </div>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <div className="login-form-header">
                  <h2 className="login-title">Reset Password</h2>
                  <p className="login-subtitle">Enter the verification code and your new password</p>
                </div>

                {(formError || error) && (
                  <div className="alert alert-danger login-alert" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {formError || error}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="login-form">
                  <div className="mb-4">
                    <label htmlFor="code" className="form-label login-label">Verification Code</label>
                    <div className="login-input-group">
                      <span className="login-input-icon">
                        <i className="bi bi-shield-lock"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control login-input"
                        id="code"
                        placeholder="Enter verification code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        autoComplete="one-time-code"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="newPassword" className="form-label login-label">New Password</label>
                    <div className="login-input-group">
                      <span className="login-input-icon">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control login-input"
                        id="newPassword"
                        placeholder="Create new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                    <label htmlFor="confirmNewPassword" className="form-label login-label">Confirm New Password</label>
                    <div className="login-input-group">
                      <span className="login-input-icon">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control login-input"
                        id="confirmNewPassword"
                        placeholder="Confirm new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
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
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </div>

                  <div className="login-signup-link">
                    <p>
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        onClick={() => setStep(1)}
                      >
                        Back to request code
                      </button>
                    </p>
                  </div>
                </form>
              </>
            )}

            {step === 3 && (
              <div className="text-center">
                <div className="mb-4">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                </div>
                <h2 className="login-title mb-3">Password Reset Successful!</h2>
                <p className="login-subtitle mb-4">Your password has been successfully reset. Redirecting you to login...</p>
                <div className="d-grid">
                  <Link to="/login" className="btn btn-primary login-btn">
                    Go to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
