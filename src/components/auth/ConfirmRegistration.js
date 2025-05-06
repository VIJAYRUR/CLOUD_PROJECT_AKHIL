import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ConfirmRegistration = () => {
  const navigate = useNavigate();
  const { confirmRegistration, resendConfirmationCode, tempEmail, loading, error } = useAuth();

  const [code, setCode] = useState('');
  const [email, setEmail] = useState(tempEmail || '');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!code) {
      setFormError('Verification code is required');
      return;
    }

    if (!email) {
      setFormError('Email is required');
      return;
    }

    try {
      await confirmRegistration(email, code);
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setFormError(error.message);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setFormError('Email is required to resend code');
      return;
    }

    try {
      await resendConfirmationCode(email);
      setFormError('');
      alert('A new verification code has been sent to your email.');
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
              <p className="lead text-white-50">Almost there! Verify your account to get started</p>
            </div>

            <div className="login-features">
              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <div className="login-feature-text">
                  <h5>Account Security</h5>
                  <p>We verify your email to keep your account secure</p>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <i className="bi bi-envelope-check"></i>
                </div>
                <div className="login-feature-text">
                  <h5>Check Your Email</h5>
                  <p>We've sent a verification code to your email address</p>
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

        {/* Right side - Confirmation Form */}
        <div className="col-lg-6 login-form-panel">
          <div className="login-form-container">
            {success ? (
              <div className="text-center">
                <div className="mb-4">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                </div>
                <h2 className="login-title mb-3">Account Verified!</h2>
                <p className="login-subtitle mb-4">Your account has been successfully verified. Redirecting you to login...</p>
                <div className="d-grid">
                  <Link to="/login" className="btn btn-primary login-btn">
                    Go to Login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="login-form-header">
                  <h2 className="login-title">Verify Your Account</h2>
                  <p className="login-subtitle">Enter the verification code sent to your email</p>
                </div>

                {(formError || error) && (
                  <div className="alert alert-danger login-alert" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {formError || error}
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
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="code" className="form-label login-label">Verification Code</label>
                    <div className="login-input-group">
                      <span className="login-input-icon">
                        <i className="bi bi-lock"></i>
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

                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg login-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Verifying...
                        </>
                      ) : (
                        'Verify Account'
                      )}
                    </button>
                  </div>

                  <div className="text-center mb-4">
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={handleResendCode}
                      disabled={loading}
                    >
                      Didn't receive a code? Resend
                    </button>
                  </div>

                  <div className="login-signup-link">
                    <p>
                      Already verified?{' '}
                      <Link to="/login" className="login-link">Sign in</Link>
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRegistration;
