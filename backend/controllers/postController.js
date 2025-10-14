const Post = require("../models/Post");

// Create Post
exports.createPost = async (req, res) => {
  try {
    const { author, description, hyperlink, topic } = req.body;
    
    // For Vercel deployment, files are in memory storage
    // In production, you should upload to cloud storage (AWS S3, Cloudinary, etc.)
    const images = req.files["images"]?.map(f => ({
      filename: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      // In production, upload to cloud storage and store the URL
      url: `data:${f.mimetype};base64,${f.buffer.toString('base64')}` // Temporary base64 for demo
    })) || [];
    
    const pdf = req.files["pdf"] ? {
      filename: req.files["pdf"][0].originalname,
      mimetype: req.files["pdf"][0].mimetype,
      size: req.files["pdf"][0].size,
      // In production, upload to cloud storage and store the URL
      url: `data:${req.files["pdf"][0].mimetype};base64,${req.files["pdf"][0].buffer.toString('base64')}` // Temporary base64 for demo
    } : null;

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

    // Handle file updates if provided
    if (req.files && req.files["images"]) {
      updateData.images = req.files["images"].map(f => ({
        filename: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        url: `data:${f.mimetype};base64,${f.buffer.toString('base64')}`
      }));
    }
    if (req.files && req.files["pdf"]) {
      updateData.pdf = {
        filename: req.files["pdf"][0].originalname,
        mimetype: req.files["pdf"][0].mimetype,
        size: req.files["pdf"][0].size,
        url: `data:${req.files["pdf"][0].mimetype};base64,${req.files["pdf"][0].buffer.toString('base64')}`
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

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
};
