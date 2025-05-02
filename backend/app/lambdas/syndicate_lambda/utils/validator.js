/**
 * Validator Utility
 * Validates request data against schemas
 */

// Import dependencies using CommonJS
const Joi = require('joi');

/**
 * Validate data against schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Joi schema
 * @returns {Object} Validated data
 * @throws {Error} Validation error
 */
const validate = (data, schema) => {
  if (!schema) {
    console.error('Schema is undefined. Available schemas:', Object.keys(schemas));
    throw new Error('Validation schema is undefined');
  }
  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    const validationError = new Error('Validation error');
    validationError.name = 'ValidationError';
    validationError.details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw validationError;
  }

  return value;
};

/**
 * Validation schemas
 */
const schemas = {
  // Auth schemas
  signUp: Joi.object({
    firstName: Joi.string().required().min(2).max(50),
    lastName: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8).max(100),
    phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
    country: Joi.string().optional(),
    city: Joi.string().optional(),
    role: Joi.string().valid('Client', 'SupportAgent', 'Admin').default('Client')
  }),

  signIn: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // User schemas
  updateUser: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
    country: Joi.string().optional(),
    city: Joi.string().optional(),
    password: Joi.string().min(8).max(100).optional()
  }),

  // Car schemas
  getCars: Joi.object({
    brand: Joi.string().optional(),
    model: Joi.string().optional(),
    minPrice: Joi.number().optional(),
    maxPrice: Joi.number().optional(),
    location: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    transmission: Joi.string().valid('Automatic', 'Manual').optional(),
    fuelType: Joi.string().valid('Petrol', 'Diesel', 'Hybrid', 'Electric').optional(),
    minSeats: Joi.number().integer().optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    sort: Joi.string().optional()
  }),

  createCar: Joi.object({
    brand: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
    pricePerDay: Joi.number().positive().required(),
    available: Joi.boolean().default(true),
    locationId: Joi.string().required(),
    transmission: Joi.string().valid('Automatic', 'Manual').required(),
    fuelType: Joi.string().valid('Petrol', 'Diesel', 'Hybrid', 'Electric').required(),
    seats: Joi.number().integer().min(1).max(10).required(),
    description: Joi.string().max(1000).optional(),
    features: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional()
  }),

  updateCar: Joi.object({
    brand: Joi.string().optional(),
    model: Joi.string().optional(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
    pricePerDay: Joi.number().positive().optional(),
    available: Joi.boolean().optional(),
    locationId: Joi.string().optional(),
    transmission: Joi.string().valid('Automatic', 'Manual').optional(),
    fuelType: Joi.string().valid('Petrol', 'Diesel', 'Hybrid', 'Electric').optional(),
    seats: Joi.number().integer().min(1).max(10).optional(),
    description: Joi.string().max(1000).optional(),
    features: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    averageRating: Joi.number().min(0).max(5).optional(),
    reviewCount: Joi.number().integer().min(0).optional(),
    bookingCount: Joi.number().integer().min(0).optional()
  }),
  getCarBookedDays: Joi.object({
    carId: Joi.string().required(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  }),
  getCarReviews: Joi.object({
    carId: Joi.string().required(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    sort: Joi.string().valid('newest', 'oldest', 'highest', 'lowest').optional()
  }),

  // Booking schemas
  // In validator.js
  createBooking: Joi.object({
    carId: Joi.string().required(),
    clientId: Joi.string().required(),
    pickupDateTime: Joi.string().required(),
    pickupLocationId: Joi.string().required(),
    dropOffDateTime: Joi.string().required(),
    dropOffLocationId: Joi.string().required()
  }),

  updateBooking: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
    status: Joi.string().valid('Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled').optional(),
    paymentStatus: Joi.string().valid('Pending', 'Processing', 'Completed', 'Failed', 'Refunded').optional(),
    additionalServices: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      price: Joi.number().positive().required()
    })).optional()
  }),

  // Feedback schemas
  createFeedback: Joi.object({
    bookingId: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(1000).optional()
  }),

  updateFeedback: Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    comment: Joi.string().max(1000).optional()
  }),

  createFeedbackResponse: Joi.object({
    response: Joi.string().max(1000).required()
  }),

  // Report schemas
  generateReport: Joi.object({
    reportType: Joi.string().valid('bookings', 'revenue', 'cars', 'users').required(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
    filters: Joi.object().optional(),
    extension: Joi.string().valid('json', 'csv', 'xlsx', 'pdf').required()
  }),

  // Location schemas
  createLocation: Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().optional(),
    coordinates: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    }).optional(),
    contactInfo: Joi.object({
      phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
      email: Joi.string().email().optional()
    }).optional(),
    operatingHours: Joi.object({
      monday: Joi.string().optional(),
      tuesday: Joi.string().optional(),
      wednesday: Joi.string().optional(),
      thursday: Joi.string().optional(),
      friday: Joi.string().optional(),
      saturday: Joi.string().optional(),
      sunday: Joi.string().optional()
    }).optional()
  }),

  updateLocation: Joi.object({
    name: Joi.string().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    country: Joi.string().optional(),
    postalCode: Joi.string().optional(),
    coordinates: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    }).optional(),
    contactInfo: Joi.object({
      phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
      email: Joi.string().email().optional()
    }).optional(),
    operatingHours: Joi.object({
      monday: Joi.string().optional(),
      tuesday: Joi.string().optional(),
      wednesday: Joi.string().optional(),
      thursday: Joi.string().optional(),
      friday: Joi.string().optional(),
      saturday: Joi.string().optional(),
      sunday: Joi.string().optional()
    }).optional()
  }),

  // Content schemas
  updateAboutUs: Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    mission: Joi.string().optional(),
    vision: Joi.string().optional(),
    values: Joi.array().items(Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required()
    })).optional(),
    team: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      position: Joi.string().required(),
      bio: Joi.string().optional(),
      image: Joi.string().uri().optional()
    })).optional()
  }),

  updateFaq: Joi.object({
    categories: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      faqs: Joi.array().items(Joi.object({
        question: Joi.string().required(),
        answer: Joi.string().required()
      })).required()
    })).required()
  }),
  // Add this to your validator.js schemas
  // Add this to your validator.js schemas
  getBookings: Joi.object({
    status: Joi.string().valid('Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional()
  }),
  // Add this to your validator.js schemas
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Passwords do not match'
    }),
  })
};

// Export validator and schemas
module.exports = {
  validate,
  schemas
};