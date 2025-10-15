const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Connect to the database (with error handling for Vercel)
try {
  connectDB();
} catch (error) {
  console.error("❌ Database connection failed during startup:", error.message);
  // Don't exit the process in Vercel, let it continue
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Note: Static file serving removed for Vercel deployment
// Files are now handled via cloud storage or base64 encoding

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "✅ API is running...",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint for environment variables (remove in production)
app.get("/debug/env", (req, res) => {
  try {
    res.json({
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing',
      MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Missing', 
      SERVER_URL: process.env.SERVER_URL || 'Missing',
      CLIENT_URL: process.env.CLIENT_URL || 'Missing',
      EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Missing',
      NODE_ENV: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Specific endpoint to check SERVER_URL
app.get("/debug/server-url", (req, res) => {
  res.json({
    SERVER_URL: process.env.SERVER_URL,
    expected: "https://research-blog-backend-4b6h.vercel.app",
    isCorrect: process.env.SERVER_URL === "https://research-blog-backend-4b6h.vercel.app"
  });
});


// ✅ IMPORTANT: Export the app for Vercel (NO app.listen)
module.exports = app;
