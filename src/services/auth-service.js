import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js';
import DynamoDBService from './dynamodb-service';
import amplifyConfig from '../config/amplify-config';

// Check if Cognito is properly configured
const isCognitoConfigured =
  amplifyConfig.Auth.userPoolId &&
  amplifyConfig.Auth.userPoolWebClientId;

// Create the Cognito User Pool if configured
let userPool = null;
try {
  if (isCognitoConfigured) {
    userPool = new CognitoUserPool({
      UserPoolId: amplifyConfig.Auth.userPoolId,
      ClientId: amplifyConfig.Auth.userPoolWebClientId
    });
    console.log('Cognito User Pool initialized successfully');
  } else {
    console.warn('Cognito is not properly configured. Authentication will not work.');
  }
} catch (error) {
  console.error('Error initializing Cognito User Pool:', error);
}

// Auth Service - Wrapper around Cognito Service with DynamoDB integration
// If Cognito is not configured, it will use a mock implementation
const AuthService = {
  /**
   * Sign up a new user
   * @param {string} username - Username (email)
   * @param {string} password - Password
   * @param {object} attributes - User attributes
   * @returns {Promise} - Promise that resolves with the sign up data
   */
  signUp: async (username, password, attributes) => {
    try {
      console.log('Signing up user:', username, attributes);

      // Check if Cognito is configured
      if (!isCognitoConfigured || !userPool) {
        console.error('Cognito is not configured properly. Cannot register user.');
        throw new Error('Authentication service is not configured properly. Please contact support.');
      }

      let userId;
      let userEmail = username;
      let userName = attributes.name;

      return new Promise((resolve, reject) => {
        try {
          // Create attribute list
          const attributeList = [];

          // Add email attribute
          const emailAttribute = new CognitoUserAttribute({
            Name: 'email',
            Value: username
          });
          attributeList.push(emailAttribute);

          // Add name attribute
          const nameAttribute = new CognitoUserAttribute({
            Name: 'name',
            Value: attributes.name
          });
          attributeList.push(nameAttribute);

          // Sign up the user
          console.log('Signing up with Cognito SDK');
          userPool.signUp(username, password, attributeList, null, (err, result) => {
            if (err) {
              console.error('Error signing up user with Cognito SDK:', err);
              reject(err);
              return;
            }

            console.log('Sign up successful with Cognito SDK');
            userId = result.userSub;

            // Make sure DynamoDBService.users exists before calling register
            if (!DynamoDBService.users || typeof DynamoDBService.users.register !== 'function') {
              console.error('DynamoDBService.users.register is not a function');
              // Still resolve with the user data from Cognito
              resolve({
                userId: userId,
                email: userEmail,
                name: userName
              });
              return;
            }

            // Store user in DynamoDB
            DynamoDBService.users.register({
              userId: userId,
              email: userEmail,
              name: userName,
              password: password, // Include password for hashing
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            })
            .then(() => {
              // Create default user preferences if the function exists
              if (DynamoDBService.userPreferences && typeof DynamoDBService.userPreferences.create === 'function') {
                return DynamoDBService.userPreferences.create(userId, {
                  learningStyle: 'visual',
                  pacePreference: 'moderate',
                  difficultyPreference: 'challenging',
                  interests: []
                });
              }
              return Promise.resolve();
            })
            .then(() => {
              // Log user activity if the function exists
              if (DynamoDBService.userActivity && typeof DynamoDBService.userActivity.create === 'function') {
                return DynamoDBService.userActivity.create({
                  userId: userId,
                  action: 'REGISTER',
                  timestamp: new Date().toISOString(),
                  details: { method: 'EMAIL_PASSWORD' }
                });
              }
              return Promise.resolve();
            })
            .then(() => {
              resolve({
                userId: userId,
                email: userEmail,
                name: userName
              });
            })
            .catch(dbError => {
              console.error('Error storing user data in DynamoDB:', dbError);
              // Continue even if DB storage fails - user is still registered in Cognito
              resolve({
                userId: userId,
                email: userEmail,
                name: userName
              });
            });
          });
        } catch (authError) {
          console.error('Error signing up with Cognito SDK:', authError);
          reject(authError);
        }
      });
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  /**
   * Confirm sign up with verification code
   * @param {string} username - Username (email)
   * @param {string} code - Verification code
   * @returns {Promise} - Promise that resolves when confirmation is complete
   */
  confirmSignUp: async (username, code) => {
    try {
      console.log('Confirming signup for:', username);

      return new Promise((resolve, reject) => {
        try {
          // Create Cognito user
          const cognitoUser = new CognitoUser({
            Username: username,
            Pool: userPool
          });

          // Confirm registration
          console.log('Confirming registration with Cognito SDK');
          cognitoUser.confirmRegistration(code, true, (err, result) => {
            if (err) {
              console.error('Error confirming registration with Cognito SDK:', err);
              reject(err);
              return;
            }

            console.log('Confirmation successful with Cognito SDK:', result);

            // Log user activity
            DynamoDBService.users.getByEmail(username)
              .then(user => {
                if (user) {
                  return DynamoDBService.userActivity.create({
                    userId: user.userId,
                    action: 'CONFIRM_REGISTRATION',
                    timestamp: new Date().toISOString(),
                    details: { method: code === 'AUTO_CONFIRM' ? 'AUTO' : 'EMAIL_CODE' }
                  });
                }
              })
              .then(() => {
                resolve({ success: true });
              })
              .catch(dbError => {
                console.error('Error logging user activity:', dbError);
                // Continue even if activity logging fails
                resolve({ success: true });
              });
          });
        } catch (authError) {
          console.error('Error confirming registration with Cognito SDK:', authError);
          reject(authError);
        }
      });
    } catch (error) {
      console.error('Error confirming sign up:', error);
      throw error;
    }
  },

  /**
   * Resend confirmation code
   * @param {string} username - Username (email)
   * @returns {Promise} - Promise that resolves when code is sent
   */
  resendConfirmationCode: async (username) => {
    try {
      console.log('Resending confirmation code to:', username);

      return new Promise((resolve, reject) => {
        try {
          // Create Cognito user
          const cognitoUser = new CognitoUser({
            Username: username,
            Pool: userPool
          });

          // Resend confirmation code
          console.log('Resending confirmation code with Cognito SDK');
          cognitoUser.resendConfirmationCode((err, result) => {
            if (err) {
              console.error('Error resending confirmation code with Cognito SDK:', err);
              reject(err);
              return;
            }

            console.log('Confirmation code resent successfully with Cognito SDK:', result);

            // Log user activity
            DynamoDBService.users.getByEmail(username)
              .then(user => {
                if (user) {
                  return DynamoDBService.userActivity.create({
                    userId: user.userId,
                    action: 'RESEND_CONFIRMATION_CODE',
                    timestamp: new Date().toISOString(),
                    details: {}
                  });
                }
              })
              .then(() => {
                resolve({ success: true });
              })
              .catch(dbError => {
                console.error('Error logging user activity:', dbError);
                // Continue even if activity logging fails
                resolve({ success: true });
              });
          });
        } catch (authError) {
          console.error('Error resending confirmation code with Cognito SDK:', authError);
          reject(authError);
        }
      });
    } catch (error) {
      console.error('Error resending confirmation code:', error);
      throw error;
    }
  },

  /**
   * Sign in a user
   * @param {string} username - Username (email)
   * @param {string} password - Password
   * @returns {Promise} - Promise that resolves with the sign in data
   */
  signIn: async (username, password) => {
    try {
      console.log('Signing in user:', username);

      // Check if Cognito is configured
      if (!isCognitoConfigured || !userPool) {
        console.error('Cognito is not configured properly. Cannot sign in user.');
        throw new Error('Authentication service is not configured properly. Please contact support.');
      }

      let userId;
      let userEmail = username;
      let userName = '';
      let token = null;

      return new Promise((resolve, reject) => {
        try {
          // Create authentication details
          const authenticationDetails = new AuthenticationDetails({
            Username: username,
            Password: password
          });

          // Create Cognito user
          const cognitoUser = new CognitoUser({
            Username: username,
            Pool: userPool
          });

          // Authenticate user
          console.log('Authenticating with Cognito directly');
          cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
              console.log('Authentication successful');

              // Get token
              token = result.getIdToken().getJwtToken();
              userId = result.getIdToken().payload.sub;
              userEmail = result.getIdToken().payload.email || username;
              userName = result.getIdToken().payload.name || '';

              console.log('Login successful with Cognito SDK');

              // Check if DynamoDB services are available
              if (!DynamoDBService.users || typeof DynamoDBService.users.getByEmail !== 'function') {
                console.error('DynamoDBService.users.getByEmail is not a function');
                // Still resolve with the user data from Cognito
                resolve({
                  userId: userId,
                  email: userEmail,
                  name: userName,
                  token: token
                });
                return;
              }

              // Update user's last login time in DynamoDB
              DynamoDBService.users.getByEmail(username)
                .then(user => {
                  if (!user) {
                    // Create user record if it doesn't exist
                    if (DynamoDBService.users && typeof DynamoDBService.users.register === 'function') {
                      const newUser = {
                        userId: userId,
                        email: userEmail,
                        name: userName,
                        password: 'COGNITO_MANAGED', // Placeholder since Cognito manages the password
                        createdAt: new Date().toISOString()
                      };
                      return DynamoDBService.users.register(newUser)
                        .then(() => {
                          if (DynamoDBService.userPreferences && typeof DynamoDBService.userPreferences.create === 'function') {
                            return DynamoDBService.userPreferences.create(userId, {
                              learningStyle: 'visual',
                              pacePreference: 'moderate',
                              difficultyPreference: 'challenging',
                              interests: []
                            });
                          }
                          return Promise.resolve();
                        });
                    }
                    return Promise.resolve();
                  } else {
                    // Update last login time
                    if (DynamoDBService.users && typeof DynamoDBService.users.update === 'function') {
                      return DynamoDBService.users.update(user.userId, {
                        lastLogin: new Date().toISOString()
                      });
                    }
                    return Promise.resolve();
                  }
                })
                .then(() => {
                  // Log user activity
                  if (DynamoDBService.userActivity && typeof DynamoDBService.userActivity.create === 'function') {
                    return DynamoDBService.userActivity.create({
                      userId: userId,
                      action: 'LOGIN',
                      timestamp: new Date().toISOString(),
                      details: { method: 'EMAIL_PASSWORD' }
                    });
                  }
                  return Promise.resolve();
                })
                .then(() => {
                  resolve({
                    userId: userId,
                    email: userEmail,
                    name: userName,
                    token: token
                  });
                })
                .catch(dbError => {
                  console.error('Error updating user data in DynamoDB:', dbError);
                  // Continue even if DB update fails
                  resolve({
                    userId: userId,
                    email: userEmail,
                    name: userName,
                    token: token
                  });
                });
            },
            onFailure: (err) => {
              console.error('Error authenticating user:', err);
              reject(err);
            }
          });
        } catch (authError) {
          console.error('Error logging in with Cognito SDK:', authError);
          reject(authError);
        }
      });
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  /**
   * Sign out the current user
   * @returns {Promise} - Promise that resolves when sign out is complete
   */
  signOut: async () => {
    try {
      console.log('Signing out user');

      // Get current user before signing out
      const currentUser = await AuthService.getCurrentUser();

      return new Promise((resolve, reject) => {
        try {
          // Get the current user from the user pool
          const cognitoUser = userPool.getCurrentUser();

          if (cognitoUser) {
            // Sign out
            cognitoUser.signOut();
            console.log('User signed out successfully with Cognito SDK');

            // Log user activity if we have the user ID
            if (currentUser && currentUser.userId) {
              DynamoDBService.userActivity.create({
                userId: currentUser.userId,
                action: 'LOGOUT',
                timestamp: new Date().toISOString(),
                details: {}
              })
              .then(() => {
                resolve(true);
              })
              .catch(dbError => {
                console.error('Error logging user activity:', dbError);
                // Continue even if activity logging fails
                resolve(true);
              });
            } else {
              resolve(true);
            }
          } else {
            console.log('No user to sign out');
            resolve(true);
          }
        } catch (authError) {
          console.error('Error signing out with Cognito SDK:', authError);
          reject(authError);
        }
      });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  /**
   * Get the current authenticated user
   * @returns {Promise} - Promise that resolves with the current user
   */
  getCurrentUser: async () => {
    try {
      return new Promise((resolve, reject) => {
        try {
          // Get the current user from the user pool
          const cognitoUser = userPool.getCurrentUser();

          if (!cognitoUser) {
            console.log('No authenticated user found');
            resolve(null);
            return;
          }

          // Get the user session
          cognitoUser.getSession((err, session) => {
            if (err) {
              console.log('Error getting user session:', err);
              resolve(null);
              return;
            }

            // Get user attributes
            cognitoUser.getUserAttributes((err, attributes) => {
              if (err) {
                console.log('Error getting user attributes:', err);
                // We can still return basic user info even if attributes fail
                resolve({
                  userId: cognitoUser.username,
                  email: cognitoUser.username,
                  name: '',
                  token: session.getIdToken().getJwtToken()
                });
                return;
              }

              // Format user data
              const userData = {
                userId: cognitoUser.username,
                email: cognitoUser.username,
                name: '',
                token: session.getIdToken().getJwtToken()
              };

              // Extract attributes
              if (attributes) {
                attributes.forEach(attr => {
                  if (attr.getName() === 'email') {
                    userData.email = attr.getValue();
                  } else if (attr.getName() === 'name') {
                    userData.name = attr.getValue();
                  }
                });
              }

              resolve(userData);
            });
          });
        } catch (error) {
          console.log('Error getting current user:', error);
          resolve(null);
        }
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Get JWT token
   * @returns {Promise<string>} - Promise that resolves with the JWT token
   */
  getJwtToken: async () => {
    try {
      return new Promise((resolve, reject) => {
        try {
          // Get the current user from the user pool
          const cognitoUser = userPool.getCurrentUser();

          if (!cognitoUser) {
            console.log('No authenticated user found');
            resolve(null);
            return;
          }

          // Get the user session
          cognitoUser.getSession((err, session) => {
            if (err) {
              console.log('Error getting user session:', err);
              resolve(null);
              return;
            }

            // Get the ID token
            const token = session.getIdToken().getJwtToken();
            resolve(token);
          });
        } catch (error) {
          console.log('Error getting JWT token:', error);
          resolve(null);
        }
      });
    } catch (error) {
      console.error('Error getting JWT token:', error);
      return null;
    }
  },

  /**
   * Forgot password - request code
   * @param {string} username - Username (email)
   * @returns {Promise} - Promise that resolves when code is sent
   */
  forgotPassword: async (username) => {
    try {
      console.log('Requesting password reset for:', username);

      return new Promise((resolve, reject) => {
        try {
          // Create Cognito user
          const cognitoUser = new CognitoUser({
            Username: username,
            Pool: userPool
          });

          // Request password reset
          console.log('Requesting password reset with Cognito SDK');
          cognitoUser.forgotPassword({
            onSuccess: (data) => {
              console.log('Password reset code sent successfully:', data);

              // Log user activity
              DynamoDBService.users.getByEmail(username)
                .then(user => {
                  if (user) {
                    return DynamoDBService.userActivity.create({
                      userId: user.userId,
                      action: 'PASSWORD_RESET_REQUEST',
                      timestamp: new Date().toISOString(),
                      details: {}
                    });
                  }
                })
                .then(() => {
                  resolve({ success: true, data });
                })
                .catch(dbError => {
                  console.error('Error logging user activity:', dbError);
                  // Continue even if activity logging fails
                  resolve({ success: true, data });
                });
            },
            onFailure: (err) => {
              console.error('Error requesting password reset with Cognito SDK:', err);
              reject(err);
            }
          });
        } catch (authError) {
          console.error('Error requesting password reset with Cognito SDK:', authError);
          reject(authError);
        }
      });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  },

  /**
   * Forgot password - submit code and new password
   * @param {string} username - Username (email)
   * @param {string} code - Verification code
   * @param {string} newPassword - New password
   * @returns {Promise} - Promise that resolves when password is reset
   */
  forgotPasswordSubmit: async (username, code, newPassword) => {
    try {
      console.log('Resetting password for:', username, 'with code:', code);

      return new Promise((resolve, reject) => {
        try {
          // Create Cognito user
          const cognitoUser = new CognitoUser({
            Username: username,
            Pool: userPool
          });

          // Confirm password reset
          console.log('Confirming password reset with Cognito SDK');
          cognitoUser.confirmPassword(code, newPassword, {
            onSuccess: () => {
              console.log('Password reset confirmed successfully');

              // Log user activity
              DynamoDBService.users.getByEmail(username)
                .then(user => {
                  if (user) {
                    return DynamoDBService.userActivity.create({
                      userId: user.userId,
                      action: 'PASSWORD_RESET_COMPLETE',
                      timestamp: new Date().toISOString(),
                      details: {}
                    });
                  }
                })
                .then(() => {
                  resolve({ success: true });
                })
                .catch(dbError => {
                  console.error('Error logging user activity:', dbError);
                  // Continue even if activity logging fails
                  resolve({ success: true });
                });
            },
            onFailure: (err) => {
              console.error('Error confirming password reset with Cognito SDK:', err);
              reject(err);
            }
          });
        } catch (authError) {
          console.error('Error confirming password reset with Cognito SDK:', authError);
          reject(authError);
        }
      });
    } catch (error) {
      console.error('Error submitting new password:', error);
      throw error;
    }
  },

  /**
   * Change password for authenticated user
   * @param {object} user - Current user
   * @param {string} oldPassword - Old password
   * @param {string} newPassword - New password
   * @returns {Promise} - Promise that resolves when password is changed
   */
  changePassword: async (user, oldPassword, newPassword) => {
    try {
      console.log('Changing password for user:', user?.userId);

      return new Promise((resolve, reject) => {
        try {
          // Get the current user from the user pool
          const cognitoUser = userPool.getCurrentUser();

          if (!cognitoUser) {
            console.error('No authenticated user found');
            reject(new Error('No authenticated user found'));
            return;
          }

          // Get the user session
          cognitoUser.getSession((err, session) => {
            if (err) {
              console.error('Error getting user session:', err);
              reject(err);
              return;
            }

            // Change password
            cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
              if (err) {
                console.error('Error changing password with Cognito SDK:', err);
                reject(err);
                return;
              }

              console.log('Password changed successfully:', result);

              // Log user activity
              if (user && user.userId) {
                DynamoDBService.userActivity.create({
                  userId: user.userId,
                  action: 'PASSWORD_CHANGE',
                  timestamp: new Date().toISOString(),
                  details: {}
                })
                .then(() => {
                  resolve({ success: true, result });
                })
                .catch(dbError => {
                  console.error('Error logging user activity:', dbError);
                  // Continue even if activity logging fails
                  resolve({ success: true, result });
                });
              } else {
                resolve({ success: true, result });
              }
            });
          });
        } catch (authError) {
          console.error('Error changing password with Cognito SDK:', authError);
          reject(authError);
        }
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  /**
   * Update user attributes
   * @param {object} user - Current user
   * @param {object} attributes - Attributes to update
   * @returns {Promise} - Promise that resolves when attributes are updated
   */
  updateUserAttributes: async (user, attributes) => {
    try {
      console.log('Updating attributes for user:', user?.userId, attributes);

      return new Promise((resolve, reject) => {
        try {
          // Get the current user from the user pool
          const cognitoUser = userPool.getCurrentUser();

          if (!cognitoUser) {
            console.error('No authenticated user found');
            reject(new Error('No authenticated user found'));
            return;
          }

          // Get the user session
          cognitoUser.getSession((err, session) => {
            if (err) {
              console.error('Error getting user session:', err);
              reject(err);
              return;
            }

            // Create attribute list
            const attributeList = [];

            // Map attributes to Cognito format
            if (attributes.name) {
              attributeList.push(new CognitoUserAttribute({
                Name: 'name',
                Value: attributes.name
              }));
            }

            if (attributes.email) {
              attributeList.push(new CognitoUserAttribute({
                Name: 'email',
                Value: attributes.email
              }));
            }

            // Only update if we have attributes to update
            if (attributeList.length > 0) {
              // Update attributes
              cognitoUser.updateAttributes(attributeList, (err, result) => {
                if (err) {
                  console.error('Error updating attributes with Cognito SDK:', err);
                  reject(err);
                  return;
                }

                console.log('User attributes updated successfully in Cognito:', result);

                // Update attributes in DynamoDB
                if (user && user.userId) {
                  // Only update fields that are allowed to be updated
                  const dbAttributes = {};
                  if (attributes.name) dbAttributes.name = attributes.name;
                  if (attributes.email) dbAttributes.email = attributes.email;

                  // Only update DynamoDB if we have attributes to update
                  if (Object.keys(dbAttributes).length > 0) {
                    DynamoDBService.users.update(user.userId, dbAttributes)
                      .then(() => {
                        // Log user activity
                        return DynamoDBService.userActivity.create({
                          userId: user.userId,
                          action: 'PROFILE_UPDATE',
                          timestamp: new Date().toISOString(),
                          details: { updatedFields: Object.keys(attributes) }
                        });
                      })
                      .then(() => {
                        resolve({ success: true, result });
                      })
                      .catch(dbError => {
                        console.error('Error updating user data in DynamoDB:', dbError);
                        // Continue even if DB update fails
                        resolve({ success: true, result });
                      });
                  } else {
                    resolve({ success: true, result });
                  }
                } else {
                  resolve({ success: true, result });
                }
              });
            } else {
              resolve({ success: true });
            }
          });
        } catch (authError) {
          console.error('Error updating attributes with Cognito SDK:', authError);
          reject(authError);
        }
      });
    } catch (error) {
      console.error('Error updating user attributes:', error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} - Promise that resolves with authentication status
   */
  isAuthenticated: async () => {
    try {
      return new Promise((resolve, reject) => {
        try {
          // Get the current user from the user pool
          const cognitoUser = userPool.getCurrentUser();

          if (!cognitoUser) {
            console.log('No authenticated user found');
            resolve(false);
            return;
          }

          // Get the user session to verify authentication
          cognitoUser.getSession((err, session) => {
            if (err) {
              console.log('Error getting user session:', err);
              resolve(false);
              return;
            }

            // Check if session is valid
            resolve(session.isValid());
          });
        } catch (error) {
          console.log('Error checking authentication status:', error);
          resolve(false);
        }
      });
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }
};

export default AuthService;
