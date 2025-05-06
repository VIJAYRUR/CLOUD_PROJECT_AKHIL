import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePlans } from '../../context/PlanContext';
import PlanExportService from '../../services/plan-export-service';

const MiniProgressTracker = ({ plan }) => {
  const { currentUser } = useAuth();

  // Calculate progress
  const steps = plan?.steps || [];
  const completedSteps = steps.filter(step => step && step.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const handleDownloadPlan = () => {
    console.log('Download button clicked');
    console.log('Plan data:', plan);

    if (!plan) {
      alert('No plan available to download.');
      return;
    }

    // Make a clean copy of the plan to avoid any reference issues
    const planToDownload = JSON.parse(JSON.stringify(plan));
    console.log('Sending plan to download service:', planToDownload);

    // Download the plan in multiple formats
    PlanExportService.downloadPlan(planToDownload);
  };

  return (
    <div className="mini-progress-tracker">
      <h5 className="mb-3">Progress Tracker</h5>

      <div className="text-center mb-3">
        <div className="display-4 fw-bold">{progress}%</div>
        <p className="text-muted">Complete</p>
      </div>

      <div className="progress mb-4" style={{ height: '10px' }}>
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

      <div className="d-flex justify-content-between mb-3">
        <div>
          <div className="fw-bold">{completedSteps}</div>
          <small className="text-muted">Steps Completed</small>
        </div>
        <div>
          <div className="fw-bold">{totalSteps - completedSteps}</div>
          <small className="text-muted">Steps Remaining</small>
        </div>
        <div>
          <div className="fw-bold">{totalSteps}</div>
          <small className="text-muted">Total Steps</small>
        </div>
      </div>

      <div className="d-grid">
        <button
          className="btn btn-primary d-flex align-items-center justify-content-center"
          onClick={handleDownloadPlan}
          style={{ backgroundColor: '#4361ee', borderColor: '#4361ee' }}
        >
          <i className="bi bi-download me-2"></i>
          Download Plan
        </button>
      </div>
    </div>
  );
};

export default MiniProgressTracker;
