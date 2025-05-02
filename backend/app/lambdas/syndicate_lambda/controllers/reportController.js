/**
 * Report Controller
 * Handles report generation operations
 */

const { validate, schemas } = require('../utils/validator');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { connectToDatabase } = require('../utils/dbConnect');
const Booking = require('../models/booking');
const Car = require('../models/car');
const User = require('../models/user');

/**
 * Get available reports
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with available reports
 */
const getAvailableReports = async (event) => {
  try {
    // Authenticate and authorize admin
    const authorizedEvent = await authorize(['Admin'])(event);
    
    // Return available reports
    return {
      statusCode: 200,
      body: {
        availableReports: [
          {
            id: 'bookings',
            name: 'Bookings Report',
            description: 'Report on all bookings with details',
            formats: ['csv', 'pdf', 'xlsx']
          },
          {
            id: 'revenue',
            name: 'Revenue Report',
            description: 'Financial report on revenue by period',
            formats: ['csv', 'pdf', 'xlsx']
          },
          {
            id: 'cars',
            name: 'Cars Report',
            description: 'Report on car inventory and performance',
            formats: ['csv', 'pdf', 'xlsx']
          },
          {
            id: 'users',
            name: 'Users Report',
            description: 'Report on user registrations and activity',
            formats: ['csv', 'pdf', 'xlsx']
          }
        ]
      }
    };
  } catch (error) {
    console.error('Error in getAvailableReports:', error);
    
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
 * Generate report
 * @param {Object} event - API Gateway event
 * @param {string} extension - Report file extension
 * @returns {Promise<Object>} Response with report data or download URL
 */
const generateReport = async (event, extension) => {
  try {
    // Authenticate and authorize admin
    const authorizedEvent = await authorize(['Admin'])(event);
    
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = validate({ ...body, extension }, schemas.generateReport);
    
    // Connect to database
    await connectToDatabase();
    
    // Get report type
    const reportType = validatedData.reportType;
    
    // Build date filter if provided
    const dateFilter = {};
    if (validatedData.startDate) {
      dateFilter.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate) {
      dateFilter.endDate = new Date(validatedData.endDate);
    }
    
    // Generate report based on type
    let reportData;
    let reportName;
    
    switch (reportType) {
      case 'bookings':
        reportData = await generateBookingsReport(dateFilter, validatedData.filters);
        reportName = 'bookings_report';
        break;
      case 'revenue':
        reportData = await generateRevenueReport(dateFilter, validatedData.filters);
        reportName = 'revenue_report';
        break;
      case 'cars':
        reportData = await generateCarsReport(validatedData.filters);
        reportName = 'cars_report';
        break;
      case 'users':
        reportData = await generateUsersReport(dateFilter, validatedData.filters);
        reportName = 'users_report';
        break;
      default:
        return {
          statusCode: 400,
          body: { message: 'Invalid report type' }
        };
    }
    
    // In a real implementation, we would:
    // 1. Generate the actual file in the requested format
    // 2. Upload it to S3
    // 3. Return a pre-signed URL for download
    
    // For this implementation, we'll return the report data directly
    // with a mock download URL
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const downloadUrl = `https://example.com/reports/${reportName}_${timestamp}.${extension}`;
    
    return {
      statusCode: 200,
      body: {
        reportType,
        format: extension,
        generatedAt: new Date().toISOString(),
        downloadUrl,
        // Include data directly for demonstration purposes
        // In production, this would likely be omitted and only the URL provided
        data: reportData
      }
    };
  } catch (error) {
    console.error('Error in generateReport:', error);
    
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
 * Generate bookings report
 * @param {Object} dateFilter - Date range filter
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Bookings report data
 */
const generateBookingsReport = async (dateFilter, filters = {}) => {
  // Build query filter
  const query = {};
  
  // Add date range filter
  if (dateFilter.startDate || dateFilter.endDate) {
    query.createdAt = {};
    if (dateFilter.startDate) {
      query.createdAt.$gte = dateFilter.startDate;
    }
    if (dateFilter.endDate) {
      query.createdAt.$lte = dateFilter.endDate;
    }
  }
  
  // Add status filter if provided
  if (filters.status) {
    query.status = filters.status;
  }
  
  // Execute query
  const bookings = await Booking.find(query)
    .populate('userId', 'firstName lastName email')
    .populate('carId', 'brand model year')
    .populate('locationId', 'name city country')
    .sort({ createdAt: -1 });
  
  // Format data for report
  return bookings.map(booking => ({
    bookingId: booking._id.toString(),
    createdAt: booking.createdAt,
    startDate: booking.startDate,
    endDate: booking.endDate,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    totalPrice: booking.totalPrice,
    user: booking.userId ? {
      userId: booking.userId._id.toString(),
      name: `${booking.userId.firstName} ${booking.userId.lastName}`,
      email: booking.userId.email
    } : null,
    car: booking.carId ? {
      carId: booking.carId._id.toString(),
      brand: booking.carId.brand,
      model: booking.carId.model,
      year: booking.carId.year
    } : null,
    location: booking.locationId ? {
      locationId: booking.locationId._id.toString(),
      name: booking.locationId.name,
      city: booking.locationId.city,
      country: booking.locationId.country
    } : null
  }));
};

/**
 * Generate revenue report
 * @param {Object} dateFilter - Date range filter
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Revenue report data
 */
const generateRevenueReport = async (dateFilter, filters = {}) => {
  // Build query filter
  const query = { paymentStatus: 'Completed' };
  
  // Add date range filter
  if (dateFilter.startDate || dateFilter.endDate) {
    query.createdAt = {};
    if (dateFilter.startDate) {
      query.createdAt.$gte = dateFilter.startDate;
    }
    if (dateFilter.endDate) {
      query.createdAt.$lte = dateFilter.endDate;
    }
  }
  
  // Execute query
  const bookings = await Booking.find(query)
    .populate('locationId', 'city country');
  
  // Calculate total revenue
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  
  // Group by location
  const revenueByLocation = {};
  bookings.forEach(booking => {
    if (booking.locationId) {
      const locationKey = `${booking.locationId.city}, ${booking.locationId.country}`;
      if (!revenueByLocation[locationKey]) {
        revenueByLocation[locationKey] = {
          locationId: booking.locationId._id.toString(),
          city: booking.locationId.city,
          country: booking.locationId.country,
          bookingCount: 0,
          revenue: 0
        };
      }
      revenueByLocation[locationKey].bookingCount++;
      revenueByLocation[locationKey].revenue += booking.totalPrice;
    }
  });
  
  // Group by month if date range spans multiple months
  let revenueByMonth = [];
  if (dateFilter.startDate && dateFilter.endDate) {
    const monthlyData = {};
    bookings.forEach(booking => {
      const month = booking.createdAt.toISOString().substring(0, 7); // YYYY-MM format
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          bookingCount: 0,
          revenue: 0
        };
      }
      monthlyData[month].bookingCount++;
      monthlyData[month].revenue += booking.totalPrice;
    });
    revenueByMonth = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }
  
  // Return formatted report data
  return {
    summary: {
      totalRevenue,
      totalBookings: bookings.length,
      averageBookingValue: bookings.length > 0 ? totalRevenue / bookings.length : 0,
      period: {
        startDate: dateFilter.startDate || 'All time',
        endDate: dateFilter.endDate || 'Present'
      }
    },
    revenueByLocation: Object.values(revenueByLocation),
    revenueByMonth
  };
};

/**
 * Generate cars report
 * @param {Object} filters - Filters
 * @returns {Promise<Array>} Cars report data
 */
const generateCarsReport = async (filters = {}) => {
  // Build query filter
  const query = {};
  
  // Add brand filter if provided
  if (filters.brand) {
    query.brand = { $regex: filters.brand, $options: 'i' };
  }
  
  // Execute query
  const cars = await Car.find(query)
    .populate('locationId', 'name city country');
  
  // Get booking data for each car
  const carIds = cars.map(car => car._id);
  const bookings = await Booking.find({ carId: { $in: carIds } });
  
  // Group bookings by car
  const bookingsByCar = {};
  bookings.forEach(booking => {
    const carId = booking.carId.toString();
    if (!bookingsByCar[carId]) {
      bookingsByCar[carId] = {
        totalBookings: 0,
        totalRevenue: 0,
        activeBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0
      };
    }
    
    bookingsByCar[carId].totalBookings++;
    bookingsByCar[carId].totalRevenue += booking.totalPrice;
    
    if (booking.status === 'Active') {
      bookingsByCar[carId].activeBookings++;
    } else if (booking.status === 'Completed') {
      bookingsByCar[carId].completedBookings++;
    } else if (booking.status === 'Cancelled') {
      bookingsByCar[carId].cancelledBookings++;
    }
  });
  
  // Format data for report
  return cars.map(car => {
    const carBookings = bookingsByCar[car._id.toString()] || {
      totalBookings: 0,
      totalRevenue: 0,
      activeBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0
    };
    
    return {
      carId: car._id.toString(),
      brand: car.brand,
      model: car.model,
      year: car.year,
      pricePerDay: car.pricePerDay,
      available: car.available,
      location: car.locationId ? {
        locationId: car.locationId._id.toString(),
        name: car.locationId.name,
        city: car.locationId.city,
        country: car.locationId.country
      } : null,
      specifications: {
        transmission: car.transmission,
        fuelType: car.fuelType,
        seats: car.seats
      },
      performance: {
        averageRating: car.averageRating,
        reviewCount: car.reviewCount,
        bookingCount: car.bookingCount
      },
      bookings: carBookings
    };
  });
};

/**
 * Generate users report
 * @param {Object} dateFilter - Date range filter
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Users report data
 */
const generateUsersReport = async (dateFilter, filters = {}) => {
  // Build query filter
  const query = {};
  
  // Add date range filter
  if (dateFilter.startDate || dateFilter.endDate) {
    query.createdAt = {};
    if (dateFilter.startDate) {
      query.createdAt.$gte = dateFilter.startDate;
    }
    if (dateFilter.endDate) {
      query.createdAt.$lte = dateFilter.endDate;
    }
  }
  
  // Add role filter if provided
  if (filters.role) {
    query.role = filters.role;
  }
  
  // Execute query
  const users = await User.find(query, { password: 0 })
    .sort({ createdAt: -1 });
  
  // Get booking data
  const userIds = users.map(user => user._id);
  const bookings = await Booking.find({ userId: { $in: userIds } });
  
  // Group bookings by user
  const bookingsByUser = {};
  bookings.forEach(booking => {
    const userId = booking.userId.toString();
    if (!bookingsByUser[userId]) {
      bookingsByUser[userId] = {
        totalBookings: 0,
        totalSpent: 0,
        activeBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0
      };
    }
    
    bookingsByUser[userId].totalBookings++;
    bookingsByUser[userId].totalSpent += booking.totalPrice;
    
    if (booking.status === 'Active') {
      bookingsByUser[userId].activeBookings++;
    } else if (booking.status === 'Completed') {
      bookingsByUser[userId].completedBookings++;
    } else if (booking.status === 'Cancelled') {
      bookingsByUser[userId].cancelledBookings++;
    }
  });
  
  // Count users by role
  const usersByRole = {
    Client: users.filter(user => user.role === 'Client').length,
    SupportAgent: users.filter(user => user.role === 'SupportAgent').length,
    Admin: users.filter(user => user.role === 'Admin').length
  };
  
  // Format data for report
  return {
    summary: {
      totalUsers: users.length,
      usersByRole,
      period: {
        startDate: dateFilter.startDate || 'All time',
        endDate: dateFilter.endDate || 'Present'
      }
    },
    users: users.map(user => {
      const userBookings = bookingsByUser[user._id.toString()] || {
        totalBookings: 0,
        totalSpent: 0,
        activeBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0
      };
      
      return {
        userId: user._id.toString(),
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        createdAt: user.createdAt,
        location: {
          country: user.country || '',
          city: user.city || ''
        },
        bookingActivity: userBookings
      };
    })
  };
};

// Export controller functions
module.exports = {
  getAvailableReports,
  generateReport
};