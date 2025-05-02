/**
 * Response Formatter Utility
 * Provides standardized response formatting functions
 */

/**
 * Format a success response
 * @param {number} statusCode - HTTP status code
 * @param {Object|Array} data - Response data
 * @param {string} message - Optional success message
 * @returns {Object} Formatted success response
 */
const formatSuccess = (statusCode, data, message = null) => {
    const response = {
      statusCode,
      body: data
    };
    
    if (message) {
      // If data is an object, add message to it
      if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        response.body = { ...data, message };
      } else {
        // If data is not an object or is an array, wrap it
        response.body = { 
          data, 
          message 
        };
      }
    }
    
    return response;
  };
  
  /**
   * Create a success response (200 OK)
   * @param {Object|Array} data - Response data
   * @param {string} message - Optional success message
   * @returns {Object} Formatted success response
   */
  const success = (data, message = null) => {
    return formatSuccess(200, data, message);
  };
  
  /**
   * Create a created response (201 Created)
   * @param {Object} data - Created resource data
   * @param {string} message - Optional success message
   * @returns {Object} Formatted created response
   */
  const created = (data, message = 'Resource created successfully') => {
    return formatSuccess(201, data, message);
  };
  
  /**
   * Create a no content response (204 No Content)
   * @returns {Object} No content response
   */
  const noContent = () => {
    return {
      statusCode: 204,
      body: null
    };
  };
  
  /**
   * Create a paginated response
   * @param {Array} data - Array of items
   * @param {Object} pagination - Pagination information
   * @param {number} pagination.page - Current page
   * @param {number} pagination.pageSize - Items per page
   * @param {number} pagination.totalCount - Total number of items
   * @param {number} pagination.totalPages - Total number of pages
   * @returns {Object} Formatted paginated response
   */
  const paginated = (data, pagination) => {
    return formatSuccess(200, {
      data,
      pagination
    });
  };
  
  module.exports = {
    formatSuccess,
    success,
    created,
    noContent,
    paginated
  };