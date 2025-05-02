/**
 * Auth Middleware
 * Handles authentication and authorization
 */

// Import dependencies using CommonJS
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/dbConnect');
const User = require('../models/user');

/**
 * Authenticate user from JWT token
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Modified event with user
 */
const authenticate = async (event) => {
  try {
    // Extract token from Authorization header
    const authHeader = event.headers.Authorization || event.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('No token provided');
      error.name = 'UnauthorizedError';
      throw error;
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Connect to database
    await connectToDatabase();
    
    // Find user
    const user = await User.findById(decoded.sub);
    
    if (!user) {
      const error = new Error('User not found');
      error.name = 'UnauthorizedError';
      throw error;
    }
    
    // Add user to event
    event.user = {
      userId: user._id,
      email: user.email,
      role: user.role
    };
    
    return event;
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      const authError = new Error('Invalid or expired token');
      authError.name = 'UnauthorizedError';
      throw authError;
    }
    throw error;
  }
};

/**
 * Authorize user by role
 * @param {Array<string>} allowedRoles - Roles allowed to access the resource
 * @returns {Function} Middleware function
 */
const authorize = (allowedRoles) => {
  return async (event) => {
    try {
      // Authenticate user first
      const authenticatedEvent = await authenticate(event);
      
      // Check if user role is allowed
      if (!allowedRoles.includes(authenticatedEvent.user.role)) {
        const error = new Error('Access forbidden');
        error.name = 'ForbiddenError';
        throw error;
      }
      
      return authenticatedEvent;
    } catch (error) {
      throw error;
    }
  };
};

// Export middleware functions
module.exports = {
  authenticate,
  authorize
};