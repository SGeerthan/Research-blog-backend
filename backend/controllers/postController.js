const Post = require("../models/Post");
const { uploadBuffer, deleteByPublicId } = require("../utils/cloudinary");

// Create Post
exports.createPost = async (req, res) => {
  try {
    const { author, description, hyperlink, topic } = req.body;
    
    // Upload images to Cloudinary
    let images = [];
    if (req.files && req.files["images"]) {
      const uploadedImages = await Promise.all(
        req.files["images"].map(async (file) => {
          const result = await uploadBuffer(file.buffer, "research-blog/images", "image");
          return {
            url: result.secure_url,
            publicId: result.public_id,
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          };
        })
      );
      images = uploadedImages;
    }

    // Upload PDF to Cloudinary as raw resource
    let pdf = null;
    if (req.files && req.files["pdf"]) {
      const file = req.files["pdf"][0];
      const result = await uploadBuffer(file.buffer, "research-blog/pdfs", "raw");
      pdf = {
        url: result.secure_url,
        publicId: result.public_id,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      };
    }

    const post = await Post.create({ 
      author, 
      description, 
      hyperlink, 
      topic,
      images, 
      pdf, 
      user: req.user.id 
    });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Error creating post", error: error.message });
  }
};

// Get All Posts (public)
exports.getPosts = async (req, res) => {
  const posts = await Post.find().populate('user', 'username email').sort({ createdAt: -1 });
  res.json(posts);
};

// Get User's Posts
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user posts", error: error.message });
  }
};

// Update Post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user owns this post
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    // Prepare updates from body
    const { author, description, hyperlink, topic } = req.body;
    const updateData = {};
    if (author !== undefined) updateData.author = author;
    if (description !== undefined) updateData.description = description;
    if (hyperlink !== undefined) updateData.hyperlink = hyperlink;
    if (topic !== undefined) updateData.topic = topic;

    // Handle file updates if provided (replace existing)
    if (req.files && req.files["images"]) {
      // Optionally delete previous images from Cloudinary
      if (post.images && post.images.length) {
        await Promise.all(post.images.map(img => img.publicId ? deleteByPublicId(img.publicId, "image") : null));
      }
      const uploadedImages = await Promise.all(
        req.files["images"].map(async (file) => {
          const result = await uploadBuffer(file.buffer, "research-blog/images", "image");
          return {
            url: result.secure_url,
            publicId: result.public_id,
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          };
        })
      );
      updateData.images = uploadedImages;
    }
    if (req.files && req.files["pdf"]) {
      if (post.pdf && post.pdf.publicId) {
        await deleteByPublicId(post.pdf.publicId, "raw");
      }
      const file = req.files["pdf"][0];
      const result = await uploadBuffer(file.buffer, "research-blog/pdfs", "raw");
      updateData.pdf = {
        url: result.secure_url,
        publicId: result.public_id,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      };
    }

    const updated = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating post", error: error.message });
  }
};

// Delete Post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user owns this post
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    // Clean up Cloudinary assets
    if (post.images && post.images.length) {
      await Promise.all(post.images.map(img => img.publicId ? deleteByPublicId(img.publicId, "image") : null));
    }
    if (post.pdf && post.pdf.publicId) {
      await deleteByPublicId(post.pdf.publicId, "raw");
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
};
