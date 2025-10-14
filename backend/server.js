const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("../config/db"); // path updated because file is now inside /api
const authRoutes = require("../routes/authRoutes");
const postRoutes = require("../routes/postRoutes");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("✅ API is running...");
});


// ✅ IMPORTANT: Export the app for Vercel (NO app.listen)
module.exports = app;
