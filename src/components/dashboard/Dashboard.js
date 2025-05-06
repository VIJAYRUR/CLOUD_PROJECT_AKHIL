import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePlans } from '../../context/PlanContext';
import LearningStatsWidget from './LearningStatsWidget';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { userPlans, loading, deletePlan } = usePlans();
  const [sortBy, setSortBy] = useState('date');

  // Sort plans
  const sortedPlans = [...(userPlans || [])].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'progress') {
      return b.progress - a.progress;
    } else if (sortBy === 'title') {
      return (a.plan?.title || '').localeCompare(b.plan?.title || '');
    }
    return 0;
  });

  const handleDeletePlan = async (e, planId) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this learning plan?')) {
      try {
        await deletePlan(planId);
      } catch (error) {
        console.error('Error deleting plan:', error);
        alert('Failed to delete plan. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      {/* Learning Stats Widget - Compact and collapsible */}
      {userPlans.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <LearningStatsWidget userPlans={userPlans} />
          </div>
        </div>
      )}

      {userPlans.length === 0 ? (
        <div className="row mt-4">
          <div className="col-md-8 mx-auto">
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="bi bi-journal-text"></i>
                </div>
                <h3 className="empty-state-title">No Learning Plans Yet</h3>
                <p className="empty-state-description">
                  Generate your first AI-powered learning plan to get started on your learning journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-md-12">
              <div className="d-flex align-items-center justify-content-end">
                <label className="me-2 text-nowrap">Sort by:</label>
                <select
                  className="form-select w-auto"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Date Created</option>
                  <option value="progress">Progress</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          </div>

          <div className="row row-cols-1 row-cols-md-2 g-4 mb-5">
            {sortedPlans.map((userPlan) => {
              const plan = userPlan.plan;
              if (!plan) return null;

              return (
                <div className="col" key={userPlan.planId}>
                  <Link to={`/plan/${userPlan.planId}`} className="text-decoration-none">
                    <div className="card h-100 plan-card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="card-title mb-0">{plan.title}</h5>
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-light rounded-circle"
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                              style={{ width: '32px', height: '32px' }}
                            >
                              <i className="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow border-0" style={{ borderRadius: 'var(--radius-md)' }}>
                              <li>
                                <a
                                  className="dropdown-item"
                                  href="#"
                                  onClick={(e) => handleDeletePlan(e, userPlan.planId)}
                                >
                                  <i className="bi bi-trash me-2 text-danger"></i>
                                  Delete Plan
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <p className="card-text text-muted mb-3">{plan.description}</p>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small className="text-muted">Progress</small>
                            <small className="fw-bold" style={{ color: 'var(--primary-color)' }}>{userPlan.progress}%</small>
                          </div>
                          <div className="progress">
                            <div
                              className="progress-bar"
                              style={{
                                width: `${userPlan.progress}%`,
                                backgroundColor: userPlan.progress >= 75 ? 'var(--success-color)' :
                                                userPlan.progress >= 25 ? 'var(--primary-color)' :
                                                'var(--warning-color)'
                              }}
                              role="progressbar"
                              aria-valuenow={userPlan.progress}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <i className="bi bi-clock me-1 text-muted"></i>
                            <small className="text-muted">{plan.estimatedTimeToComplete || 'Not specified'}</small>
                          </div>
                          <div>
                            <i className="bi bi-calendar me-1 text-muted"></i>
                            <small className="text-muted">Created: {new Date(userPlan.createdAt).toLocaleDateString()}</small>
                          </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2 mb-3">
                          {plan.tags && plan.tags.map((tag, index) => (
                            <span key={index} className="badge" style={{
                              backgroundColor: 'rgba(67, 97, 238, 0.1)',
                              color: 'var(--primary-color)',
                              borderRadius: 'var(--radius-full)',
                              padding: '0.5em 1em'
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="card-footer bg-white border-top-0">
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <small style={{ color: 'var(--neutral-600)' }}>
                              <i className="bi bi-check2-circle me-1"></i>
                              {plan.steps && `${plan.steps.filter(step => step.completed).length} of ${plan.steps.length} steps`}
                            </small>
                          </div>
                          <span className="btn btn-sm btn-primary" style={{
                            borderRadius: 'var(--radius-full)',
                            padding: '0.4em 1.2em'
                          }}>View Plan</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="row mt-5">
        <div className="col-md-8 mx-auto mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title d-flex align-items-center mb-4">
                <span className="icon-circle me-2" style={{
                  backgroundColor: 'rgba(251, 191, 36, 0.2)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-lightning-charge" style={{ color: 'var(--warning-color)', fontSize: '1.25rem' }}></i>
                </span>
                Quick Tips
              </h5>
              <div className="quick-tips">
                <div className="row">
                  <div className="col-md-6">
                    <div className="quick-tip-item">
                      <i className="bi bi-check-circle-fill quick-tip-icon"></i>
                      <span className="quick-tip-text">Break down large skills into smaller, manageable steps</span>
                    </div>
                    <div className="quick-tip-item">
                      <i className="bi bi-check-circle-fill quick-tip-icon"></i>
                      <span className="quick-tip-text">Aim to practice consistently rather than in long sessions</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="quick-tip-item">
                      <i className="bi bi-check-circle-fill quick-tip-icon"></i>
                      <span className="quick-tip-text">Update your progress regularly to stay motivated</span>
                    </div>
                    <div className="quick-tip-item">
                      <i className="bi bi-check-circle-fill quick-tip-icon"></i>
                      <span className="quick-tip-text">Use the AI to generate detailed plans for complex skills</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
