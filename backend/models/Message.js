const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: String, 
  type: {
    type: String,
    enum: ["text", "image"],
    default: "text",
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deletedFor: [
  { type: mongoose.Schema.Types.ObjectId, ref: "User" }
],

});

module.exports = mongoose.model("Message", messageSchema);
