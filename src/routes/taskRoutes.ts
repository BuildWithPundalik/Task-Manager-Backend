import express from 'express';
import { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask, 
  getTaskStats 
} from '../controllers/taskController';
import { auth } from '../middlewares/auth';

const router = express.Router();

// All task routes require authentication
router.use(auth);

// Task CRUD routes
router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
