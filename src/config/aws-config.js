// AWS Configuration
// Using environment variables for credentials
const awsConfig = {
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
  // Using environment variables for credentials
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
  },
  // Cognito User Pool Configuration
  cognito: {
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
    userPoolWebClientSecret: process.env.REACT_APP_COGNITO_CLIENT_SECRET,
    region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    tokenEndpoint: `https://cognito-idp.${process.env.REACT_APP_AWS_REGION || 'us-east-1'}.amazonaws.com/${process.env.REACT_APP_COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
    authenticationFlowType: 'USER_PASSWORD_AUTH', // Explicitly set the authentication flow type
    // Add callback URLs
    callbackUrl: process.env.REACT_APP_CALLBACK_URL || 'http://localhost:3000',
    signOutUrl: process.env.REACT_APP_SIGNOUT_URL || 'http://localhost:3000',
    hostedUIDomain: process.env.REACT_APP_HOSTED_UI_DOMAIN
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
