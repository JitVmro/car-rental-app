/**
 * FAQ Model
 * Defines the schema for frequently asked questions in MongoDB
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * FAQ Content Item Schema
 * Defines the structure for individual FAQ items
 */
const faqContentItemSchema = new Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required']
  }
});

/**
 * FAQ Schema
 * Defines the structure and validation for FAQ documents
 */
const faqSchema = new Schema({
  // Content array containing question-answer pairs
  content: [faqContentItemSchema],
  
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
faqSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the FAQ model
const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;