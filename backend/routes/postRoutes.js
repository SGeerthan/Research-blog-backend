const express = require("express");
const multer = require("multer");
const { createPost, getPosts, getUserPosts, updatePost, deletePost } = require("../controllers/postController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.post("/", protect, upload.fields([{ name: "images", maxCount: 20 }, { name: "pdf", maxCount: 1 }]), createPost);
router.get("/", getPosts); // Public - anyone can view all posts
router.get("/my-posts", protect, getUserPosts); // Protected - user can only see their own posts
router.put("/:id", protect, upload.fields([{ name: "images", maxCount: 20 }, { name: "pdf", maxCount: 1 }]), updatePost); // Protected - only post owner can update
router.delete("/:id", protect, deletePost); // Protected - only post owner can delete

module.exports = router;
