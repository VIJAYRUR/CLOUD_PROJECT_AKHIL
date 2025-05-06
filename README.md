# CLOUD_PROJECT_AKHIL (SkillForge)

SkillForge is an AI-powered learning plan generator that helps users create personalized learning paths for any skill they want to acquire. The application uses OpenAI's API to generate detailed, step-by-step learning plans and allows users to track their progress.

![SkillForge Dashboard](./docs/images/dashboard.png)

## Features

- AI-generated learning plans tailored to user preferences
- Progress tracking for learning goals
- User authentication with AWS Cognito
- Email notifications for account activities
- Responsive, modern UI design

## Quick Start

1. Clone the repository
   ```bash
   git clone https://github.com/VIJAYRUR/CLOUD_PROJECT_AKHIL.git
   cd CLOUD_PROJECT_AKHIL
   ```
2. Install dependencies with `npm install`
3. Set up environment variables (see [Getting Started](./docs/getting-started.md))
4. Run the development server with `npm start`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Documentation

Detailed documentation is available in the [docs](./docs) directory:

- [Getting Started](./docs/getting-started.md) - Setup and installation guide
- [Authentication](./docs/authentication.md) - Authentication system details
- [AWS Integration](./docs/aws-integration.md) - AWS services integration
- [Email System](./docs/email-system.md) - Email notification system
- [User Guide](./docs/user-guide.md) - End-user documentation

## Technology Stack

- **Frontend**: React.js
- **Authentication**: AWS Cognito
- **Database**: AWS DynamoDB
- **AI Integration**: OpenAI API
- **Email Service**: EmailJS

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Environment Variables

The application uses environment variables for configuration. Create a `.env` file with the following variables (see `.env.example` for a template):

```
# AWS Configuration
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# Cognito Configuration
REACT_APP_AWS_REGION=your_aws_region
REACT_APP_AWS_USER_POOL_ID=your_user_pool_id
REACT_APP_AWS_APP_CLIENT_ID=your_app_client_id
REACT_APP_AWS_APP_CLIENT_SECRET=your_app_client_secret

# OpenAI Configuration
REACT_APP_OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:3000
SESSION_SECRET=your_session_secret_key_here
```

## Deployment

This project can be deployed to Vercel:

1. Connect your GitHub repository to Vercel
2. Configure the environment variables in Vercel's dashboard
3. Deploy the application

## License

This project is licensed under the MIT License - see the LICENSE file for details.
