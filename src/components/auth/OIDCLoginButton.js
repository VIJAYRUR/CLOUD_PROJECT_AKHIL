import React from 'react';
import amplifyConfig from '../../config/amplify-config';

const OIDCLoginButton = ({ className, text = 'Sign in with Cognito' }) => {
  const handleLogin = async () => {
    try {
      // Construct the Cognito hosted UI URL
      const region = amplifyConfig.Auth.region;
      const userPoolId = amplifyConfig.Auth.userPoolId;
      const clientId = amplifyConfig.Auth.userPoolWebClientId;
      const redirectUri = encodeURIComponent(window.location.origin);

      // Construct the Cognito domain
      const domain = `${userPoolId.split('_')[0]}.auth.${region}.amazoncognito.com`;

      // Construct the full URL
      const url = `https://${domain}/login?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirectUri}`;

      console.log('Initiating Cognito sign-in with hosted UI');
      window.location.href = url;
    } catch (error) {
      console.error('Error initiating federated sign in:', error);
    }
  };

  return (
    <button
      type="button"
      className={`btn btn-primary ${className}`}
      onClick={handleLogin}
    >
      <i className="bi bi-shield-lock me-2"></i>
      {text}
    </button>
  );
};

export default OIDCLoginButton;
