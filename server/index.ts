import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import memorystore from "memorystore";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { connectToDatabase, getConnectionStatus, isUsingFallbackStorage } from "./database/mongo";

// Add session user type
declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      username: string;
      isAdmin: boolean | null;
    } | null;
  }
}

const MemoryStore = memorystore(session);

const app = express();

// Apply rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiter to API routes
app.use('/api/', apiLimiter);

// Enable compression for all responses
app.use(compression());

// Increase JSON payload limit to handle larger file uploads (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Serve static files from uploads directory with caching headers
app.use('/uploads', express.static('public/uploads', {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true
}));

// Session configuration with efficient memory usage
app.use(session({
  secret: "portfolio-admin-secret", // In production, use env var
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
    max: 1000, // Maximum number of sessions in memory
    ttl: 86400000 // Session TTL (24 hours)
  }),
  cookie: { 
    secure: false, // set to true if using https
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    path: '/',
    sameSite: 'lax'
  }
}));

// Enhanced performance monitoring and logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const method = req.method;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  let responseSize = 0;

  // Track response body size for analytics
  const originalResWrite = res.write;
  const originalResEnd = res.end;
  
  // Function to safely measure content length
  const measureSize = (chunk: any): number => {
    if (!chunk) return 0;
    return typeof chunk === 'string' ? Buffer.byteLength(chunk, 'utf8') : chunk.length;
  };
  
  // Just track the response size without modifying the end method
  res.on("finish", () => {
    // Track response size from headers
    const contentLength = res.getHeader('content-length');
    if (contentLength) {
      responseSize = parseInt(contentLength as string, 10);
    }
  });

  // Capture JSON responses without modifying the method
  const originalResJson = res.json;
  // @ts-ignore - Ignore TypeScript errors for this method override
  res.json = function (bodyJson: any) {
    capturedJsonResponse = bodyJson;
    return originalResJson.call(res, bodyJson);
  };

  // Set performance header before sending response
  res.set('Server-Timing', 'init;dur=0'); // Set initial value that will be updated
  
  // Performance logging after response is sent
  res.on("finish", () => {
    const duration = Date.now() - start;
    
    // Log API requests with detailed performance info
    if (path.startsWith("/api")) {
      let logLine = `${method} ${path} ${res.statusCode} in ${duration}ms | ${responseSize} bytes`;
      
      // Add warning for slow responses (>500ms)
      if (duration > 500) {
        logLine = `⚠️ SLOW - ${logLine}`;
      }
      
      // Include response preview for debugging if needed
      if (capturedJsonResponse) {
        const jsonStr = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${jsonStr.length > 60 ? jsonStr.slice(0, 59) + '…' : jsonStr}`;
      }

      // Truncate very long log lines
      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Add a MongoDB connection status endpoint to help with debugging
    app.get('/api/system/db-status', (_req, res) => {
      const status = getConnectionStatus();
      res.json({ 
        status,
        usingFallback: isUsingFallbackStorage(),
        connectionTime: new Date().toISOString()
      });
    });
    
    // Start MongoDB connection in the background (don't await) to avoid delaying server startup
    if (process.env.MONGODB_URI) {
      log('MONGODB_URI environment variable found, connecting to MongoDB in the background...');
      // Connect in the background and handle errors, don't wait for completion
      connectToDatabase()
        .then(() => log('MongoDB connection completed in the background'))
        .catch(err => log(`MongoDB background connection failed: ${err.message}`));
      
      log('Server will start with in-memory storage and switch to MongoDB when available');
    } else {
      log('No MONGODB_URI environment variable found, using in-memory storage only');
    }
    
    const server = await registerRoutes(app);

    // Enhanced error handling middleware with proper error classification
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      // Log detailed error information for server-side debugging
      if (status >= 500) {
        console.error(`[SERVER ERROR] ${err.stack || err}`);
      } else {
        log(`[CLIENT ERROR ${status}] ${message}`);
      }

      // Don't expose internal error details to the client
      const clientMessage = status >= 500 
        ? "An unexpected error occurred. Please try again later." 
        : message;
      
      res.status(status).json({ message: clientMessage });
      
      // Don't throw the error as it will crash the server
      // Just log it above instead
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const PORT = parseInt(process.env.PORT || "5000", 10);
    const HOST = 'localhost'; // Change from '0.0.0.0' to 'localhost'

    app.listen(PORT, HOST, () => {
      console.log(`Server is running at http://${HOST}:${PORT}`);
    });
  } catch (error) {
    log(`Failed to start the server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
})();
