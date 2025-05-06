import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DynamoDBService from '../../services/dynamodb-service';

const ActivityLog = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchActivities = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      let userActivities = [];

      // Log for debugging
      console.log('Fetching activities for user:', currentUser);

      // Make sure we have a valid user ID
      if (currentUser.userId) {
        console.log('Using userId:', currentUser.userId);

        if (filter === 'all') {
          console.log('Fetching all activities');
          userActivities = await DynamoDBService.userActivity.getByUserId(currentUser.userId, 100);
        } else {
          console.log('Fetching activities with filter:', filter);
          userActivities = await DynamoDBService.userActivity.getByUserIdAndAction(currentUser.userId, filter, 100);
        }

        console.log('Activities fetched:', userActivities);
      } else {
        console.error('No userId found in currentUser:', currentUser);
        setError('User ID not found. Please try logging out and back in.');
      }

      setActivities(userActivities);
    } catch (err) {
      console.error('Error fetching user activities:', err);
      setError('Failed to load activity log. Please try again later.');
      // Set empty activities on error to avoid showing stale data
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [currentUser, filter]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get human-readable action name
  const getActionName = (action) => {
    const actionMap = {
      'PLAN_ASSIGNED': 'Plan Assigned',
      'PROGRESS_UPDATE': 'Progress Updated',
      'STEP_COMPLETED': 'Step Completed',
      'STEP_UNCOMPLETED': 'Step Uncompleted',
      'PROFILE_UPDATE': 'Profile Updated',
      'LOGIN': 'Logged In',
      'REGISTRATION': 'Registered',
      'PASSWORD_RESET': 'Password Reset'
    };

    return actionMap[action] || action;
  };

  // Render activity details based on action type
  const renderActivityDetails = (activity) => {
    const { action, details = {} } = activity;

    // Safety check for missing details
    if (!details) {
      return <p className="text-muted mb-0">No details available</p>;
    }

    try {
      switch (action) {
        case 'PROGRESS_UPDATE':
          return (
            <div>
              <p className="mb-1">
                <strong>Plan Progress:</strong> {details.previousProgress || 0}% → {details.newProgress || 0}%
              </p>
              <p className="mb-0">
                <strong>Steps:</strong> {details.completedSteps || 0} of {details.totalSteps || 0} completed
              </p>
            </div>
          );

        case 'STEP_COMPLETED':
        case 'STEP_UNCOMPLETED':
          return (
            <p className="mb-0">
              <strong>Step ID:</strong> {details.stepId || 'Unknown'}
              <br />
              <strong>Status:</strong> {details.completed ? 'Completed' : 'Uncompleted'}
            </p>
          );

        case 'PLAN_ASSIGNED':
          return (
            <p className="mb-0">
              <strong>Plan ID:</strong> {details.planId || 'Unknown'}
              <br />
              <strong>Initial Progress:</strong> {details.initialProgress || 0}%
              <br />
              <strong>Total Steps:</strong> {details.totalSteps || 0}
            </p>
          );

        default:
          return (
            <pre className="mb-0 small">
              {JSON.stringify(details, null, 2)}
            </pre>
          );
      }
    } catch (error) {
      console.error('Error rendering activity details:', error);
      return <p className="text-danger mb-0">Error displaying details</p>;
    }
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading activity log...</span>
        </div>
        <p className="text-muted mt-2">Loading your activity log...</p>
      </div>
    );
  }

  // Sample activities for fallback UI
  const sampleActivities = [
    {
      action: 'LOGIN',
      timestamp: new Date().toISOString(),
      details: {}
    },
    {
      action: 'PLAN_ASSIGNED',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      details: {
        planId: 'sample-plan-1',
        initialProgress: 0,
        totalSteps: 10
      }
    },
    {
      action: 'PROGRESS_UPDATE',
      timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      details: {
        planId: 'sample-plan-1',
        previousProgress: 0,
        newProgress: 30,
        completedSteps: 3,
        totalSteps: 10
      }
    }
  ];

  if (error) {
    return (
      <div>
        <div className="alert alert-danger mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={fetchActivities}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Retry
            </button>
          </div>
        </div>

        {/* Show sample UI when there's an error */}
        <div className="mt-3">
          <div className="text-muted mb-3">
            <i className="bi bi-info-circle me-2"></i>
            Here's a preview of what your activity log will look like:
          </div>

          <div className="list-group opacity-50">
            {sampleActivities.map((activity, index) => (
              <div key={index} className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">{getActionName(activity.action)}</h6>
                  <small className="text-muted">{formatDate(activity.timestamp)}</small>
                </div>
                {renderActivityDetails(activity)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activities.length === 0 && !loading) {
    return (
      <div>
        <div className="alert alert-info mb-4">
          <i className="bi bi-info-circle-fill me-2"></i>
          No activity recorded yet. As you use the app, your actions will be logged here.
        </div>

        {/* Show sample UI when there's no data */}
        <div className="mt-3">
          <div className="text-muted mb-3">
            <i className="bi bi-info-circle me-2"></i>
            Here's a preview of what your activity log will look like:
          </div>

          <div className="list-group opacity-50">
            {sampleActivities.map((activity, index) => (
              <div key={index} className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">{getActionName(activity.action)}</h6>
                  <small className="text-muted">{formatDate(activity.timestamp)}</small>
                </div>
                {renderActivityDetails(activity)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-log">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <h5 className="mb-0 me-2">Activity Log</h5>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={fetchActivities}
            title="Refresh activity log"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
        <div className="d-flex align-items-center">
          <select
            className="form-select form-select-sm w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Activities</option>
            <option value="PROGRESS_UPDATE">Progress Updates</option>
            <option value="STEP_COMPLETED">Completed Steps</option>
            <option value="STEP_UNCOMPLETED">Uncompleted Steps</option>
            <option value="PLAN_ASSIGNED">Plan Assignments</option>
            <option value="LOGIN">Logins</option>
          </select>
        </div>
      </div>

      {activities.length > 0 ? (
        <div className="list-group">
          {activities.map((activity, index) => (
            <div key={index} className="list-group-item list-group-item-action">
              <div className="d-flex w-100 justify-content-between">
                <h6 className="mb-1">{getActionName(activity.action)}</h6>
                <small className="text-muted">{formatDate(activity.timestamp)}</small>
              </div>
              {renderActivityDetails(activity)}
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="bi bi-info-circle-fill me-2"></i>
          No activities found with the current filter. Try changing the filter or refreshing.
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
