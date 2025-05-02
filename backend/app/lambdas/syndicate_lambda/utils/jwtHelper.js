const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Generates a JWT token
 * @param {Object} payload - Data to include in the token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  if (!payload) {
    throw new Error('Payload is required');
  }
  
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

/**
 * Verifies a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  if (!token) {
    throw new Error('Token is required');
  }
  
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Extracts token from Authorization header
 * @param {Object} headers - Request headers
 * @returns {string|null} JWT token or null if not found
 */
const extractTokenFromHeader = (headers) => {
  if (!headers || !headers.Authorization) {
    return null;
  }
  
  const authHeader = headers.Authorization;
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader
};