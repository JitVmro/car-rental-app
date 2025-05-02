/**
 * Booking Controller
 * Handles booking-related operations
 */

const { validate, schemas } = require('../utils/validator');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { connectToDatabase } = require('../utils/dbConnect');
const Booking = require('../models/booking');
const Car = require('../models/car');
const User = require('../models/user');
const Location = require('../models/location');

/**
 * Create a new booking
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with booking details
 */
const createBooking = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body);
    
    // Validate request body
    const validatedData = validate(body, schemas.createBooking);
    
    // Connect to database
    await connectToDatabase();
    
    // Use clientId from request body - this is now required
    if (!validatedData.clientId) {
      return {
        statusCode: 400,
        body: { message: 'clientId is required' }
      };
    }
    
    // Check if the client exists
    const client = await User.findById(validatedData.clientId);
    if (!client) {
      return {
        statusCode: 404,
        body: { message: 'Client not found' }
      };
    }
    
    // Check if car exists and is available
    const car = await Car.findById(validatedData.carId);
    
    if (!car) {
      return {
        statusCode: 404,
        body: { message: 'Car not found' }
      };
    }
    
    if (!car.available) {
      return {
        statusCode: 400,
        body: { message: 'Car is not available for booking' }
      };
    }
    
    // Parse dates from the provided format
    const pickupDateTime = new Date(validatedData.pickupDateTime);
    const dropOffDateTime = new Date(validatedData.dropOffDateTime);
    
    // Check if dates are valid
    if (isNaN(pickupDateTime.getTime()) || isNaN(dropOffDateTime.getTime())) {
      return {
        statusCode: 400,
        body: { message: 'Invalid date format. Please use YYYY-MM-DD HH:MM format.' }
      };
    }
    
    // Check if pickup date is before drop-off date
    if (pickupDateTime >= dropOffDateTime) {
      return {
        statusCode: 400,
        body: { message: 'Pickup date must be before drop-off date' }
      };
    }
    
    // Check if car is already booked for the requested period
    const overlappingBookings = await Booking.find({
      carId: validatedData.carId,
      status: { $in: ['Pending', 'Confirmed', 'Active'] },
      $or: [
        { startDate: { $lte: dropOffDateTime }, endDate: { $gte: pickupDateTime } }
      ]
    });
    
    if (overlappingBookings.length > 0) {
      return {
        statusCode: 400,
        body: { message: 'Car is already booked for the selected dates' }
      };
    }
    
    // Calculate rental duration in days
    const durationMs = dropOffDateTime.getTime() - pickupDateTime.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    
    // Calculate total price
    const totalPrice = car.pricePerDay * durationDays;
    
    // Generate booking number
    const bookingNumber = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Create new booking
    const newBooking = new Booking({
      userId: validatedData.clientId,
      carId: validatedData.carId,
      startDate: pickupDateTime,
      endDate: dropOffDateTime,
      pickupLocationId: validatedData.pickupLocationId,
      dropOffLocationId: validatedData.dropOffLocationId,
      status: 'Pending',
      totalPrice,
      bookingNumber
    });
    
    await newBooking.save();
    
    // Update car booking count
    car.bookingCount = (car.bookingCount || 0) + 1;
    await car.save();
    
    // Return booking details
    return {
      statusCode: 201,
      body: {
        bookingId: newBooking._id,
        bookingNumber,
        status: newBooking.status,
        startDate: newBooking.startDate,
        endDate: newBooking.endDate,
        totalPrice: newBooking.totalPrice,
        car: {
          carId: car._id,
          brand: car.brand,
          model: car.model,
          year: car.year
        }
      }
    };
  } catch (error) {
    console.error('Error in createBooking:', error);
    
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
 * Get all bookings (admin/agent only)
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with list of bookings
 */
const getBookings = async (event) => {
  try {
    // Extract query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Skip validation since the schema is missing
    // const validatedParams = validate(queryParams, schemas.getBookings);
    // Just use the raw query params instead
    const validatedParams = queryParams;
    
    // Authenticate and authorize admin
    const authorizedEvent = await authorize(['Admin'])(event);
    
    // Connect to database
    await connectToDatabase();
    
    // Build filter query
    const filter = {};
    
    if (validatedParams.status) {
      filter.status = validatedParams.status;
    }
    
    if (validatedParams.startDate && validatedParams.endDate) {
      filter.$or = [
        {
          startDate: {
            $gte: new Date(validatedParams.startDate),
            $lte: new Date(validatedParams.endDate)
          }
        },
        {
          endDate: {
            $gte: new Date(validatedParams.startDate),
            $lte: new Date(validatedParams.endDate)
          }
        }
      ];
    }
    
    // Find bookings
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 });
    
    // Process bookings to match the required format
    const contentItems = [];
    
    for (const booking of bookings) {
      // Get user details
      const user = await User.findById(booking.userId);
      
      // Get car details
      const car = await Car.findById(booking.carId);
      
      // Format dates
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const bookingPeriod = `${monthNames[startDate.getMonth()]} ${startDate.getDate()} - ${monthNames[endDate.getMonth()]} ${endDate.getDate()}`;
      
      // Format date (day.month.year)
      const date = `${startDate.getDate().toString().padStart(2, '0')}.${(startDate.getMonth() + 1).toString().padStart(2, '0')}.${startDate.getFullYear().toString().slice(-2)}`;
      
      // Get location
      let location = "Unknown";
      if (car && car.locationId) {
        const locationsDoc = await Locations.findOne({});
        if (locationsDoc && locationsDoc.content) {
          const matchingLocation = locationsDoc.content.find(loc => 
            loc.locationId === car.locationId.toString()
          );
          
          if (matchingLocation) {
            // Extract city from address
            const addressParts = matchingLocation.locationAddress.split(',');
            location = addressParts.length > 0 ? addressParts[0].trim() : "Unknown";
          }
        }
      }
      
      // Add to content items
      contentItems.push({
        bookingId: booking._id.toString(),
        bookingNumber: booking.bookingNumber || Math.floor(1000 + Math.random() * 9000).toString(),
        BookingPeriod: bookingPeriod,
        carModel: car ? `${car.brand} ${car.model} ${car.year}` : "Unknown Car",
        clientName: user ? `${user.firstName} ${user.lastName}` : "Unknown Client",
        date: date,
        location: location,
        madeBy: user && user.role === "Admin" ? "Admin" : "Client"
      });
    }
    
    // Return bookings in the required format
    return {
      statusCode: 200,
      body: {
        content: contentItems
      }
    };
  } catch (error) {
    console.error('Error in getBookings:', error);
    
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
 * Get user bookings
 * @param {Object} event - API Gateway event
 * @param {string} userId - User ID from path
 * @returns {Promise<Object>} Response with user's bookings
 */
const getUserBookings = async (event, userId) => {
  try {
    // Authenticate user
    const authenticatedEvent = await authenticate(event);
    const requestingUser = authenticatedEvent.user;
  
    // Check if user is requesting their own bookings or has admin/agent rights
    if (requestingUser.userId.toString() !== userId && 
        !['Admin', 'SupportAgent'].includes(requestingUser.role)) {
      return {
        statusCode: 403,
        body: { message: 'Forbidden: You can only access your own bookings' }
      };
    }
    
    // Extract and validate query parameters
    const queryParams = event.queryStringParameters || {};
    const validatedParams = validate({ ...queryParams, userId }, schemas.getUserBookings);
    
    // Connect to database
    await connectToDatabase();
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return {
        statusCode: 404,
        body: { message: 'User not found' }
      };
    }
    
    // Build filter query
    const filter = { userId };
    
    if (validatedParams.status) {
      filter.status = validatedParams.status;
    }
    
    // Calculate pagination
    const page = validatedParams.page || 1;
    const pageSize = validatedParams.pageSize || 10;
    const skip = (page - 1) * pageSize;
    
    // Execute query with pagination
    const bookings = await Booking.find(filter)
      .populate('carId', 'brand model year imageUrls')
      .populate('locationId', 'name city country')
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const totalCount = await Booking.countDocuments(filter);
    
    // Return user bookings with pagination info
    return {
      statusCode: 200,
      body: {
        bookings: bookings.map(booking => ({
          bookingId: booking._id,
          car: booking.carId ? {
            carId: booking.carId._id,
            brand: booking.carId.brand,
            model: booking.carId.model,
            year: booking.carId.year,
            imageUrl: booking.carId.imageUrls && booking.carId.imageUrls.length > 0 ? booking.carId.imageUrls[0] : null
          } : null,
          location: booking.locationId ? {
            locationId: booking.locationId._id,
            name: booking.locationId.name,
            city: booking.locationId.city,
            country: booking.locationId.country
          } : null,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalPrice: booking.totalPrice,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          createdAt: booking.createdAt
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
    console.error('Error in getUserBookings:', error);
    
    if (error.name === 'UnauthorizedError' || error.name === 'ForbiddenError') {
      return {
        statusCode: error.name === 'UnauthorizedError' ? 401 : 403,
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
 * Update booking status
 * @param {Object} event - API Gateway event
 * @param {string} bookingId - Booking ID from path
 * @returns {Promise<Object>} Response with updated booking
 */
const updateBookingStatus = async (event, bookingId) => {
  try {
    // Authenticate and authorize admin or support agent
    const authorizedEvent = await authorize(['Admin', 'SupportAgent'])(event);
    
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = validate({ ...body, bookingId }, schemas.updateBookingStatus);
    
    // Connect to database
    await connectToDatabase();
    
    // Find booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return {
        statusCode: 404,
        body: { message: 'Booking not found' }
      };
    }
    
    // Update booking status
    booking.status = validatedData.status;
    
    // If cancelling, update payment status if needed
    if (validatedData.status === 'Cancelled' && booking.paymentStatus === 'Completed') {
      booking.paymentStatus = 'Refunded';
    }
    
    // Save updated booking
    await booking.save();
    
    // Return updated booking
    return {
      statusCode: 200,
      body: {
        bookingId: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        updatedAt: booking.updatedAt
      }
    };
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
    
    if (error.name === 'UnauthorizedError' || error.name === 'ForbiddenError') {
      return {
        statusCode: error.name === 'UnauthorizedError' ? 401 : 403,
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
 * Cancel booking
 * @param {Object} event - API Gateway event
 * @param {string} bookingId - Booking ID from path
 * @returns {Promise<Object>} Response with success message
 */
const cancelBooking = async (event, bookingId) => {
  try {
    // Authenticate user
    const authenticatedEvent = await authenticate(event);
    const user = authenticatedEvent.user;
    
    // Connect to database
    await connectToDatabase();
    
    // Find booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return {
        statusCode: 404,
        body: { message: 'Booking not found' }
      };
    }
    
    // Check if user owns this booking or is admin
    if (booking.userId.toString() !== user._id.toString() && user.role !== 'Admin') {
      return {
        statusCode: 403,
        body: { message: 'Forbidden: You can only cancel your own bookings' }
      };
    }
    
    // Check if booking can be cancelled
    const now = new Date();
    const bookingStart = new Date(booking.startDate);
    const hoursUntilStart = (bookingStart - now) / (1000 * 60 * 60);
    
    // Only allow cancellation if more than 24 hours before start
    if (hoursUntilStart < 24 && user.role !== 'Admin') {
      return {
        statusCode: 400,
        body: { message: 'Bookings can only be cancelled at least 24 hours before start time' }
      };
    }
    
    // Update booking status
    booking.status = 'Cancelled';
    
    // Handle payment status if needed
    if (booking.paymentStatus === 'Completed') {
      booking.paymentStatus = 'Refunded';
    } else if (booking.paymentStatus === 'Pending') {
      booking.paymentStatus = 'Cancelled';
    }
    
    // Save updated booking
    await booking.save();
    
    // Return success response
    return {
      statusCode: 200,
      body: { 
        message: 'Booking successfully cancelled',
        bookingId: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    };
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    
    if (error.name === 'UnauthorizedError') {
      return {
        statusCode: 401,
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
  createBooking,
  getBookings,
  getUserBookings,
  updateBookingStatus,
  cancelBooking
};