/**
 * Location Model
 * Defines the schema for location data in MongoDB
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Location Content Item Schema
 * Defines the structure for individual location items
 */
const locationContentItemSchema = new Schema({
  locationId: {
    type: String,
    required: true
  },
  locationName: {
    type: String,
    required: true,
    trim: true
  },
  locationAddress: {
    type: String,
    required: true,
    trim: true
  },
  locationImageUrl: {
    type: String,
    required: false,
    trim: true
  }
});

/**
 * Locations Schema
 * Defines the structure and validation for locations documents
 */
const locationsSchema = new Schema({
  // Content array containing location items
  content: [locationContentItemSchema],
  
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
locationsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the Locations model
const Locations = mongoose.model('Locations', locationsSchema);

module.exports = Locations;