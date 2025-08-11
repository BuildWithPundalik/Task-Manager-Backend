import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI environment variable is not defined');
      console.error('🔧 Please set your MongoDB Atlas connection string in .env file');
      process.exit(1);
    }
    
    console.log('🔄 Attempting MongoDB connection...');
    console.log(`📍 Connecting to: ${mongoURI.replace(/\/\/[^@]*@/, '//***:***@')}`);
    
    // Simple connection like local MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
    
    // Connection event handlers
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('🔍 Error details:', JSON.stringify(error, null, 2));
    process.exit(1);
  }
};

export default connectDB;
