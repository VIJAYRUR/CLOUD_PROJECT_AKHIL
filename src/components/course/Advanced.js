import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Quiz from './Quiz';

const Advanced = () => {
  const { course } = useOutletContext();
  const navigate = useNavigate();
  const advancedSection = course.sections.advanced;
  const [showQuiz, setShowQuiz] = useState(false);

  const handleStartQuiz = () => {
    // In a real app, we would check if the user has completed the basic quiz first
    setShowQuiz(true);
  };

  const handleNavigateToQuiz = () => {
    navigate(`/course/${course.id}/quiz`);
  };
  
  const handleNavigateToHomework = () => {
    navigate(`/course/${course.id}/homework`);
  };

  if (showQuiz) {
    return <AdvancedQuiz course={course} onComplete={() => navigate(`/course/${course.id}/homework`)} />;
  }

  return (
    <div className="advanced-section">
      <div className="section-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{advancedSection.title}</h2>
          <span className="badge bg-danger">Advanced</span>
        </div>
        
        <div className="content-area mb-5">
          {advancedSection.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>

        {advancedSection.resources && advancedSection.resources.length > 0 && (
          <div className="resources mt-5">
            <h4 className="mb-3">
              <i className="bi bi-journal-bookmark me-2"></i>
              Advanced Learning Resources
            </h4>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {advancedSection.resources.map((resource, index) => (
                <div className="col" key={index}>
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="me-3">
                          <span className={`badge ${
                            resource.type === 'video' ? 'bg-danger' :
                            resource.type === 'article' ? 'bg-info' :
                            resource.type === 'pdf' ? 'bg-success' :
                            resource.type === 'tutorial' ? 'bg-warning' :
                            resource.type === 'documentation' ? 'bg-secondary' :
                            resource.type === 'whitepaper' ? 'bg-dark' : 'bg-primary'
                          }`}>
                            {resource.type.toUpperCase()}
                          </span>
                        </div>
                        <h5 className="card-title mb-0">{resource.title}</h5>
                      </div>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm w-100"
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i>
                        Open Resource
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="d-flex justify-content-between mt-5">
          <button className="btn btn-outline-secondary" onClick={handleNavigateToQuiz}>
            <i className="bi bi-arrow-left me-1"></i>
            Back to Basic Quiz
          </button>
          <button className="btn btn-primary" onClick={handleStartQuiz}>
            Take Advanced Quiz
            <i className="bi bi-arrow-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const AdvancedQuiz = ({ course, onComplete }) => {
  const quizSection = course.sections.advancedQuiz;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;

    const correct = selectedOption === quizSection.questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 1);
    }
    
    // Store the answer
    setAnswers([...answers, {
      questionId: quizSection.questions[currentQuestion].id,
      selectedOption,
      correct
    }]);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    
    if (currentQuestion < quizSection.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setQuizCompleted(false);
    setScore(0);
    setAnswers([]);
  };

  if (quizCompleted) {
    const totalQuestions = quizSection.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <div className="quiz-container">
        <div className="section-container">
          <div className="text-center mb-4">
            <h2>Advanced Quiz Completed!</h2>
            <p className="lead text-muted">You've completed the {quizSection.title}</p>
          </div>
          
          <div className="result-summary text-center mb-5">
            <div className="display-1 fw-bold mb-3">{percentage}%</div>
            <h3 className="mb-3">Your Score: {score} out of {totalQuestions}</h3>
            <div className="progress mb-4" style={{ height: '10px' }}>
              <div 
                className={`progress-bar ${percentage >= 70 ? 'bg-success' : percentage >= 40 ? 'bg-warning' : 'bg-danger'}`} 
                role="progressbar" 
                style={{ width: `${percentage}%` }} 
                aria-valuenow={percentage} 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
            
            <div className="mt-4">
              {percentage >= 70 ? (
                <div className="alert alert-success">
                  <h4 className="alert-heading">Excellent work!</h4>
                  <p>You've mastered the advanced concepts. You're ready for the take-home assignment!</p>
                </div>
              ) : percentage >= 40 ? (
                <div className="alert alert-warning">
                  <h4 className="alert-heading">Good progress!</h4>
                  <p>You understand some advanced concepts, but might want to review the material again.</p>
                </div>
              ) : (
                <div className="alert alert-danger">
                  <h4 className="alert-heading">Keep studying!</h4>
                  <p>You should review the advanced material before attempting the take-home assignment.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="question-review mb-5">
            <h4 className="mb-3">Question Review</h4>
            <div className="accordion" id="advancedQuestionReview">
              {quizSection.questions.map((question, index) => {
                const answer = answers.find(a => a.questionId === question.id);
                return (
                  <div className="accordion-item" key={index}>
                    <h2 className="accordion-header" id={`advHeading${index}`}>
                      <button 
                        className={`accordion-button collapsed ${answer?.correct ? 'text-success' : 'text-danger'}`} 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target={`#advCollapse${index}`} 
                        aria-expanded="false" 
                        aria-controls={`advCollapse${index}`}
                      >
                        <div className="d-flex align-items-center w-100">
                          <span className="me-3">Question {index + 1}:</span>
                          <span className="flex-grow-1">{question.question}</span>
                          <span className={`badge ${answer?.correct ? 'bg-success' : 'bg-danger'} ms-2`}>
                            {answer?.correct ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                      </button>
                    </h2>
                    <div 
                      id={`advCollapse${index}`} 
                      className="accordion-collapse collapse" 
                      aria-labelledby={`advHeading${index}`} 
                      data-bs-parent="#advancedQuestionReview"
                    >
                      <div className="accordion-body">
                        <div className="mb-3">
                          {question.options.map((option, optIndex) => (
                            <div 
                              className={`form-check mb-2 ${
                                optIndex === question.correctAnswer ? 'text-success fw-bold' : 
                                (answer && answer.selectedOption === optIndex && !answer.correct) ? 'text-danger' : ''
                              }`} 
                              key={optIndex}
                            >
                              <input
                                className="form-check-input"
                                type="radio"
                                name={`adv-review-question-${index}`}
                                id={`adv-review-option-${index}-${optIndex}`}
                                checked={answer && answer.selectedOption === optIndex}
                                disabled
                              />
                              <label className="form-check-label" htmlFor={`adv-review-option-${index}-${optIndex}`}>
                                {option}
                                {optIndex === question.correctAnswer && (
                                  <span className="ms-2 badge bg-success">Correct Answer</span>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <div className="alert alert-info">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button className="btn btn-outline-primary btn-lg" onClick={handleRetake}>
              <i className="bi bi-arrow-repeat me-1"></i>
              Retake Quiz
            </button>
            <button className="btn btn-primary btn-lg" onClick={onComplete}>
              Continue to Take-Home Work
              <i className="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quizSection.questions[currentQuestion];

  return (
    <div className="quiz-container">
      <div className="section-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{quizSection.title}</h2>
          <span className="badge bg-danger">Advanced Quiz</span>
        </div>
        
        <div className="progress mb-4">
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: `${((currentQuestion) / quizSection.questions.length) * 100}%` }} 
            aria-valuenow={((currentQuestion) / quizSection.questions.length) * 100} 
            aria-valuemin="0" 
            aria-valuemax="100"
          >
            Question {currentQuestion + 1} of {quizSection.questions.length}
          </div>
        </div>
        
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-4">Question {currentQuestion + 1}:</h5>
            <p className="card-text fs-5 mb-4">{question.question}</p>
            
            <div className="options mt-4">
              {question.options.map((option, index) => (
                <div className="form-check mb-3" key={index}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`adv-question-${currentQuestion}`}
                    id={`adv-option-${index}`}
                    checked={selectedOption === index}
                    onChange={() => handleOptionSelect(index)}
                    disabled={showFeedback}
                  />
                  <label className="form-check-label fs-5" htmlFor={`adv-option-${index}`}>
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {showFeedback && (
          <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            <h5 className="mb-2">{isCorrect ? 'Correct!' : 'Incorrect!'}</h5>
            <p className="mb-0">
              {isCorrect
                ? 'Great job! You selected the right answer.'
                : `The correct answer is: ${
                    question.options[question.correctAnswer]
                  }`}
            </p>
            {question.explanation && (
              <div className="mt-3">
                <strong>Explanation:</strong> {question.explanation}
              </div>
            )}
          </div>
        )}
        
        <div className="d-flex justify-content-between mt-4">
          {!showFeedback ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={selectedOption === null}
            >
              Submit Answer
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleNext}>
              {currentQuestion < quizSection.questions.length - 1
                ? 'Next Question'
                : 'Finish Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Advanced;
