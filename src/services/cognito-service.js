import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js';
import cognitoConfig from '../config/cognito-config';
import CryptoJS from 'crypto-js';
import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  region: cognitoConfig.region,
  credentials: new AWS.Credentials({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
  })
});

// Check if Cognito is properly configured
const isCognitoConfigured = cognitoConfig.userPoolId && cognitoConfig.userPoolWebClientId;

// Function to calculate the SECRET_HASH
const calculateSecretHash = (username) => {
  if (!cognitoConfig.userPoolWebClientSecret) {
    console.warn('No client secret available for SECRET_HASH calculation');
    return undefined;
  }

  try {
    // The message is username + clientId
    const message = username + cognitoConfig.userPoolWebClientId;

    // Create a hash using HMAC SHA256
    const hashObj = CryptoJS.HmacSHA256(
      message,
      cognitoConfig.userPoolWebClientSecret
    );

    // Convert to Base64
    const hashBase64 = CryptoJS.enc.Base64.stringify(hashObj);

    console.log('Generated SECRET_HASH for', username);
    return hashBase64;
  } catch (error) {
    console.error('Error calculating SECRET_HASH:', error);
    return undefined;
  }
};

// Initialize the Cognito User Pool if configured
let userPool = null;
if (isCognitoConfigured) {
  userPool = new CognitoUserPool({
    UserPoolId: cognitoConfig.userPoolId,
    ClientId: cognitoConfig.userPoolWebClientId,
    AuthenticationFlowType: cognitoConfig.authenticationFlowType || 'USER_PASSWORD_AUTH'
  });

  console.log('Cognito User Pool initialized with:', {
    UserPoolId: cognitoConfig.userPoolId,
    ClientId: cognitoConfig.userPoolWebClientId,
    AuthenticationFlowType: cognitoConfig.authenticationFlowType || 'USER_PASSWORD_AUTH'
  });
}

// Cognito Service
const CognitoService = {
  /**
   * Check if Cognito is configured
   * @returns {boolean} - Whether Cognito is configured
   */
  isConfigured: () => {
    return isCognitoConfigured;
  },

  /**
   * Register a new user
   * @param {Object} userData - User data (name, email, password)
   * @returns {Promise} - Promise that resolves with the user data
   */
  register: (userData) => {
    return new Promise((resolve, reject) => {
      // Check if Cognito is configured
      if (!isCognitoConfigured) {
        console.error('Cognito is not configured. Please set up the App Client ID.');
        reject(new Error('Cognito is not configured. Please set up the App Client ID.'));
        return;
      }

      // Prepare attributes
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'name',
          Value: userData.name
        }),
        new CognitoUserAttribute({
          Name: 'email',
          Value: userData.email
        })
      ];

      // Calculate the SECRET_HASH
      const secretHash = calculateSecretHash(userData.email);

      // According to AWS Cognito documentation, we need to include the SECRET_HASH as a parameter
      // Create a signUpParams object
      const signUpParams = {
        ClientId: cognitoConfig.userPoolWebClientId,
        Username: userData.email,
        Password: userData.password,
        UserAttributes: attributeList
      };

      // Add SECRET_HASH if available
      if (secretHash) {
        signUpParams.SecretHash = secretHash;
        console.log('Adding SECRET_HASH to signUp params');
      }

      // Use the AWS SDK directly to sign up
      const cognito = new AWS.CognitoIdentityServiceProvider({ region: cognitoConfig.region });

      cognito.signUp(signUpParams, (err, result) => {
        if (err) {
          console.error('Error registering user:', err);
          reject(err);
          return;
        }

        console.log('User registered successfully:', result);
        resolve({
          userId: result.UserSub,
          email: userData.email,
          name: userData.name
        });
      });
    });
  },

  // Rest of the service methods...
  // (truncated for brevity)
  
  /**
   * Get current authenticated user
   * @returns {Promise} - Promise that resolves with the current user data
   */
  getCurrentUser: () => {
    return new Promise((resolve, reject) => {
      // Check if Cognito is configured
      if (!isCognitoConfigured) {
        console.warn('Cognito is not configured. No user can be logged in.');
        resolve(null);
        return;
      }

      const cognitoUser = userPool.getCurrentUser();

      if (!cognitoUser) {
        resolve(null);
        return;
      }

      cognitoUser.getSession((err, session) => {
        if (err) {
          console.error('Error getting session:', err);
          reject(err);
          return;
        }

        // Get user attributes
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            console.error('Error getting user attributes:', err);
            reject(err);
            return;
          }

          const user = {
            userId: cognitoUser.getUsername(),
            email: attributes.find(attr => attr.Name === 'email')?.Value || '',
            name: attributes.find(attr => attr.Name === 'name')?.Value || '',
            token: session.getIdToken().getJwtToken()
          };

          resolve(user);
        });
      });
    });
  }
};

export default CognitoService;
