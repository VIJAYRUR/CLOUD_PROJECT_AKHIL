# Authentication System

SkillForge uses AWS Cognito for user authentication, providing a secure and scalable authentication system with features like user registration, login, password recovery, and email verification.

## Authentication Flow

![Authentication Flow Diagram](./images/auth-flow.png)

### Registration Process

1. **User Registration**: Users enter their email, name, and password.
2. **Email Verification**: A verification code is sent to the user's email.
3. **Account Confirmation**: User enters the verification code to confirm their account.
4. **Profile Creation**: Upon successful verification, a user profile is created in DynamoDB.

### Login Process

1. **User Login**: Users enter their email and password.
2. **Token Generation**: Upon successful authentication, Cognito issues JWT tokens.
3. **Session Management**: The application stores tokens in browser storage and includes them in API requests.
4. **Auto Refresh**: Tokens are automatically refreshed when they expire.

### Password Recovery

1. **Forgot Password**: User initiates password recovery with their email.
2. **Verification Code**: A verification code is sent to the user's email.
3. **Password Reset**: User enters the code and sets a new password.

## Implementation Details

### AWS Cognito Configuration

SkillForge uses the following Cognito settings:

- **User Pool ID**: `us-east-1_91eIa7lk8`
- **App Client**: Created without a client secret
- **Authentication Flow**: Email/password (no MFA)
- **Password Policy**: Minimum 8 characters, requiring uppercase, lowercase, numbers, and special characters

### Authentication Components

The authentication system consists of the following React components:

- `Login.js`: Handles user login
- `Register.js`: Manages user registration
- `ConfirmRegistration.js`: Verifies user email with confirmation code
- `ForgotPassword.js`: Manages password recovery process
- `AuthContext.js`: Provides authentication state and methods to the application

### Security Considerations

- **JWT Tokens**: Authentication uses secure JWT tokens with expiration
- **HTTPS**: All communication is encrypted using HTTPS
- **XSS Protection**: React's built-in protections against XSS attacks
- **CSRF Protection**: Tokens are stored securely to prevent CSRF attacks

## Code Examples

### Login Implementation

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    // Simple login flow
    await login(email, password);
    navigate('/');
  } catch (error) {
    console.error('Login attempt failed:', error);

    // If the user needs to confirm their account, redirect to the confirmation page
    if (error.code === 'UserNotConfirmedException') {
      navigate('/confirm');
      return;
    }

    // Handle other errors
    if (error.code === 'NotAuthorizedException') {
      setError('Incorrect username or password');
    } else if (error.code === 'UserNotFoundException') {
      setError('User does not exist');
    } else {
      setError('An error occurred during login. Please try again.');
    }
  }
};
```

### Token Management

```jsx
// Store tokens after successful authentication
const storeTokens = (tokens) => {
  localStorage.setItem('accessToken', tokens.accessToken.jwtToken);
  localStorage.setItem('idToken', tokens.idToken.jwtToken);
  localStorage.setItem('refreshToken', tokens.refreshToken.token);
  localStorage.setItem('tokenExpiration', new Date(tokens.accessToken.payload.exp * 1000).toISOString());
};

// Get current authentication status
const isAuthenticated = () => {
  const tokenExpiration = localStorage.getItem('tokenExpiration');
  if (!tokenExpiration) return false;
  
  return new Date(tokenExpiration) > new Date();
};
```

## Troubleshooting

### Common Authentication Issues

1. **"User not confirmed" error**: The user needs to verify their email. Direct them to the confirmation page.

2. **"Incorrect username or password" error**: Verify credentials or use the password recovery option.

3. **Token expiration issues**: If users are unexpectedly logged out, check the token refresh mechanism.

4. **CORS errors**: Ensure the Cognito domain is properly configured for your application domain.

## Additional Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
- [JWT.io](https://jwt.io/) - For debugging JWT tokens
- [OAuth 2.0 Specification](https://oauth.net/2/)
