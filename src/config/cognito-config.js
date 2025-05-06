// AWS Cognito Configuration
import awsConfig from './aws-config';

const cognitoConfig = {
  region: awsConfig.cognito.region,
  userPoolId: awsConfig.cognito.userPoolId,
  userPoolWebClientId: awsConfig.cognito.userPoolWebClientId,
  userPoolWebClientSecret: awsConfig.cognito.userPoolWebClientSecret,
  authenticationFlowType: 'USER_PASSWORD_AUTH', // Use USER_PASSWORD_AUTH flow
  tokenEndpoint: awsConfig.cognito.tokenEndpoint
};

export default cognitoConfig;
