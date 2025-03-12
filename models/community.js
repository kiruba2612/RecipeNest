const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Replier's Name
  text: { type: String, required: true }, // Reply Content
  createdAt: { type: Date, default: Date.now },
});

const QuerySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Query Author
  query: { type: String, required: true }, // Query Title
  content: { type: String, required: true }, // Query Details
  replies: [ReplySchema], // Array of Replies
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Query", QuerySchema);
