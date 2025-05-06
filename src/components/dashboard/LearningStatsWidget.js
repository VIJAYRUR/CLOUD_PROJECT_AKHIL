import React from 'react';
import { Link } from 'react-router-dom';

const LearningStatsWidget = ({ userPlans }) => {
  // Calculate statistics
  const totalPlans = userPlans.length;
  const averageProgress = totalPlans > 0
    ? Math.round(userPlans.reduce((sum, plan) => sum + plan.progress, 0) / totalPlans)
    : 0;
  const completedSteps = userPlans.reduce((sum, userPlan) => {
    const plan = userPlan.plan || {};
    return sum + ((plan.steps || []).filter(step => step.completed).length || 0);
  }, 0);

  return (
    <div className="learning-stats-widget card">
      <div className="card-body p-0">
        {/* Simple stats header */}
        <div className="stats-compact-header d-flex align-items-center p-3">
          <div className="d-flex align-items-center flex-grow-1">
            <h5 className="card-title m-0 me-3">Your Learning Statistics</h5>
            <div className="compact-stats d-flex">
              <div className="compact-stat me-4">
                <span className="compact-stat-value">{totalPlans}</span>
                <span className="compact-stat-label ms-1">Plans</span>
              </div>
              <div className="compact-stat me-4">
                <span className="compact-stat-value">{averageProgress}%</span>
                <span className="compact-stat-label ms-1">Progress</span>
              </div>
              <div className="compact-stat">
                <span className="compact-stat-value">{completedSteps}</span>
                <span className="compact-stat-label ms-1">Steps</span>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <Link to="/profile" className="btn btn-sm btn-outline-primary" style={{ borderRadius: 'var(--radius-full)' }}>
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningStatsWidget;
