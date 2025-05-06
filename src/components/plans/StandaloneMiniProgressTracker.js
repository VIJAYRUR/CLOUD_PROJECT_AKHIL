import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DynamoDBService from '../../services/dynamodb-service';
import PlanExportService from '../../services/plan-export-service';

const StandaloneMiniProgressTracker = ({ planId }) => {
  const { currentUser } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedPlan = await DynamoDBService.plans.getById(planId);
        setPlan(fetchedPlan);
      } catch (error) {
        console.error('Error fetching plan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  // Calculate progress
  const steps = plan?.steps || [];
  const completedSteps = steps.filter(step => step && step.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const handleDownloadPlan = async () => {
    console.log('Download button clicked in StandaloneMiniProgressTracker');
    console.log('Plan data:', plan);

    if (!plan) {
      alert('No plan available to download.');
      return;
    }

    // Make a clean copy of the plan to avoid any reference issues
    const planToDownload = JSON.parse(JSON.stringify(plan));
    console.log('Sending plan to download service:', planToDownload);

    // Download the plan in multiple formats
    const downloadResult = PlanExportService.downloadPlan(planToDownload);

    // Log the activity if download was successful
    if (downloadResult && currentUser) {
      try {
        console.log('Logging download activity for user:', currentUser.userId);
        await DynamoDBService.userActivity.create({
          userId: currentUser.userId,
          action: 'PLAN_DOWNLOADED',
          timestamp: new Date().toISOString(),
          details: {
            planId: plan.id || plan.planId
          }
        });
        console.log('Download activity logged successfully');
      } catch (activityError) {
        console.error('Error logging download activity:', activityError);
        // Continue even if activity logging fails
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center p-4">
        <p className="text-muted">Plan not found</p>
      </div>
    );
  }

  return (
    <div className="standalone-mini-progress-tracker">
      <h5 className="mb-3">Progress Tracker</h5>

      <div className="text-center mb-3">
        <div className="display-4 fw-bold">{progress}%</div>
        <p className="text-muted">Complete</p>
      </div>

      <div className="progress mb-4" style={{ height: '10px' }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{
            width: `${progress}%`,
            backgroundColor: progress >= 75 ? '#28a745' :
                            progress >= 25 ? '#4361ee' :
                            '#ffc107'
          }}
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

export default StandaloneMiniProgressTracker;
