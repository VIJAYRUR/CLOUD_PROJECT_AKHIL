# SkillForge

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.
