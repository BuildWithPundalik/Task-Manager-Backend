// Complete test API for frontend compatibility
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  const { url, method } = req;
  
  // Root endpoint
  if (url === "/" || url === "") {
    return res.status(200).json({
      message: "Task Manager API is running",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: "/api/auth/login",
        tasks: "/api/tasks",
        health: "/api/health"
      }
    });
  }
  
  // Health check
  if (url === "/api/health") {
    return res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      message: "API is healthy"
    });
  }
  
  // Login endpoint
  if (url === "/api/auth/login" && method === "POST") {
    return res.status(200).json({
      success: true,
      message: "Login endpoint working",
      token: "test-token-12345",
      user: {
        id: "test-user",
        email: "test@example.com"
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Register endpoint
  if (url === "/api/auth/register" && method === "POST") {
    return res.status(201).json({
      success: true,
      message: "Register endpoint working",
      user: {
        id: "new-user",
        email: req.body?.email || "test@example.com"
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Tasks endpoint
  if (url === "/api/tasks" && method === "GET") {
    return res.status(200).json({
      success: true,
      tasks: [
        {
          id: "1",
          title: "Test Task 1",
          description: "This is a test task",
          status: "pending",
          createdAt: new Date().toISOString()
        },
        {
          id: "2", 
          title: "Test Task 2",
          description: "Another test task",
          status: "completed",
          createdAt: new Date().toISOString()
        }
      ],
      count: 2,
      timestamp: new Date().toISOString()
    });
  }
  
  // Create task endpoint
  if (url === "/api/tasks" && method === "POST") {
    return res.status(201).json({
      success: true,
      message: "Task created",
      task: {
        id: "new-task",
        title: req.body?.title || "New Task",
        description: req.body?.description || "",
        status: "pending",
        createdAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // 404 for all other routes
  return res.status(404).json({
    error: "Not found",
    path: url,
    method: method,
    timestamp: new Date().toISOString(),
    available_endpoints: [
      "GET /",
      "GET /api/health", 
      "POST /api/auth/login",
      "POST /api/auth/register",
      "GET /api/tasks",
      "POST /api/tasks"
    ]
  });
};
