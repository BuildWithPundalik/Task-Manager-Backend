import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "../src/config/database";
import authRoutes from "../src/routes/authRoutes";

dotenv.config();

const app = express();

// Connect to database
connectDB();

// CORS middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean);
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.use('/api/auth', authRoutes);

export default app;
