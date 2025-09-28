const Post = require("../models/Post");

// Create Post
exports.createPost = async (req, res) => {
  const { author, description, hyperlink } = req.body;
  const images = req.files["images"]?.map(f => f.path) || [];
  const pdf = req.files["pdf"] ? req.files["pdf"][0].path : null;

  const post = await Post.create({ author, description, hyperlink, images, pdf });
  res.json(post);
};

// Get All Posts (public)
exports.getPosts = async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
};

// Update Post
exports.updatePost = async (req, res) => {
  const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

// Delete Post
exports.deletePost = async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
};
