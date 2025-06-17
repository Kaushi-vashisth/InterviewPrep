const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
  name: String,
  company: String,
  role: String,
  difficulty: String,
  content: String,
  upvotes: { type: Number, default: 0 },
  approved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Experience", experienceSchema);
