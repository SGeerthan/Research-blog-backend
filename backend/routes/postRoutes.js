const express = require("express");
const multer = require("multer");
const { createPost, getPosts, getUserPosts, updatePost, deletePost } = require("../controllers/postController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// For Vercel deployment, use memory storage instead of disk storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    // Keep individual file limit conservative to avoid timeouts on serverless
    fileSize: 8 * 1024 * 1024, // 8MB per file
    files: 21 // up to 20 images + 1 pdf
  }
});

router.post("/", protect, upload.fields([{ name: "images", maxCount: 20 }, { name: "pdf", maxCount: 1 }]), createPost);
router.get("/", getPosts); // Public - anyone can view all posts
router.get("/my-posts", protect, getUserPosts); // Protected - user can only see their own posts
router.put("/:id", protect, upload.fields([{ name: "images", maxCount: 20 }, { name: "pdf", maxCount: 1 }]), updatePost); // Protected - only post owner can update
router.delete("/:id", protect, deletePost); // Protected - only post owner can delete

module.exports = router;
