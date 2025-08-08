import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "../src/config/database";
import taskRoutes from "../src/routes/taskRoutes";

dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS middleware - Allow all origins for now
app.use(cors({
  origin: ['http://localhost:3000', 'https://task-manager-opal-one.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount task routes directly (without /api prefix since this function handles /api/tasks/*)
app.use('/', taskRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
