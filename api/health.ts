// Simple health check endpoint
export default function handler(req: any, res: any) {
  res.status(200).json({ 
    message: "Task Manager API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      tasks: "/api/tasks",
    }
  });
}
