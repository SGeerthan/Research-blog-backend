const express = require("express");
const multer = require("multer");
const { createPost, getPosts, updatePost, deletePost } = require("../controllers/postController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.post("/", protect, upload.fields([{ name: "images" }, { name: "pdf", maxCount: 1 }]), createPost);
router.get("/", getPosts);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;
