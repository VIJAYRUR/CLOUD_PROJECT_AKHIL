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
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
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

  /**
   * Resend confirmation code for user registration
   * @param {string} email - User's email
   * @returns {Promise} - Promise that resolves when code is sent
   */
  resendConfirmationCode: (email) => {
    return new Promise((resolve, reject) => {
      // Check if Cognito is configured
      if (!isCognitoConfigured) {
        console.error('Cognito is not configured. Please set up the App Client ID.');
        reject(new Error('Cognito is not configured. Please set up the App Client ID.'));
        return;
      }

      // Calculate the SECRET_HASH
      const secretHash = calculateSecretHash(email);

      // Create params for resendConfirmationCode
      const params = {
        ClientId: cognitoConfig.userPoolWebClientId,
        Username: email
      };

      // Add SECRET_HASH if we have a client secret
      if (secretHash) {
        params.SecretHash = secretHash;
        console.log('Adding SECRET_HASH to resendConfirmationCode params');
      }

      // Use the AWS SDK directly to resend confirmation code
      const cognito = new AWS.CognitoIdentityServiceProvider({ region: cognitoConfig.region });

      cognito.resendConfirmationCode(params, (err, data) => {
        if (err) {
          console.error('Error resending confirmation code:', err);
          reject(err);
          return;
        }

        console.log('Confirmation code resent successfully:', data);
        resolve(data);
      });
    });
  },

  /**
   * Confirm user registration with verification code
   * @param {string} email - User's email
   * @param {string} code - Verification code
   * @returns {Promise} - Promise that resolves when confirmation is complete
   */
  confirmRegistration: (email, code) => {
    return new Promise((resolve, reject) => {
      // Check if Cognito is configured
      if (!isCognitoConfigured) {
        console.error('Cognito is not configured. Please set up the App Client ID.');
        reject(new Error('Cognito is not configured. Please set up the App Client ID.'));
        return;
      }

      // Calculate the SECRET_HASH
      const secretHash = calculateSecretHash(email);

      // Create params for confirmSignUp
      const params = {
        ClientId: cognitoConfig.userPoolWebClientId,
        Username: email,
        ConfirmationCode: code,
        ForceAliasCreation: true
      };

      // Add SECRET_HASH if we have a client secret
      if (secretHash) {
        params.SecretHash = secretHash;
        console.log('Adding SECRET_HASH to confirmSignUp params');
      }

      // Use the AWS SDK directly to confirm registration
      const cognito = new AWS.CognitoIdentityServiceProvider({ region: cognitoConfig.region });

      cognito.confirmSignUp(params, (err, result) => {
        if (err) {
          console.error('Error confirming registration:', err);
          reject(err);
          return;
        }

        console.log('Registration confirmed successfully:', result);
        resolve(result);
      });
    });
  },

  /**
   * Login user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - Promise that resolves with the user data
   */
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      // Check if Cognito is configured
      if (!isCognitoConfigured) {
        console.error('Cognito is not configured. Please set up the App Client ID.');
        reject(new Error('Cognito is not configured. Please set up the App Client ID.'));
        return;
      }

      console.log('Attempting to login user:', email);

      // Calculate the SECRET_HASH
      const secretHash = calculateSecretHash(email);

      // Use the direct InitiateAuth API call with USER_PASSWORD_AUTH flow
      const cognito = new AWS.CognitoIdentityServiceProvider({ region: cognitoConfig.region });

      // Create params for InitiateAuth
      // Use USER_PASSWORD_AUTH flow
      const params = {
        AuthFlow: 'USER_PASSWORD_AUTH', // This requires ALLOW_USER_PASSWORD_AUTH to be enabled in Cognito
        ClientId: cognitoConfig.userPoolWebClientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      };

      // Add SECRET_HASH if we have a client secret
      if (secretHash) {
        params.AuthParameters.SECRET_HASH = secretHash;
        console.log('Adding SECRET_HASH to authentication params');
      }

      console.log('Using InitiateAuth with params:', JSON.stringify({
        ...params,
        AuthParameters: {
          ...params.AuthParameters,
          PASSWORD: '********' // Don't log the actual password
        }
      }));

      // Use InitiateAuth which is the standard way to authenticate
      cognito.initiateAuth(params, (err, result) => {
        if (err) {
          console.error('Error with InitiateAuth using USER_PASSWORD_AUTH:', err);

          // If the error is about USER_PASSWORD_AUTH not being enabled, try with USER_SRP_AUTH
          if (err.message && err.message.includes('USER_PASSWORD_AUTH flow not enabled')) {
            console.log('Falling back to USER_SRP_AUTH flow...');

            // Create a CognitoUser instance
            const userData = {
              Username: email,
              Pool: userPool
            };

            const cognitoUser = new CognitoUser(userData);

            // Create authentication details
            const authenticationData = {
              Username: email,
              Password: password
            };

            // Add SECRET_HASH if we have a client secret
            if (secretHash) {
              authenticationData.SecretHash = secretHash;
              console.log('Adding SECRET_HASH to AuthenticationDetails');
            }

            const authenticationDetails = new AuthenticationDetails(authenticationData);

            // Authenticate using the SRP flow
            cognitoUser.authenticateUser(authenticationDetails, {
              onSuccess: (session) => {
                console.log('Login successful with USER_SRP_AUTH flow');

                // Get user attributes
                cognitoUser.getUserAttributes((attrErr, attributes) => {
                  if (attrErr) {
                    console.error('Error getting user attributes:', attrErr);
                    reject(attrErr);
                    return;
                  }

                  const user = {
                    userId: cognitoUser.getUsername(),
                    email: email,
                    name: attributes.find(attr => attr.Name === 'name')?.Value || '',
                    token: session.getIdToken().getJwtToken()
                  };

                  resolve(user);
                });
              },
              onFailure: (fallbackErr) => {
                console.error('Error with USER_SRP_AUTH flow:', fallbackErr);
                reject(fallbackErr);
              }
            });
            return;
          }

          // If it's not the USER_PASSWORD_AUTH error or the fallback also failed
          reject(err);
          return;
        }

        console.log('Login successful with InitiateAuth:', result);

        // Get user info from the tokens
        const idToken = result.AuthenticationResult.IdToken;
        const accessToken = result.AuthenticationResult.AccessToken;

        // Get user attributes
        cognito.getUser({
          AccessToken: accessToken
        }, (err, userData) => {
          if (err) {
            console.error('Error getting user attributes:', err);
            reject(err);
            return;
          }

          const attributes = userData.UserAttributes || [];

          const user = {
            userId: userData.Username,
            email: email,
            name: attributes.find(attr => attr.Name === 'name')?.Value || '',
            token: idToken
          };

          resolve(user);
        });
      });
    });
  },

  /**
   * Logout user
   */
  logout: () => {
    // Check if Cognito is configured
    if (!isCognitoConfigured) {
      console.warn('Cognito is not configured. No need to sign out.');
      return;
    }

    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
      console.log('User signed out');
    }
  },

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
  },

  /**
   * Reset password (forgot password)
   * @param {string} email - User's email
   * @returns {Promise} - Promise that resolves when reset code is sent
   */
  forgotPassword: (email) => {
    return new Promise((resolve, reject) => {
      // Check if Cognito is configured
      if (!isCognitoConfigured) {
        console.error('Cognito is not configured. Please set up the App Client ID.');
        reject(new Error('Cognito is not configured. Please set up the App Client ID.'));
        return;
      }

      // Calculate the SECRET_HASH
      const secretHash = calculateSecretHash(email);

      // Create params for forgotPassword
      const params = {
        ClientId: cognitoConfig.userPoolWebClientId,
        Username: email
      };

      // Add SECRET_HASH if we have a client secret
      if (secretHash) {
        params.SecretHash = secretHash;
        console.log('Adding SECRET_HASH to forgotPassword params');
      }

      // Use the AWS SDK directly to request password reset
      const cognito = new AWS.CognitoIdentityServiceProvider({ region: cognitoConfig.region });

      cognito.forgotPassword(params, (err, data) => {
        if (err) {
          console.error('Error sending password reset code:', err);
          reject(err);
          return;
        }

        console.log('Password reset code sent successfully:', data);
        resolve(data);
      });
    });
  },

  /**
   * Confirm new password with reset code
   * @param {string} email - User's email
   * @param {string} code - Reset code
   * @param {string} newPassword - New password
   * @returns {Promise} - Promise that resolves when password is reset
   */
  confirmPassword: (email, code, newPassword) => {
    return new Promise((resolve, reject) => {
      // Check if Cognito is configured
      if (!isCognitoConfigured) {
        console.error('Cognito is not configured. Please set up the App Client ID.');
        reject(new Error('Cognito is not configured. Please set up the App Client ID.'));
        return;
      }

      // Calculate the SECRET_HASH
      const secretHash = calculateSecretHash(email);

      // Create params for confirmForgotPassword
      const params = {
        ClientId: cognitoConfig.userPoolWebClientId,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword
      };

      // Add SECRET_HASH if we have a client secret
      if (secretHash) {
        params.SecretHash = secretHash;
        console.log('Adding SECRET_HASH to confirmForgotPassword params');
      }

      // Use the AWS SDK directly to confirm password reset
      const cognito = new AWS.CognitoIdentityServiceProvider({ region: cognitoConfig.region });

      cognito.confirmForgotPassword(params, (err, data) => {
        if (err) {
          console.error('Error resetting password:', err);
          reject(err);
          return;
        }

        console.log('Password reset successful');
        resolve(data);
      });
    });
  },

  /**
   * Change password (when user is logged in)
   * @param {string} oldPassword - Old password
   * @param {string} newPassword - New password
   * @returns {Promise} - Promise that resolves when password is changed
   */
  changePassword: (oldPassword, newPassword) => {
    return new Promise((resolve, reject) => {
      // Check if Cognito is configured
      if (!isCognitoConfigured) {
        console.error('Cognito is not configured. Please set up the App Client ID.');
        reject(new Error('Cognito is not configured. Please set up the App Client ID.'));
        return;
      }

      const cognitoUser = userPool.getCurrentUser();

      if (!cognitoUser) {
        reject(new Error('No user is logged in'));
        return;
      }

      cognitoUser.getSession((err, session) => {
        if (err) {
          console.error('Error getting session:', err);
          reject(err);
          return;
        }

        cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
          if (err) {
            console.error('Error changing password:', err);
            reject(err);
            return;
          }

          console.log('Password changed successfully:', result);
          resolve(result);
        });
      });
    });
  },

  /**
   * Update user attributes
   * @param {Object} attributes - Attributes to update
   * @returns {Promise} - Promise that resolves when attributes are updated
   */
  updateUserAttributes: (attributes) => {
    return new Promise((resolve, reject) => {
      // Check if Cognito is configured
      if (!isCognitoConfigured) {
        console.error('Cognito is not configured. Please set up the App Client ID.');
        reject(new Error('Cognito is not configured. Please set up the App Client ID.'));
        return;
      }

      const cognitoUser = userPool.getCurrentUser();

      if (!cognitoUser) {
        reject(new Error('No user is logged in'));
        return;
      }

      cognitoUser.getSession((err, session) => {
        if (err) {
          console.error('Error getting session:', err);
          reject(err);
          return;
        }

        // Prepare attribute list
        const attributeList = Object.entries(attributes).map(([key, value]) => {
          return new CognitoUserAttribute({
            Name: key,
            Value: value
          });
        });

        cognitoUser.updateAttributes(attributeList, (err, result) => {
          if (err) {
            console.error('Error updating attributes:', err);
            reject(err);
            return;
          }

          console.log('Attributes updated successfully:', result);
          resolve(result);
        });
      });
    });
  }
};

export default CognitoService;
