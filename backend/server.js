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
  res.send("✅ API is running...");
});


// ✅ IMPORTANT: Export the app for Vercel (NO app.listen)
module.exports = app;
