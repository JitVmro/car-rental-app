/**
 * Home Controller
 * Handles home page content operations
 */

const { validate, schemas } = require('../utils/validator');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { connectToDatabase } = require('../utils/dbConnect');
const AboutUs = require('../models/aboutUs');
const FAQ = require('../models/faq');
const Locations = require('../models/location');

/**
 * Get about us content
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with about us content
 */
const getAboutUs = async (event) => {
  try {
    // Connect to database
    await connectToDatabase();

    // Find active about us sections
    const aboutUs = await AboutUs.findOne({});


    // Return about us content
    return {
      statusCode: 200,
      body: aboutUs || { content: [] }
    };
  } catch (error) {
    console.error('Error in getAboutUs:', error);
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};

/**
 * Get FAQ content
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with FAQ content
 */
const getFaq = async (event) => {
  try {
    // Connect to database
    await connectToDatabase();

    // Find FAQ document
    let faq = await FAQ.findOne({});
    
    // If no FAQ document exists, return empty content array
    if (!faq) {
      return {
        statusCode: 200,
        body: { content: [] }
      };
    }

    // Return FAQ content as is
    return {
      statusCode: 200,
      body: faq
    };
  } catch (error) {
    console.error('Error in getFaq:', error);
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};

/**
 * Get locations
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with locations
 */
const getLocations = async (event) => {
  try {
    // Connect to database
    await connectToDatabase();

    // Find locations document
    let locations = await Locations.findOne({});
    
    // If no locations document exists, return empty content array
    if (!locations) {
      return {
        statusCode: 200,
        body: { content: [] }
      };
    }

    // Return locations content as is
    return {
      statusCode: 200,
      body: locations
    };
  } catch (error) {
    console.error('Error in getLocations:', error);
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};

/**
 * Update about us content (admin only)
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with updated content
 */
const updateAboutUs = async (event) => {
  try {
    // Authenticate and authorize admin
    const authorizedEvent = await authorize(['Admin'])(event);

    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = validate(body, schemas.updateAboutUs);

    // Connect to database
    await connectToDatabase();

    // Check if section exists
    let aboutUsSection;

    if (body.id) {
      aboutUsSection = await AboutUs.findById(body.id);

      if (!aboutUsSection) {
        return {
          statusCode: 404,
          body: { message: 'About us section not found' }
        };
      }

      // Update existing section
      aboutUsSection.title = validatedData.title;
      aboutUsSection.content = validatedData.content;
      if (validatedData.imageUrl !== undefined) {
        aboutUsSection.imageUrl = validatedData.imageUrl;
      }
      if (validatedData.order !== undefined) {
        aboutUsSection.order = validatedData.order;
      }
      if (validatedData.active !== undefined) {
        aboutUsSection.active = validatedData.active;
      }
    } else {
      // Create new section
      aboutUsSection = new AboutUs({
        title: validatedData.title,
        content: validatedData.content,
        imageUrl: validatedData.imageUrl,
        order: validatedData.order || 0,
        active: validatedData.active !== undefined ? validatedData.active : true
      });
    }

    // Save section
    await aboutUsSection.save();

    // Return updated section
    return {
      statusCode: body.id ? 200 : 201,
      body: {
        id: aboutUsSection._id,
        title: aboutUsSection.title,
        content: aboutUsSection.content,
        imageUrl: aboutUsSection.imageUrl,
        order: aboutUsSection.order,
        active: aboutUsSection.active
      }
    };
  } catch (error) {
    console.error('Error in updateAboutUs:', error);

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
 * Update FAQ (admin only)
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with updated FAQ
 */
const updateFaq = async (event) => {
  try {
    // Authenticate and authorize admin
    const authorizedEvent = await authorize(['Admin'])(event);

    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = validate(body, schemas.updateFaq);

    // Connect to database
    await connectToDatabase();

    // Check if FAQ exists
    let faq;

    if (body.id) {
      faq = await FAQ.findById(body.id);

      if (!faq) {
        return {
          statusCode: 404,
          body: { message: 'FAQ not found' }
        };
      }

      // Update existing FAQ
      faq.question = validatedData.question;
      faq.answer = validatedData.answer;
      if (validatedData.category !== undefined) {
        faq.category = validatedData.category;
      }
      if (validatedData.order !== undefined) {
        faq.order = validatedData.order;
      }
      if (validatedData.active !== undefined) {
        faq.active = validatedData.active;
      }
    } else {
      // Create new FAQ
      faq = new FAQ({
        question: validatedData.question,
        answer: validatedData.answer,
        category: validatedData.category || 'General',
        order: validatedData.order || 0,
        active: validatedData.active !== undefined ? validatedData.active : true
      });
    }

    // Save FAQ
    await faq.save();

    // Return updated FAQ
    return {
      statusCode: body.id ? 200 : 201,
      body: {
        id: faq._id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        order: faq.order,
        active: faq.active
      }
    };
  } catch (error) {
    console.error('Error in updateFaq:', error);

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
 * Create location (admin only)
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response with created location
 */
const createLocation = async (event) => {
  try {
    // Authenticate and authorize admin
    const authorizedEvent = await authorize(['Admin'])(event);

    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = validate(body, schemas.createLocation);

    // Connect to database
    await connectToDatabase();

    // Create new location
    const newLocation = new Location({
      name: validatedData.name,
      address: validatedData.address,
      city: validatedData.city,
      country: validatedData.country,
      zipCode: validatedData.zipCode,
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
      phoneNumber: validatedData.phoneNumber,
      email: validatedData.email,
      workingHours: validatedData.workingHours,
      active: validatedData.active !== undefined ? validatedData.active : true
    });

    // Save location
    await newLocation.save();

    // Return created location
    return {
      statusCode: 201,
      body: {
        locationId: newLocation._id,
        name: newLocation.name,
        address: newLocation.address,
        city: newLocation.city,
        country: newLocation.country,
        zipCode: newLocation.zipCode,
        coordinates: {
          latitude: newLocation.latitude,
          longitude: newLocation.longitude
        },
        phoneNumber: newLocation.phoneNumber,
        email: newLocation.email,
        workingHours: newLocation.workingHours,
        active: newLocation.active
      }
    };
  } catch (error) {
    console.error('Error in createLocation:', error);

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

module.exports = {
  getAboutUs,
  getFaq,
  getLocations,
  updateAboutUs,
  updateFaq,
  createLocation
};