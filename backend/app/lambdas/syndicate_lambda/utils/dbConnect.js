
const mongoose = require('mongoose');
const config = require('../config/config');

let isConnected = false;

/**
 * Connects to MongoDB database
 * Reuses existing connection if available
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
const connectToDatabase = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return mongoose.connection;
    }

    try {
        mongoose.set('strictQuery', false);
        console.log('Connecting to MongoDB...');
        await mongoose.connect(config.mongoDbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: config.dbName
        });

        isConnected = mongoose.connection.readyState === 1;

        console.log('Successfully connected to MongoDB');
        return mongoose.connection;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

const disconnectFromDatabase = async () => {
    if (!isConnected) {
        return;
    }

    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
        throw error;
    }
};

module.exports = {
    connectToDatabase,
    disconnectFromDatabase
};