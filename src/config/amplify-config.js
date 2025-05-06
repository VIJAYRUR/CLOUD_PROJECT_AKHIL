// AWS Amplify configuration for Cognito

// Amplify configuration with Auth category
const amplifyConfig = {
  Auth: {
    // Required: Amazon Cognito Region
    region: process.env.REACT_APP_AWS_REGION || 'us-east-1',

    // Required: Amazon Cognito User Pool ID
    userPoolId: process.env.REACT_APP_AMPLIFY_USER_POOL_ID || '',

    // Required: Amazon Cognito Web Client ID (App client without secret)
    userPoolWebClientId: process.env.REACT_APP_AMPLIFY_USER_POOL_WEB_CLIENT_ID || '',

    // Optional: Authentication Flow Type
    authenticationFlowType: 'USER_PASSWORD_AUTH'
  }
};

// Export the configuration
export default amplifyConfig;
