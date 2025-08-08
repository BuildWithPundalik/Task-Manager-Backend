import express from 'express';
import authRoutes from './authRoutes';
import taskRoutes from './taskRoutes';

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Task Manager API is running'
  });
});

export default router;
