import { useState } from 'react';
import OpenAIService from '../../services/openai-service';

const SkillSearch = ({ user }) => {
  const [skill, setSkill] = useState('');
  const [learningStyle, setLearningStyle] = useState(user?.preferences?.learningStyle || 'visual');
  const [pacePreference, setPacePreference] = useState(user?.preferences?.pacePreference || 'moderate');
  const [difficultyPreference, setDifficultyPreference] = useState(user?.preferences?.difficultyPreference || 'challenging');
  const [loading, setLoading] = useState(false);
  const [learningPath, setLearningPath] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const userPreferences = {
        learningStyle,
        pacePreference,
        difficultyPreference,
        interests: user?.preferences?.interests || []
      };
      
      const generatedPath = await OpenAIService.generateLearningPath(skill, userPreferences);
      setLearningPath(generatedPath);
    } catch (error) {
      console.error('Error generating learning path:', error);
      setError('Failed to generate learning path. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="skill-search-container">
      <div className="skill-search-header">
        <h1 className="display-5 fw-bold mb-3">Find Your Next Skill</h1>
        <p className="lead text-muted">
          Tell us what you want to learn, and our AI will create a personalized learning path just for you.
        </p>
      </div>

      {!learningPath ? (
        <div className="skill-search-form">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="skill" className="form-label fw-bold">What skill do you want to learn?</label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="skill"
                placeholder="e.g., Python Programming, Digital Marketing, Data Science"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                required
              />
            </div>

            <div className="row mb-4">
              <div className="col-md-4">
                <label htmlFor="learningStyle" className="form-label fw-bold">Learning Style</label>
                <select
                  className="form-select"
                  id="learningStyle"
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                >
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="reading">Reading/Writing</option>
                  <option value="kinesthetic">Hands-on</option>
                </select>
              </div>
              <div className="col-md-4">
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
              <div className="col-md-4">
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
                    Generating Your Learning Path...
                  </>
                ) : (
                  'Generate Learning Path'
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="learning-path-result">
          <div className="learning-path-header">
            <h2 className="mb-3">{learningPath.title}</h2>
            <p className="lead">{learningPath.description}</p>
            <div className="d-flex align-items-center mt-3">
              <div className="me-4">
                <span className="fw-bold text-muted">Estimated Time:</span>{' '}
                <span>{learningPath.estimatedTimeToComplete}</span>
              </div>
              <button
                className="btn btn-outline-primary"
                onClick={() => setLearningPath(null)}
              >
                Create Another Path
              </button>
            </div>
          </div>

          <div className="learning-path-content">
            {learningPath.sections.map((section, index) => (
              <div className="learning-path-section" key={index}>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                    {index + 1}
                  </div>
                  <h3 className="mb-0">{section.title}</h3>
                </div>
                
                <div className="section-container">
                  <div className="mb-4">
                    <span className="badge bg-secondary text-uppercase mb-2">{section.type}</span>
                    <p>{section.content}</p>
                  </div>

                  {section.resources && section.resources.length > 0 && (
                    <div className="mb-4">
                      <h5>Resources</h5>
                      <div className="list-group">
                        {section.resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <div className="fw-bold">{resource.title}</div>
                              <small className="text-muted">{resource.description}</small>
                            </div>
                            <span className="badge bg-primary rounded-pill text-uppercase">{resource.type}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.quiz && section.quiz.length > 0 && (
                    <div>
                      <h5>Practice Quiz</h5>
                      <div className="accordion" id={`quizAccordion${index}`}>
                        {section.quiz.map((quizItem, qIdx) => (
                          <div className="accordion-item" key={qIdx}>
                            <h2 className="accordion-header" id={`heading${index}-${qIdx}`}>
                              <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapse${index}-${qIdx}`}
                                aria-expanded="false"
                                aria-controls={`collapse${index}-${qIdx}`}
                              >
                                {quizItem.question}
                              </button>
                            </h2>
                            <div
                              id={`collapse${index}-${qIdx}`}
                              className="accordion-collapse collapse"
                              aria-labelledby={`heading${index}-${qIdx}`}
                              data-bs-parent={`#quizAccordion${index}`}
                            >
                              <div className="accordion-body">
                                <div className="mb-3">
                                  {quizItem.options.map((option, oIdx) => (
                                    <div className="form-check mb-2" key={oIdx}>
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        name={`quiz-${index}-${qIdx}`}
                                        id={`option-${index}-${qIdx}-${oIdx}`}
                                        disabled
                                      />
                                      <label className="form-check-label" htmlFor={`option-${index}-${qIdx}-${oIdx}`}>
                                        {option}
                                      </label>
                                      {oIdx === quizItem.correctAnswer && (
                                        <span className="ms-2 badge bg-success">Correct Answer</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="alert alert-info">
                                  <strong>Explanation:</strong> {quizItem.explanation}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-center mt-4 mb-5">
            <button className="btn btn-primary btn-lg me-3">Save This Learning Path</button>
            <button className="btn btn-outline-secondary btn-lg" onClick={() => setLearningPath(null)}>
              Create Another Path
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillSearch;
