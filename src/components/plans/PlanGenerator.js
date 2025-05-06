import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OpenAIService from '../../services/openai-service';
import { usePlans } from '../../context/PlanContext';
import { useAuth } from '../../context/AuthContext';

const PlanGenerator = () => {
  const { currentUser: user } = useAuth();
  const { createPlan } = usePlans();
  const navigate = useNavigate();
  const [skill, setSkill] = useState('');
  const [learningStyle, setLearningStyle] = useState(user?.preferences?.learningStyle || 'visual');
  const [pacePreference, setPacePreference] = useState(user?.preferences?.pacePreference || 'moderate');
  const [difficultyPreference, setDifficultyPreference] = useState(user?.preferences?.difficultyPreference || 'challenging');
  const [timeCommitment, setTimeCommitment] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [error, setError] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [skillBreakdown, setSkillBreakdown] = useState(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userPreferences = {
        learningStyle,
        pacePreference,
        difficultyPreference,
        timeCommitment,
        interests: user?.preferences?.interests || []
      };

      const generatedPlan = await OpenAIService.generateLearningPlan(skill, userPreferences);
      setGeneratedPlan(generatedPlan);
    } catch (error) {
      console.error('Error generating learning plan:', error);
      setError('Failed to generate learning plan. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      // Set saving state to show loading indicator
      setSavingPlan(true);
      setError(null);

      // Convert the generated plan to the format expected by the app
      const planToSave = {
        title: generatedPlan.title,
        description: generatedPlan.description,
        estimatedTimeToComplete: generatedPlan.estimatedTimeToComplete,
        tags: generatedPlan.tags || [],
        steps: generatedPlan.steps.map(step => ({
          id: step.id,
          title: step.title,
          description: step.description,
          completed: false
        }))
      };

      // Save the plan using the createPlan function from PlanContext
      const savedPlan = await createPlan(planToSave);

      // Navigate to the plan detail page
      navigate(`/plan/${savedPlan.planId}`);
    } catch (error) {
      console.error('Error saving plan:', error);
      setError('Failed to save the learning plan. Please try again later.');
      setSavingPlan(false); // Reset saving state on error
    }
  };

  const handleGenerateBreakdown = async () => {
    if (!skill.trim()) return;

    setLoadingBreakdown(true);
    setError(null);

    try {
      const breakdown = await OpenAIService.generateSkillBreakdown(skill);
      setSkillBreakdown(breakdown);
      setShowBreakdown(true);
    } catch (error) {
      console.error('Error generating skill breakdown:', error);
      setError('Failed to generate skill breakdown. Please try again later.');
    } finally {
      setLoadingBreakdown(false);
    }
  };

  return (
    <div className="plan-generator">
      <div className="row mb-4">
        <div className="col-lg-8 mx-auto">
          <h1 className="mb-4">Generate Learning Plan</h1>
          <p className="lead">
            Tell us what you want to learn, and our AI will create a personalized step-by-step learning plan tailored to your preferences.
          </p>
        </div>
      </div>

      {!generatedPlan ? (
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="skill" className="form-label fw-bold">What skill do you want to learn?</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="skill"
                        placeholder="e.g., Python Programming, Digital Marketing, Data Science"
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleGenerateBreakdown}
                        disabled={!skill.trim() || loadingBreakdown}
                      >
                        {loadingBreakdown ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Analyzing...
                          </>
                        ) : (
                          <>Analyze Skill</>
                        )}
                      </button>
                    </div>
                    <div className="form-text">
                      Be specific about what you want to learn. You can click "Analyze Skill" to see a breakdown of sub-skills.
                    </div>
                  </div>

                  {showBreakdown && skillBreakdown && (
                    <div className="mb-4">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-diagram-3 me-2"></i>
                            Skill Breakdown: {skillBreakdown.mainSkill}
                          </h5>
                          <p>{skillBreakdown.description}</p>

                          <div className="mb-3">
                            <h6 className="fw-bold">Core Sub-Skills:</h6>
                            <ul className="list-group">
                              {skillBreakdown.coreSubSkills.slice(0, 5).map((subSkill, index) => (
                                <li key={index} className="list-group-item bg-transparent border-0 ps-0 py-1">
                                  <span className={`badge ${
                                    subSkill.importance === 'high' ? 'bg-danger' :
                                    subSkill.importance === 'medium' ? 'bg-warning' :
                                    'bg-info'
                                  } me-2`}>
                                    {subSkill.importance}
                                  </span>
                                  <strong>{subSkill.name}</strong> - {subSkill.description}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h6 className="fw-bold">Recommended Learning Path:</h6>
                            <ol className="ps-3">
                              {skillBreakdown.skillProgressionPath.slice(0, 5).map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="row mb-4">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="learningStyle" className="form-label fw-bold">Learning Style</label>
                      <select
                        className="form-select"
                        id="learningStyle"
                        value={learningStyle}
                        onChange={(e) => setLearningStyle(e.target.value)}
                      >
                        <option value="visual">Visual (images, diagrams, videos)</option>
                        <option value="auditory">Auditory (lectures, discussions)</option>
                        <option value="reading">Reading/Writing (books, articles)</option>
                        <option value="kinesthetic">Hands-on (projects, practice)</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="difficultyPreference" className="form-label fw-bold">Difficulty Level</label>
                      <select
                        className="form-select"
                        id="difficultyPreference"
                        value={difficultyPreference}
                        onChange={(e) => setDifficultyPreference(e.target.value)}
                      >
                        <option value="beginner">Beginner-friendly</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="challenging">Challenging</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="pacePreference" className="form-label fw-bold">Learning Pace</label>
                      <select
                        className="form-select"
                        id="pacePreference"
                        value={pacePreference}
                        onChange={(e) => setPacePreference(e.target.value)}
                      >
                        <option value="slow">Slow & Thorough</option>
                        <option value="moderate">Moderate</option>
                        <option value="fast">Fast-paced</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="timeCommitment" className="form-label fw-bold">Time Commitment</label>
                      <select
                        className="form-select"
                        id="timeCommitment"
                        value={timeCommitment}
                        onChange={(e) => setTimeCommitment(e.target.value)}
                      >
                        <option value="low">Low (1-3 hours/week)</option>
                        <option value="medium">Medium (4-7 hours/week)</option>
                        <option value="high">High (8+ hours/week)</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger mb-4" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading || !skill.trim()}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Generating Your Learning Plan...
                        </>
                      ) : (
                        'Generate Learning Plan'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="mb-0">{generatedPlan.title}</h3>
                  <button
                    className="btn btn-light"
                    onClick={handleSavePlan}
                    disabled={savingPlan}
                  >
                    {savingPlan ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        Save Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger mb-4" role="alert">
                    {error}
                  </div>
                )}
                <div className="mb-4">
                  <p className="lead">{generatedPlan.description}</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <div className="badge bg-light text-dark p-2">
                      <i className="bi bi-clock me-1"></i>
                      {generatedPlan.estimatedTimeToComplete}
                    </div>
                    {generatedPlan.tags && generatedPlan.tags.map((tag, index) => (
                      <div key={index} className="badge bg-light text-dark p-2">
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>

                {generatedPlan.prerequisites && generatedPlan.prerequisites.length > 0 && (
                  <div className="mb-4">
                    <h5>Prerequisites</h5>
                    <ul className="list-group">
                      {generatedPlan.prerequisites.map((prerequisite, index) => (
                        <li key={index} className="list-group-item">
                          <i className="bi bi-check-circle me-2 text-success"></i>
                          {prerequisite}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="mb-3">Learning Plan Steps</h4>
                  <div className="accordion" id="learningPlanAccordion">
                    {generatedPlan.steps.map((step, index) => (
                      <div className="accordion-item" key={index}>
                        <h2 className="accordion-header" id={`heading${index}`}>
                          <button
                            className="accordion-button"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse${index}`}
                            aria-expanded={index === 0 ? "true" : "false"}
                            aria-controls={`collapse${index}`}
                          >
                            <div className="me-3 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', flexShrink: 0 }}>
                              {step.id}
                            </div>
                            <span className="fw-bold">{step.title}</span>
                            <span className="ms-auto badge bg-light text-dark">{step.estimatedTime}</span>
                          </button>
                        </h2>
                        <div
                          id={`collapse${index}`}
                          className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                          aria-labelledby={`heading${index}`}
                          data-bs-parent="#learningPlanAccordion"
                        >
                          <div className="accordion-body">
                            <p>{step.description}</p>

                            {step.tasks && step.tasks.length > 0 && (
                              <div className="mb-3">
                                <h6 className="fw-bold">Tasks:</h6>
                                <ul className="list-group">
                                  {step.tasks.map((task, taskIndex) => (
                                    <li key={taskIndex} className="list-group-item border-0 ps-0 py-1">
                                      <i className="bi bi-check-square me-2 text-primary"></i>
                                      {task}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {step.resources && step.resources.length > 0 && (
                              <div className="mb-3">
                                <h6 className="fw-bold">Resources:</h6>
                                <div className="row row-cols-1 row-cols-md-2 g-3">
                                  {step.resources.map((resource, resourceIndex) => (
                                    <div className="col" key={resourceIndex}>
                                      <div className="card h-100 border-0 bg-light">
                                        <div className="card-body">
                                          <div className="d-flex align-items-center mb-2">
                                            <span className={`badge ${
                                              resource.type === 'video' ? 'bg-danger' :
                                              resource.type === 'article' ? 'bg-info' :
                                              resource.type === 'book' ? 'bg-success' :
                                              resource.type === 'course' ? 'bg-warning' :
                                              resource.type === 'tool' ? 'bg-secondary' :
                                              'bg-primary'
                                            } me-2`}>
                                              {resource.type}
                                            </span>
                                            <h6 className="card-title mb-0">{resource.title}</h6>
                                          </div>
                                          <p className="card-text small">{resource.description}</p>
                                          {resource.url && (
                                            <a
                                              href={resource.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="btn btn-sm btn-outline-primary"
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
                              </div>
                            )}

                            {step.milestoneProject && (
                              <div className="mt-3 p-3 bg-light rounded">
                                <h6 className="fw-bold">
                                  <i className="bi bi-flag me-2 text-success"></i>
                                  Milestone Project: {step.milestoneProject.title}
                                </h6>
                                <p className="mb-0">{step.milestoneProject.description}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {generatedPlan.nextSteps && generatedPlan.nextSteps.length > 0 && (
                  <div className="mt-4">
                    <h5>What's Next After This Plan</h5>
                    <ul className="list-group">
                      {generatedPlan.nextSteps.map((nextStep, index) => (
                        <li key={index} className="list-group-item">
                          <i className="bi bi-arrow-right-circle me-2 text-primary"></i>
                          {nextStep}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="card-footer">
                <div className="d-flex justify-content-between">
                  <button className="btn btn-outline-secondary" onClick={() => setGeneratedPlan(null)}>
                    <i className="bi bi-arrow-left me-2"></i>
                    Generate Another Plan
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSavePlan}
                    disabled={savingPlan}
                  >
                    {savingPlan ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        Save This Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanGenerator;
