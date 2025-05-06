import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import OpenAIService from '../../services/openai-service';
import { usePlans } from '../../context/PlanContext';
import { useAuth } from '../../context/AuthContext';
import DynamoDBService from '../../services/dynamodb-service';
import MiniProgressTracker from './MiniProgressTracker';

const PlanDetail = () => {
  const { userPlans, updatePlanProgress, updatePlanSteps, updatePlanNotes } = usePlans();
  const { currentUser } = useAuth();
  const savedPlans = userPlans || [];
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resourceRecommendations, setResourceRecommendations] = useState(null);
  const [loadingResources, setLoadingResources] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const [resourceType, setResourceType] = useState('video');


  useEffect(() => {
    if (!savedPlans || savedPlans.length === 0) {
      setLoading(false);
      return;
    }

    console.log('Looking for plan with ID:', planId);
    console.log('Available plans:', savedPlans);

    // Try to find the plan by planId (string) first
    let foundPlan = savedPlans.find(p => p.planId === planId);

    // If not found, try to find by numeric id if planId can be parsed as a number
    if (!foundPlan && !isNaN(parseInt(planId))) {
      foundPlan = savedPlans.find(p => p.planId === planId || p.id === parseInt(planId));
    }

    if (foundPlan) {
      console.log('Found plan:', foundPlan);

      // If we found a userPlan object with a plan property, use that
      if (foundPlan.plan) {
        console.log('Using plan from userPlan.plan:', foundPlan.plan);
        console.log('Steps with completion status:', foundPlan.plan.steps);
        setPlan(foundPlan.plan);
        // Set notes if they exist
        if (foundPlan.plan.notes) {
          setNotes(foundPlan.plan.notes);
        }
      } else {
        // Otherwise use the plan object directly
        console.log('Using plan directly:', foundPlan);
        console.log('Steps with completion status:', foundPlan.steps);
        setPlan(foundPlan);
        // Set notes if they exist
        if (foundPlan.notes) {
          setNotes(foundPlan.notes);
        }
      }
    } else {
      console.log('Plan not found, redirecting to dashboard');
      // Don't navigate away, just show the "Plan not found" message
      setPlan(null);
    }
    setLoading(false);
  }, [planId, savedPlans, navigate]);

  const handleToggleStep = async (stepId) => {
    if (!plan || !plan.steps) return;

    console.log('Toggling step with ID:', stepId);
    console.log('Current plan steps:', plan.steps);

    // Find the step by id or stepId (handle both formats)
    const step = plan.steps.find(s => (s.id === stepId || s.stepId === stepId));
    if (!step) {
      console.error('Step not found with ID:', stepId);
      return;
    }

    console.log('Found step:', step);
    console.log('Current completion status:', step.completed);

    // Toggle the step completion status locally
    const updatedSteps = plan.steps.map(s => {
      if ((s.id === stepId || s.stepId === stepId)) {
        return { ...s, completed: !s.completed };
      }
      return s;
    });

    console.log('Updated steps after toggle:', updatedSteps);

    // Update the local plan state
    setPlan({ ...plan, steps: updatedSteps });

    // Calculate new progress percentage and step counts
    const newCompletedSteps = updatedSteps.filter(s => s && s.completed).length;
    const totalSteps = updatedSteps.length;
    const newProgress = Math.round((newCompletedSteps / totalSteps) * 100);

    console.log('New progress:', newProgress, 'Completed steps:', newCompletedSteps, 'Total steps:', totalSteps);

    // Use plan.id or plan.planId depending on which exists
    const planIdentifier = plan.id || plan.planId || planId;
    if (!planIdentifier) {
      console.error('No plan identifier found');
      return;
    }

    console.log('Using plan identifier:', planIdentifier);

    try {
      // Update the steps in the database
      await updatePlanSteps(planIdentifier, updatedSteps);

      // Track the individual step completion if currentUser is available
      if (currentUser && currentUser.userId) {
        try {
          await DynamoDBService.userPlans.trackStepCompletion(
            currentUser.userId,
            planIdentifier,
            stepId,
            step ? !step.completed : false
          );
        } catch (trackError) {
          // Log but don't fail the whole operation if tracking fails
          console.error('Error tracking step completion:', trackError);
        }
      }

      // Update the progress in the database with enhanced tracking
      try {
        await updatePlanProgress(
          planIdentifier,
          newProgress,
          newCompletedSteps,
          totalSteps
        );
      } catch (progressError) {
        // Log but don't fail the whole operation if progress update fails
        console.error('Error updating progress:', progressError);
      }

      console.log('Successfully updated step completion status with enhanced tracking');
    } catch (error) {
      console.error('Error updating plan:', error);
      // Revert the local state change if the update failed
      setPlan(prevPlan => ({
        ...prevPlan,
        steps: prevPlan.steps.map(s => {
          if ((s.id === stepId || s.stepId === stepId)) {
            return { ...s, completed: s.completed }; // Keep the original completion status
          }
          return s;
        })
      }));
    }
  };

  const handleGetResources = async (step) => {
    setSelectedStep(step);
    setLoadingResources(true);

    try {
      const recommendations = await OpenAIService.generateResourceRecommendations(
        step.title,
        resourceType,
        'intermediate'
      );
      setResourceRecommendations(recommendations);
    } catch (error) {
      console.error('Error getting resource recommendations:', error);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!plan) return;

    // Use plan.id or plan.planId depending on which exists
    const planIdentifier = plan.id || plan.planId || planId;
    if (!planIdentifier) return;

    // Store the original notes in case we need to revert
    const originalNotes = notes;

    try {
      setIsSavingNotes(true);
      await updatePlanNotes(planIdentifier, notes);
      console.log('Notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
      // Show an error message to the user
      alert('Failed to save notes. Please try again.');
      // Optionally revert to original notes if needed
      // setNotes(originalNotes);
    } finally {
      setIsSavingNotes(false);
    }
  };



  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading plan...</span>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="alert alert-warning">
        Plan not found. <Link to="/">Return to Dashboard</Link>
      </div>
    );
  }

  // Safely calculate progress with null checks
  const steps = plan.steps || [];
  const completedSteps = steps.filter(step => step && step.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="plan-detail">
      <div className="row mb-4">
        <div className="col-md-8">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {plan.title}
              </li>
            </ol>
          </nav>
          <h1 className="mb-2">{plan.title}</h1>
          <p className="lead text-muted">{plan.description}</p>
        </div>
        <div className="col-md-4 d-flex flex-column justify-content-center">
          <div className="d-flex align-items-center mb-2">
            <div className="me-3">
              <i className="bi bi-clock me-1"></i>
              <span>{plan.estimatedTimeToComplete}</span>
            </div>
            <div>
              <i className="bi bi-calendar me-1"></i>
              <span>Created: {plan.createdAt}</span>
            </div>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div
              className={`progress-bar ${
                progress >= 75 ? 'bg-success' :
                progress >= 25 ? 'bg-primary' :
                'bg-warning'
              }`}
              role="progressbar"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <small className="text-muted mt-1">{completedSteps} of {totalSteps} steps completed ({progress}%)</small>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Learning Steps</h5>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {(plan.steps || []).map((step) => {
                  // Skip rendering if step is null or undefined
                  if (!step) return null;

                  // Use step.id or step.stepId, whichever is available
                  const stepId = step.id || step.stepId || `step-${Math.random()}`;

                  return (
                    <li key={stepId} className="list-group-item p-3">
                      <div className="d-flex align-items-center">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`step-${stepId}`}
                            checked={!!step.completed}
                            onChange={() => handleToggleStep(stepId)}
                          />
                          <label className="form-check-label" htmlFor={`step-${stepId}`}>
                            <span className={step.completed ? 'text-decoration-line-through text-muted' : ''}>
                              {step.title || 'Untitled Step'}
                            </span>
                          </label>
                        </div>
                        <div className="ms-auto">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleGetResources(step)}
                          >
                            <i className="bi bi-journal-bookmark me-1"></i>
                            Find Resources
                          </button>
                        </div>
                      </div>
                      {step.description && (
                        <div className="mt-2 ps-4">
                          <p className="text-muted mb-0">{step.description}</p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Notes</h5>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
              >
                {isSavingNotes ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>Save Notes</>
                )}
              </button>
            </div>
            <div className="card-body">
              <textarea
                className="form-control"
                rows="5"
                placeholder="Add your notes about this learning plan here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card mb-4 sticky-top" style={{ top: '20px' }}>
            <div className="card-body">
              <MiniProgressTracker plan={plan} />
            </div>
          </div>

          {plan.tags && plan.tags.length > 0 && (
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Tags</h5>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  {plan.tags.map((tag, index) => (
                    <span key={index} className="badge bg-light text-dark p-2">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedStep && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Resources for: {selectedStep.title}</h5>
                <button type="button" className="btn-close" onClick={() => {
                  setSelectedStep(null);
                  setResourceRecommendations(null);
                }}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-3">
                    <label className="me-2">Resource Type:</label>
                    <select
                      className="form-select w-auto"
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value)}
                    >
                      <option value="video">Videos</option>
                      <option value="article">Articles</option>
                      <option value="book">Books</option>
                      <option value="course">Courses</option>
                      <option value="tool">Tools</option>
                    </select>
                    <button
                      className="btn btn-primary ms-2"
                      onClick={() => handleGetResources(selectedStep)}
                      disabled={loadingResources}
                    >
                      {loadingResources ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Loading...
                        </>
                      ) : (
                        <>Find Resources</>
                      )}
                    </button>
                  </div>
                </div>

                {loadingResources ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading resources...</span>
                    </div>
                    <p className="mt-3">Finding the best resources for you...</p>
                  </div>
                ) : resourceRecommendations ? (
                  <div className="row row-cols-1 g-4">
                    {resourceRecommendations.map((resource, index) => (
                      <div className="col" key={index}>
                        <div className="card h-100">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="card-title">{resource.title}</h5>
                              <span className="badge bg-primary">{resource.type}</span>
                            </div>
                            <h6 className="card-subtitle mb-2 text-muted">{resource.author}</h6>
                            <p className="card-text">{resource.description}</p>

                            <div className="d-flex flex-wrap gap-2 mb-3">
                              <span className="badge bg-light text-dark">
                                <i className="bi bi-bar-chart me-1"></i>
                                {resource.level}
                              </span>
                              <span className="badge bg-light text-dark">
                                <i className="bi bi-clock me-1"></i>
                                {resource.estimatedTimeToComplete}
                              </span>
                            </div>

                            {resource.highlights && resource.highlights.length > 0 && (
                              <div className="mb-3">
                                <h6 className="fw-bold">Highlights:</h6>
                                <ul className="mb-0">
                                  {resource.highlights.map((highlight, idx) => (
                                    <li key={idx}>{highlight}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary"
                              >
                                <i className="bi bi-box-arrow-up-right me-1"></i>
                                Open Resource
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-journal-bookmark display-1 text-muted mb-3"></i>
                    <p>Click "Find Resources" to get personalized recommendations for this step.</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedStep(null);
                    setResourceRecommendations(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default PlanDetail;
