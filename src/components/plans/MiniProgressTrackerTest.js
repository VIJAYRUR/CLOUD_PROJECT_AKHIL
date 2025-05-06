import React from 'react';
import { useParams } from 'react-router-dom';
import StandaloneMiniProgressTracker from './StandaloneMiniProgressTracker';

const MiniProgressTrackerTest = () => {
  const { planId } = useParams();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <StandaloneMiniProgressTracker planId={planId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniProgressTrackerTest;
