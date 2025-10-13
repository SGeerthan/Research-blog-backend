const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  description: { type: String, required: true },
  topic: { type: String },
  images: [{ type: String }], 
  hyperlink: { type: String },
  pdf: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
