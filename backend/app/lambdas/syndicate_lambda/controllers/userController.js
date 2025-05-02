/**
 * User Controller
 * Handles user-related operations
 */

const bcrypt = require('bcryptjs');
const { validate, schemas } = require('../utils/validator');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { connectToDatabase } = require('../utils/dbConnect');
const User = require('../models/user');

/**
 * Get user personal information
 * @param {Object} event - API Gateway event
 * @param {string} userId - User ID from path
 * @returns {Promise<Object>} Response with user info
 */
const getPersonalInfo = async (event, userId) => {
  try {
    // Authenticate user
    const authenticatedEvent = await authenticate(event);
    const requestingUser = authenticatedEvent.user;
    console.log('Authenticated User:', requestingUser);
    if (!requestingUser) {
      return {
        statusCode: 401,
        body: { message: 'Authentication failed: User not found' }
      };
    }    
    // Check if user is requesting their own info or has admin rights
    if (requestingUser.userId.toString() !== userId && requestingUser.role !== 'Admin') {
      return {
        statusCode: 403,
        body: { message: 'Forbidden: You can only access your own personal information' }
      };
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return {
        statusCode: 404,
        body: { message: 'User not found' }
      };
    }
    
    // Return user personal info
    return {
      statusCode: 200,
      body: {
        clientId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        country: user.country || '',
        city: user.city || '',
        street: user.street || '',
        postalCode: user.postalCode || '',
        imageUrl: user.imageUrl || ''
      }
    };
  } catch (error) {
    console.error('Error in getPersonalInfo:', error);
    
    if (error.name === 'UnauthorizedError') {
      return {
        statusCode: 401,
        body: { message: error.message }
      };
    }
    
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};

/**
 * Update user personal information
 * @param {Object} event - API Gateway event
 * @param {string} userId - User ID from path
 * @returns {Promise<Object>} Response with updated user info
 */
const updatePersonalInfo = async (event, userId) => {
  try {
    // Authenticate user
    const authenticatedEvent = await authenticate(event);
    const requestingUser = authenticatedEvent.user;
    
    // Check if user is updating their own info or has admin rights
    if (requestingUser.userId.toString() !== userId && requestingUser.role !== 'Admin') {
      return {
        statusCode: 403,
        body: { message: 'Forbidden: You can only update your own personal information' }
      };
    }
    
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = validate(body, schemas.updateUser);
    
    // Connect to database
    await connectToDatabase();
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return {
        statusCode: 404,
        body: { message: 'User not found' }
      };
    }
    
    // Update user fields
    if (validatedData.firstName) user.firstName = validatedData.firstName;
    if (validatedData.lastName) user.lastName = validatedData.lastName;
    if (validatedData.phone !== undefined) user.phoneNumber = validatedData.phone;
    if (validatedData.country !== undefined) user.country = validatedData.country;
    if (validatedData.city !== undefined) user.city = validatedData.city;
    if (validatedData.street !== undefined) user.street = validatedData.street;
    if (validatedData.postalCode !== undefined) user.postalCode = validatedData.postalCode;
    if (validatedData.imageUrl !== undefined) user.imageUrl = validatedData.imageUrl;
    
    // Save updated user
    await user.save();
    
    // Return updated user info
    return {
      statusCode: 200,
      body: {
        clientId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        country: user.country || '',
        city: user.city || '',
        street: user.street || '',
        postalCode: user.postalCode || '',
        imageUrl: user.imageUrl || ''
      }
    };
  } catch (error) {
    console.error('Error in updatePersonalInfo:', error);
    
    if (error.name === 'UnauthorizedError') {
      return {
        statusCode: 401,
        body: { message: error.message }
      };
    }
    
    if (error.name === 'ValidationError') {
      return {
        statusCode: 400,
        body: { message: 'Validation error', details: error.details }
      };
    }
    
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};

/**
 * Change user password
 * @param {Object} event - API Gateway event
 * @param {string} userId - User ID from path
 * @returns {Promise<Object>} Response with success message
 */
const changePassword = async (event, userId) => {
  try {
    // Authenticate user
    const authenticatedEvent = await authenticate(event);
    const requestingUser = authenticatedEvent.user;
    
    // Check if user is changing their own password
    if (requestingUser.userId.toString() !== userId) {
      return {
        statusCode: 403,
        body: { message: 'Forbidden: You can only change your own password' }
      };
    }
    
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = validate(body, schemas.changePassword);
    
    // Connect to database
    await connectToDatabase();
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return {
        statusCode: 404,
        body: { message: 'User not found' }
      };
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);
    if (!isPasswordValid) {
      return {
        statusCode: 400,
        body: { message: 'Current password is incorrect' }
      };
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    // Return success response
    return {
      statusCode: 200,
      body: { message: 'Password successfully changed' }
    };
  } catch (error) {
    console.error('Error in changePassword:', error);
    
    if (error.name === 'UnauthorizedError') {
      return {
        statusCode: 401,
        body: { message: error.message }
      };
    }
    
    if (error.name === 'ValidationError') {
      return {
        statusCode: 400,
        body: { message: 'Validation error', details: error.details }
      };
    }
    
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};

/**
 * Get all support agents
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with list of agents
 */
const getAgents = async (event) => {
  try {
    // Authenticate and authorize admin
    const authorizedEvent = await authorize(['Admin'])(event);
    
    // Connect to database
    await connectToDatabase();
    
    // Find all support agents
    const agents = await User.find({ role: 'SupportAgent' }, { password: 0 });
    
    // Return list of agents
    return {
      statusCode: 200,
      body: agents.map(agent => ({
        userId: agent._id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        imageUrl: agent.imageUrl || ''
      }))
    };
  } catch (error) {
    console.error('Error in getAgents:', error);
    
    if (error.name === 'UnauthorizedError' || error.name === 'ForbiddenError') {
      return {
        statusCode: error.name === 'UnauthorizedError' ? 401 : 403,
        body: { message: error.message }
      };
    }
    
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};

/**
 * Get all clients
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with list of clients
 */
const getClients = async (event) => {
  try {
    // Authenticate and authorize admin or support agent
    const authorizedEvent = await authorize(['Admin', 'SupportAgent'])(event);
    
    // Connect to database
    await connectToDatabase();
    
    // Find all clients
    const clients = await User.find({ role: 'Client' }, { password: 0 });
    
    // Return list of clients
    return {
      statusCode: 200,
      body: clients.map(client => ({
        userId: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phoneNumber: client.phoneNumber || '',
        country: client.country || '',
        city: client.city || '',
        imageUrl: client.imageUrl || ''
      }))
    };
  } catch (error) {
    console.error('Error in getClients:', error);
    
    if (error.name === 'UnauthorizedError' || error.name === 'ForbiddenError') {
      return {
        statusCode: error.name === 'UnauthorizedError' ? 401 : 403,
        body: { message: error.message }
      };
    }
    
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};

module.exports = {
  getPersonalInfo,
  updatePersonalInfo,
  changePassword,
  getAgents,
  getClients
};