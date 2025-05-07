/**
 * Feedback Controller
 * Handles feedback/review-related operations
 */

const { authenticate, authorize } = require('../middleware/authMiddleware');
const { connectToDatabase } = require('../utils/dbConnect');
const { validate, schemas } = require('../utils/validator');
const Feedback = require('../models/feedback');
const Car = require('../models/car');
const Booking = require('../models/booking');

/**
 * Create a new feedback/review
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with created feedback
 */
const createFeedback = async (event) => {
  try {
    // Authenticate user
    const authenticatedEvent = await authenticate(event);
    const user = authenticatedEvent.user;
    
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = validate(body, schemas.createFeedback);
    
    // Connect to database
    await connectToDatabase();
    
    // Check if car exists
    const car = await Car.findById(validatedData.carId);
    if (!car) {
      return {
        statusCode: 404,
        body: { message: 'Car not found' }
      };
    }
    
    // Check if user has booked this car before
    const userBookings = await Booking.find({
      userId: user._id,
      carId: validatedData.carId,
      status: 'Completed'
    });
    
    if (userBookings.length === 0 && user.role === 'Client') {
      return {
        statusCode: 403,
        body: { message: 'You can only review cars you have booked and used' }
      };
    }
    
    // Check if user has already reviewed this car
    const existingFeedback = await Feedback.findOne({
      userId: user._id,
      carId: validatedData.carId
    });
    
    if (existingFeedback) {
      return {
        statusCode: 409,
        body: { message: 'You have already reviewed this car' }
      };
    }
    
    // Create new feedback
    const newFeedback = new Feedback({
      userId: user._id,
      carId: validatedData.carId,
      bookingId: userBookings.length > 0 ? userBookings[0]._id : null,
      rating: validatedData.rating,
      comment: validatedData.comment
    });
    
    // Save feedback to database
    await newFeedback.save();
    
    // Update car average rating
    const allFeedbacks = await Feedback.find({ carId: validatedData.carId });
    const totalRating = allFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = totalRating / allFeedbacks.length;
    
    car.averageRating = parseFloat(averageRating.toFixed(1));
    car.reviewCount = allFeedbacks.length;
    await car.save();
    
    // Return created feedback
    return {
      statusCode: 201,
      body: {
        feedbackId: newFeedback._id,
        userId: newFeedback.userId,
        carId: newFeedback.carId,
        rating: newFeedback.rating,
        comment: newFeedback.comment,
        createdAt: newFeedback.createdAt
      }
    };
  } catch (error) {
    console.error('Error in createFeedback:', error);
    
    if (error.name === 'UnauthorizedError') {
      return {
        statusCode: 401,
        body: { message: error.message }
      };
    }
    
    if (error.name === 'ValidationError') {
      return {
        statusCode: 400,
        body: { message: 'Validation error', details: error.details }
      };
    }
    
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};

/**
 * Get recent feedbacks
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with recent feedbacks
 */
const getRecentFeedbacks = async (event) => {
  try {
    // Extract query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Connect to database
    await connectToDatabase();
    
    // Get count parameter
    const count = parseInt(queryParams.count) || 10;
    const validCount = Math.min(Math.max(1, count), 50); // Limit between 1 and 50
    
    // Find recent feedbacks with good ratings
    const recentFeedbacks = await Feedback.find({ rating: { $gte: 4 } })
      .populate('userId', 'firstName lastName location imageUrl')
      .populate('carId', 'brand model year imageUrls')
      .limit(validCount)
      .sort({ createdAt: -1 });
    
    // Format the response according to Swagger UI format
    const formattedFeedbacks = recentFeedbacks.map(feedback => {
      const date = new Date(feedback.createdAt);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
      
      // Get user info
      const userName = feedback.userId ? 
        `${feedback.userId.firstName} ${feedback.userId.lastName}` : 
        'Anonymous';
      
      const userLocation = feedback.userId && feedback.userId.location ? 
        feedback.userId.location : 
        '';
      
      const author = userLocation ? 
        `${userName}, ${userLocation}` : 
        userName;
      
      // Get car info
      const carModel = feedback.carId ? 
        `${feedback.carId.brand} ${feedback.carId.model} ${feedback.carId.year}` : 
        'Unknown Model';
      
      const carImageUrl = feedback.carId && 
                         feedback.carId.imageUrls && 
                         feedback.carId.imageUrls.length > 0 ? 
        feedback.carId.imageUrls[0] : 
        null;
      
      return {
        feedbackId: feedback._id.toString(),
        feedbackText: feedback.comment,
        rating: feedback.rating.toFixed(1),
        date: formattedDate,
        author: author,
        carModel: carModel,
        carImageUrl: carImageUrl,
        orderHistory: `#${feedback._id.toString().substring(0, 4)} (${formattedDate})`
      };
    });
    
    // Return recent feedbacks in the format matching Swagger UI
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: formattedFeedbacks
    };
  } catch (error) {
    console.error('Error in getRecentFeedbacks:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};

/**
 * Get all feedbacks (admin/agent only)
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with all feedbacks
 */
const getAllFeedbacks = async (event) => {
  try {
    // Authenticate and authorize admin or support agent
    const authorizedEvent = await authorize(['Admin', 'SupportAgent'])(event);
    
    // Extract pagination parameters
    const queryParams = event.queryStringParameters || {};
    const page = parseInt(queryParams.page) || 1;
    const pageSize = parseInt(queryParams.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    
    // Connect to database
    await connectToDatabase();
    
    // Find all feedbacks with pagination
    const feedbacks = await Feedback.find()
      .populate('userId', 'firstName lastName email')
      .populate('carId', 'brand model year')
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const totalCount = await Feedback.countDocuments();
    
    // Return feedbacks with pagination info
    return {
      statusCode: 200,
      body: {
        feedbacks: feedbacks.map(feedback => ({
          feedbackId: feedback._id,
          rating: feedback.rating,
          comment: feedback.comment,
          createdAt: feedback.createdAt,
          user: feedback.userId ? {
            userId: feedback.userId._id,
            name: `${feedback.userId.firstName} ${feedback.userId.lastName}`,
            email: feedback.userId.email
          } : null,
          car: feedback.carId ? {
            carId: feedback.carId._id,
            brand: feedback.carId.brand,
            model: feedback.carId.model,
            year: feedback.carId.year
          } : null,
          adminResponse: feedback.adminResponse,
          adminResponseDate: feedback.adminResponseDate
        })),
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      }
    };
  } catch (error) {
    console.error('Error in getAllFeedbacks:', error);
    
    if (error.name === 'UnauthorizedError' || error.name === 'ForbiddenError') {
      return {
        statusCode: error.name === 'UnauthorizedError' ? 401 : 403,
        body: { message: error.message }
      };
    }
    
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};

/**
 * Add admin response to feedback
 * @param {Object} event - API Gateway event
 * @param {string} feedbackId - Feedback ID from path
 * @returns {Promise<Object>} Response with updated feedback
 */
const addAdminResponse = async (event, feedbackId) => {
  try {
    // Authenticate and authorize admin or support agent
    const authorizedEvent = await authorize(['Admin', 'SupportAgent'])(event);
    
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    
    if (!body.response || typeof body.response !== 'string') {
      return {
        statusCode: 400,
        body: { message: 'Response is required' }
      };
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find feedback by ID
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return {
        statusCode: 404,
        body: { message: 'Feedback not found' }
      };
    }
    
    // Add admin response
    feedback.adminResponse = body.response;
    feedback.adminResponseDate = new Date();
    
    // Save updated feedback
    await feedback.save();
    
    // Return updated feedback
    return {
      statusCode: 200,
      body: {
        feedbackId: feedback._id,
        adminResponse: feedback.adminResponse,
        adminResponseDate: feedback.adminResponseDate
      }
    };
  } catch (error) {
    console.error('Error in addAdminResponse:', error);
    
    if (error.name === 'UnauthorizedError' || error.name === 'ForbiddenError') {
      return {
        statusCode: error.name === 'UnauthorizedError' ? 401 : 403,
        body: { message: error.message }
      };
    }
    
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};

module.exports = {
  createFeedback,
  getRecentFeedbacks,
  getAllFeedbacks,
  addAdminResponse
};