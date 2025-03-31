import { Request, Response, NextFunction } from 'express';

// Define a middleware function to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated through session
  if (req.session && req.session.user) {
    return next();
  }
  
  // If not authenticated, return 401 Unauthorized
  return res.status(401).json({
    message: "Authentication required"
  });
}

// Middleware to check if user is admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // First check if authenticated
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }
  
  // Then check if user is admin
  if (req.session.user.isAdmin) {
    return next();
  }
  
  // If not admin, return 403 Forbidden
  return res.status(403).json({
    message: "Admin access required"
  });
}