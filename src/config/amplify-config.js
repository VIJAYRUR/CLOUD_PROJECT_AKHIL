// AWS Amplify configuration for Cognito

// Amplify configuration with Auth category
const amplifyConfig = {
  Auth: {
    // Required: Amazon Cognito Region
    region: 'us-east-1',

    // Required: Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_91eIa7lk8',

    // Required: Amazon Cognito Web Client ID (App client without secret)
    userPoolWebClientId: '7sj65oojf6198tk16723c595d9',

    // Optional: Authentication Flow Type
    authenticationFlowType: 'USER_PASSWORD_AUTH'
  }
};

// Export the configuration
export default amplifyConfig;
