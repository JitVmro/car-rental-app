/**
 * User Model
 * Defines the schema for user data in MongoDB
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User Schema
 * Defines the structure and validation for user documents
 */
const userSchema = new Schema({
  // Authentication fields
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  
  // Personal information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  
  country: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  street: {
    type: String,
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  },
  
  // Profile information
  imageUrl: {
    type: String
  },
  
  // Role and permissions
  role: {
    type: String,
    enum: ['Client', 'SupportAgent', 'Admin'],
    default: 'Client'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Pre-save middleware
 * Updates the updatedAt timestamp before saving
 */
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Instance method to get full name
 * @returns {string} Full name of the user
 */
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

/**
 * Instance method to get public profile
 * Returns user data without sensitive information
 * @returns {Object} User profile without sensitive data
 */
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  
  // Remove sensitive information
  delete userObject.password;
  
  return userObject;
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;