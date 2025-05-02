/**
 * Error Handler Utility
 * Provides standardized error handling functions
 */

/**
 * Custom API Error class
 * @extends Error
 */
class ApiError extends Error {
    /**
     * Create a new API error
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     * @param {Object} details - Additional error details
     */
    constructor(message, statusCode, details = null) {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = statusCode;
      this.details = details;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Bad Request Error (400)
   * @extends ApiError
   */
  class BadRequestError extends ApiError {
    constructor(message = 'Bad Request', details = null) {
      super(message, 400, details);
    }
  }
  
  /**
   * Unauthorized Error (401)
   * @extends ApiError
   */
  class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized') {
      super(message, 401);
    }
  }
  
  /**
   * Forbidden Error (403)
   * @extends ApiError
   */
  class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden') {
      super(message, 403);
    }
  }
  
  /**
   * Not Found Error (404)
   * @extends ApiError
   */
  class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
      super(message, 404);
    }
  }
  
  /**
   * Conflict Error (409)
   * @extends ApiError
   */
  class ConflictError extends ApiError {
    constructor(message = 'Resource conflict') {
      super(message, 409);
    }
  }
  
  /**
   * Internal Server Error (500)
   * @extends ApiError
   */
  class InternalServerError extends ApiError {
    constructor(message = 'Internal Server Error') {
      super(message, 500);
    }
  }
  
  /**
   * Format error response
   * @param {Error} error - Error object
   * @returns {Object} Formatted error response
   */
  const formatErrorResponse = (error) => {
    console.error('Error:', error);
    
    // If it's an ApiError, use its properties
    if (error instanceof ApiError) {
      return {
        statusCode: error.statusCode,
        body: {
          message: error.message,
          ...(error.details && { details: error.details })
        }
      };
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return {
        statusCode: 400,
        body: {
          message: 'Validation error',
          details: error.details || error.message
        }
      };
    }
    
    // Handle MongoDB errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      if (error.code === 11000) {
        return {
          statusCode: 409,
          body: {
            message: 'Duplicate key error',
            details: error.keyValue
          }
        };
      }
    }
    
    // Default to internal server error
    return {
      statusCode: 500,
      body: {
        message: 'Internal server error'
      }
    };
  };
  
  module.exports = {
    ApiError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError,
    formatErrorResponse
  };