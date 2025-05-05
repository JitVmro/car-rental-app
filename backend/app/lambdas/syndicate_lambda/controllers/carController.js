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
    console.log('Incoming Query Parameters:', event.queryStringParameters);

    const queryParams = event.queryStringParameters || {};
    const validatedParams = validate(queryParams, schemas.getCars);

    console.log('Validated Query Parameters:', validatedParams);

    // Connect to the database
    await connectToDatabase();
    console.log('Database connected successfully');

    // Build filter query
    const filter = {};

    // Apply filters based on validated parameters
    if (validatedParams.model) {
      filter.model = { $regex: validatedParams.model, $options: 'i' };
    }

    if (validatedParams.minPrice) {
      filter.pricePerDay = { $gte: parseFloat(validatedParams.minPrice) };
    }

    if (validatedParams.maxPrice) {
      filter.pricePerDay = { ...filter.pricePerDay, $lte: parseFloat(validatedParams.maxPrice) };
    }

    if (validatedParams.location) {
      filter.location = { $regex: validatedParams.location, $options: 'i' };
    }

    if (validatedParams.status) {
      filter.status = validatedParams.status.toUpperCase();
    }

    if (validatedParams.fuelType) {
      filter.fuelType = validatedParams.fuelType.toUpperCase();
    }

    if (validatedParams.gearBoxType) {
      filter.gearBoxType = validatedParams.gearBoxType.toUpperCase();
    }

    // Handle date availability filtering (optional)
    if (validatedParams.startDate && validatedParams.endDate) {
      const startDate = new Date(validatedParams.startDate);
      const endDate = new Date(validatedParams.endDate);

      if (isNaN(startDate) || isNaN(endDate)) {
        throw new Error('Invalid Date Format');
      }

      console.log('Start Date:', startDate, 'End Date:', endDate);

      const bookedCarIds = await Booking.find({
        status: 'Active',
        $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
      }).distinct('carId');

      console.log('Booked Car IDs:', bookedCarIds);

      filter.carId = { $nin: bookedCarIds };
    }

    // Pagination Logic
    const page = parseInt(validatedParams.page, 10) || 1;
    const pageSize = parseInt(validatedParams.pageSize, 10) || 10;
    const skip = (page - 1) * pageSize;

    // Debug log: Filter query
    console.log('Filter Query:', filter);

    // Retrieve cars from the database
    const cars = await Car.find(filter).skip(skip).limit(pageSize).sort({ createdAt: -1 });
    console.log('Retrieved Cars:', cars);

    // Count total number of documents that match the filter
    const totalCount = await Car.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Prepare and return the response as plain JavaScript objects
    return {
      statusCode: 200,
      body: {
        cars: cars.map((car) => ({
          carId: car.carId,
          carRating: car.carRating,
          imageURL: car.images && car.images[0] ? car.images[0] : null,
          location: car.location,
          model: car.model,
          pricePerDay: car.pricePerDay,
          serviceRating: car.serviceRating,
          status: car.status ? car.status.toUpperCase() : 'UNKNOWN',
        })),
        currentPage: page,
        totalElements: totalCount,
        totalPages: totalPages,
      },
    };
  } catch (error) {
    console.error('Error in getCars:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return {
        statusCode: 400,
        body: {
          message: 'Validation error',
          details: error.details,
        },
      };
    }

    // Handle other internal errors
    return {
      statusCode: 500,
      body: {
        message: 'Internal server error',
        details: error.toString(),
      },
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
const getCarById = async (event) => {
  try {
    // Extract carId from path parameters
    const carId = event.pathParameters?.carId;
    console.log('Received carId:', carId);

    if (!carId) {
      return {
        statusCode: 400,
        body: { message: 'Car ID is required' },
      };
    }

    // Connect to the database
    await connectToDatabase();
    console.log('Database connected successfully');

    // Find the car by its unique carId
    const car = await Car.findOne({ carId });

    if (!car) {
      return {
        statusCode: 404,
        body: { message: 'Car not found' },
      };
    }

    // Initialize locationData as null
    let locationData = null;

    // Retrieve location data if the car has a location defined
    if (car.location) {
      const locationsDoc = await Locations.findOne({});
      if (locationsDoc && locationsDoc.content) {
        const matchingLocation = locationsDoc.content.find(
          (loc) => loc.locationId === car.location.toString()
        );

        if (matchingLocation) {
          // Extract location details
          locationData = {
            locationId: matchingLocation.locationId,
            name: matchingLocation.locationName,
            address: matchingLocation.locationAddress,
            city: matchingLocation.locationAddress.split(',')[0] || '',
            country: matchingLocation.locationAddress.split(',').pop().trim() || '',
            zipCode: matchingLocation.zipCode || '',
            coordinates: matchingLocation.coordinates || {
              latitude: 0,
              longitude: 0,
            },
          };
        }
      }
    }

    // Return car details as plain JavaScript objects
    return {
      statusCode: 200,
      body: {
        carId: car.carId,
        carRating: car.carRating || null,
        climateControlOption: car.climateControlOption,
        engineCapacity: car.engineCapacity,
        fuelConsumption: car.fuelConsumption || null,
        fuelType: car.fuelType,
        gearBoxType: car.gearBoxType,
        images: car.images || [],
        location: locationData,
        model: car.model,
        passengerCapacity: car.passengerCapacity || null,
        pricePerDay: car.pricePerDay,
        serviceRating: car.serviceRating || null,
        status: car.status || 'Unknown',
        createdAt: car.createdAt,
        updatedAt: car.updatedAt,
      },
    };
  } catch (error) {
    console.error('Error in getCarById:', error);

    // Handle unexpected errors
    return {
      statusCode: 500,
      body: { message: 'Internal server error', details: error.toString() },
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