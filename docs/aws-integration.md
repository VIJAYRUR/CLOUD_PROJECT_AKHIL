# AWS Integration

SkillForge integrates with several AWS services to provide authentication, data storage, and other functionality. This document provides detailed information about the AWS services used and how they are integrated into the application.

## AWS Services Used

SkillForge integrates with the following AWS services:

1. **Amazon Cognito** - User authentication and management
2. **Amazon DynamoDB** - NoSQL database for storing user data and learning plans
3. **AWS SDK for JavaScript** - Client library for interacting with AWS services

## Amazon Cognito Setup

### User Pool Configuration

SkillForge uses Amazon Cognito User Pools for authentication. The User Pool is configured as follows:

- **User Pool ID**: `us-east-1_91eIa7lk8`
- **App Client**: Created without a client secret
- **Required Attributes**: Email, Name
- **Password Policy**: Minimum 8 characters with uppercase, lowercase, numbers, and special characters
- **MFA**: Disabled
- **Email Verification**: Enabled

### Setting Up Cognito

1. **Create a User Pool**:
   - Go to the AWS Management Console
   - Navigate to Amazon Cognito
   - Click "Create a User Pool"
   - Follow the wizard to configure your user pool
   - Note the User Pool ID

2. **Create an App Client**:
   - In your User Pool, go to "App clients"
   - Click "Add an app client"
   - Configure the app client without a client secret
   - Note the App Client ID

3. **Configure Environment Variables**:
   ```
   REACT_APP_AWS_REGION=us-east-1
   REACT_APP_AWS_USER_POOL_ID=your_user_pool_id
   REACT_APP_AWS_APP_CLIENT_ID=your_app_client_id
   ```

### Cognito Integration Code

```javascript
// src/config/cognito-config.js
const cognitoConfig = {
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
  userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID || 'us-east-1_91eIa7lk8',
  userPoolWebClientId: process.env.REACT_APP_AWS_APP_CLIENT_ID || '',
  mandatorySignIn: true,
  authenticationFlowType: 'USER_PASSWORD_AUTH'
};

export default cognitoConfig;
```

```javascript
// src/services/cognito-service.js
import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import cognitoConfig from '../config/cognito-config';

class CognitoService {
  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: cognitoConfig.userPoolId,
      ClientId: cognitoConfig.userPoolWebClientId
    });
  }

  // Check if Cognito is configured
  isConfigured() {
    return cognitoConfig.userPoolId && cognitoConfig.userPoolWebClientId;
  }

  // Sign up a new user
  signUp(email, password, attributes) {
    return new Promise((resolve, reject) => {
      const attributeList = [];
      
      // Add user attributes
      for (const key in attributes) {
        const attribute = new CognitoUserAttribute({
          Name: key,
          Value: attributes[key]
        });
        attributeList.push(attribute);
      }

      this.userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result.user);
      });
    });
  }

  // Additional methods for login, logout, password reset, etc.
  // ...
}

export default new CognitoService();
```

## Amazon DynamoDB Setup

### Table Structure

SkillForge uses the following DynamoDB tables:

1. **Users Table**:
   - Partition Key: `userId` (String)
   - Attributes: `email`, `name`, `createdAt`, `preferences`

2. **Learning Plans Table**:
   - Partition Key: `planId` (String)
   - Sort Key: `userId` (String)
   - Attributes: `title`, `description`, `steps`, `progress`, `createdAt`, `updatedAt`

### Setting Up DynamoDB

1. **Create Tables**:
   - Go to the AWS Management Console
   - Navigate to DynamoDB
   - Click "Create table"
   - Configure the table with the appropriate partition key and sort key
   - Set up capacity mode (on-demand or provisioned)

2. **Configure IAM Permissions**:
   - Create an IAM policy with appropriate permissions for DynamoDB operations
   - Attach the policy to your Cognito Identity Pool or IAM user

### DynamoDB Integration Code

```javascript
// src/services/dynamodb-service.js
import AWS from 'aws-sdk';
import cognitoConfig from '../config/cognito-config';

class DynamoDBService {
  constructor() {
    this.dynamoDB = null;
    this.initialized = false;
  }

  initialize(idToken) {
    if (this.initialized) return;

    AWS.config.region = cognitoConfig.region;
    
    // Configure AWS credentials using Cognito Identity Pool
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: cognitoConfig.identityPoolId,
      Logins: {
        [`cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}`]: idToken
      }
    });

    this.dynamoDB = new AWS.DynamoDB.DocumentClient();
    this.initialized = true;
  }

  // Get user data
  async getUserData(userId) {
    const params = {
      TableName: 'Users',
      Key: { userId }
    };

    try {
      const result = await this.dynamoDB.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  // Save learning plan
  async saveLearningPlan(plan) {
    const params = {
      TableName: 'LearningPlans',
      Item: {
        ...plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    try {
      await this.dynamoDB.put(params).promise();
      return plan;
    } catch (error) {
      console.error('Error saving learning plan:', error);
      throw error;
    }
  }

  // Additional methods for CRUD operations
  // ...
}

export default new DynamoDBService();
```

## Security Considerations

### IAM Permissions

- Use the principle of least privilege when setting up IAM policies
- Create separate IAM roles for different functions (e.g., authentication, data access)
- Regularly review and audit IAM permissions

### Data Encryption

- Enable encryption at rest for DynamoDB tables
- Use HTTPS for all communications with AWS services
- Consider using AWS Key Management Service (KMS) for managing encryption keys

### Cognito Security

- Implement strong password policies
- Consider enabling advanced security features in Cognito
- Regularly review Cognito logs for suspicious activities

## Troubleshooting

### Common Issues

1. **Authentication Failures**:
   - Verify Cognito User Pool and App Client IDs
   - Check if the user has confirmed their email
   - Ensure the user exists in the User Pool

2. **DynamoDB Access Issues**:
   - Verify IAM permissions
   - Check if the DynamoDB tables exist
   - Ensure the correct region is configured

3. **AWS SDK Errors**:
   - Update to the latest version of the AWS SDK
   - Check for proper initialization of AWS services
   - Verify network connectivity to AWS endpoints

## Additional Resources

- [AWS Cognito Developer Guide](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- [AWS SDK for JavaScript Documentation](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html)
