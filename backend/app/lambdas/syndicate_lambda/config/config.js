const STAGE = process.env.STAGE || 'dev';
// const MONGODB_URI = 'mongodb+srv://swapnajitmishra:NnFFgYoAFNVKyCbe@projed8.g0bvm.mongodb.net/'
const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://swapnajit:qoverflow@cluster0.cu405ai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

const environments = {
  dev: {
    mongoDbUri: MONGODB_URI,
    dbName: 'car_rental_dev',
    jwtSecret: JWT_SECRET,
    jwtExpiresIn: '24h',
    logLevel: 'debug'
  },
  prod: {
    mongoDbUri: MONGODB_URI,
    dbName: 'car_rental_prod',
    jwtSecret: JWT_SECRET,
    jwtExpiresIn: '12h',
    logLevel: 'error'
  }
};

const config = environments[STAGE];

if (!config) {
  throw new Error(`Invalid environment: ${STAGE}`);
}

if (!config.mongoDbUri) {
  throw new Error('MongoDB URI is required');
}

if (!config.jwtSecret) {
  throw new Error('JWT Secret is required');
}

module.exports = config;