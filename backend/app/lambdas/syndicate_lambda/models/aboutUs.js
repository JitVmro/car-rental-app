/**
 * AboutUs Model
 * Defines the schema for about us content in MongoDB
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * AboutUs Schema
 * Defines the structure and validation for about us documents
 */
const aboutUsSchema = new mongoose.Schema({
  content: [{
    description: {
      type: String,
      required: true
    },
    numericValue: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  }]
}, { timestamps: true });


/**
 * Pre-save middleware
 * Updates the updatedAt timestamp before saving
 */
// aboutUsSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// Create and export the AboutUs model
const AboutUs = mongoose.model('AboutUs', aboutUsSchema);

module.exports = AboutUs;