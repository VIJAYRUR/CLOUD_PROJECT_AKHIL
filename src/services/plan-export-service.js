/**
 * Plan Export Service
 *
 * This service provides functionality to export learning plans in different formats.
 */

const PlanExportService = {
  /**
   * Download the plan as a text file
   * @param {object} plan - The learning plan to download
   * @returns {boolean} - True if download started
   */
  downloadPlanAsText: (plan) => {
    try {
      if (!plan) {
        throw new Error("No plan provided");
      }

      // Calculate progress
      const steps = plan.steps || [];
      const completedSteps = steps.filter(step => step && step.completed).length;
      const totalSteps = steps.length;
      const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      // Format steps for text file
      const stepsText = steps.map((step, index) => {
        const checkmark = step.completed ? '[X]' : '[ ]';
        return `${checkmark} Step ${index + 1}: ${step.title}${step.description ? `\n    ${step.description}` : ''}`;
      }).join('\n');

      // Create text content
      const textContent = `
YOUR LEARNING PLAN: ${plan.title || 'Learning Plan'}
===============================================

${plan.description || 'No description provided'}

Progress: ${progress}%
Completed Steps: ${completedSteps}
Remaining Steps: ${totalSteps - completedSteps}
Total Steps: ${totalSteps}

LEARNING STEPS:
--------------
${stepsText}

${plan.notes ? `NOTES:\n------\n${plan.notes}` : ''}

This plan was created with SkillForge. Happy learning!
      `;

      // Create download link
      const element = document.createElement('a');
      const file = new Blob([textContent], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${plan.title || 'learning-plan'}.txt`.replace(/\s+/g, '-').toLowerCase();

      // Trigger download
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      console.log('Plan downloaded as text file');
      return true;
    } catch (error) {
      console.error("Error downloading plan:", error);
      alert(`Failed to download plan as text: ${error.message || 'Unknown error'}. Please try again.`);
      return false;
    }
  },

  /**
   * Download the plan as HTML (can be printed or saved as PDF)
   * @param {object} plan - The learning plan to download
   * @returns {boolean} - True if download started
   */
  downloadPlanAsHTML: (plan) => {
    try {
      if (!plan) {
        throw new Error("No plan provided");
      }

      // Calculate progress
      const steps = plan.steps || [];
      const completedSteps = steps.filter(step => step && step.completed).length;
      const totalSteps = steps.length;
      const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      // Create a PDF-ready HTML file that can be printed or saved as PDF
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${plan.title || 'Learning Plan'}</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      color: #4361ee;
      margin-bottom: 10px;
    }
    h2 {
      color: #4361ee;
      margin-top: 25px;
      margin-bottom: 15px;
    }
    .progress {
      background: #eee;
      height: 20px;
      border-radius: 10px;
      margin: 20px 0;
    }
    .progress-bar {
      background: #4361ee;
      height: 100%;
      border-radius: 10px;
      width: ${progress}%;
    }
    .stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .stat {
      text-align: center;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 5px;
      width: 30%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .step {
      margin-bottom: 15px;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    .step:last-child {
      border-bottom: none;
    }
    .notes {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-top: 20px;
      white-space: pre-line;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    @media print {
      body {
        margin: 0;
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <h1>${plan.title || 'Learning Plan'}</h1>
  <p>${plan.description || 'No description provided'}</p>

  <h2>Progress: ${progress}%</h2>
  <div class="progress"><div class="progress-bar"></div></div>

  <div class="stats">
    <div class="stat">
      <div style="font-weight: bold; font-size: 24px;">${completedSteps}</div>
      <div>Steps Completed</div>
    </div>
    <div class="stat">
      <div style="font-weight: bold; font-size: 24px;">${totalSteps - completedSteps}</div>
      <div>Steps Remaining</div>
    </div>
    <div class="stat">
      <div style="font-weight: bold; font-size: 24px;">${totalSteps}</div>
      <div>Total Steps</div>
    </div>
  </div>

  <h2>Learning Steps:</h2>
  <div class="steps">
  ${steps.map((step, index) => {
    const checkmark = step.completed ? '✓' : '□';
    return `
      <div class="step">
        <div><strong>${checkmark} Step ${index + 1}: ${step.title}</strong></div>
        ${step.description ? `<div style="margin-left: 20px; color: #666;">${step.description}</div>` : ''}
      </div>
    `;
  }).join('')}
  </div>

  ${plan.notes ? `
    <h2>Notes:</h2>
    <div class="notes">${plan.notes}</div>
  ` : ''}

  <div class="footer">
    <p>This plan was created with SkillForge. Happy learning!</p>
    <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #4361ee; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Print or Save as PDF
    </button>
  </div>
</body>
</html>
      `;

      // Create download link for HTML file
      const htmlElement = document.createElement('a');
      const htmlFile = new Blob([htmlContent], {type: 'text/html'});
      htmlElement.href = URL.createObjectURL(htmlFile);
      htmlElement.download = `${plan.title || 'learning-plan'}.html`.replace(/\s+/g, '-').toLowerCase();

      // Trigger download
      document.body.appendChild(htmlElement);
      htmlElement.click();
      document.body.removeChild(htmlElement);

      console.log('Plan downloaded as HTML file (can be saved as PDF)');
      return true;
    } catch (error) {
      console.error("Error downloading plan as HTML:", error);
      alert(`Failed to download plan as HTML: ${error.message || 'Unknown error'}. Please try again.`);
      return false;
    }
  },

  /**
   * Download the plan in multiple formats
   * @param {object} plan - The learning plan to download
   * @returns {boolean} - True if download started
   */
  downloadPlan: (plan) => {
    try {
      console.log('Attempting to download plan:', plan);

      if (!plan) {
        console.error('Plan is null or undefined');
        alert('No plan data available to download. Please try again.');
        return false;
      }

      // Log plan structure to help debug
      console.log('Plan structure:', {
        title: plan.title,
        description: plan.description,
        steps: plan.steps ? `${plan.steps.length} steps` : 'No steps',
        hasSteps: !!plan.steps,
        stepsSample: plan.steps ? plan.steps.slice(0, 2) : 'N/A'
      });

      // Create a simple text file as a fallback that will definitely work
      try {
        // Create a very simple text content
        const textContent = `
Learning Plan: ${plan.title || 'Untitled Plan'}
${plan.description || 'No description'}

Steps:
${plan.steps ? plan.steps.map((step, i) => `${i+1}. ${step.title || 'Untitled step'}`).join('\n') : 'No steps found'}
        `;

        // Create download link
        const element = document.createElement('a');
        const file = new Blob([textContent], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `learning-plan-${Date.now()}.txt`;

        // Trigger download
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        console.log('Basic plan download successful');
        alert('Your learning plan has been downloaded as a text file.');
        return true;
      } catch (basicError) {
        console.error('Error with basic download:', basicError);
        alert('Could not download plan. Please try again later.');
        return false;
      }
    } catch (error) {
      console.error("Error downloading plan:", error);
      alert(`Failed to download plan: ${error.message || 'Unknown error'}. Please try again.`);
      return false;
    }
  }
};

export default PlanExportService;
