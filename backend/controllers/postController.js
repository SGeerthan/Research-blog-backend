const Post = require("../models/Post");

// Create Post
exports.createPost = async (req, res) => {
  const { author, description, hyperlink } = req.body;
  const images = req.files["images"]?.map(f => f.path) || [];
  const pdf = req.files["pdf"] ? req.files["pdf"][0].path : null;

  const post = await Post.create({ 
    author, 
    description, 
    hyperlink, 
    images, 
    pdf, 
    user: req.user.id 
  });
  res.json(post);
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

    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
