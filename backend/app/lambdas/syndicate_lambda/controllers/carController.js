/**
 * Car Controller
 * Handles car-related operations
 */

const { validate, schemas } = require('../utils/validator');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { connectToDatabase } = require('../utils/dbConnect');
const Car = require('../models/car');
const Booking = require('../models/booking');
const Feedback = require('../models/feedback');
const Locations = require('../models/location');

/**
 * Get cars with filtering
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with list of cars
 */
const getCars = async (event) => {
  try {
    // Extract and validate query parameters
    const queryParams = event.queryStringParameters || {};
    const validatedParams = validate(queryParams, schemas.getCars);
    
    // Connect to database
    await connectToDatabase();
    
    // Build filter query
    const filter = {};
    
    if (validatedParams.brand) {
      filter.brand = { $regex: validatedParams.brand, $options: 'i' };
    }
    
    if (validatedParams.model) {
      filter.model = { $regex: validatedParams.model, $options: 'i' };
    }
    
    if (validatedParams.minPrice !== undefined) {
      filter.pricePerDay = { $gte: validatedParams.minPrice };
    }
    
    if (validatedParams.maxPrice !== undefined) {
      filter.pricePerDay = { 
        ...filter.pricePerDay,
        $lte: validatedParams.maxPrice 
      };
    }
    
    // Handle location filter
    if (validatedParams.location) {
      // Just use the location parameter directly as the locationId
      filter.locationId = validatedParams.location;
    }
    
    // Handle date availability filter
    if (validatedParams.startDate && validatedParams.endDate) {
      // Find cars that are not booked during the specified period
      const startDate = new Date(validatedParams.startDate);
      const endDate = new Date(validatedParams.endDate);
      
      // Find bookings that overlap with the requested period
      const overlappingBookings = await Booking.find({
        status: 'Active',
        $or: [
          { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
        ]
      });
      
      // Extract car IDs that are already booked
      const bookedCarIds = overlappingBookings.map(booking => booking.carId);
      
      // Exclude booked cars from results
      if (bookedCarIds.length > 0) {
        filter._id = { $nin: bookedCarIds };
      }
    }
    
    // Add availability filter
    filter.available = true;
    
    // Calculate pagination
    const page = validatedParams.page || 1;
    const pageSize = validatedParams.pageSize || 10;
    const skip = (page - 1) * pageSize;
    
    // Execute query with pagination
    // REMOVE THE POPULATE CALL
    const cars = await Car.find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const totalCount = await Car.countDocuments(filter);
    
    // Get all locations to manually join with cars
    const locationsDoc = await Locations.findOne({});
    const locationsMap = {};
    
    if (locationsDoc && locationsDoc.content) {
      locationsDoc.content.forEach(loc => {
        locationsMap[loc.locationId] = {
          locationId: loc.locationId,
          name: loc.locationName,
          address: loc.locationAddress
        };
      });
    }
    
    // Return cars with pagination info
    return {
      statusCode: 200,
      body: {
        cars: cars.map(car => ({
          carId: car._id,
          brand: car.brand,
          model: car.model,
          year: car.year,
          transmission: car.transmission,
          fuelType: car.fuelType,
          seats: car.seats,
          pricePerDay: car.pricePerDay,
          location: locationsMap[car.locationId] || null,
          available: car.available,
          imageUrls: car.imageUrls,
          averageRating: car.averageRating,
          reviewCount: car.reviewCount
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
    console.error('Error in getCars:', error);
    
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
 * Get popular cars
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with list of popular cars
 */
const getPopularCars = async (event) => {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get popular cars based on booking count without populate
    const popularCars = await Car.find({ available: true })
      .sort({ bookingCount: -1, averageRating: -1 })
      .limit(10);
    
    // Get all locations to manually join with cars
    const locationsDoc = await Locations.findOne({});
    const locationsMap = {};
    
    if (locationsDoc && locationsDoc.content) {
      locationsDoc.content.forEach(loc => {
        // Extract city and country from address
        const addressParts = loc.locationAddress.split(',');
        const city = addressParts.length > 0 ? addressParts[0].trim() : '';
        const country = addressParts.length > 1 ? addressParts[addressParts.length - 1].trim() : '';
        
        locationsMap[loc.locationId] = {
          locationId: loc.locationId,
          name: loc.locationName,
          city: city,
          country: country
        };
      });
    }
    
    // Return popular cars
    return {
      statusCode: 200,
      body: popularCars.map(car => {
        const locationId = car.locationId ? car.locationId.toString() : null;
        const location = locationId && locationsMap[locationId] ? locationsMap[locationId] : null;
        
        return {
          carId: car._id,
          brand: car.brand,
          model: car.model,
          year: car.year,
          pricePerDay: car.pricePerDay,
          location: location ? {
            locationId: location.locationId,
            city: location.city,
            country: location.country
          } : null,
          imageUrl: car.imageUrls && car.imageUrls.length > 0 ? car.imageUrls[0] : null,
          averageRating: car.averageRating,
          reviewCount: car.reviewCount,
          bookingCount: car.bookingCount
        };
      })
    };
  } catch (error) {
    console.error('Error in getPopularCars:', error);
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};

/**
 * Get car by ID
 * @param {Object} event - API Gateway event
 * @param {string} carId - Car ID from path
 * @returns {Promise<Object>} Response with car details
 */
const getCarById = async (event, carId) => {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Find car by ID without populate
    const car = await Car.findById(carId);
    
    if (!car) {
      return {
        statusCode: 404,
        body: { message: 'Car not found' }
      };
    }
    
    // Get location data from the new Locations model
    let locationData = null;
    if (car.locationId) {
      const locationsDoc = await Locations.findOne({});
      if (locationsDoc && locationsDoc.content) {
        const matchingLocation = locationsDoc.content.find(loc => 
          loc.locationId === car.locationId.toString()
        );
        
        if (matchingLocation) {
          // Extract location data from our new format
          locationData = {
            locationId: matchingLocation.locationId,
            name: matchingLocation.locationName,
            address: matchingLocation.locationAddress,
            // These fields might not be available in the new format
            city: matchingLocation.locationAddress.split(',')[0] || '',
            country: matchingLocation.locationAddress.split(',').pop().trim() || '',
            zipCode: '',
            coordinates: {
              latitude: 0,
              longitude: 0
            }
          };
        }
      }
    }
    
    // Return car details
    return {
      statusCode: 200,
      body: {
        carId: car._id,
        brand: car.brand,
        model: car.model,
        year: car.year,
        transmission: car.transmission,
        fuelType: car.fuelType,
        seats: car.seats,
        pricePerDay: car.pricePerDay,
        location: locationData,
        available: car.available,
        description: car.description,
        features: car.features,
        imageUrls: car.imageUrls,
        averageRating: car.averageRating,
        reviewCount: car.reviewCount
      }
    };
  } catch (error) {
    console.error('Error in getCarById:', error);
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};

/**
 * Get car booked days
 * @param {Object} event - API Gateway event
 * @param {string} carId - Car ID from path
 * @returns {Promise<Object>} Response with booked days
 */
const getCarBookedDays = async (event, carId) => {
  try {
    // Extract and validate query parameters
    const queryParams = event.queryStringParameters || {};
    const validatedParams = validate({ ...queryParams, carId }, schemas.getCarBookedDays);
    
    // Connect to database
    await connectToDatabase();
    
    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return {
        statusCode: 404,
        body: { message: 'Car not found' }
      };
    }
    
    // Build date filter
    const dateFilter = { carId, status: 'Active' };
    
    if (validatedParams.year && validatedParams.month) {
      // Filter by specific month
      const year = parseInt(validatedParams.year);
      const month = parseInt(validatedParams.month);
      
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      
      dateFilter.$or = [
        { startDate: { $lte: endOfMonth }, endDate: { $gte: startOfMonth } }
      ];
    }
    
    // Find bookings for the car
    const bookings = await Booking.find(dateFilter, 'startDate endDate');
    
    // Extract all booked dates
    const bookedDays = [];
    bookings.forEach(booking => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      
      // Add all days between start and end (inclusive)
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        bookedDays.push(new Date(date).toISOString().split('T')[0]);
      }
    });
    
    // Return booked days
    return {
      statusCode: 200,
      body: {
        carId,
        bookedDays: [...new Set(bookedDays)] // Remove duplicates
      }
    };
  } catch (error) {
    console.error('Error in getCarBookedDays:', error);
    
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
 * Get car reviews
 * @param {Object} event - API Gateway event
 * @param {string} carId - Car ID from path
 * @returns {Promise<Object>} Response with car reviews
 */
const getCarReviews = async (event, carId) => {
  try {
    // Extract and validate query parameters
    const queryParams = event.queryStringParameters || {};
    const validatedParams = validate({ ...queryParams, carId }, schemas.getCarReviews);
    
    // Connect to database
    await connectToDatabase();
    
    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return {
        statusCode: 404,
        body: { message: 'Car not found' }
      };
    }
    
    // Calculate pagination
    const page = validatedParams.page || 1;
    const pageSize = validatedParams.pageSize || 10;
    const skip = (page - 1) * pageSize;
    
    // Find reviews for the car
    const reviews = await Feedback.find({ carId })
      .populate('userId', 'firstName lastName imageUrl')
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const totalCount = await Feedback.countDocuments({ carId });
    
    // Return reviews with pagination info
    return {
      statusCode: 200,
      body: {
        reviews: reviews.map(review => ({
          feedbackId: review._id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          user: review.userId ? {
            userId: review.userId._id,
            name: `${review.userId.firstName} ${review.userId.lastName}`,
            imageUrl: review.userId.imageUrl || ''
          } : null,
          adminResponse: review.adminResponse,
          adminResponseDate: review.adminResponseDate
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
    console.error('Error in getCarReviews:', error);
    
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
 * Create car (admin only)
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with created car
 */
const createCar = async (event) => {
  try {
    // Authenticate and authorize admin
    const authorizedEvent = await authorize(['Admin'])(event);
    
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = validate(body, schemas.createCar);
    
    // Connect to database
    await connectToDatabase();
    
    // Check if location exists
    const location = await Location.findById(validatedData.locationId);
    if (!location) {
      return {
        statusCode: 400,
        body: { message: 'Invalid location ID' }
      };
    }
    
    // Create new car
    const newCar = new Car({
      brand: validatedData.brand,
      model: validatedData.model,
      year: validatedData.year,
      transmission: validatedData.transmission,
      fuelType: validatedData.fuelType,
      seats: validatedData.seats,
      pricePerDay: validatedData.pricePerDay,
      locationId: validatedData.locationId,
      available: validatedData.available !== undefined ? validatedData.available : true,
      description: validatedData.description,
      features: validatedData.features,
      imageUrls: validatedData.imageUrls
    });
    
    // Save car to database
    await newCar.save();
    
    // Return created car
    return {
      statusCode: 201,
      body: {
        carId: newCar._id,
        brand: newCar.brand,
        model: newCar.model,
        year: newCar.year,
        transmission: newCar.transmission,
        fuelType: newCar.fuelType,
        seats: newCar.seats,
        pricePerDay: newCar.pricePerDay,
        locationId: newCar.locationId,
        available: newCar.available,
        description: newCar.description,
        features: newCar.features,
        imageUrls: newCar.imageUrls
      }
    };
  } catch (error) {
    console.error('Error in createCar:', error);
    
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
 * Update car (admin only)
 * @param {Object} event - API Gateway event
 * @param {string} carId - Car ID from path
 * @returns {Promise<Object>} Response with updated car
 */
const updateCar = async (event, carId) => {
  try {
    // Authenticate and authorize admin
    const authorizedEvent = await authorize(['Admin'])(event);
    
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = validate({ ...body, carId }, schemas.updateCar);
    
    // Connect to database
    await connectToDatabase();
    
    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return {
        statusCode: 404,
        body: { message: 'Car not found' }
      };
    }
    
    // Check if location exists if provided
    if (validatedData.locationId) {
      const location = await Location.findById(validatedData.locationId);
      if (!location) {
        return {
          statusCode: 400,
          body: { message: 'Invalid location ID' }
        };
      }
    }
    
    // Update car fields
    if (validatedData.brand) car.brand = validatedData.brand;
    if (validatedData.model) car.model = validatedData.model;
    if (validatedData.year) car.year = validatedData.year;
    if (validatedData.transmission) car.transmission = validatedData.transmission;
    if (validatedData.fuelType) car.fuelType = validatedData.fuelType;
    if (validatedData.seats) car.seats = validatedData.seats;
    if (validatedData.pricePerDay) car.pricePerDay = validatedData.pricePerDay;
    if (validatedData.locationId) car.locationId = validatedData.locationId;
    if (validatedData.available !== undefined) car.available = validatedData.available;
    if (validatedData.description !== undefined) car.description = validatedData.description;
    if (validatedData.features) car.features = validatedData.features;
    if (validatedData.imageUrls) car.imageUrls = validatedData.imageUrls;
    
    // Save updated car
    await car.save();
    
    // Return updated car
    return {
      statusCode: 200,
      body: {
        carId: car._id,
        brand: car.brand,
        model: car.model,
        year: car.year,
        transmission: car.transmission,
        fuelType: car.fuelType,
        seats: car.seats,
        pricePerDay: car.pricePerDay,
        locationId: car.locationId,
        available: car.available,
        description: car.description,
        features: car.features,
        imageUrls: car.imageUrls
      }
    };
  } catch (error) {
    console.error('Error in updateCar:', error);
    
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
 * Delete car (admin only)
 * @param {Object} event - API Gateway event
 * @param {string} carId - Car ID from path
 * @returns {Promise<Object>} Response with success message
 */
const deleteCar = async (event, carId) => {
  try {
    // Authenticate and authorize admin
    const authorizedEvent = await authorize(['Admin'])(event);
    
    // Connect to database
    await connectToDatabase();
    
    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return {
        statusCode: 404,
        body: { message: 'Car not found' }
      };
    }
    
    // Check if car has active bookings
    const activeBookings = await Booking.countDocuments({ 
      carId, 
      status: 'Active',
      endDate: { $gte: new Date() }
    });
    
    if (activeBookings > 0) {
      return {
        statusCode: 400,
        body: { message: 'Cannot delete car with active bookings' }
      };
    }
    
    // Delete car
    await Car.deleteOne({ _id: carId });
    
    // Return success response
    return {
      statusCode: 200,
      body: { message: 'Car successfully deleted' }
    };
  } catch (error) {
    console.error('Error in deleteCar:', error);
    
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
  getCars,
  getPopularCars,
  getCarById,
  getCarBookedDays,
  getCarReviews,
  createCar,
  updateCar,
  deleteCar
};