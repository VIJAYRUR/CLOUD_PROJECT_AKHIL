import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePlans } from '../../context/PlanContext';

const FloatingStatsButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { userPlans } = usePlans();

  // Calculate statistics
  const totalPlans = userPlans.length;
  const averageProgress = totalPlans > 0
    ? Math.round(userPlans.reduce((sum, plan) => sum + plan.progress, 0) / totalPlans)
    : 0;
  const completedSteps = userPlans.reduce((sum, userPlan) => {
    const plan = userPlan.plan || {};
    return sum + ((plan.steps || []).filter(step => step.completed).length || 0);
  }, 0);

  // Generate activity data for the last 30 days
  const generateActivityData = () => {
    const today = new Date();
    const activityData = [];

    // Create an array of the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Random activity level for demo purposes (0-3)
      // In a real app, this would come from actual user activity data
      const activityLevel = Math.floor(Math.random() * 4);

      activityData.push({
        date: date,
        level: activityLevel
      });
    }

    return activityData;
  };

  const activityData = generateActivityData();

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false);
  };

  // Show tooltip after page load to guide users
  useEffect(() => {
    if (userPlans.length > 0) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [userPlans.length]);

  // Hide tooltip after 5 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  if (userPlans.length === 0) {
    return null; // Don't show the button if there are no plans
  }

  return (
    <div className="floating-stats-container">
      {showTooltip && !isOpen && (
        <div className="floating-stats-tooltip">
          Click to view your learning statistics
          <div className="tooltip-arrow"></div>
        </div>
      )}

      <button
        className={`floating-stats-button ${isOpen ? 'open' : ''}`}
        onClick={toggleOpen}
        aria-label="View learning statistics"
      >
        <i className="bi bi-graph-up"></i>
      </button>

      {isOpen && (
        <div className="floating-stats-panel">
          <div className="floating-stats-header">
            <h6 className="m-0">Learning Statistics</h6>
            <button className="btn-close" onClick={toggleOpen} aria-label="Close"></button>
          </div>

          <div className="floating-stats-body">
            <div className="floating-stat-item">
              <div className="floating-stat-value">{totalPlans}</div>
              <div className="floating-stat-label">Active Plans</div>
            </div>
            <div className="floating-stat-item">
              <div className="floating-stat-value">{averageProgress}%</div>
              <div className="floating-stat-label">Avg. Progress</div>
            </div>
            <div className="floating-stat-item">
              <div className="floating-stat-value">{completedSteps}</div>
              <div className="floating-stat-label">Steps Done</div>
            </div>

            <div className="floating-stats-activity mt-3">
              <div className="floating-stats-activity-label mb-2">Activity (Last 30 Days)</div>
              <div className="activity-blocks d-flex justify-content-between mb-2">
                {activityData.map((day, index) => (
                  <div
                    key={index}
                    className="activity-block"
                    style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: day.level === 0
                        ? 'var(--neutral-200)'
                        : day.level === 1
                          ? 'rgba(67, 97, 238, 0.3)'
                          : day.level === 2
                            ? 'rgba(67, 97, 238, 0.6)'
                            : 'var(--primary-color)',
                      borderRadius: '1px',
                      transition: 'all 0.2s ease'
                    }}
                    title={`${day.date.toLocaleDateString()}: ${day.level === 0 ? 'No activity' : day.level === 1 ? 'Low activity' : day.level === 2 ? 'Medium activity' : 'High activity'}`}
                  />
                ))}
              </div>
              <div className="d-flex justify-content-between">
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>30 days ago</small>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Today</small>
              </div>
            </div>
          </div>

          <div className="floating-stats-footer">
            <Link to="/profile" className="btn btn-sm btn-primary w-100" onClick={toggleOpen}>
              View Detailed Stats
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingStatsButton;
