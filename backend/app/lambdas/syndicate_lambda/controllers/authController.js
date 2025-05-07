/**
 * Authentication Controller
 * Handles user authentication operations
 */

const bcrypt = require('bcryptjs');
const { validate, schemas } = require('../utils/validator');
const { generateToken } = require('../utils/jwtHelper');
const { connectToDatabase } = require('../utils/dbConnect');
const User = require('../models/user');

/**
 * User sign-in
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with authentication token
 */
const signIn = async (event) => {
  try {
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = validate(body, schemas.signIn);

    // Connect to database
    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ email: validatedData.email });

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(validatedData.password, user.password))) {
      return {
        statusCode: 401,
        body: { message: 'Invalid email or password' }
      };
    }

    // Generate JWT token
    const token = generateToken({
      sub: user._id.toString(),
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role
    });

    // Return success response with token
    return {
      statusCode: 200,
      body: {
        idToken: token,
        userId: user._id.toString(),
        username: `${user.firstName} ${user.lastName}`,
        role: user.role,
        userImageUrl: user.imageUrl || ''
      }
    };
  } catch (error) {
    console.error('Error in signIn:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return {
        statusCode: 400,
        body: { message: 'Validation error', details: error.details }
      };
    }

    // Handle other errors
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};

/**
 * User sign-up
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with success message
 */
const signUp = async (event) => {
  try {
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = validate(body, schemas.signUp);

    // Connect to database
    await connectToDatabase();

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return {
        statusCode: 409,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'User with this email already exists' })
      };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    // Create new user
    const newUser = new User({
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phoneNumber: validatedData.phoneNumber,
      country: validatedData.country,
      city: validatedData.city,
      street: validatedData.street,
      postalCode: validatedData.postalCode,
      role: 'Client' // Default role for new users
    });

    // Save user to database
    await newUser.save();

    // Return success response
    return {
      statusCode: 201,
      body: { message: 'User successfully created' }
    };
  } catch (error) {
    console.error('Error in signUp:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return {
        statusCode: 400,
        body: { message: 'Validation error', details: error.details }
      };
    }

    // Handle other errors
    return {
      statusCode: 500,
      body: { message: 'Internal server error :)' }
    };
  }
};

module.exports = {
  signIn,
  signUp
};