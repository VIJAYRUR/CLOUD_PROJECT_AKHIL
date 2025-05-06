import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Component to display a notification when Cognito is not configured
 */
const CognitoConfigNotification = () => {
  return (
    <div className="container mt-4">
      <div className="alert alert-danger">
        <h4 className="alert-heading">AWS Cognito Configuration Error</h4>
        <p>
          The AWS Cognito User Pool Client ID is not configured. This is required for authentication to work properly.
        </p>
        <hr />
        <p className="mb-0">
          To fix this issue:
        </p>
        <ol>
          <li>Create an App Client in your AWS Cognito User Pool</li>
          <li>Update the <code>userPoolWebClientId</code> in <code>src/config/aws-config.js</code></li>
          <li>Restart the application</li>
        </ol>
        <p className="mt-3">
          For now, you can continue using the application with limited functionality.
        </p>
        <div className="d-flex justify-content-end">
          <Link to="/" className="btn btn-outline-danger">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CognitoConfigNotification;
