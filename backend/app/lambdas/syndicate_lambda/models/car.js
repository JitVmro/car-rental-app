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
  carId: {
    type: String,
    required: [true, 'CarId is required'],
    unique: true
  },
  carRating: {
    type: String,
  },
  climateControlOption: {
    type: String,
    enum: ["None", "Air Conditioner", "Climate Control", "Two Zone Climate Control"],
    required: [true, 'ClimateControlOption is required']
  },
  engineCapacity: {
    type: String,
    required: true
  },
  fuelConsumption: {
    type: String
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    required: [true, 'Fuel type is required'],
    trim: true
  },
  gearBoxType: {
    type: String,
    enum: ['Automatic', 'Manual'],
    required: [true, 'GearBoxType type is required']
  },
  images: [{
    type: String,
    trim: true
  }],
  location: {
    type:String,
    required: [true, 'Location is required']
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  passengerCapacity: {
    type: String,
  },
  pricePerDay: {
    type: String,
    required: true
  },
  serviceRating: {
    type: String
  },
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Unavailable']
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
carSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Index for search optimization
 */
carSchema.index({ model: 1 });
carSchema.index({ location: 1 });
carSchema.index({ pricePerDay: 1 });
carSchema.index({ status: 1 });
carSchema.index({ carRating: 1 });

// Create and export the Car model
const Car = mongoose.model('Car', carSchema);

module.exports = Car;