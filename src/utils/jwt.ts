import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const payload = { 
    userId,
    iat: Math.floor(Date.now() / 1000)
  };
  
  console.log(`🎫 Generating token for userId: ${userId}`);
  
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' } // 24 hours instead of 7 days for better security
  );
};

export const verifyToken = (token: string): any => {
  console.log(`🔍 Verifying token: ${token.substring(0, 20)}...`);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log(`✅ Token verified successfully`);
    return decoded;
  } catch (error: any) {
    console.log(`❌ Token verification failed:`, error.message);
    throw error;
  }
};
