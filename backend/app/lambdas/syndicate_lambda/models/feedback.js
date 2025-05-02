/**
 * Feedback Model
 * Defines the schema for feedback/reviews data in MongoDB
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Feedback Schema
 * Defines the structure and validation for feedback documents
 */
const feedbackSchema = new Schema({
  // Feedback relationships
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car ID is required']
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  
  // Feedback content
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    trim: true
  },
  
  // Admin response
  adminResponse: {
    type: String,
    trim: true
  },
  adminResponseDate: {
    type: Date
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
feedbackSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Index for search optimization
 */
feedbackSchema.index({ carId: 1, createdAt: -1 });
feedbackSchema.index({ userId: 1 });

// Create and export the Feedback model
const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;