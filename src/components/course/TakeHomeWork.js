import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import OpenAIService from '../../services/openai-service';

const TakeHomeWork = () => {
  const { course, user } = useOutletContext();
  const homeworkSection = course.sections.homework;
  const [submission, setSubmission] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would send the submission to the backend
      // For demo purposes, we'll use OpenAI to generate feedback
      const generatedFeedback = await OpenAIService.generateHomeworkFeedback(
        homeworkSection.description + '\n\n' + homeworkSection.tasks.join('\n'),
        submission
      );
      
      setFeedback(generatedFeedback);
      setSubmitted(true);
    } catch (error) {
      console.error('Error generating feedback:', error);
      setError('Failed to submit your work. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmission('');
    setSubmitted(false);
    setFeedback(null);
    setError(null);
  };

  return (
    <div className="homework-section">
      <div className="section-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{homeworkSection.title}</h2>
          <span className="badge bg-info">Take-Home Work</span>
        </div>
        
        <div className="mb-4">
          <p className="lead">{homeworkSection.description}</p>
        </div>
        
        <div className="card mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">Assignment Tasks</h5>
          </div>
          <ul className="list-group list-group-flush">
            {homeworkSection.tasks.map((task, index) => (
              <li className="list-group-item d-flex align-items-start" key={index}>
                <div className="me-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                    {index + 1}
                  </div>
                </div>
                <div>{task}</div>
              </li>
            ))}
          </ul>
          <div className="card-footer">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Due Date:</strong> {homeworkSection.dueDate}
              </div>
              {homeworkSection.submissionFormat && (
                <div>
                  <strong>Format:</strong> {homeworkSection.submissionFormat}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="submission" className="form-label fw-bold">
                Your Submission
              </label>
              <textarea
                className="form-control"
                id="submission"
                rows="12"
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder="Enter your solution here..."
                required
              ></textarea>
              <div className="form-text">
                For this demo, you can enter any text as your submission. In a real application, you might upload files or provide links to your work.
              </div>
            </div>
            
            {error && (
              <div className="alert alert-danger mb-4" role="alert">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || !submission.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                'Submit Assignment'
              )}
            </button>
          </form>
        ) : (
          <div className="submission-feedback">
            <div className="alert alert-success mb-4">
              <h4 className="alert-heading">Assignment Submitted!</h4>
              <p className="mb-0">Your work has been submitted successfully.</p>
            </div>
            
            {feedback && (
              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">AI-Generated Feedback</h5>
                </div>
                <div className="card-body">
                  <div className="mb-4">
                    <h6>Score:</h6>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className={`progress-bar ${
                          feedback.score >= 80
                            ? 'bg-success'
                            : feedback.score >= 60
                            ? 'bg-warning'
                            : 'bg-danger'
                        }`}
                        role="progressbar"
                        style={{ width: `${feedback.score}%` }}
                        aria-valuenow={feedback.score}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                      </div>
                    </div>
                    <div className="text-end mt-1">
                      <small className="text-muted">{feedback.score}/100</small>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h6>Overall Feedback:</h6>
                    <p>{feedback.overallFeedback}</p>
                  </div>
                  
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="text-success">Strengths:</h6>
                      <ul className="list-group">
                        {feedback.strengths.map((strength, index) => (
                          <li className="list-group-item" key={index}>
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-danger">Areas for Improvement:</h6>
                      <ul className="list-group">
                        {feedback.areasForImprovement.map((area, index) => (
                          <li className="list-group-item" key={index}>
                            <i className="bi bi-exclamation-circle-fill text-danger me-2"></i>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {feedback.additionalResources && feedback.additionalResources.length > 0 && (
                    <div>
                      <h6>Additional Resources:</h6>
                      <div className="list-group">
                        {feedback.additionalResources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="list-group-item list-group-item-action"
                          >
                            <div className="d-flex w-100 justify-content-between">
                              <h6 className="mb-1">{resource.title}</h6>
                            </div>
                            <p className="mb-1">{resource.description}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="d-flex gap-3">
              <button className="btn btn-primary" onClick={handleReset}>
                Revise and Resubmit
              </button>
              <button className="btn btn-outline-secondary">
                Download Feedback as PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeHomeWork;
