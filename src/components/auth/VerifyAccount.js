import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CognitoService from '../../services/cognito-service';
import AuthService from '../../services/auth-service';
import CognitoConfigNotification from '../common/CognitoConfigNotification';

const VerifyAccount = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isCognitoConfigured, setIsCognitoConfigured] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Get the auth context
  const { loading, error: authError } = useAuth();

  // Get the email from the location state
  const email = location.state?.email || '';

  // Check if Cognito is configured
  useEffect(() => {
    setIsCognitoConfigured(CognitoService.isConfigured());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setLocalError('Email is missing. Please go back to the registration page.');
      return;
    }

    if (!verificationCode) {
      setLocalError('Please enter the verification code sent to your email.');
      return;
    }

    setIsVerifying(true);
    setLocalError('');

    try {
      // Use AuthService directly instead of the context function
      await AuthService.confirmSignUp(email, verificationCode);
      setSuccess(true);

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login', { state: { verifiedEmail: email } });
      }, 2000);
    } catch (err) {
      console.error('Error verifying account:', err);
      setLocalError(err.message || 'Failed to verify your account. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setLocalError('Email is missing. Please go back to the registration page.');
      return;
    }

    setIsVerifying(true);
    setLocalError('');

    try {
      // Use AuthService directly instead of the context function
      await AuthService.resendConfirmationCode(email);
      setSuccess('A new verification code has been sent to your email.');

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      console.error('Error resending verification code:', err);
      setLocalError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Container className="mt-5">
      {!isCognitoConfigured && <CognitoConfigNotification />}
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="mb-3">Verify Your Account</h2>
                <p className="text-muted">
                  We've sent a verification code to {email || 'your email'}.
                  Please enter the code below to verify your account.
                </p>
              </div>

              {(localError || authError) && <Alert variant="danger">{localError || authError}</Alert>}
              {success && <Alert variant="success">{typeof success === 'string' ? success : 'Your account has been verified successfully! Redirecting to login...'}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Verification Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={isVerifying || success}
                    required
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading || isVerifying || success}
                  >
                    {loading || isVerifying ? 'Verifying...' : 'Verify Account'}
                  </Button>
                </div>
              </Form>

              <div className="mt-3 text-center">
                <p>
                  Didn't receive the code?{' '}
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={handleResendCode}
                    disabled={loading || isVerifying || success}
                  >
                    Resend Code
                  </Button>
                </p>
                <p>
                  <Link to="/login">Back to Login</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyAccount;
