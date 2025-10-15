const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  description: { type: String, required: true },
  topic: { type: String },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    filename: { type: String },
    mimetype: { type: String },
    size: { type: Number }
  }],
  hyperlink: { type: String },
  pdf: {
    url: { type: String },
    publicId: { type: String },
    filename: { type: String },
    mimetype: { type: String },
    size: { type: Number }
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
