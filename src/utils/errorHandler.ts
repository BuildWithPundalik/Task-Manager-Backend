import { Response } from 'express';

/**
 * Handle different types of database and validation errors
 * @param error - The error object
 * @param res - Express response object
 * @param context - Optional context for logging
 */
export const handleError = (error: any, res: Response, context?: string): void => {
  if (context) {
    console.error(`💥 ${context}:`, error);
  } else {
    console.error('💥 Error:', error);
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map((err: any) => err.message);
    res.status(400).json({
      message: 'Validation failed',
      errors: validationErrors
    });
    return;
  }

  // Handle Mongoose cast errors (invalid ObjectId, invalid date, etc.)
  if (error.name === 'CastError') {
    res.status(400).json({
      message: `Invalid ${error.path}: ${error.value}`
    });
    return;
  }

  // Handle MongoDB duplicate key error (unique constraint)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0];
    res.status(400).json({
      message: field 
        ? `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
        : 'Duplicate entry found'
    });
    return;
  }

  // Handle MongoDB connection errors
  if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
    res.status(503).json({
      message: 'Database connection error. Please try again later.'
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      message: 'Invalid token'
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      message: 'Token expired'
    });
    return;
  }

  // Default server error
  res.status(500).json({
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
};
