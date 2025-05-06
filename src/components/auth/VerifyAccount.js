import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CognitoService from '../../services/cognito-service';

const VerifyAccount = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the email from the location state
  const email = location.state?.email || '';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is missing. Please go back to the registration page.');
      return;
    }
    
    if (!verificationCode) {
      setError('Please enter the verification code sent to your email.');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    try {
      await CognitoService.confirmRegistration(email, verificationCode);
      setSuccess(true);
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login', { state: { verifiedEmail: email } });
      }, 2000);
    } catch (err) {
      console.error('Error verifying account:', err);
      setError(err.message || 'Failed to verify your account. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleResendCode = async () => {
    if (!email) {
      setError('Email is missing. Please go back to the registration page.');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    try {
      await CognitoService.resendConfirmationCode(email);
      setSuccess(true);
      setSuccess('A new verification code has been sent to your email.');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      console.error('Error resending verification code:', err);
      setError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <Container className="mt-5">
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
              
              {error && <Alert variant="danger">{error}</Alert>}
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
                    disabled={isVerifying || success}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Account'}
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
                    disabled={isVerifying || success}
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
