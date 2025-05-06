import OpenAI from 'openai';
import openaiConfig from '../config/openai-config';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiConfig.apiKey,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from a backend
});

// Service for OpenAI API interactions
const OpenAIService = {
  /**
   * Generate a detailed learning plan based on the skill and user preferences
   * @param {string} skill - The skill to learn
   * @param {object} userPreferences - User preferences and learning style
   * @returns {Promise<object>} - The generated learning plan
   */
  generateLearningPlan: async (skill, userPreferences) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert educational planner specializing in creating detailed, actionable learning plans. Your task is to create a structured step-by-step plan for learning the requested skill, tailored to the user's preferences and learning style. The plan should be practical, specific, and include clear milestones."
          },
          {
            role: "user",
            content: `Create a detailed learning plan for ${skill}.
            User preferences: ${JSON.stringify(userPreferences)}

            Format the response as a JSON object with the following structure:
            {
              "title": "Learning Plan Title",
              "description": "Brief description of what the user will achieve by following this plan",
              "estimatedTimeToComplete": "Estimated time to complete the plan (e.g., '8 weeks', '3 months')",
              "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
              "tags": ["tag1", "tag2", "tag3"],
              "steps": [
                {
                  "id": 1,
                  "title": "Step Title",
                  "description": "Detailed description of what to do in this step",
                  "estimatedTime": "Time to complete this step (e.g., '1 week')",
                  "resources": [
                    {
                      "type": "video|article|book|course|tool|exercise",
                      "title": "Resource title",
                      "url": "Resource URL if available",
                      "description": "Why this resource is helpful"
                    }
                  ],
                  "tasks": [
                    "Specific task 1 to complete in this step",
                    "Specific task 2 to complete in this step"
                  ],
                  "milestoneProject": {
                    "title": "Project title that demonstrates mastery of this step",
                    "description": "Description of what to build/create"
                  }
                }
              ],
              "nextSteps": [
                "Suggestion for what to learn after completing this plan"
              ]
            }`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error generating learning plan:', error);
      throw error;
    }
  },

  /**
   * Generate feedback on a user's progress in their learning plan
   * @param {object} plan - The learning plan
   * @param {object} progress - The user's progress data
   * @returns {Promise<object>} - Feedback and recommendations
   */
  generateProgressFeedback: async (plan, progress) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert learning coach providing constructive feedback on a user's progress through their learning plan. Your feedback should be motivating, specific, and include actionable recommendations."
          },
          {
            role: "user",
            content: `Learning Plan: ${JSON.stringify(plan)}

            User Progress: ${JSON.stringify(progress)}

            Provide feedback on the user's progress and recommendations for next steps. Format the response as a JSON object with the following structure:
            {
              "overallFeedback": "Overall assessment of progress",
              "accomplishments": ["Accomplishment 1", "Accomplishment 2"],
              "challenges": ["Challenge 1", "Challenge 2"],
              "recommendations": [
                {
                  "title": "Recommendation title",
                  "description": "Detailed description of the recommendation",
                  "reason": "Why this is recommended based on current progress"
                }
              ],
              "motivationalMessage": "A personalized motivational message"
            }`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error generating progress feedback:', error);
      throw error;
    }
  },

  /**
   * Generate personalized recommendations for learning resources
   * @param {string} topic - The topic to find resources for
   * @param {string} resourceType - Type of resource (video, book, course, etc.)
   * @param {string} level - Skill level (beginner, intermediate, advanced)
   * @returns {Promise<Array>} - Array of recommended resources
   */
  generateResourceRecommendations: async (topic, resourceType, level) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert in educational resources who provides high-quality, specific recommendations for learning materials. Your recommendations should be current, relevant, and appropriate for the user's skill level."
          },
          {
            role: "user",
            content: `Recommend ${resourceType} resources for learning about ${topic} at a ${level} level.

            Format the response as a JSON array with the following structure:
            [
              {
                "title": "Resource title",
                "author": "Author or creator name",
                "type": "${resourceType}",
                "url": "URL to the resource if available",
                "description": "Detailed description of what the resource covers",
                "level": "${level}",
                "estimatedTimeToComplete": "Estimated time to complete",
                "highlights": ["Key highlight 1", "Key highlight 2"]
              }
            ]`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error generating resource recommendations:', error);
      throw error;
    }
  },

  /**
   * Generate a breakdown of a complex skill into manageable sub-skills
   * @param {string} skill - The main skill to break down
   * @returns {Promise<object>} - Skill breakdown structure
   */
  generateSkillBreakdown: async (skill) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert in skill acquisition and learning pathways. Your task is to break down complex skills into logical, manageable sub-skills that can be learned incrementally."
          },
          {
            role: "user",
            content: `Break down the skill of ${skill} into its component sub-skills and learning areas.

            Format the response as a JSON object with the following structure:
            {
              "mainSkill": "${skill}",
              "description": "Overall description of the skill",
              "coreSubSkills": [
                {
                  "name": "Sub-skill name",
                  "description": "Description of this sub-skill",
                  "importance": "high|medium|low",
                  "dependsOn": ["Names of any prerequisite sub-skills"]
                }
              ],
              "learningAreas": [
                {
                  "name": "Learning area name",
                  "description": "Description of this learning area",
                  "relatedSubSkills": ["Names of related sub-skills"]
                }
              ],
              "skillProgressionPath": [
                "Step 1 in logical learning order",
                "Step 2 in logical learning order"
              ]
            }`
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error generating skill breakdown:', error);
      throw error;
    }
  }
};

export default OpenAIService;
