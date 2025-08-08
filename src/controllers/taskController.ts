import { Response } from 'express';
import Task, { ITask } from '../models/Task';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';

// Get all tasks for authenticated user
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { status, priority, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query filter
    const filter: any = { userId: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    if (priority) {
      filter.priority = priority;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const tasks = await Task.find(filter)
      .sort(sort)
      .populate('userId', 'name email');

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get single task by ID
export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }

    const task = await Task.findOne({ 
      _id: id, 
      userId: req.user._id 
    }).populate('userId', 'name email');

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({
      success: true,
      task
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Create new task
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { title, description, status, priority, dueDate } = req.body;

    // Validate required fields
    if (!title || !description || !dueDate) {
      res.status(400).json({ 
        message: 'Title, description, and due date are required' 
      });
      return;
    }

    // Validate due date
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      res.status(400).json({ message: 'Invalid due date format' });
      return;
    }

    const task = new Task({
      title,
      description,
      status: status || 'Pending',
      priority: priority || 'medium',
      dueDate: dueDateObj,
      userId: req.user._id
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populatedTask
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update task
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }

    // Validate due date if provided
    let dueDateObj;
    if (dueDate) {
      dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        res.status(400).json({ message: 'Invalid due date format' });
        return;
      }
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (dueDateObj) updateData.dueDate = dueDateObj;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete task
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }

    const task = await Task.findOneAndDelete({ 
      _id: id, 
      userId: req.user._id 
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get task statistics for user
export const getTaskStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const userId = req.user._id;

    const stats = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          high: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          },
          medium: {
            $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] }
          },
          low: {
            $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    res.json({
      success: true,
      stats: result
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};
