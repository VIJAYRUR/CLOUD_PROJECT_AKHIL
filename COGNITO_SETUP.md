# AWS Cognito Setup Guide for SkillForge

This guide will walk you through setting up AWS Cognito for the SkillForge application.

## Prerequisites

- An AWS account
- AWS CLI installed and configured (optional, but helpful)
- Basic understanding of AWS services

## Step 1: Create a Cognito User Pool

1. Sign in to the AWS Management Console and navigate to the Cognito service.
2. Click "Create user pool".
3. For "Cognito user pool sign-in options", select "Email" as the primary authentication method.
4. Click "Next".
5. Configure security requirements:
   - Password policy: Choose "Cognito defaults" or customize as needed
int] 
src/services/auth-service.js
  Line 442:14:  'result' is not defined  no-undef
  Line 505:14:  'result' is not defined  no-undef
  Line 551:14:  'result' is not defined  no-undef

Search for the keywords to learn more about each error.
WARNING in [eslint] 
src/services/auth-service.js
  Line 426:7:  Unreachable code  no-unreachable
  Line 489:7:  Unreachable code  no-unreachable
  Line 537:7:  Unreachable code  no-unreachable

ERROR in [eslint] 
src/services/auth-service.js
  Line 442:14:  'result' is not defined  no-undef
  Line 505:14:  'result' is not defined  no-undef
  Line 551:14:  'result' is not defined  no-undef

Search for the keywords to learn more about each error.

webpack compiled with 1 error and 1 warning

   - Click "Next"
6. Configure sign-up experience:
   - Self-service sign-up: Enable
   - Required attributes: Select "name" and "email"
   - Custom attributes: Add any custom attributes you need
   - Click "Next"
7. Configure message delivery:
   - Email provider: Choose "Send email with Cognito" for development or configure SES for production
   - From email address: Enter your email address
   - Reply-to email address: Enter your email address
   - Click "Next"
8. Integrate your app:
   - User pool name: Enter "SkillForge-UserPool"
   - App client name: Enter "SkillForge-Web"
   - Client secret: Choose "Generate a client secret" (Important: Our implementation requires a client secret)
   - Click "Next"
9. Review all settings and click "Create user pool".

## Step 2: Configure the User Pool

1. After creating the user pool, note the "User Pool ID" from the pool details page.
2. Navigate to the "App integration" tab.
3. Under "App clients and analytics", click on the app client you created.
4. Note the "Client ID".
5. Click on "Edit" for the app client.
6. Under "Auth Flows Configuration", make sure to enable "ALLOW_USER_PASSWORD_AUTH" (this is critical for our login implementation).
7. Click "Save changes".
8. Under "Hosted UI", click "Edit".
9. Configure the Hosted UI:
   - Allowed callback URLs: Add `http://localhost:3000/` for development
   - Allowed sign-out URLs: Add `http://localhost:3000/` for development
   - Identity providers: Check "Cognito user pool"
   - OAuth 2.0 grant types: Select "Authorization code grant" and "Implicit grant"
   - OpenID Connect scopes: Select "Email", "OpenID", and "Profile"
   - Click "Save changes"

## Step 3: Update the Cognito Configuration in the App

1. Open the file `src/config/cognito-config.js` in the SkillForge application.
2. Update the configuration with your Cognito details:

```javascript
const cognitoConfig = {
  region: 'YOUR_AWS_REGION', // e.g., 'us-east-1'
  userPoolId: 'YOUR_USER_POOL_ID',
  userPoolWebClientId: 'YOUR_APP_CLIENT_ID',
  userPoolWebClientSecret: 'YOUR_APP_CLIENT_SECRET', // Important: Required for SECRET_HASH calculation
  oauth: {
    domain: 'YOUR_COGNITO_DOMAIN.auth.YOUR_AWS_REGION.amazoncognito.com',
    scope: ['email', 'openid', 'profile'],
    redirectSignIn: 'http://localhost:3000/',
    redirectSignOut: 'http://localhost:3000/',
    responseType: 'code'
  }
};
```

## Step 4: Test the Authentication Flow

1. Start the SkillForge application.
2. Navigate to the registration page and create a new account.
3. You should receive a verification email with a code.
4. Enter the code in the confirmation page.
5. After confirming your account, log in with your credentials.
6. Test the forgot password flow by clicking "Forgot password?" on the login page.

## Authentication Flows

AWS Cognito supports several authentication flows:

1. **USER_PASSWORD_AUTH**: A simple flow where the username and password are sent directly to the server. This requires enabling "ALLOW_USER_PASSWORD_AUTH" in the app client settings.

2. **USER_SRP_AUTH**: The Secure Remote Password protocol, which is more secure as it doesn't send the password directly. This is the default flow.

3. **ADMIN_USER_PASSWORD_AUTH**: Similar to USER_PASSWORD_AUTH but requires AWS credentials with admin permissions.

Our application tries to use USER_PASSWORD_AUTH first, and falls back to USER_SRP_AUTH if needed.

## Production Considerations

For a production environment, consider the following:

1. Use Amazon SES for email delivery instead of the default Cognito email service.
2. Enable MFA for additional security.
3. Configure custom domains for the Cognito hosted UI.
4. Set up proper CORS configurations.
5. Implement proper error handling and logging.
6. Use environment variables for Cognito configuration instead of hardcoding values.
7. Set up proper IAM roles and policies for Cognito.
8. Consider which authentication flow is most appropriate for your security requirements.

## Troubleshooting

- If you're not receiving verification emails, check your spam folder or verify your email configuration in Cognito.
- If you encounter CORS issues, ensure your app's domain is properly configured in the Cognito app client settings.
- For authentication errors, check the browser console for detailed error messages from the Cognito SDK.
- If you see a "Client is configured with secret but SECRET_HASH was not received" error:
  1. Make sure your app client has a client secret generated
  2. Ensure the client secret is correctly configured in your `aws-config.js` file
  3. Verify that the SECRET_HASH is being calculated and included in all authentication requests
  4. Check that you're using the correct authentication flow (USER_PASSWORD_AUTH)
- If you see a "USER_PASSWORD_AUTH flow not enabled for this client" error:
  1. Go to the AWS Cognito console
  2. Navigate to your User Pool > App integration > App clients and analytics
  3. Click "Edit" for your app client
  4. Under "Auth Flows Configuration", enable "ALLOW_USER_PASSWORD_AUTH"
  5. Click "Save changes"

## Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
- [Amazon Cognito Identity SDK for JavaScript](https://github.com/aws-amplify/amplify-js/tree/main/packages/amazon-cognito-identity-js)
- [AWS Amplify Authentication Documentation](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)
