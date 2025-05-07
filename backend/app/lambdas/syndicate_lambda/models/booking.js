/**
 * Booking Model
 * Defines the schema for booking data in MongoDB
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Booking Schema
 * Defines the structure and validation for booking documents
 */
const bookingSchema = new Schema({
  // Booking relationships
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  carId: {
    type:String,
    required: [true, 'Car ID is required']
  },
  dropOffLocationId: {
    type: String,
    required: [true, 'Location ID is required']
  },
  pickupLocationId: {
    type: String,
    required: [true, 'Location ID is required']
  },
  
  // Booking dates
  pickupDateTime: {
    type: String,
    required: [true, 'Start date is required']
  },
  dropOffDateTime: {
    type: String,
    required: [true, 'End date is required']
  },
  carImg: {
    type: String,
    required: [true, 'Car Img is required'],
  },
  carName: {
    type: String,
    required: [true, 'Car Name is required'],
  },

  
  // Booking details
  totalPrice: {
    type: Number,
    required: [false, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  status: {
    type: String,
    enum: ['FinishedService','Cancelled','InProgress','FinishedBooking','Reserved',],
    default: 'Reserved'
  },
  
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String
  },
  paymentReference: {
    type: String
  },
  
  // Additional notes
  notes: {
    type: String
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
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Index for search optimization
 */
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ carId: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1 });

// Create and export the Booking model
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;