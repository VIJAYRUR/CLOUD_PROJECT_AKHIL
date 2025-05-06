import React, { createContext, useState, useEffect, useContext } from 'react';
import DynamoDBService from '../services/dynamodb-service';
import { useAuth } from './AuthContext';

// Create plan context
const PlanContext = createContext();

// Plan provider component
export const PlanProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [userPlans, setUserPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user plans when user changes
  useEffect(() => {
    const loadUserPlans = async () => {
      if (!currentUser) {
        setUserPlans([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const plans = await DynamoDBService.userPlans.getByUserId(currentUser.userId);
        setUserPlans(plans);
      } catch (error) {
        console.error('Error loading user plans:', error);
        setError('Failed to load your learning plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadUserPlans();
  }, [currentUser]);

  // Create a new plan
  const createPlan = async (planData) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        throw new Error('You must be logged in to create a plan');
      }

      // Create plan in DynamoDB
      const newPlan = await DynamoDBService.plans.create(planData);

      // Assign plan to user
      await DynamoDBService.userPlans.assign(currentUser.userId, newPlan.planId);

      // Reload user plans
      const updatedPlans = await DynamoDBService.userPlans.getByUserId(currentUser.userId);
      setUserPlans(updatedPlans);

      return newPlan;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update a plan
  const updatePlan = async (planId, planData) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        throw new Error('You must be logged in to update a plan');
      }

      // Update plan in DynamoDB
      const updatedPlan = await DynamoDBService.plans.update(planId, planData);

      // Reload user plans
      const updatedPlans = await DynamoDBService.userPlans.getByUserId(currentUser.userId);
      setUserPlans(updatedPlans);

      return updatedPlan;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a plan
  const deletePlan = async (planId) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        throw new Error('You must be logged in to delete a plan');
      }

      // Remove plan from user
      await DynamoDBService.userPlans.remove(currentUser.userId, planId);

      // Delete plan from DynamoDB
      await DynamoDBService.plans.delete(planId);

      // Update local state
      setUserPlans(userPlans.filter(plan => plan.planId !== planId));

      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update plan progress with enhanced tracking
  const updatePlanProgress = async (planId, progress, completedSteps, totalSteps) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        throw new Error('You must be logged in to update plan progress');
      }

      console.log('Updating plan progress in database:', progress, 'Completed steps:', completedSteps, 'Total steps:', totalSteps);

      // Update progress in DynamoDB with enhanced tracking
      await DynamoDBService.userPlans.updateProgress(
        currentUser.userId,
        planId,
        progress,
        completedSteps,
        totalSteps
      );

      // Update local state with enhanced tracking data
      setUserPlans(prevUserPlans => {
        const updatedUserPlans = prevUserPlans.map(userPlan => {
          if (userPlan.planId === planId) {
            return {
              ...userPlan,
              progress,
              completedSteps,
              totalSteps,
              lastProgressUpdate: new Date().toISOString()
            };
          }
          return userPlan;
        });

        console.log('Updated userPlans in context after progress update:', updatedUserPlans);
        return updatedUserPlans;
      });

      return true;
    } catch (error) {
      console.error('Error updating plan progress:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update plan steps (for saving step completion status)
  const updatePlanSteps = async (planId, steps) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        throw new Error('You must be logged in to update plan steps');
      }

      // Find the plan to update
      const planToUpdate = await DynamoDBService.plans.getById(planId);
      if (!planToUpdate) {
        throw new Error('Plan not found');
      }

      console.log('Updating plan steps in database:', steps);

      // Update only the steps field, not the entire plan
      const updatedPlan = await DynamoDBService.plans.update(planId, {
        steps
      });

      console.log('Updated plan in database:', updatedPlan);

      // Update local state
      setUserPlans(prevUserPlans => {
        const updatedUserPlans = prevUserPlans.map(userPlan => {
          if (userPlan.planId === planId) {
            if (userPlan.plan) {
              // If userPlan has a plan property, update it
              return {
                ...userPlan,
                plan: {
                  ...userPlan.plan,
                  steps
                }
              };
            } else {
              // If userPlan is the plan itself, update it directly
              return {
                ...userPlan,
                steps
              };
            }
          }
          return userPlan;
        });

        console.log('Updated userPlans in context:', updatedUserPlans);
        return updatedUserPlans;
      });

      return updatedPlan;
    } catch (error) {
      console.error('Error updating plan steps:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update plan notes
  const updatePlanNotes = async (planId, notes) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        throw new Error('You must be logged in to update plan notes');
      }

      // Find the plan to update
      const planToUpdate = await DynamoDBService.plans.getById(planId);
      if (!planToUpdate) {
        throw new Error('Plan not found');
      }

      console.log('Updating plan notes in database:', notes);

      // Update only the notes field, not the entire plan
      const updatedPlan = await DynamoDBService.plans.update(planId, {
        notes
      });

      console.log('Updated plan in database:', updatedPlan);

      // Update local state
      setUserPlans(prevUserPlans => {
        const updatedUserPlans = prevUserPlans.map(userPlan => {
          if (userPlan.planId === planId) {
            if (userPlan.plan) {
              // If userPlan has a plan property, update it
              return {
                ...userPlan,
                plan: {
                  ...userPlan.plan,
                  notes
                }
              };
            } else {
              // If userPlan is the plan itself, update it directly
              return {
                ...userPlan,
                notes
              };
            }
          }
          return userPlan;
        });

        console.log('Updated userPlans in context after notes update:', updatedUserPlans);
        return updatedUserPlans;
      });

      return updatedPlan;
    } catch (error) {
      console.error('Error updating plan notes:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    userPlans,
    loading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    updatePlanProgress,
    updatePlanSteps,
    updatePlanNotes
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
};

// Custom hook to use plan context
export const usePlans = () => {
  return useContext(PlanContext);
};

export default PlanContext;
