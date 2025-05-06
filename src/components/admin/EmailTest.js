import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const EmailTest = () => {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);

  // Add a log entry
  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toISOString() }]);
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    
    if (!email) {
      addLog('Please enter an email address', 'error');
      return;
    }

    try {
      setIsSending(true);
      setResult(null);
      addLog(`Starting email test to: ${email}`);
      
      // Initialize EmailJS
      const userId = 'DqISLp7u4KEjIC47m';
      const serviceId = 'service_a54771z';
      const templateId = 'template_learning_plan';
      
      addLog(`Using EmailJS configuration:
- User ID: ${userId}
- Service ID: ${serviceId}
- Template ID: ${templateId}`);
      
      emailjs.init(userId);
      
      // Create a simple test template
      const templateParams = {
        to_email: email,
        to_name: email.split('@')[0],
        from_name: "SkillForge Test",
        reply_to: "noreply@skillforge.app",
        plan_title: "Test Learning Plan",
        plan_description: "This is a test email to verify that EmailJS is working correctly.",
        plan_progress: "50%",
        plan_steps: "✓ Step 1: Set up EmailJS\n□ Step 2: Test email delivery\n□ Step 3: Implement in production",
        plan_notes: "This is a test email sent at " + new Date().toLocaleString(),
        completed_steps: 1,
        remaining_steps: 2,
        total_steps: 3
      };
      
      addLog('Sending email with parameters: ' + JSON.stringify(templateParams, null, 2));

      // Send direct test email
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        userId
      );

      addLog(`Email sent successfully! Response: ${JSON.stringify(response)}`, 'success');
      setResult({
        success: true,
        message: `Email sent successfully! Status: ${response.status}, Text: ${response.text}`
      });
    } catch (error) {
      addLog(`Error sending email: ${error.message}`, 'error');
      addLog(`Error details: ${JSON.stringify(error, null, 2)}`, 'error');
      setResult({
        success: false,
        message: `Error: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">EmailJS Direct Test</h4>
            </div>
            <div className="card-body">
              <p className="card-text">
                This page bypasses the app's email service and sends an email directly using EmailJS.
                Use this to test if there are any issues with your EmailJS configuration.
              </p>
              
              <form onSubmit={handleSendTest}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending Test Email...
                        </>
                      ) : (
                        <>Send Direct Test Email</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
              
              {result && (
                <div className={`alert ${result.success ? 'alert-success' : 'alert-danger'}`}>
                  {result.message}
                </div>
              )}
              
              <div className="mt-4">
                <h5>Debug Logs</h5>
                <div className="border rounded p-3 bg-light" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {logs.length === 0 ? (
                    <p className="text-muted mb-0">No logs yet. Send a test email to see logs.</p>
                  ) : (
                    logs.map((log, index) => (
                      <div 
                        key={index} 
                        className={`mb-1 ${
                          log.type === 'error' ? 'text-danger' : 
                          log.type === 'success' ? 'text-success' : 
                          'text-secondary'
                        }`}
                      >
                        <small>
                          <span className="fw-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                        </small>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <h5>Troubleshooting Tips</h5>
                <ul className="mb-0">
                  <li>Check your spam/junk folder for the test email</li>
                  <li>Verify that your EmailJS service is active</li>
                  <li>Make sure your template exists and has the correct ID</li>
                  <li>Check if you've reached the free tier limits (200 emails/month)</li>
                  <li>Try using a different email address (Gmail, Outlook, etc.)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTest;
