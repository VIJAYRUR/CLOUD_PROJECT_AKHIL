# Email System

SkillForge uses EmailJS to send transactional emails to users. This document provides detailed information about the email system implementation, configuration, and customization.

## Overview

The email system in SkillForge handles various types of notifications:

1. **Account Verification** - Sends verification codes during registration
2. **Password Reset** - Sends password reset codes
3. **Welcome Emails** - Sends welcome messages to new users
4. **Learning Plan Updates** - Notifies users about updates to their learning plans

## EmailJS Integration

### Why EmailJS?

EmailJS was chosen for the following reasons:

- **Simplicity**: Easy to integrate with React applications
- **No Backend Required**: Works directly from the frontend
- **Customizable Templates**: Supports HTML email templates
- **Reliable Delivery**: High deliverability rates
- **Free Tier**: Offers a free tier for development and small-scale applications

### Setup and Configuration

#### 1. EmailJS Account Setup

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Set up an email service (Gmail, Outlook, etc.)
3. Create email templates for different notification types
4. Note your User ID and service IDs

#### 2. Environment Configuration

Add the following environment variables to your `.env` file:

```
REACT_APP_EMAILJS_USER_ID=your_emailjs_user_id
REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id
REACT_APP_EMAILJS_VERIFICATION_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_RESET_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_WELCOME_TEMPLATE_ID=your_template_id
```

#### 3. EmailJS Service Implementation

```javascript
// src/services/email-service.js
import emailjs from 'emailjs-com';

class EmailService {
  constructor() {
    this.userId = process.env.REACT_APP_EMAILJS_USER_ID;
    this.serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    this.templates = {
      verification: process.env.REACT_APP_EMAILJS_VERIFICATION_TEMPLATE_ID,
      reset: process.env.REACT_APP_EMAILJS_RESET_TEMPLATE_ID,
      welcome: process.env.REACT_APP_EMAILJS_WELCOME_TEMPLATE_ID
    };
    
    // Initialize EmailJS
    emailjs.init(this.userId);
  }

  // Send verification code
  async sendVerificationCode(email, code, name) {
    try {
      const templateParams = {
        to_email: email,
        to_name: name || email,
        verification_code: code
      };
      
      const response = await emailjs.send(
        this.serviceId,
        this.templates.verification,
        templateParams
      );
      
      return response;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  // Send password reset code
  async sendPasswordResetCode(email, code) {
    try {
      const templateParams = {
        to_email: email,
        reset_code: code
      };
      
      const response = await emailjs.send(
        this.serviceId,
        this.templates.reset,
        templateParams
      );
      
      return response;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email, name) {
    try {
      const templateParams = {
        to_email: email,
        to_name: name
      };
      
      const response = await emailjs.send(
        this.serviceId,
        this.templates.welcome,
        templateParams
      );
      
      return response;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }
}

export default new EmailService();
```

## Email Templates

### Verification Email Template

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #4361ee;">SkillForge</h1>
    <p style="color: #666;">Your AI-powered learning journey</p>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
    <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
    <p>Hello {{to_name}},</p>
    <p>Thank you for registering with SkillForge. Please use the verification code below to complete your registration:</p>
    
    <div style="background-color: #4361ee; color: white; font-size: 24px; font-weight: bold; text-align: center; padding: 15px; border-radius: 5px; margin: 20px 0;">
      {{verification_code}}
    </div>
    
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this verification, please ignore this email.</p>
  </div>
  
  <div style="color: #999; font-size: 12px; text-align: center;">
    <p>© 2023 SkillForge. All rights reserved.</p>
    <p>This is an automated message, please do not reply.</p>
  </div>
</div>
```

### Password Reset Template

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #4361ee;">SkillForge</h1>
    <p style="color: #666;">Your AI-powered learning journey</p>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
    <h2 style="color: #333; margin-top: 0;">Password Reset</h2>
    <p>Hello,</p>
    <p>We received a request to reset your password. Please use the code below to reset your password:</p>
    
    <div style="background-color: #4361ee; color: white; font-size: 24px; font-weight: bold; text-align: center; padding: 15px; border-radius: 5px; margin: 20px 0;">
      {{reset_code}}
    </div>
    
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
  </div>
  
  <div style="color: #999; font-size: 12px; text-align: center;">
    <p>© 2023 SkillForge. All rights reserved.</p>
    <p>This is an automated message, please do not reply.</p>
  </div>
</div>
```

## Integration with Authentication Flow

The email system is integrated with the authentication flow in the following ways:

### Registration Process

```javascript
// In Register.js component
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Register user with Cognito
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
    
    // Cognito automatically sends verification email
    // But we can also send our custom welcome email
    await emailService.sendWelcomeEmail(formData.email, formData.name);
    
    // Redirect to verification page
    navigate('/verify', {
      state: {
        email: formData.email,
        name: formData.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    setFormError(error.message);
  }
};
```

### Password Reset Process

```javascript
// In ForgotPassword.js component
const handleRequestCode = async (e) => {
  e.preventDefault();
  
  try {
    // Request password reset through Cognito
    await forgotPassword(email);
    
    // Cognito sends the reset code automatically
    // Move to the next step in the UI
    setStep(2);
  } catch (error) {
    console.error('Error requesting password reset:', error);
    setFormError(error.message);
  }
};
```

## Email Delivery Monitoring

To monitor email delivery and troubleshoot issues:

1. **EmailJS Dashboard**: Check the EmailJS dashboard for delivery statistics and errors
2. **Application Logging**: Implement logging for email sending attempts and responses
3. **User Feedback**: Provide clear feedback to users when emails are sent or if there are issues

## Troubleshooting

### Common Issues

1. **Emails Not Being Sent**:
   - Verify EmailJS credentials and template IDs
   - Check for errors in the browser console
   - Ensure the email service (Gmail, etc.) is properly configured in EmailJS

2. **Emails Going to Spam**:
   - Improve email template design and content
   - Avoid spam trigger words
   - Use a reputable email service provider

3. **Template Variables Not Working**:
   - Ensure variable names in the code match those in the template
   - Check for typos in variable names
   - Verify the template is properly saved in EmailJS

## Best Practices

1. **Rate Limiting**: Implement rate limiting to prevent abuse of the email system
2. **Error Handling**: Provide graceful fallbacks when email sending fails
3. **Responsive Design**: Ensure email templates are responsive for mobile devices
4. **Accessibility**: Make email templates accessible to all users
5. **Testing**: Test email delivery across different email clients

## Additional Resources

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [Email Template Best Practices](https://www.litmus.com/blog/email-design-best-practices/)
- [Email Deliverability Guide](https://sendgrid.com/blog/10-tips-to-keep-email-out-of-the-spam-folder/)
