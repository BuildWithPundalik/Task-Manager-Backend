// api/index.ts for Vercel serverless function entry point
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "../src/config/database";
import routes from "../src/routes";

// Configure dotenv for serverless
dotenv.config();

// Create Express app for serverless
const app = express();

// Connect to database
connectDB();

// CORS middleware - Allow all origins for now
app.use(cors({
  origin: ['http://localhost:3000', 'https://task-manager-opal-one.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

app.get("/", (_req, res) => {
  res.json({ 
    message: "Task Manager API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      tasks: "/api/tasks",
      health: "/api/health"
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Export for Vercel
export default app;
