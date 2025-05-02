/**
 * Booking Routes Handler
 * Handles routing for booking-related endpoints
 */

const bookingController = require('../controllers/bookingController');

/**
 * Handle booking-related requests
 * @param {string} path - Request path
 * @param {string} method - HTTP method
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response object
 */
const handleRequest = async (path, method, event) => {
  console.log(`Booking route: ${method} ${path}`);
  
  // Get all bookings (admin/agent only)
  if (path === '/bookings' && method === 'GET') {
    return await bookingController.getBookings(event);
  }
  
  // Create booking
  if (path === '/bookings' && method === 'POST') {
    return await bookingController.createBooking(event);
  }
  
  // Get user bookings
  if (path.match(/^\/bookings\/[^/]+$/) && method === 'GET') {
    const userId = path.split('/')[2];
    return await bookingController.getUserBookings(event, userId);
  }
  
  // Update booking status
  if (path.match(/^\/bookings\/[^/]+\/status$/) && method === 'PUT') {
    const bookingId = path.split('/')[2];
    return await bookingController.updateBookingStatus(event, bookingId);
  }
  
  // Cancel booking
  if (path.match(/^\/bookings\/[^/]+$/) && method === 'DELETE') {
    const bookingId = path.split('/')[2];
    return await bookingController.cancelBooking(event, bookingId);
  }
  
  // If no route matches
  return {
    statusCode: 404,
    body: { 
      message: 'Booking endpoint not found',
      path,
      method
    }
  };
};

module.exports = {
  handleRequest
};