# User Guide

Welcome to SkillForge! This guide will help you navigate the application and make the most of its features to create and track your personalized learning plans.

## Table of Contents

- [Getting Started](#getting-started)
- [Creating a Learning Plan](#creating-a-learning-plan)
- [Tracking Your Progress](#tracking-your-progress)
- [Managing Your Account](#managing-your-account)
- [Frequently Asked Questions](#frequently-asked-questions)

## Getting Started

### Creating an Account

1. Visit the SkillForge website
2. Click on "Create an account" on the login page
3. Enter your name, email address, and create a password
4. Check your email for a verification code
5. Enter the verification code to activate your account
6. Complete your profile by setting your learning preferences

### Logging In

1. Visit the SkillForge website
2. Enter your email and password
3. Click "Sign In"
4. If you've forgotten your password, click "Forgot password?" to reset it

### Dashboard Overview

![Dashboard Overview](./images/dashboard.png)

The dashboard is your central hub in SkillForge, featuring:

- **Learning Plans**: View and access all your current learning plans
- **Quick Stats**: See your overall progress and activity
- **Quick Tips**: Get helpful suggestions for effective learning
- **Create New Plan**: Button to generate a new learning plan

## Creating a Learning Plan

### Generating a Plan with AI

1. Click the "Create New Plan" button on the dashboard
2. Enter the skill you want to learn (e.g., "Python Programming", "Digital Marketing")
3. Customize your learning preferences:
   - **Learning Style**: Visual, Auditory, Reading/Writing, or Hands-on
   - **Pace**: Relaxed, Moderate, or Intensive
   - **Difficulty**: Beginner, Intermediate, or Advanced
4. Click "Generate Plan"
5. Review the generated plan, which includes:
   - Title and description
   - Estimated time to complete
   - Step-by-step learning path
6. Click "Save Plan" to add it to your dashboard

### Customizing Your Plan

After generating a plan, you can customize it:

1. Open the plan from your dashboard
2. Click "Edit Plan" to make changes
3. You can:
   - Rename the plan
   - Edit the description
   - Add, remove, or reorder steps
   - Adjust the estimated completion time
4. Click "Save Changes" when finished

### Downloading Your Plan

To save a copy of your learning plan:

1. Open the plan you want to download
2. Click the "Download Plan" button
3. Choose your preferred format (PDF or Markdown)
4. The plan will download to your device

## Tracking Your Progress

### Marking Steps as Complete

1. Open a learning plan from your dashboard
2. Find the step you've completed
3. Click the checkbox next to the step
4. The progress bar will automatically update

### Adding Notes

You can add notes to any step in your learning plan:

1. Open a learning plan
2. Click the "Add Note" icon next to a step
3. Enter your notes in the text field
4. Click "Save Note"

### Viewing Statistics

SkillForge provides detailed statistics about your learning journey:

1. Click on "Learning Statistics" in the top navigation
2. View insights such as:
   - Total learning plans
   - Average progress across all plans
   - Completed steps
   - Learning streaks
   - Time spent on each plan

## Managing Your Account

### Updating Your Profile

1. Click on your profile picture in the top-right corner
2. Select "Profile Settings"
3. Update your information:
   - Name
   - Profile picture
   - Email address
   - Password
4. Click "Save Changes"

### Setting Learning Preferences

Your learning preferences help the AI generate better plans for you:

1. Go to "Profile Settings"
2. Click on the "Learning Preferences" tab
3. Set your preferences:
   - Preferred learning style
   - Pace preference
   - Difficulty level
   - Areas of interest
4. Click "Save Preferences"

### Deleting a Plan

If you no longer need a learning plan:

1. Go to your dashboard
2. Find the plan you want to delete
3. Click the three dots (⋮) in the top-right corner of the plan card
4. Select "Delete Plan"
5. Confirm the deletion

## Frequently Asked Questions

### How does the AI generate learning plans?

SkillForge uses OpenAI's advanced language models to create personalized learning plans based on your specified skill and preferences. The AI analyzes the best learning approaches for the skill, breaks it down into logical steps, and tailors the plan to your learning style, pace, and experience level.

### Can I share my learning plans with others?

Currently, SkillForge doesn't have a direct sharing feature. However, you can download your plan as a PDF and share it manually with friends or colleagues.

### How do I reset my password?

1. Click "Forgot password?" on the login page
2. Enter your email address
3. Check your email for a password reset code
4. Enter the code and create a new password

### Is my data secure?

Yes, SkillForge takes data security seriously:
- All data is stored in secure AWS DynamoDB databases
- Authentication is handled by AWS Cognito
- Passwords are never stored in plain text
- All communication is encrypted using HTTPS

### Can I use SkillForge offline?

SkillForge requires an internet connection to generate plans and sync your progress. However, once you download a plan, you can refer to it offline.

### How do I delete my account?

To delete your account:
1. Go to "Profile Settings"
2. Scroll to the bottom and click "Delete Account"
3. Confirm your decision
4. Your account and all associated data will be permanently deleted

## Getting Help

If you need additional assistance:

- Check our [Knowledge Base](https://skillforge.example.com/help)
- Email us at support@skillforge.example.com
- Use the "Help" button in the application to access contextual help
