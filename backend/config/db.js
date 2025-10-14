const mongoose = require("mongoose");

const connectDB = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI environment variable is not set");
      }
      
      console.log(`🔄 Attempting MongoDB connection (attempt ${i + 1}/${retries})...`);
      
      await mongoose.connect(process.env.MONGO_URI, {
        connectTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 30000,  // 30 seconds
        serverSelectionTimeoutMS: 30000, // 30 seconds
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverApi: { version: '1', strict: true, deprecationErrors: true }
      });
      
      console.log("✅ MongoDB Connected");
      return;
    } catch (error) {
      console.error(`❌ MongoDB Connection Error (attempt ${i + 1}):`, error.message);
      
      if (i === retries - 1) {
        // Last attempt failed
        console.error("❌ All MongoDB connection attempts failed");
        
        // In Vercel/serverless environment, don't exit the process
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
          console.log("⚠️ Continuing without database connection in serverless environment");
          return;
        }
        
        // Only exit in development
        process.exit(1);
      } else {
        // Wait before retrying
        console.log(`⏳ Waiting 2 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
};

module.exports = connectDB;
