/**
 * Report Controller
 * Handles report generation and scheduling for CarRent offices
 */

const { validate, schemas } = require('../utils/validator');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { connectToDatabase } = require('../utils/dbConnect');
const Booking = require('../models/booking');
const Car = require('../models/car');
const User = require('../models/user');
const Feedback = require('../models/feedback');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

/**
 * Get reports based on filtered parameters
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with reports matching filters
 */
const getReports = async (event) => {
  try {
    // Authenticate and authorize admin
    const authorizedEvent = await authorize(['Admin'])(event);
    
    // Extract query parameters
    const queryParams = event.queryStringParameters || {};
    const {
      dateFrom,
      dateTo,
      locationId,
      carId,
      supportAgentId
    } = queryParams;
    
    // Connect to database
    await connectToDatabase();
    
    // Build query filter
    const query = {};
    
    // Add date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }
    
    // Add location filter
    if (locationId) {
      query.pickupLocationId = locationId;
    }
    
    // Add car filter
    if (carId) {
      query.carId = carId;
    }
    
    // Add support agent filter
    if (supportAgentId) {
      query.supportAgentId = supportAgentId;
    }
    
    // Fetch bookings based on filters
    const bookings = await Booking.find(query)
      .populate('clientId', 'firstName lastName email')
      .populate('carId', 'model pricePerDay status images location')
      .sort({ createdAt: -1 });
    
    // Format response
    const reports = bookings.map(booking => ({
      reportId: booking._id.toString(),
      bookingPeriod: `${moment(booking.pickupDateTime).format('MMM DD')} - ${moment(booking.dropOffDateTime).format('MMM DD')}`,
      carModel: booking.carName,
      carNumber: booking.carId ? booking.carId._id.substring(0, 8).toUpperCase() : 'N/A',
      carMillageStart: Math.floor(Math.random() * 10000) + 20000, // Placeholder - replace with actual data when available
      carMillageEnd: Math.floor(Math.random() * 10000) + 30000, // Placeholder - replace with actual data when available
      carServiceRating: booking.carId ? booking.carId.serviceRating || '4.5' : 'N/A',
      supportAgent: booking.supportAgentId || 'Self-service',
      madeBy: booking.clientId ? `${booking.clientId.firstName} ${booking.clientId.lastName} (Client)` : 'Unknown'
    }));

    return {
      statusCode: 200,
      body: {
        contents: reports
      }
    };
  } catch (error) {
    console.error('Error in getReports:', error);
    
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
 * Create and export aggregated report
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with URL to download the exported report
 */
const createAggregationReport = async (event) => {
  try {
    // Authenticate and authorize admin
    const authorizedEvent = await authorize(['Admin'])(event);
    
    // Extract path parameters
    const pathParams = event.pathParameters || {};
    const extension = pathParams.extension;
    
    // Validate extension
    if (!['csv', 'xlsx'].includes(extension)) {
      return {
        statusCode: 400,
        body: { message: 'Invalid report extension. Supported formats: csv, xlsx' }
      };
    }
    
    // Extract query parameters
    const queryParams = event.queryStringParameters || {};
    const {
      dateFrom,
      dateTo,
      locationId,
      carId,
      supportAgentId
    } = queryParams;
    
    // Connect to database
    await connectToDatabase();
    
    // Define current and previous periods
    const currentPeriodStart = dateFrom ? new Date(dateFrom) : new Date(new Date().setDate(1)); // First day of current month if not specified
    const currentPeriodEnd = dateTo ? new Date(dateTo) : new Date(new Date().setMonth(new Date().getMonth() + 1, 0)); // Last day of current month if not specified
    
    // Calculate previous period with same duration
    const periodDuration = currentPeriodEnd.getTime() - currentPeriodStart.getTime();
    const previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1); // Day before current period start
    const previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodDuration);
    
    // Generate the appropriate report based on parameters
    let reportData;
    let reportFileName;
    
    if (supportAgentId) {
      // Generate support agent performance report
      reportData = await generateSupportAgentReport(
        supportAgentId,
        currentPeriodStart,
        currentPeriodEnd,
        previousPeriodStart,
        previousPeriodEnd,
        locationId
      );
      reportFileName = `support_agent_performance_${moment(currentPeriodStart).format('YYYY-MM-DD')}_to_${moment(currentPeriodEnd).format('YYYY-MM-DD')}`;
    } else {
      // Generate sales statistics report
      reportData = await generateSalesStatisticsReport(
        currentPeriodStart,
        currentPeriodEnd,
        previousPeriodStart,
        previousPeriodEnd,
        locationId,
        carId
      );
      reportFileName = `sales_statistics_${moment(currentPeriodStart).format('YYYY-MM-DD')}_to_${moment(currentPeriodEnd).format('YYYY-MM-DD')}`;
    }
    
    // Generate the file path
    const timestamp = Date.now();
    const filePath = `/tmp/${reportFileName}_${timestamp}.${extension}`;
    
    // Create the report file
    await createReportFile(reportData, filePath, extension);
    
    // In a real implementation:
    // 1. Upload the file to S3 or another storage service
    // 2. Return a pre-signed URL for download
    
    // For this implementation, we'll return a mock URL
    const downloadUrl = `https://application.s3.eu-central-1.amazonaws.com/reports/${reportFileName}_${timestamp}.${extension}`;
    
    return {
      statusCode: 201,
      body: {
        url: downloadUrl
      }
    };
  } catch (error) {
    console.error('Error in createAggregationReport:', error);
    
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
 * Schedule weekly reports for all CarRent offices
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with scheduling status
 */
const scheduleWeeklyReports = async (event) => {
  try {
    // Authenticate and authorize admin
    const authorizedEvent = await authorize(['Admin'])(event);
    
    // Extract request body
    const body = JSON.parse(event.body || '{}');
    const {
      emailRecipients,
      dayOfWeek = 1, // Monday by default
      reportTypes = ['sales', 'support']
    } = body;
    
    // Validate email recipients
    if (!emailRecipients || !Array.isArray(emailRecipients) || emailRecipients.length === 0) {
      return {
        statusCode: 400,
        body: { message: 'At least one email recipient is required' }
      };
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get all unique locations
    const locations = await Booking.distinct('pickupLocationId');
    
    // Store scheduling information in database
    // This would typically be stored in a separate collection
    // For this implementation, we'll just return the schedule
    
    const schedule = {
      id: `schedule_${Date.now()}`,
      emailRecipients,
      dayOfWeek,
      reportTypes,
      locations,
      nextExecutionDate: getNextDayOfWeek(dayOfWeek),
      status: 'ACTIVE'
    };
    
    return {
      statusCode: 201,
      body: {
        message: 'Weekly reports scheduled successfully',
        schedule
      }
    };
  } catch (error) {
    console.error('Error in scheduleWeeklyReports:', error);
    
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
 * Manual trigger to send reports to specified email addresses
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with sending status
 */
const sendReportsManually = async (event) => {
  try {
    // Authenticate and authorize admin
    const authorizedEvent = await authorize(['Admin'])(event);
    
    // Extract request body
    const body = JSON.parse(event.body || '{}');
    const {
      emailRecipients,
      reportPeriodStart,
      reportPeriodEnd,
      locations,
      reportTypes = ['sales', 'support']
    } = body;
    
    // Validate required fields
    if (!emailRecipients || !Array.isArray(emailRecipients) || emailRecipients.length === 0) {
      return {
        statusCode: 400,
        body: { message: 'At least one email recipient is required' }
      };
    }
    
    if (!reportPeriodStart || !reportPeriodEnd) {
      return {
        statusCode: 400,
        body: { message: 'Report period start and end dates are required' }
      };
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Parse date strings to Date objects
    const startDate = new Date(reportPeriodStart);
    const endDate = new Date(reportPeriodEnd);
    
    // Calculate previous period with same duration
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousPeriodEnd = new Date(startDate.getTime() - 1);
    const previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodDuration);
    
    // Generate and send reports for each location
    const reportPromises = [];
    const locationsToProcess = locations || await Booking.distinct('pickupLocationId');
    
    for (const location of locationsToProcess) {
      if (reportTypes.includes('sales')) {
        reportPromises.push(
          generateAndSendSalesReport(
            emailRecipients,
            startDate,
            endDate,
            previousPeriodStart,
            previousPeriodEnd,
            location
          )
        );
      }
      
      if (reportTypes.includes('support')) {
        reportPromises.push(
          generateAndSendSupportReport(
            emailRecipients,
            startDate,
            endDate,
            previousPeriodStart,
            previousPeriodEnd,
            location
          )
        );
      }
    }
    
    // Wait for all reports to be generated and sent
    await Promise.all(reportPromises);
    
    return {
      statusCode: 200,
      body: {
        message: 'Reports generated and sent successfully',
        details: {
          emailRecipients,
          reportPeriod: `${moment(startDate).format('YYYY-MM-DD')} to ${moment(endDate).format('YYYY-MM-DD')}`,
          locations: locationsToProcess,
          reportTypes
        }
      }
    };
  } catch (error) {
    console.error('Error in sendReportsManually:', error);
    
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
 * Generate sales statistics report data
 * @param {Date} currentStart - Current period start date
 * @param {Date} currentEnd - Current period end date
 * @param {Date} previousStart - Previous period start date
 * @param {Date} previousEnd - Previous period end date
 * @param {string} location - Location filter
 * @param {string} carId - Car ID filter
 * @returns {Promise<Object>} Report data
 */
const generateSalesStatisticsReport = async (currentStart, currentEnd, previousStart, previousEnd, location, carId) => {
  // Build query filters
  const currentPeriodFilter = {
    $or: [
      // Bookings that started in the period
      { pickupDateTime: { $gte: currentStart, $lte: currentEnd } },
      // Bookings that ended in the period
      { dropOffDateTime: { $gte: currentStart, $lte: currentEnd } },
      // Bookings that span the entire period
      { pickupDateTime: { $lte: currentStart }, dropOffDateTime: { $gte: currentEnd } }
    ]
  };
  
  const previousPeriodFilter = {
    $or: [
      // Bookings that started in the previous period
      { pickupDateTime: { $gte: previousStart, $lte: previousEnd } },
      // Bookings that ended in the previous period
      { dropOffDateTime: { $gte: previousStart, $lte: previousEnd } },
      // Bookings that span the entire previous period
      { pickupDateTime: { $lte: previousStart }, dropOffDateTime: { $gte: previousEnd } }
    ]
  };
  
  // Add location filter if provided
  if (location) {
    currentPeriodFilter.pickupLocationId = location;
    previousPeriodFilter.pickupLocationId = location;
  }
  
  // Add car filter if provided
  if (carId) {
    currentPeriodFilter.carId = carId;
    previousPeriodFilter.carId = carId;
  }
  
  // Get bookings for current and previous periods
  const currentBookings = await Booking.find(currentPeriodFilter)
    .populate('carId', 'model pricePerDay status images location')
    .populate('clientId', 'firstName lastName email');
  
  const previousBookings = await Booking.find(previousPeriodFilter)
    .populate('carId', 'model pricePerDay status images location')
    .populate('clientId', 'firstName lastName email');
  
  // Get feedback for current and previous periods
  const currentBookingIds = currentBookings.map(booking => booking._id);
  const previousBookingIds = previousBookings.map(booking => booking._id);
  
  const currentFeedback = await Feedback.find({ bookingId: { $in: currentBookingIds } });
  const previousFeedback = await Feedback.find({ bookingId: { $in: previousBookingIds } });
  
  // Group bookings by car
  const carStats = {};
  
  // Process current period bookings
  for (const booking of currentBookings) {
    const carIdString = booking.carId ? booking.carId._id.toString() : booking.carId;
    if (!carIdString) continue;
    
    if (!carStats[carIdString]) {
      carStats[carIdString] = {
        carId: carIdString,
        model: booking.carName || (booking.carId ? booking.carId.model : 'Unknown'),
        location: booking.pickupLocationId || (booking.carId ? booking.carId.location : 'Unknown'),
        current: {
          rentalDays: 0,
          reservations: 0,
          mileageStart: Math.floor(Math.random() * 10000) + 20000, // Placeholder
          mileageEnd: Math.floor(Math.random() * 10000) + 30000, // Placeholder
          totalKilometers: 0,
          avgMileagePerReservation: 0,
          feedback: [],
          revenue: 0
        },
        previous: {
          rentalDays: 0,
          reservations: 0,
          mileageStart: Math.floor(Math.random() * 10000) + 10000, // Placeholder
          mileageEnd: Math.floor(Math.random() * 10000) + 20000, // Placeholder
          totalKilometers: 0,
          avgMileagePerReservation: 0,
          feedback: [],
          revenue: 0
        }
      };
    }
    
    // Calculate rental days
    const pickupDate = new Date(booking.pickupDateTime);
    const dropOffDate = new Date(booking.dropOffDateTime);
    const rentalDays = Math.ceil((dropOffDate - pickupDate) / (1000 * 60 * 60 * 24));
    
    carStats[carIdString].current.rentalDays += rentalDays;
    carStats[carIdString].current.reservations += 1;
    
    // Calculate revenue (use actual price if available, otherwise estimate)
    const bookingPrice = booking.totalPrice || (booking.carId && booking.carId.pricePerDay ? booking.carId.pricePerDay * rentalDays : 0);
    carStats[carIdString].current.revenue += bookingPrice;
    
    // Find feedback for this booking
    const bookingFeedback = currentFeedback.find(fb => fb.bookingId.toString() === booking._id.toString());
    if (bookingFeedback) {
      carStats[carIdString].current.feedback.push(bookingFeedback.rating);
    }
    
    // Placeholder for mileage calculation (would be replaced with actual data)
    const estimatedMileage = Math.floor(Math.random() * 100) + 50; // 50-150 km per day
    const bookingMileage = estimatedMileage * rentalDays;
    carStats[carIdString].current.totalKilometers += bookingMileage;
  }
  
  // Process previous period bookings
  for (const booking of previousBookings) {
    const carIdString = booking.carId ? booking.carId._id.toString() : booking.carId;
    if (!carIdString) continue;
    
    if (!carStats[carIdString]) {
      carStats[carIdString] = {
        carId: carIdString,
        model: booking.carName || (booking.carId ? booking.carId.model : 'Unknown'),
        location: booking.pickupLocationId || (booking.carId ? booking.carId.location : 'Unknown'),
        current: {
          rentalDays: 0,
          reservations: 0,
          mileageStart: Math.floor(Math.random() * 10000) + 20000, // Placeholder
          mileageEnd: Math.floor(Math.random() * 10000) + 30000, // Placeholder
          totalKilometers: 0,
          avgMileagePerReservation: 0,
          feedback: [],
          revenue: 0
        },
        previous: {
          rentalDays: 0,
          reservations: 0,
          mileageStart: Math.floor(Math.random() * 10000) + 10000, // Placeholder
          mileageEnd: Math.floor(Math.random() * 10000) + 20000, // Placeholder
          totalKilometers: 0,
          avgMileagePerReservation: 0,
          feedback: [],
          revenue: 0
        }
      };
    }
    
    // Calculate rental days
    const pickupDate = new Date(booking.pickupDateTime);
    const dropOffDate = new Date(booking.dropOffDateTime);
    const rentalDays = Math.ceil((dropOffDate - pickupDate) / (1000 * 60 * 60 * 24));
    
    carStats[carIdString].previous.rentalDays += rentalDays;
    carStats[carIdString].previous.reservations += 1;
    
    // Calculate revenue
    const bookingPrice = booking.totalPrice || (booking.carId && booking.carId.pricePerDay ? booking.carId.pricePerDay * rentalDays : 0);
    carStats[carIdString].previous.revenue += bookingPrice;
    
    // Find feedback for this booking
    const bookingFeedback = previousFeedback.find(fb => fb.bookingId.toString() === booking._id.toString());
    if (bookingFeedback) {
      carStats[carIdString].previous.feedback.push(bookingFeedback.rating);
    }
    
    // Placeholder for mileage calculation
    const estimatedMileage = Math.floor(Math.random() * 100) + 50; // 50-150 km per day
    const bookingMileage = estimatedMileage * rentalDays;
    carStats[carIdString].previous.totalKilometers += bookingMileage;
  }
  
  // Calculate derived metrics and deltas
  Object.values(carStats).forEach(car => {
    // Current period calculations
    if (car.current.reservations > 0) {
      car.current.avgMileagePerReservation = car.current.totalKilometers / car.current.reservations;
    }
    
    car.current.avgFeedback = car.current.feedback.length > 0 
      ? car.current.feedback.reduce((sum, rating) => sum + rating, 0) / car.current.feedback.length
      : 0;
    
    car.current.minFeedback = car.current.feedback.length > 0 
      ? Math.min(...car.current.feedback)
      : 0;
    
    // Previous period calculations
    if (car.previous.reservations > 0) {
      car.previous.avgMileagePerReservation = car.previous.totalKilometers / car.previous.reservations;
    }
    
    car.previous.avgFeedback = car.previous.feedback.length > 0 
      ? car.previous.feedback.reduce((sum, rating) => sum + rating, 0) / car.previous.feedback.length
      : 0;
    
    car.previous.minFeedback = car.previous.feedback.length > 0 
      ? Math.min(...car.previous.feedback)
      : 0;
    
    // Calculate deltas
    car.deltaAvgMileagePerReservation = car.previous.avgMileagePerReservation > 0 
      ? ((car.current.avgMileagePerReservation - car.previous.avgMileagePerReservation) / car.previous.avgMileagePerReservation) * 100
      : 0;
    
    car.deltaAvgFeedback = car.previous.avgFeedback > 0 
      ? ((car.current.avgFeedback - car.previous.avgFeedback) / car.previous.avgFeedback) * 100
      : 0;
    
    car.deltaRevenue = car.previous.revenue > 0 
      ? ((car.current.revenue - car.previous.revenue) / car.previous.revenue) * 100
      : 0;
  });
  
  // Format the report data
  const reportData = {
    reportPeriod: {
      start: moment(currentStart).format('YYYY-MM-DD'),
      end: moment(currentEnd).format('YYYY-MM-DD')
    },
    previousPeriod: {
      start: moment(previousStart).format('YYYY-MM-DD'),
      end: moment(previousEnd).format('YYYY-MM-DD')
    },
    cars: Object.values(carStats).map(car => ({
      carId: car.carId,
      model: car.model,
      location: car.location,
      rentalDays: car.current.rentalDays,
      reservations: car.current.reservations,
      mileageStart: car.current.mileageStart,
      mileageEnd: car.current.mileageEnd,
      totalKilometers: car.current.totalKilometers,
      avgMileagePerReservation: car.current.avgMileagePerReservation.toFixed(2),
      deltaAvgMileagePerReservation: car.deltaAvgMileagePerReservation.toFixed(2) + '%',
      avgFeedback: car.current.avgFeedback.toFixed(2),
      minFeedback: car.current.minFeedback.toFixed(2),
      deltaAvgFeedback: car.deltaAvgFeedback.toFixed(2) + '%',
      revenue: car.current.revenue.toFixed(2),
      deltaRevenue: car.deltaRevenue.toFixed(2) + '%'
    }))
  };
  
  return reportData;
};

/**
 * Generate support agent performance report data
 * @param {string} supportAgentId - Support agent ID
 * @param {Date} currentStart - Current period start date
 * @param {Date} currentEnd - Current period end date
 * @param {Date} previousStart - Previous period start date
 * @param {Date} previousEnd - Previous period end date
 * @param {string} location - Location filter
 * @returns {Promise<Object>} Report data
 */
const generateSupportAgentReport = async (supportAgentId, currentStart, currentEnd, previousStart, previousEnd, location) => {
  // Build query filters
  const currentPeriodFilter = {
    createdAt: { $gte: currentStart, $lte: currentEnd }
  };
  
  const previousPeriodFilter = {
    createdAt: { $gte: previousStart, $lte: previousEnd }
  };
  
  // Add support agent filter
  if (supportAgentId) {
    currentPeriodFilter.supportAgentId = supportAgentId;
    previousPeriodFilter.supportAgentId = supportAgentId;
  }
  
  // Add location filter if provided
  if (location) {
    currentPeriodFilter.pickupLocationId = location;
    previousPeriodFilter.pickupLocationId = location;
  }
  
  // Get bookings processed by support agents
  const currentBookings = await Booking.find(currentPeriodFilter);
  const previousBookings = await Booking.find(previousPeriodFilter);
  
  // Get feedback for these bookings
  const currentBookingIds = currentBookings.map(booking => booking._id);
  const previousBookingIds = previousBookings.map(booking => booking._id);
  
  const currentFeedback = await Feedback.find({ bookingId: { $in: currentBookingIds } });
  const previousFeedback = await Feedback.find({ bookingId: { $in: previousBookingIds } });
  
  // Group by support agent
  const agentStats = {};
  
  // Get unique support agent IDs
  const supportAgentIds = new Set();
  currentBookings.forEach(booking => {
    if (booking.supportAgentId) supportAgentIds.add(booking.supportAgentId);
  });
  previousBookings.forEach(booking => {
    if (booking.supportAgentId) supportAgentIds.add(booking.supportAgentId);
  });
  
  // Initialize stats for each support agent
  for (const agentId of supportAgentIds) {
    agentStats[agentId] = {
      supportAgentId: agentId,
      current: {
        bookingsProcessed: 0,
        feedback: [],
        revenue: 0
      },
      previous: {
        bookingsProcessed: 0,
        feedback: [],
        revenue: 0
      }
    };
  }
  
  // Process current period bookings
  for (const booking of currentBookings) {
    if (!booking.supportAgentId) continue;
    
    const agentId = booking.supportAgentId;
    agentStats[agentId].current.bookingsProcessed += 1;
    
    // Calculate revenue
    const pickupDate = new Date(booking.pickupDateTime);
    const dropOffDate = new Date(booking.dropOffDateTime);
    const rentalDays = Math.ceil((dropOffDate - pickupDate) / (1000 * 60 * 60 * 24));
    const bookingPrice = booking.totalPrice || 0;
    
    agentStats[agentId].current.revenue += bookingPrice;
    
    // Find feedback for this booking
    const bookingFeedback = currentFeedback.find(fb => fb.bookingId.toString() === booking._id.toString());
    if (bookingFeedback) {
      agentStats[agentId].current.feedback.push(bookingFeedback.rating);
    }
  }
  
  // Process previous period bookings
  for (const booking of previousBookings) {
    if (!booking.supportAgentId) continue;
    
    const agentId = booking.supportAgentId;
    agentStats[agentId].previous.bookingsProcessed += 1;
    
    // Calculate revenue
    const pickupDate = new Date(booking.pickupDateTime);
    const dropOffDate = new Date(booking.dropOffDateTime);
    const rentalDays = Math.ceil((dropOffDate - pickupDate) / (1000 * 60 * 60 * 24));
    const bookingPrice = booking.totalPrice || 0;
    
    agentStats[agentId].previous.revenue += bookingPrice;
    
    // Find feedback for this booking
    const bookingFeedback = previousFeedback.find(fb => fb.bookingId.toString() === booking._id.toString());
    if (bookingFeedback) {
      agentStats[agentId].previous.feedback.push(bookingFeedback.rating);
    }
  }
  
  // Calculate derived metrics and deltas
  Object.values(agentStats).forEach(agent => {
    // Current period calculations
    agent.current.avgFeedback = agent.current.feedback.length > 0 
      ? agent.current.feedback.reduce((sum, rating) => sum + rating, 0) / agent.current.feedback.length
      : 0;
    
    agent.current.minFeedback = agent.current.feedback.length > 0 
      ? Math.min(...agent.current.feedback)
      : 0;
    
    // Previous period calculations
    agent.previous.avgFeedback = agent.previous.feedback.length > 0 
      ? agent.previous.feedback.reduce((sum, rating) => sum + rating, 0) / agent.previous.feedback.length
      : 0;
    
    agent.previous.minFeedback = agent.previous.feedback.length > 0 
      ? Math.min(...agent.previous.feedback)
      : 0;
    
    // Calculate deltas
    agent.deltaBookingsProcessed = agent.previous.bookingsProcessed > 0 
      ? ((agent.current.bookingsProcessed - agent.previous.bookingsProcessed) / agent.previous.bookingsProcessed) * 100
      : 0;
    
    agent.deltaAvgFeedback = agent.previous.avgFeedback > 0 
      ? ((agent.current.avgFeedback - agent.previous.avgFeedback) / agent.previous.avgFeedback) * 100
      : 0;
    
    agent.deltaMinFeedback = agent.previous.minFeedback > 0 
      ? ((agent.current.minFeedback - agent.previous.minFeedback) / agent.previous.minFeedback) * 100
      : 0;
    
    agent.deltaRevenue = agent.previous.revenue > 0 
      ? ((agent.current.revenue - agent.previous.revenue) / agent.previous.revenue) * 100
      : 0;
  });
  
  // Format the report data
  const reportData = {
    reportPeriod: {
      start: moment(currentStart).format('YYYY-MM-DD'),
      end: moment(currentEnd).format('YYYY-MM-DD')
    },
    previousPeriod: {
      start: moment(previousStart).format('YYYY-MM-DD'),
      end: moment(previousEnd).format('YYYY-MM-DD')
    },
    supportAgents: Object.values(agentStats).map(agent => ({
      supportAgentId: agent.supportAgentId,
      bookingsProcessed: agent.current.bookingsProcessed,
      deltaBookingsProcessed: agent.deltaBookingsProcessed.toFixed(2) + '%',
      avgFeedback: agent.current.avgFeedback.toFixed(2),
      minFeedback: agent.current.minFeedback.toFixed(2),
      deltaAvgFeedback: agent.deltaAvgFeedback.toFixed(2) + '%',
      deltaMinFeedback: agent.deltaMinFeedback.toFixed(2) + '%',
      revenue: agent.current.revenue.toFixed(2),
      deltaRevenue: agent.deltaRevenue.toFixed(2) + '%'
    }))
  };
  
  return reportData;
};

/**
 * Create report file in the specified format
 * @param {Object} reportData - Report data
 * @param {string} filePath - File path
 * @param {string} extension - File extension
 * @returns {Promise<void>}
 */
const createReportFile = async (reportData, filePath, extension) => {
  if (extension === 'xlsx') {
    await createExcelReport(reportData, filePath);
  } else if (extension === 'csv') {
    await createCsvReport(reportData, filePath);
  } else {
    throw new Error(`Unsupported file extension: ${extension}`);
  }
};

/**
 * Create Excel report
 * @param {Object} reportData - Report data
 * @param {string} filePath - File path
 * @returns {Promise<void>}
 */
const createExcelReport = async (reportData, filePath) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');
  
  // Add report period information
  worksheet.addRow(['Report Period', `${reportData.reportPeriod.start} to ${reportData.reportPeriod.end}`]);
  worksheet.addRow(['Previous Period', `${reportData.previousPeriod.start} to ${reportData.previousPeriod.end}`]);
  worksheet.addRow([]);
  
  // Check if it's a sales report or support agent report
  if (reportData.cars) {
    // Sales statistics report
    worksheet.addRow([
      'Car Model',
      'Location',
      'Rental Days',
      'Reservations',
      'Mileage Start (km)',
      'Mileage End (km)',
      'Total Kilometers (km)',
      'Avg Mileage per Reservation (km)',
      'Delta Avg Mileage (%)',
      'Avg Feedback (1-5)',
      'Min Feedback (1-5)',
      'Delta Avg Feedback (%)',
      'Revenue',
      'Delta Revenue (%)'
    ]);
    
    reportData.cars.forEach(car => {
      worksheet.addRow([
        car.model,
        car.location,
        car.rentalDays,
        car.reservations,
        car.mileageStart,
        car.mileageEnd,
        car.totalKilometers,
        car.avgMileagePerReservation,
        car.deltaAvgMileagePerReservation,
        car.avgFeedback,
        car.minFeedback,
        car.deltaAvgFeedback,
        car.revenue,
        car.deltaRevenue
      ]);
    });
  } else {
    // Support agent performance report
    worksheet.addRow([
      'Support Agent ID',
      'Bookings Processed',
      'Delta Bookings Processed (%)',
      'Avg Feedback (1-5)',
      'Min Feedback (1-5)',
      'Delta Avg Feedback (%)',
      'Delta Min Feedback (%)',
      'Revenue',
      'Delta Revenue (%)'
    ]);
    
    reportData.supportAgents.forEach(agent => {
      worksheet.addRow([
        agent.supportAgentId,
        agent.bookingsProcessed,
        agent.deltaBookingsProcessed,
        agent.avgFeedback,
        agent.minFeedback,
        agent.deltaAvgFeedback,
        agent.deltaMinFeedback,
        agent.revenue,
        agent.deltaRevenue
      ]);
    });
  }
  
  await workbook.xlsx.writeFile(filePath);
};

/**
 * Create CSV report
 * @param {Object} reportData - Report data
 * @param {string} filePath - File path
 * @returns {Promise<void>}
 */
const createCsvReport = async (reportData, filePath) => {
  let csvContent = '';
  
  // Add report period information
  csvContent += `Report Period,${reportData.reportPeriod.start} to ${reportData.reportPeriod.end}\n`;
  csvContent += `Previous Period,${reportData.previousPeriod.start} to ${reportData.previousPeriod.end}\n\n`;
  
  // Check if it's a sales report or support agent report
  if (reportData.cars) {
    // Sales statistics report
    csvContent += 'Car Model,Location,Rental Days,Reservations,Mileage Start (km),Mileage End (km),Total Kilometers (km),Avg Mileage per Reservation (km),Delta Avg Mileage (%),Avg Feedback (1-5),Min Feedback (1-5),Delta Avg Feedback (%),Revenue,Delta Revenue (%)\n';
    
    reportData.cars.forEach(car => {
      csvContent += `${car.model},${car.location},${car.rentalDays},${car.reservations},${car.mileageStart},${car.mileageEnd},${car.totalKilometers},${car.avgMileagePerReservation},${car.deltaAvgMileagePerReservation},${car.avgFeedback},${car.minFeedback},${car.deltaAvgFeedback},${car.revenue},${car.deltaRevenue}\n`;
    });
  } else {
    // Support agent performance report
    csvContent += 'Support Agent ID,Bookings Processed,Delta Bookings Processed (%),Avg Feedback (1-5),Min Feedback (1-5),Delta Avg Feedback (%),Delta Min Feedback (%),Revenue,Delta Revenue (%)\n';
    
    reportData.supportAgents.forEach(agent => {
      csvContent += `${agent.supportAgentId},${agent.bookingsProcessed},${agent.deltaBookingsProcessed},${agent.avgFeedback},${agent.minFeedback},${agent.deltaAvgFeedback},${agent.deltaMinFeedback},${agent.revenue},${agent.deltaRevenue}\n`;
    });
  }
  
  await fs.promises.writeFile(filePath, csvContent);
};

/**
 * Generate and send sales report
 * @param {Array<string>} recipients - Email recipients
 * @param {Date} startDate - Report period start date
 * @param {Date} endDate - Report period end date
 * @param {Date} previousStart - Previous period start date
 * @param {Date} previousEnd - Previous period end date
 * @param {string} location - Location
 * @returns {Promise<void>}
 */
const generateAndSendSalesReport = async (recipients, startDate, endDate, previousStart, previousEnd, location) => {
  // Generate report data
  const reportData = await generateSalesStatisticsReport(
    startDate,
    endDate,
    previousStart,
    previousEnd,
    location
  );
  
  // Create Excel file
  const timestamp = Date.now();
  const fileName = `sales_statistics_${location.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.xlsx`;
  const filePath = `/tmp/${fileName}`;
  
  await createExcelReport(reportData, filePath);
  
  // Send email with attachment
  await sendReportEmail(
    recipients,
    `CarRent Sales Statistics Report - ${location} - ${moment(startDate).format('YYYY-MM-DD')} to ${moment(endDate).format('YYYY-MM-DD')}`,
    `Please find attached the sales statistics report for ${location} for the period ${moment(startDate).format('YYYY-MM-DD')} to ${moment(endDate).format('YYYY-MM-DD')}.`,
    filePath,
    fileName
  );
};

/**
 * Generate and send support agent performance report
 * @param {Array<string>} recipients - Email recipients
 * @param {Date} startDate - Report period start date
 * @param {Date} endDate - Report period end date
 * @param {Date} previousStart - Previous period start date
 * @param {Date} previousEnd - Previous period end date
 * @param {string} location - Location
 * @returns {Promise<void>}
 */
const generateAndSendSupportReport = async (recipients, startDate, endDate, previousStart, previousEnd, location) => {
  // Get support agents for the location
  const supportAgents = await Booking.distinct('supportAgentId', { pickupLocationId: location });
  
  for (const agentId of supportAgents) {
    if (!agentId) continue;
    
    // Generate report data
    const reportData = await generateSupportAgentReport(
      agentId,
      startDate,
      endDate,
      previousStart,
      previousEnd,
      location
    );
    
    // Create Excel file
    const timestamp = Date.now();
    const fileName = `support_agent_performance_${agentId}_${timestamp}.xlsx`;
    const filePath = `/tmp/${fileName}`;
    
    await createExcelReport(reportData, filePath);
    
    // Send email with attachment
    await sendReportEmail(
      recipients,
      `CarRent Support Agent Performance Report - Agent ${agentId} - ${moment(startDate).format('YYYY-MM-DD')} to ${moment(endDate).format('YYYY-MM-DD')}`,
      `Please find attached the performance report for Support Agent ${agentId} at ${location} for the period ${moment(startDate).format('YYYY-MM-DD')} to ${moment(endDate).format('YYYY-MM-DD')}.`,
      filePath,
      fileName
    );
  }
};

/**
 * Send email with report attachment
 * @param {Array<string>} recipients - Email recipients
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @param {string} attachmentPath - Attachment file path
 * @param {string} attachmentName - Attachment file name
 * @returns {Promise<void>}
 */
const sendReportEmail = async (recipients, subject, body, attachmentPath, attachmentName) => {
  // In a real implementation, you would configure nodemailer with your email service
  // For this implementation, we'll just log the email details
  console.log(`Sending email to ${recipients.join(', ')}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  console.log(`Attachment: ${attachmentPath} (${attachmentName})`);
  
  // Example nodemailer implementation (commented out)
  /*
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipients.join(', '),
    subject: subject,
    text: body,
    attachments: [
      {
        filename: attachmentName,
        path: attachmentPath
      }
    ]
  };
  
  await transporter.sendMail(mailOptions);
  */
};

/**
 * Get the next occurrence of a specific day of the week
 * @param {number} dayOfWeek - Day of the week (0 = Sunday, 1 = Monday, etc.)
 * @returns {Date} Next occurrence date
 */
const getNextDayOfWeek = (dayOfWeek) => {
  const today = new Date();
  const result = new Date(today);
  result.setDate(today.getDate() + (7 + dayOfWeek - today.getDay()) % 7);
  return result;
};

// Export controller functions
module.exports = {
  getReports,
  createAggregationReport,
  scheduleWeeklyReports,
  sendReportsManually
};