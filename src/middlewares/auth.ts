import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    console.log(`🔐 Auth header:`, authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      res.status(401).json({ message: 'No token, authorization denied' });
      return;
    }

    console.log(`🎫 Token received: ${token.substring(0, 20)}...`);

    // Verify token
    const decoded = verifyToken(token);
    console.log(`✅ Token decoded, userId:`, decoded.userId);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log(`❌ User not found for userId: ${decoded.userId}`);
      res.status(401).json({ message: 'Token is not valid' });
      return;
    }

    console.log(`👤 User found: ${user.name} (${user.email})`);
    req.user = user;
    next();
  } catch (error: any) {
    console.log('💥 Token validation error:', error.message);
    res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};
