/**
 * Car Model
 * Defines the schema for car data in MongoDB
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Car Schema
 * Defines the structure and validation for car documents
 */
const carSchema = new Schema({
  // Basic car information
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  
  // Car specifications
  transmission: {
    type: String,
    enum: ['Automatic', 'Manual'],
    required: [true, 'Transmission type is required']
  },
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    trim: true
  },
  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [1, 'Car must have at least 1 seat'],
    max: [10, 'Car cannot have more than 10 seats']
  },
  
  // Pricing and availability
  pricePerDay: {
    type: Number,
    required: [true, 'Price per day is required'],
    min: [0, 'Price cannot be negative']
  },
  available: {
    type: Boolean,
    default: true
  },
  
  // Location information
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location is required']
  },
  
  // Additional details
  description: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  imageUrls: [{
    type: String,
    trim: true
  }],
  
  // Metadata
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  bookingCount: {
    type: Number,
    default: 0
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
carSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Index for search optimization
 */
carSchema.index({ brand: 1, model: 1 });
carSchema.index({ locationId: 1 });
carSchema.index({ pricePerDay: 1 });
carSchema.index({ available: 1 });
carSchema.index({ bookingCount: -1 }); // For popular cars

// Create and export the Car model
const Car = mongoose.model('Car', carSchema);

module.exports = Car;