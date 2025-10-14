const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

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
  res.json({
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing',
    MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Missing', 
    SERVER_URL: process.env.SERVER_URL ? 'Set' : 'Missing',
    CLIENT_URL: process.env.CLIENT_URL ? 'Set' : 'Missing',
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Missing',
    NODE_ENV: process.env.NODE_ENV || 'development'
  });
});


// ✅ IMPORTANT: Export the app for Vercel (NO app.listen)
module.exports = app;
