// AWS Configuration
// Using environment variables for all sensitive information
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  // Using environment variables for credentials
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  },
  // Cognito User Pool Configuration
  cognito: {
    userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID || '',
    userPoolWebClientId: process.env.REACT_APP_AWS_APP_CLIENT_ID || '',
    userPoolWebClientSecret: process.env.REACT_APP_AWS_APP_CLIENT_SECRET || '',
    region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    tokenEndpoint: process.env.REACT_APP_AWS_COGNITO_TOKEN_ENDPOINT || '',
    authenticationFlowType: 'USER_PASSWORD_AUTH', // Explicitly set the authentication flow type
    // Add callback URLs
    callbackUrl: process.env.REACT_APP_AWS_COGNITO_CALLBACK_URL || 'http://localhost:3000',
    signOutUrl: process.env.REACT_APP_AWS_COGNITO_SIGNOUT_URL || 'http://localhost:3000',
    hostedUIDomain: process.env.REACT_APP_AWS_COGNITO_HOSTED_UI_DOMAIN || ''
  },
  // DynamoDB configuration
  dynamoDb: {
    tables: {
      users: 'SkillForge_Users',
      plans: 'SkillForge_Plans',
      userPlans: 'SkillForge_UserPlans',
      userPreferences: 'SkillForge_UserPreferences',
      userActivity: 'SkillForge_UserActivity' // Added table for user activity tracking
    }
  }
};

export default awsConfig;
