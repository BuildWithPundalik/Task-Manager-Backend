import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middlewares/auth';
import { handleError } from '../utils/errorHandler';

// Register user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    console.log(`📝 Registration attempt for:`, { name, email, password: password ? '***' : 'undefined' });

    // Validate input
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('❌ Password too short');
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!strongPasswordRegex.test(password)) {
      console.log('❌ Password not strong enough');
      res.status(400).json({ 
        message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)' 
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    console.log(`👤 Existing user check:`, existingUser ? 'User exists' : 'User does not exist');
    
    if (existingUser) {
      console.log(`❌ User already exists: ${email}`);
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create new user
    console.log(`✨ Creating new user: ${email}`);
    const user = new User({
      name,
      email: email.toLowerCase(),
      password
    });

    await user.save();
    console.log(`✅ User created successfully: ${user.email}`);

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error: any) {
    handleError(error, res, 'Registration error');
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log(`🔍 Login attempt for email: ${email}`);
    console.log(`📝 Request body:`, { email, password: password ? '***' : 'undefined' });

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log(`👤 User lookup result:`, user ? `Found: ${user.name} (${user.email})` : 'Not found');
    
    if (!user) {
      console.log(`❌ User not found for email: ${email}`);
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    console.log(`🔐 Comparing password for user: ${user.email}`);
    const isMatch = await user.comparePassword(password);
    console.log(`🔑 Password match result: ${isMatch}`);
    
    if (!isMatch) {
      console.log(`❌ Password mismatch for user: ${email}`);
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString());
    console.log(`✅ Login successful for user: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error: any) {
    handleError(error, res, 'Login error');
  }
};

// Get user profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log(`📋 Profile request for user:`, req.user ? req.user.email : 'No user');
    
    if (!req.user) {
      console.log('❌ User not authenticated in getProfile');
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    console.log(`✅ Returning profile for: ${req.user.name} (${req.user.email})`);
    res.json({
      message: 'Profile retrieved successfully',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error: any) {
    handleError(error, res, 'Profile error');
  }
};

// Verify token and get current user
export const verifyToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log(`🔍 Token verification request`);
    
    if (!req.user) {
      console.log('❌ Token verification failed - no user');
      res.status(401).json({ 
        valid: false, 
        message: 'Token is not valid' 
      });
      return;
    }

    console.log(`✅ Token valid for: ${req.user.name} (${req.user.email})`);
    res.json({
      valid: true,
      message: 'Token is valid',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error: any) {
    handleError(error, res, 'Token verification error');
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { name, email } = req.body;
    const userId = req.user._id;

    // Check if email is being changed and if it already exists
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'Email already in use' });
        return;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...(name && { name }),
        ...(email && { email })
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    });
  } catch (error: any) {
    handleError(error, res, 'Update profile error');
  }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    handleError(error, res, 'Change password error');
  }
};
