// api/index.ts for Vercel serverless function entry point
import serverless from 'serverless-http';
import app from "../src/index";

// Export the serverless handler
export default serverless(app);
