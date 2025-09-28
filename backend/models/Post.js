const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }], 
  hyperlink: { type: String },
  pdf: { type: String }, 
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
