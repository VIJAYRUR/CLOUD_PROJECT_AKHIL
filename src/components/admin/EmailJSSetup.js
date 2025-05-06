import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const EmailJSSetup = () => {
  const [userId, setUserId] = useState('DqISLp7u4KEjIC47m');
  const [templateId, setTemplateId] = useState('template_learning_plan');
  const [serviceId, setServiceId] = useState('service_a54771z');
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1);

  // Sample plan data for testing
  const samplePlan = {
    title: "Test Learning Plan",
    description: "This is a test plan to verify EmailJS is working correctly.",
    steps: [
      { title: "Step 1", description: "Description for step 1", completed: true },
      { title: "Step 2", description: "Description for step 2", completed: false },
      { title: "Step 3", description: "Description for step 3", completed: false }
    ],
    notes: "These are some test notes for the plan."
  };

  const handleCreateTemplate = () => {
    // Open EmailJS template creation page in a new tab
    window.open('https://dashboard.emailjs.com/admin/templates', '_blank');
  };

  const handleGetUserId = () => {
    // Open EmailJS account page to get user ID
    window.open('https://dashboard.emailjs.com/admin', '_blank');
  };

  const handleSendTest = async (e) => {
    e.preventDefault();

    if (!userId || !templateId || !serviceId || !testEmail) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsSending(true);
      setResult(null);

      // Initialize EmailJS with the provided user ID
      emailjs.init(userId);

      // Calculate progress for the sample plan
      const steps = samplePlan.steps || [];
      const completedSteps = steps.filter(step => step && step.completed).length;
      const totalSteps = steps.length;
      const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      // Format steps for email
      const stepsText = steps.map((step, index) => {
        const checkmark = step.completed ? '✓' : '□';
        return `${checkmark} Step ${index + 1}: ${step.title}${step.description ? ` - ${step.description}` : ''}`;
      }).join('\\n');

      // Prepare template parameters
      const templateParams = {
        to_email: testEmail,
        to_name: testEmail.split('@')[0], // Use part before @ as name
        plan_title: samplePlan.title,
        plan_description: samplePlan.description || 'No description provided',
        plan_progress: `${progress}%`,
        plan_steps: stepsText,
        plan_notes: samplePlan.notes || 'No notes added',
        completed_steps: completedSteps,
        remaining_steps: totalSteps - completedSteps,
        total_steps: totalSteps
      };

      // Send test email
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams
      );

      setResult({
        success: true,
        message: `Email sent successfully! Status: ${response.status}, Text: ${response.text}`
      });

      // Save the configuration to localStorage for convenience
      localStorage.setItem('emailjs_user_id', userId);
      localStorage.setItem('emailjs_template_id', templateId);
      localStorage.setItem('emailjs_service_id', serviceId);

      // Move to success step
      setStep(4);
    } catch (error) {
      console.error('Error sending test email:', error);
      setResult({
        success: false,
        message: `Error: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsSending(false);
    }
  };

  // Load saved values from localStorage
  useEffect(() => {
    const savedUserId = localStorage.getItem('emailjs_user_id');
    const savedTemplateId = localStorage.getItem('emailjs_template_id');
    const savedServiceId = localStorage.getItem('emailjs_service_id');

    if (savedUserId) setUserId(savedUserId);
    if (savedTemplateId) setTemplateId(savedTemplateId);
    if (savedServiceId) setServiceId(savedServiceId);
  }, []);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">EmailJS Setup Wizard</h4>
            </div>
            <div className="card-body">
              {step === 1 && (
                <div>
                  <h5 className="card-title">Step 1: Get Your EmailJS User ID</h5>
                  <p>You need your EmailJS User ID to send emails. You can find it in your EmailJS dashboard.</p>

                  <div className="mb-3">
                    <button
                      className="btn btn-outline-primary me-2"
                      onClick={handleGetUserId}
                    >
                      Open EmailJS Dashboard
                    </button>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="userId" className="form-label">Your EmailJS User ID</label>
                    <input
                      type="text"
                      className="form-control"
                      id="userId"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="e.g., user_abc123"
                    />
                    <div className="form-text">
                      Find this in your EmailJS dashboard under "Account" → "API Keys"
                    </div>
                  </div>

                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-secondary"
                      disabled
                    >
                      Back
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => setStep(2)}
                      disabled={!userId}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h5 className="card-title">Step 2: Create an Email Template</h5>
                  <p>You need to create an email template in EmailJS to format your plan emails.</p>

                  <div className="mb-3">
                    <button
                      className="btn btn-outline-primary me-2"
                      onClick={handleCreateTemplate}
                    >
                      Create Email Template
                    </button>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="templateId" className="form-label">Your Template ID</label>
                    <input
                      type="text"
                      className="form-control"
                      id="templateId"
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      placeholder="e.g., template_plan"
                    />
                    <div className="form-text">
                      Find this in your EmailJS dashboard under "Email Templates"
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <h6>Template Variables to Include:</h6>
                    <ul className="mb-0">
                      <li>plan_title - The title of the plan</li>
                      <li>plan_description - The plan description</li>
                      <li>plan_progress - The progress percentage</li>
                      <li>plan_steps - The formatted steps list</li>
                      <li>plan_notes - Any notes for the plan</li>
                      <li>completed_steps - Number of completed steps</li>
                      <li>remaining_steps - Number of remaining steps</li>
                      <li>total_steps - Total number of steps</li>
                    </ul>
                  </div>

                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => setStep(3)}
                      disabled={!templateId}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h5 className="card-title">Step 3: Test Your Configuration</h5>
                  <p>Let's send a test email to make sure everything is working correctly.</p>

                  <form onSubmit={handleSendTest}>
                    <div className="mb-3">
                      <label htmlFor="serviceId" className="form-label">Service ID</label>
                      <input
                        type="text"
                        className="form-control"
                        id="serviceId"
                        value={serviceId}
                        onChange={(e) => setServiceId(e.target.value)}
                        placeholder="e.g., service_abc123"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="testEmail" className="form-label">Your Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        id="testEmail"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                      />
                      <div className="form-text">
                        We'll send a test plan to this email address.
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-grid">
                        <button
                          type="submit"
                          className="btn btn-success"
                          disabled={isSending}
                        >
                          {isSending ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Sending Test Email...
                            </>
                          ) : (
                            <>Send Test Email</>
                          )}
                        </button>
                      </div>
                    </div>

                    {result && (
                      <div className={`alert ${result.success ? 'alert-success' : 'alert-danger'}`}>
                        {result.message}
                      </div>
                    )}
                  </form>

                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setStep(2)}
                      disabled={isSending}
                    >
                      Back
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => setStep(4)}
                      disabled={isSending || !result?.success}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className="text-center mb-4">
                    <div className="display-1 text-success">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h4 className="mt-3">Setup Complete!</h4>
                    <p className="text-muted">Your EmailJS configuration is working correctly.</p>
                  </div>

                  <div className="alert alert-info">
                    <h6>Your Configuration:</h6>
                    <ul className="mb-0">
                      <li><strong>User ID:</strong> {userId}</li>
                      <li><strong>Template ID:</strong> {templateId}</li>
                      <li><strong>Service ID:</strong> {serviceId}</li>
                    </ul>
                  </div>

                  <div className="alert alert-warning">
                    <h6>Next Steps:</h6>
                    <p className="mb-0">
                      Update the <code>src/services/emailjs-service.js</code> file with these values to enable email functionality throughout the app.
                    </p>
                  </div>

                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setStep(3)}
                    >
                      Back
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => window.location.href = '/'}
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailJSSetup;
