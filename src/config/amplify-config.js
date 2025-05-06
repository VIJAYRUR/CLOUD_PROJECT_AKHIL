// AWS Amplify configuration for Cognito

// Amplify configuration with Auth category
const amplifyConfig = {
  Auth: {
    // Required: Amazon Cognito Region
    region: process.env.REACT_APP_AWS_REGION || 'us-east-1',

    // Required: Amazon Cognito User Pool ID
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,

    // Required: Amazon Cognito Web Client ID (App client without secret)
    userPoolWebClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,

    // Optional: Authentication Flow Type
    authenticationFlowType: 'USER_PASSWORD_AUTH'
  }
};

// For debugging
console.log('Amplify Config:', {
  region: amplifyConfig.Auth.region,
  userPoolId: amplifyConfig.Auth.userPoolId,
  clientId: amplifyConfig.Auth.userPoolWebClientId
});

// Export the configuration
export default amplifyConfig;
