import React, { createContext, useState, useEffect, useContext } from 'react';
import DynamoDBService from '../services/dynamodb-service';
import AuthService from '../services/auth-service';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [tempEmail, setTempEmail] = useState('');

  // Initialize DynamoDB tables on app start
  useEffect(() => {
    const initializeTables = async () => {
      try {
        await DynamoDBService.initializeTables();
      } catch (error) {
        console.error('Error initializing DynamoDB tables:', error);
        setError('Failed to initialize database. Please try again later.');
      }
    };

    initializeTables();
  }, []);

  // Check for saved user session on app load
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get the current authenticated user from Cognito SDK
        const userData = await AuthService.getCurrentUser();

        if (userData) {
          // Format user data
          const user = {
            userId: userData.userId,
            email: userData.email,
            name: userData.name || '',
            token: userData.token
          };

          setCurrentUser(user);

          // Load user preferences from DynamoDB
          try {
            const preferences = await DynamoDBService.userPreferences.getByUserId(user.userId);
            setUserPreferences(preferences);
          } catch (prefError) {
            console.error('Error loading user preferences:', prefError);
            // Create default preferences if they don't exist
            const defaultPreferences = {
              learningStyle: 'visual',
              pacePreference: 'moderate',
              difficultyPreference: 'challenging',
              interests: []
            };

            await DynamoDBService.userPreferences.create(user.userId, defaultPreferences);
            setUserPreferences(defaultPreferences);
          }
        }
      } catch (error) {
        console.error('Error loading user session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Register user with Amplify
      await AuthService.signUp(
        userData.email,
        userData.password,
        {
          name: userData.name,
          email: userData.email
        }
      );

      // No need to set confirmation flags since we're auto-confirming
      // Users can directly proceed to login
      return { email: userData.email, confirmed: true };
    } catch (error) {
      console.error('Registration error:', error);

      // Handle specific Cognito errors
      if (error.code === 'UsernameExistsException') {
        setError('An account with this email already exists.');
      } else if (error.code === 'InvalidPasswordException') {
        setError('Password does not meet requirements. It must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.');
      } else {
        setError(error.message || 'Failed to register. Please try again.');
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Confirm user registration
  const confirmRegistration = async (email, code) => {
    try {
      setLoading(true);
      setError(null);

      await AuthService.confirmSignUp(email || tempEmail, code);
      setNeedsConfirmation(false);

      return true;
    } catch (error) {
      console.error('Confirmation error:', error);

      if (error.code === 'CodeMismatchException') {
        setError('Invalid verification code. Please try again.');
      } else if (error.code === 'ExpiredCodeException') {
        setError('Verification code has expired. Please request a new one.');
      } else {
        setError(error.message || 'Failed to confirm registration. Please try again.');
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Resend confirmation code
  const resendConfirmationCode = async (email) => {
    try {
      setLoading(true);
      setError(null);

      await AuthService.resendConfirmationCode(email || tempEmail);

      return true;
    } catch (error) {
      console.error('Error resending code:', error);
      setError(error.message || 'Failed to resend code. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Login with Cognito SDK
      const userData = await AuthService.signIn(email, password);

      // Format user data
      const user = {
        userId: userData.userId,
        email: userData.email,
        name: userData.name || '',
        token: userData.token
      };

      setCurrentUser(user);

      // Load or create user preferences in DynamoDB
      try {
        const preferences = await DynamoDBService.userPreferences.getByUserId(user.userId);
        setUserPreferences(preferences);
      } catch (prefError) {
        // Create default preferences if they don't exist
        const defaultPreferences = {
          learningStyle: 'visual',
          pacePreference: 'moderate',
          difficultyPreference: 'challenging',
          interests: []
        };

        await DynamoDBService.userPreferences.create(user.userId, defaultPreferences);
        setUserPreferences(defaultPreferences);
      }

      return user;
    } catch (error) {
      console.error('Login error:', error);

      // Handle specific Cognito errors with more detailed messages
      if (error.code === 'NotAuthorizedException') {
        console.log('NotAuthorizedException details:', error);
        if (error.message.includes('Incorrect username or password')) {
          setError('Incorrect username or password. Please try again.');
        } else {
          setError('Authentication failed. Please try again or contact support.');
        }
      } else if (error.code === 'UserNotFoundException') {
        setError('Account not found. Please check your email or sign up.');
      } else if (error.code === 'UserNotConfirmedException') {
        setError('Your account is not confirmed. Please check your email for a verification code.');
        setNeedsConfirmation(true);
        setTempEmail(email);
      } else if (error.code === 'PasswordResetRequiredException') {
        setError('You need to reset your password. Please use the forgot password link below.');
      } else if (error.code === 'ResourceNotFoundException') {
        setError('Authentication service configuration error. Please contact support.');
      } else {
        console.error('Unhandled login error:', error);
        setError(error.message || 'Failed to login. Please try again.');
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      // Logout from Amplify
      await AuthService.signOut();

      // Clear local state
      setCurrentUser(null);
      setUserPreferences(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        throw new Error('No user is logged in');
      }

      // Get current authenticated user
      const cognitoUser = await AuthService.getCurrentUser();

      // Update user attributes in Cognito
      const attributes = {};
      if (userData.name) attributes.name = userData.name;
      if (userData.email) attributes.email = userData.email;

      await AuthService.updateUserAttributes(cognitoUser, attributes);

      // Update local state
      const updatedUser = {
        ...currentUser,
        ...userData
      };

      setCurrentUser(updatedUser);

      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        throw new Error('No user is logged in');
      }

      // Update preferences in DynamoDB
      const updatedPreferences = await DynamoDBService.userPreferences.update(
        currentUser.userId,
        preferences
      );

      setUserPreferences(updatedPreferences);

      return updatedPreferences;
    } catch (error) {
      console.error('Update preferences error:', error);
      setError(error.message || 'Failed to update preferences. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (oldPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        throw new Error('No user is logged in');
      }

      // Get current authenticated user
      const cognitoUser = await AuthService.getCurrentUser();

      // Change password in Cognito
      await AuthService.changePassword(cognitoUser, oldPassword, newPassword);

      return true;
    } catch (error) {
      console.error('Change password error:', error);

      if (error.code === 'NotAuthorizedException') {
        setError('Incorrect current password.');
      } else if (error.code === 'InvalidPasswordException') {
        setError('New password does not meet requirements. It must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.');
      } else {
        setError(error.message || 'Failed to change password. Please try again.');
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      await AuthService.forgotPassword(email);
      setTempEmail(email);

      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to send reset code. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Confirm new password with reset code
  const confirmPassword = async (email, code, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      await AuthService.forgotPasswordSubmit(email || tempEmail, code, newPassword);

      return true;
    } catch (error) {
      console.error('Confirm password error:', error);

      if (error.code === 'CodeMismatchException') {
        setError('Invalid verification code. Please try again.');
      } else if (error.code === 'ExpiredCodeException') {
        setError('Verification code has expired. Please request a new one.');
      } else if (error.code === 'InvalidPasswordException') {
        setError('Password does not meet requirements. It must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.');
      } else {
        setError(error.message || 'Failed to reset password. Please try again.');
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    currentUser,
    userPreferences,
    loading,
    error,
    needsConfirmation,
    tempEmail,
    register,
    confirmRegistration,
    resendConfirmationCode,
    login,
    logout,
    updateProfile,
    updatePreferences,
    changePassword,
    forgotPassword,
    confirmPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
