# Getting Started with SkillForge

This guide will help you set up and run the SkillForge application on your local machine for development and testing purposes.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14.x or later)
- npm (v6.x or later)
- AWS account (for Cognito and DynamoDB)
- OpenAI API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/skillforge.git
   cd skillforge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_OPENAI_API_KEY=your_openai_api_key
   REACT_APP_AWS_REGION=us-east-1
   REACT_APP_AWS_USER_POOL_ID=your_cognito_user_pool_id
   REACT_APP_AWS_APP_CLIENT_ID=your_cognito_app_client_id
   ```

## Running the Application

To start the development server:

```bash
npm start
```

This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Building for Production

To build the app for production:

```bash
npm run build
```

This builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

## Project Structure

```
skillforge/
├── public/             # Static files
├── src/                # Source code
│   ├── components/     # React components
│   ├── context/        # React context providers
│   ├── services/       # Service integrations (AWS, OpenAI)
│   ├── styles/         # CSS and styling files
│   ├── utils/          # Utility functions
│   ├── App.js          # Main App component
│   └── index.js        # Entry point
├── docs/               # Documentation
└── package.json        # Project dependencies
```

## Testing

To run tests:

```bash
npm test
```

This launches the test runner in interactive watch mode.

## AWS Configuration

For detailed instructions on setting up AWS services (Cognito and DynamoDB), please refer to the [AWS Integration](./aws-integration.md) documentation.

## Troubleshooting

### Common Issues

1. **Authentication errors**: Ensure your AWS Cognito credentials are correctly set up in the `.env` file.

2. **API rate limiting**: If you encounter OpenAI API rate limits, consider implementing a queueing system or reducing the frequency of requests.

3. **Build errors**: Make sure all dependencies are installed correctly with `npm install`.

If you encounter any other issues, please check the [GitHub issues](https://github.com/yourusername/skillforge/issues) or create a new one.
