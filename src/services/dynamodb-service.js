import {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import awsConfig from '../config/aws-config';
import bcrypt from 'bcryptjs';

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: awsConfig.region,
  credentials: awsConfig.credentials
});

// Table names
const { users, plans, userPlans, userPreferences, userActivity } = awsConfig.dynamoDb.tables;

// DynamoDB Service
const DynamoDBService = {
  /**
   * Initialize DynamoDB tables if they don't exist
   */
  initializeTables: async () => {
    try {
      // Check if tables already exist
      const { TableNames } = await dynamoClient.send(new ListTablesCommand({}));

      // Create Users table if it doesn't exist
      if (!TableNames.includes(users)) {
        await dynamoClient.send(new CreateTableCommand({
          TableName: users,
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'email', AttributeType: 'S' }
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'EmailIndex',
              KeySchema: [
                { AttributeName: 'email', KeyType: 'HASH' }
              ],
              Projection: {
                ProjectionType: 'ALL'
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
              }
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }));
        console.log(`Created ${users} table`);
      }

      // Create Plans table if it doesn't exist
      if (!TableNames.includes(plans)) {
        await dynamoClient.send(new CreateTableCommand({
          TableName: plans,
          KeySchema: [
            { AttributeName: 'planId', KeyType: 'HASH' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'planId', AttributeType: 'S' }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }));
        console.log(`Created ${plans} table`);
      }

      // Create UserPlans table if it doesn't exist
      if (!TableNames.includes(userPlans)) {
        await dynamoClient.send(new CreateTableCommand({
          TableName: userPlans,
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' },
            { AttributeName: 'planId', KeyType: 'RANGE' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'planId', AttributeType: 'S' }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }));
        console.log(`Created ${userPlans} table`);
      }

      // Create UserPreferences table if it doesn't exist
      if (!TableNames.includes(userPreferences)) {
        await dynamoClient.send(new CreateTableCommand({
          TableName: userPreferences,
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }));
        console.log(`Created ${userPreferences} table`);
      }

      // Create UserActivity table if it doesn't exist
      if (!TableNames.includes(userActivity)) {
        await dynamoClient.send(new CreateTableCommand({
          TableName: userActivity,
          KeySchema: [
            { AttributeName: 'activityId', KeyType: 'HASH' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'activityId', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'timestamp', AttributeType: 'S' }
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'UserIdIndex',
              KeySchema: [
                { AttributeName: 'userId', KeyType: 'HASH' },
                { AttributeName: 'timestamp', KeyType: 'RANGE' }
              ],
              Projection: {
                ProjectionType: 'ALL'
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
              }
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }));
        console.log(`Created ${userActivity} table`);
      }

      return true;
    } catch (error) {
      console.error('Error initializing DynamoDB tables:', error);
      throw error;
    }
  },

  /**
   * User Management
   */
  users: {
    // Register a new user
    register: async (userData) => {
      try {
        // Check if user with email already exists
        const existingUser = await DynamoDBService.users.getByEmail(userData.email);
        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Generate unique user ID
        const userId = `user_${Date.now()}`;

        // Prepare user data
        const user = {
          userId,
          email: userData.email,
          name: userData.name,
          hashedPassword,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Save user to DynamoDB
        await dynamoClient.send(new PutItemCommand({
          TableName: users,
          Item: marshall(user)
        }));

        // Create default user preferences
        await DynamoDBService.userPreferences.create(userId, {
          learningStyle: 'visual',
          pacePreference: 'moderate',
          difficultyPreference: 'challenging',
          interests: []
        });

        // Return user without password
        const { hashedPassword: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        console.error('Error registering user:', error);
        throw error;
      }
    },

    // Login user
    login: async (email, password) => {
      try {
        // Get user by email
        const user = await DynamoDBService.users.getByEmail(email);
        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!isMatch) {
          throw new Error('Invalid email or password');
        }

        // Return user without password
        const { hashedPassword, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
      }
    },

    // Get user by ID
    getById: async (userId) => {
      try {
        const { Item } = await dynamoClient.send(new GetItemCommand({
          TableName: users,
          Key: marshall({ userId })
        }));

        return Item ? unmarshall(Item) : null;
      } catch (error) {
        console.error('Error getting user by ID:', error);
        throw error;
      }
    },

    // Get user by email
    getByEmail: async (email) => {
      try {
        const { Items } = await dynamoClient.send(new QueryCommand({
          TableName: users,
          IndexName: 'EmailIndex',
          KeyConditionExpression: 'email = :email',
          ExpressionAttributeValues: marshall({
            ':email': email
          })
        }));

        return Items && Items.length > 0 ? unmarshall(Items[0]) : null;
      } catch (error) {
        console.error('Error getting user by email:', error);
        throw error;
      }
    },

    // Update user
    update: async (userId, userData) => {
      try {
        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        // Build update expression
        Object.entries(userData).forEach(([key, value]) => {
          if (key !== 'userId' && key !== 'email') {
            updateExpressions.push(`#${key} = :${key}`);
            expressionAttributeNames[`#${key}`] = key;
            expressionAttributeValues[`:${key}`] = value;
          }
        });

        // Add updatedAt
        updateExpressions.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        // Update user
        await dynamoClient.send(new UpdateItemCommand({
          TableName: users,
          Key: marshall({ userId }),
          UpdateExpression: `SET ${updateExpressions.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: marshall(expressionAttributeValues)
        }));

        // Get updated user
        return await DynamoDBService.users.getById(userId);
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    },

    // Change password
    changePassword: async (userId, oldPassword, newPassword) => {
      try {
        // Get user
        const user = await DynamoDBService.users.getById(userId);
        if (!user) {
          throw new Error('User not found');
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.hashedPassword);
        if (!isMatch) {
          throw new Error('Invalid password');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await dynamoClient.send(new UpdateItemCommand({
          TableName: users,
          Key: marshall({ userId }),
          UpdateExpression: 'SET hashedPassword = :hashedPassword, updatedAt = :updatedAt',
          ExpressionAttributeValues: marshall({
            ':hashedPassword': hashedPassword,
            ':updatedAt': new Date().toISOString()
          })
        }));

        return true;
      } catch (error) {
        console.error('Error changing password:', error);
        throw error;
      }
    }
  },

  /**
   * Plan Management
   */
  plans: {
    // Create a new plan
    create: async (planData) => {
      try {
        // Generate unique plan ID
        const planId = `plan_${Date.now()}`;

        // Prepare plan data
        const plan = {
          planId,
          ...planData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Save plan to DynamoDB
        await dynamoClient.send(new PutItemCommand({
          TableName: plans,
          Item: marshall(plan)
        }));

        return plan;
      } catch (error) {
        console.error('Error creating plan:', error);
        throw error;
      }
    },

    // Get plan by ID
    getById: async (planId) => {
      try {
        const { Item } = await dynamoClient.send(new GetItemCommand({
          TableName: plans,
          Key: marshall({ planId })
        }));

        return Item ? unmarshall(Item) : null;
      } catch (error) {
        console.error('Error getting plan by ID:', error);
        throw error;
      }
    },

    // Update plan
    update: async (planId, planData) => {
      try {
        // First get the current plan to avoid conflicts
        const currentPlan = await DynamoDBService.plans.getById(planId);
        if (!currentPlan) {
          throw new Error('Plan not found');
        }

        // Create a new plan object with updated fields
        const updatedPlan = {
          ...currentPlan,
          ...planData,
          updatedAt: new Date().toISOString()
        };

        // Remove the planId from the update data to avoid conflicts
        delete updatedPlan.createdAt; // Don't update creation date

        // Use PutItem instead of UpdateItem to avoid path conflicts
        await dynamoClient.send(new PutItemCommand({
          TableName: plans,
          Item: marshall(updatedPlan)
        }));

        // Return the updated plan
        return updatedPlan;
      } catch (error) {
        console.error('Error updating plan:', error);
        throw error;
      }
    },

    // Delete plan
    delete: async (planId) => {
      try {
        await dynamoClient.send(new DeleteItemCommand({
          TableName: plans,
          Key: marshall({ planId })
        }));

        return true;
      } catch (error) {
        console.error('Error deleting plan:', error);
        throw error;
      }
    }
  },

  /**
   * User Plans Management
   */
  userPlans: {
    // Assign plan to user with enhanced progress tracking
    assign: async (userId, planId, progress = 0, completedSteps = 0, totalSteps = 0) => {
      try {
        const timestamp = new Date().toISOString();

        // Get plan details to determine total steps if not provided
        if (totalSteps === 0) {
          const { Item } = await dynamoClient.send(new GetItemCommand({
            TableName: plans,
            Key: marshall({ planId })
          }));

          if (Item) {
            const plan = unmarshall(Item);
            totalSteps = plan.steps ? plan.steps.length : 0;
          }
        }

        // Prepare user plan data with enhanced tracking
        const userPlan = {
          userId,
          planId,
          progress,
          completedSteps,
          totalSteps,
          lastProgressUpdate: timestamp,
          createdAt: timestamp,
          updatedAt: timestamp
        };

        // Save user plan to DynamoDB
        await dynamoClient.send(new PutItemCommand({
          TableName: userPlans,
          Item: marshall(userPlan)
        }));

        // Log the plan assignment in the activity table
        await DynamoDBService.userActivity.create({
          userId,
          action: 'PLAN_ASSIGNED',
          timestamp,
          details: {
            planId,
            initialProgress: progress,
            totalSteps
          }
        });

        return userPlan;
      } catch (error) {
        console.error('Error assigning plan to user:', error);
        throw error;
      }
    },

    // Get user plans
    getByUserId: async (userId) => {
      try {
        const { Items } = await dynamoClient.send(new QueryCommand({
          TableName: userPlans,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: marshall({
            ':userId': userId
          })
        }));

        // Get plan details for each user plan
        const userPlansWithDetails = await Promise.all(
          (Items || []).map(async (item) => {
            const userPlan = unmarshall(item);
            const plan = await DynamoDBService.plans.getById(userPlan.planId);
            return { ...userPlan, plan };
          })
        );

        return userPlansWithDetails;
      } catch (error) {
        console.error('Error getting user plans:', error);
        throw error;
      }
    },

    // Update user plan progress with enhanced tracking
    updateProgress: async (userId, planId, progress, completedSteps, totalSteps) => {
      try {
        const timestamp = new Date().toISOString();

        // Get current plan data to compare with new progress
        const { Item } = await dynamoClient.send(new GetItemCommand({
          TableName: userPlans,
          Key: marshall({ userId, planId })
        }));

        const currentPlan = Item ? unmarshall(Item) : null;
        const previousProgress = currentPlan ? currentPlan.progress : 0;

        // Update the user plan with enhanced progress data
        await dynamoClient.send(new UpdateItemCommand({
          TableName: userPlans,
          Key: marshall({ userId, planId }),
          UpdateExpression: 'SET progress = :progress, completedSteps = :completedSteps, totalSteps = :totalSteps, lastProgressUpdate = :lastProgressUpdate, updatedAt = :updatedAt',
          ExpressionAttributeValues: marshall({
            ':progress': progress,
            ':completedSteps': completedSteps,
            ':totalSteps': totalSteps,
            ':lastProgressUpdate': timestamp,
            ':updatedAt': timestamp
          })
        }));

        // Log the progress update in the activity table
        await DynamoDBService.userActivity.create({
          userId,
          action: 'PROGRESS_UPDATE',
          timestamp,
          details: {
            planId,
            previousProgress,
            newProgress: progress,
            completedSteps,
            totalSteps
          }
        });

        return true;
      } catch (error) {
        console.error('Error updating user plan progress:', error);
        throw error;
      }
    },

    // Remove plan from user
    remove: async (userId, planId) => {
      try {
        await dynamoClient.send(new DeleteItemCommand({
          TableName: userPlans,
          Key: marshall({ userId, planId })
        }));

        return true;
      } catch (error) {
        console.error('Error removing plan from user:', error);
        throw error;
      }
    },

    // Track step completion
    trackStepCompletion: async (userId, planId, stepId, completed) => {
      try {
        const timestamp = new Date().toISOString();

        // Log the step completion in the activity table
        await DynamoDBService.userActivity.create({
          userId,
          action: completed ? 'STEP_COMPLETED' : 'STEP_UNCOMPLETED',
          timestamp,
          details: {
            planId,
            stepId,
            completed
          }
        });

        return true;
      } catch (error) {
        console.error('Error tracking step completion:', error);
        throw error;
      }
    },

    // Get progress history for a user plan
    getProgressHistory: async (userId, planId, limit = 100) => {
      try {
        const { Items } = await dynamoClient.send(new QueryCommand({
          TableName: userActivity,
          IndexName: 'UserIdIndex',
          KeyConditionExpression: 'userId = :userId',
          FilterExpression: 'action = :action AND details.planId = :planId',
          ExpressionAttributeValues: marshall({
            ':userId': userId,
            ':action': 'PROGRESS_UPDATE',
            ':planId': planId
          }),
          ScanIndexForward: false, // Sort by timestamp descending (newest first)
          Limit: limit
        }));

        return Items ? Items.map(item => unmarshall(item)) : [];
      } catch (error) {
        console.error('Error getting progress history:', error);
        throw error;
      }
    }
  },

  /**
   * User Preferences Management
   */
  userPreferences: {
    // Create user preferences
    create: async (userId, preferences) => {
      try {
        // Prepare user preferences data
        const userPrefs = {
          userId,
          ...preferences,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Save user preferences to DynamoDB
        await dynamoClient.send(new PutItemCommand({
          TableName: userPreferences,
          Item: marshall(userPrefs)
        }));

        return userPrefs;
      } catch (error) {
        console.error('Error creating user preferences:', error);
        throw error;
      }
    },

    // Get user preferences
    getByUserId: async (userId) => {
      try {
        const { Item } = await dynamoClient.send(new GetItemCommand({
          TableName: userPreferences,
          Key: marshall({ userId })
        }));

        return Item ? unmarshall(Item) : null;
      } catch (error) {
        console.error('Error getting user preferences:', error);
        throw error;
      }
    },

    // Update user preferences
    update: async (userId, preferences) => {
      try {
        // First get the current preferences to avoid conflicts
        const currentPrefs = await DynamoDBService.userPreferences.getByUserId(userId);

        // If no preferences exist yet, create them
        if (!currentPrefs) {
          return await DynamoDBService.userPreferences.create(userId, preferences);
        }

        // Create a new preferences object with updated fields
        const updatedPrefs = {
          ...currentPrefs,
          ...preferences,
          updatedAt: new Date().toISOString()
        };

        // Don't update creation date
        delete updatedPrefs.createdAt;

        // Use PutItem instead of UpdateItem to avoid path conflicts
        await dynamoClient.send(new PutItemCommand({
          TableName: userPreferences,
          Item: marshall(updatedPrefs)
        }));

        // Return the updated preferences
        return updatedPrefs;
      } catch (error) {
        console.error('Error updating user preferences:', error);
        throw error;
      }
    }
  },

  /**
   * User Activity Management
   */
  userActivity: {
    // Create user activity entry
    create: async (activityData) => {
      try {
        // Generate unique activity ID
        const activityId = `activity_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

        // Prepare activity data
        const activity = {
          activityId,
          ...activityData,
          // Ensure timestamp exists
          timestamp: activityData.timestamp || new Date().toISOString()
        };

        // Save activity to DynamoDB
        await dynamoClient.send(new PutItemCommand({
          TableName: userActivity,
          Item: marshall(activity)
        }));

        return activity;
      } catch (error) {
        console.error('Error creating user activity:', error);
        throw error;
      }
    },

    // Get user activities
    getByUserId: async (userId, limit = 100) => {
      try {
        const { Items } = await dynamoClient.send(new QueryCommand({
          TableName: userActivity,
          IndexName: 'UserIdIndex',
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: marshall({
            ':userId': userId
          }),
          ScanIndexForward: false, // Sort by timestamp descending (newest first)
          Limit: limit
        }));

        return Items ? Items.map(item => unmarshall(item)) : [];
      } catch (error) {
        console.error('Error getting user activities:', error);
        throw error;
      }
    },

    // Get user activities by type
    getByUserIdAndAction: async (userId, action, limit = 100) => {
      try {
        const { Items } = await dynamoClient.send(new QueryCommand({
          TableName: userActivity,
          IndexName: 'UserIdIndex',
          KeyConditionExpression: 'userId = :userId',
          FilterExpression: 'action = :action',
          ExpressionAttributeValues: marshall({
            ':userId': userId,
            ':action': action
          }),
          ScanIndexForward: false, // Sort by timestamp descending (newest first)
          Limit: limit
        }));

        return Items ? Items.map(item => unmarshall(item)) : [];
      } catch (error) {
        console.error('Error getting user activities by type:', error);
        throw error;
      }
    }
  }
};

export default DynamoDBService;
