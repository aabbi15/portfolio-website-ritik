import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get MongoDB URI from environment with fallback to local development URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

// Improved MongoDB connection options for reliability and serverless environment
// These options are optimized for Vercel's serverless environment
const options = {
  autoIndex: process.env.NODE_ENV !== 'production', // Only build indexes in development
  maxPoolSize: 10,                 // Maximum 10 connections for short-lived functions
  minPoolSize: 1,                  // Minimum 1 connection to keep alive
  serverSelectionTimeoutMS: 5000,  // Timeout for server selection (5s)
  connectTimeoutMS: 5000,          // Connection timeout (5s)
  socketTimeoutMS: 30000,          // Socket timeout (30s) - increased for longer operations
  family: 4,                       // Use IPv4, skip trying IPv6
  retryWrites: true,               // Enable retryable writes
  retryReads: true,                // Enable retryable reads
  bufferCommands: false,           // Disable buffering for faster failure recognition
  ssl: process.env.NODE_ENV === 'production', // Use SSL in production
  autoCreate: true,                // Auto-create collections
};

// Flag to track if we're using fallback in-memory storage
let usingFallbackStorage = false;

// Cache MongoDB connection between serverless function invocations
let cachedConnection: typeof mongoose | null = null;

// Max number of connection attempts
const MAX_CONNECT_ATTEMPTS = 2; // Reduced to make fallback faster
// Base delay in ms between retries (will be multiplied by attempt number)
const RETRY_BASE_DELAY = 1000; // 1 second - reduced for faster fallback
// MongoDB connection timeout in milliseconds
const CONNECTION_TIMEOUT_MS = 5000; // 5 seconds max wait

// Connect to MongoDB with retry mechanism
export async function connectToDatabase(): Promise<typeof mongoose> {
  // If we already have a cached connection and it's connected, return it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }
  
  let lastError = null;
  
  for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt++) {
    try {
      console.log(`MongoDB connection attempt ${attempt}/${MAX_CONNECT_ATTEMPTS}...`);
      
      // Check if the MongoDB URI is provided and not a placeholder
      if (!MONGODB_URI || MONGODB_URI === 'your_mongodb_connection_string_here') {
        throw new Error('MongoDB URI is not configured. Make sure MONGODB_URI environment variable is set.');
      }
      
      // Try to connect with a timeout to avoid hanging
      const connection = await Promise.race([
        mongoose.connect(MONGODB_URI, options),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Connection timeout after ${CONNECTION_TIMEOUT_MS}ms`)), 
          CONNECTION_TIMEOUT_MS)
        )
      ]);
      
      // Success! Log connection success (without sensitive info)
      const dbName = mongoose.connection.name || 'unknown';
      console.log(`Connected to MongoDB database "${dbName}" successfully!`);
      
      // Setup connection event handlers only once
      if (!cachedConnection) {
        mongoose.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
          console.warn('MongoDB disconnected');
          // In serverless, we don't auto-reconnect - functions are short-lived
        });
      }
      
      // Reset fallback flag in case this is a reconnection
      usingFallbackStorage = false;
      
      // Cache the connection for future use
      cachedConnection = connection;
      
      return connection;
    } catch (error) {
      lastError = error;
      console.error(`MongoDB connection attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error));
      
      // If we haven't reached the max attempts, wait before retrying
      if (attempt < MAX_CONNECT_ATTEMPTS) {
        const delay = RETRY_BASE_DELAY * attempt;
        console.log(`Retrying connection in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed, log detailed error and use fallback
  console.error('All MongoDB connection attempts failed. Last error:', lastError);
  usingFallbackStorage = true;
  console.log('Using fallback in-memory storage instead. Data will not be persisted to MongoDB.');
  
  // Return mongoose instance anyway so the app can continue
  return mongoose;
}

// Get MongoDB connection status with additional details
export function getConnectionStatus(): string {
  if (usingFallbackStorage) {
    return 'Using fallback in-memory storage';
  }
  
  // Check the actual connection state
  const readyState = mongoose.connection.readyState;
  // Map numeric states to human-readable descriptions
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
    99: 'Uninitialized'
  };
  
  return states[readyState] || 'Unknown';
}

// Check if using fallback storage
export function isUsingFallbackStorage(): boolean {
  return usingFallbackStorage;
}

// Check if we have an active MongoDB connection
export function hasActiveConnection(): boolean {
  return mongoose.connection.readyState === 1;
}

// Close MongoDB connection (useful for testing and graceful shutdown)
export async function closeDatabaseConnection(): Promise<void> {
  if (usingFallbackStorage) {
    console.log('No MongoDB connection to close, using fallback storage');
    return;
  }
  
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error while closing MongoDB connection:', error);
  }
}