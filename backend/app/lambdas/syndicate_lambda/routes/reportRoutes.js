/**
 * Report Routes Handler
 * Handles routing for report-related endpoints
 */

const reportController = require('../controllers/reportController');

/**
 * Handle report-related requests
 * @param {string} path - Request path
 * @param {string} method - HTTP method
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response object
 */
const handleRequest = async (path, method, event) => {
  console.log(`Report route: ${method} ${path}`);
  
  // Get reports based on filtered parameters
  if (path === '/reports' && method === 'GET') {
    return await reportController.getReports(event);
  }
  
  // Create and export aggregated report
  if (path.match(/^\/reports\/(csv|pdf|xlsx)$/) && method === 'POST') {
    // Set the extension in the event's pathParameters
    if (!event.pathParameters) {
      event.pathParameters = {};
    }
    event.pathParameters.extension = path.split('/')[2];
    
    return await reportController.createAggregationReport(event);
  }
  
  // Schedule weekly reports (new functionality)
  if (path === '/reports/schedule' && method === 'POST') {
    return await reportController.scheduleWeeklyReports(event);
  }
  
  // Send reports manually (new functionality)
  if (path === '/reports/send' && method === 'POST') {
    return await reportController.sendReportsManually(event);
  }
  
  // If no route matches
  return {
    statusCode: 404,
    body: { 
      message: 'Report endpoint not found',
      path,
      method
    }
  };
};

module.exports = {
  handleRequest
};