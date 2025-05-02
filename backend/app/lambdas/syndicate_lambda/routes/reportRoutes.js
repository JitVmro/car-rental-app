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
  
  // Get available reports
  if (path === '/reports' && method === 'GET') {
    return await reportController.getAvailableReports(event);
  }
  
  // Generate report
  if (path.match(/^\/reports\/(csv|pdf|xlsx)$/) && method === 'POST') {
    const extension = path.split('/')[2];
    return await reportController.generateReport(event, extension);
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