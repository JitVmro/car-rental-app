/**
 * Car Routes Handler
 * Handles routing for car-related endpoints
 */

const carController = require('../controllers/carController');

/**
 * Handle car-related requests
 * @param {string} path - Request path
 * @param {string} method - HTTP method
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response object
 */
const handleRequest = async (path, method, event) => {
  console.log(`Car route: ${method} ${path}`);
  
  // Get all cars with filtering
  if (path === '/cars' && method === 'GET') {
    return await carController.getCars(event);
  }
  
  // Get popular cars
  if (path === '/cars/popular' && method === 'GET') {
    return await carController.getPopularCars(event);
  }
  
  // Get car by ID
  if (path.match(/^\/cars\/[^/]+$/) && method === 'GET') {
    const carId = path.split('/')[2];
    return await carController.getCarById(event, carId);
  }
  
  // Get car booked days
  if (path.match(/^\/cars\/[^/]+\/booked-days$/) && method === 'GET') {
    const carId = path.split('/')[2];
    return await carController.getCarBookedDays(event, carId);
  }
  
  // Get car reviews
  if (path.match(/^\/cars\/[^/]+\/client-review$/) && method === 'GET') {
    const carId = path.split('/')[2];
    return await carController.getCarReviews(event, carId);
  }
  
  // Create car (admin only)
  if (path === '/cars' && method === 'POST') {
    return await carController.createCar(event);
  }
  
  // Update car (admin only)
  if (path.match(/^\/cars\/[^/]+$/) && method === 'PUT') {
    const carId = path.split('/')[2];
    return await carController.updateCar(event, carId);
  }
  
  // Delete car (admin only)
  if (path.match(/^\/cars\/[^/]+$/) && method === 'DELETE') {
    const carId = path.split('/')[2];
    return await carController.deleteCar(event, carId);
  }
  
  // If no route matches
  return {
    statusCode: 404,
    body: { 
      message: 'Car endpoint not found',
      path,
      method
    }
  };
};

module.exports = {
  handleRequest
};