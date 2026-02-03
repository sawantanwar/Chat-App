const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const auth = require("../middleware/authMiddleware");

const router = express.Router();
const { decrypt } = require("../utils/encrypt");

// ✅ Get unread count per sender (FIXED ObjectId issue)
router.get("/unread", auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const unread = await Message.aggregate([
      {
        $match: {
          receiver: userId,
          status: { $ne: "seen" },
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(unread); 
    // example: [{ _id: senderId, count: 3 }]
  } catch (err) {
    console.error("Unread error:", err);
    res.status(500).json({ error: "Failed to fetch unread messages" });
  }
});


// Get last message per user (SAFE + FIXED)
router.get("/last", auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const msgs = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    const result = msgs.map((m) => ({
      _id: m._id,
      lastMessage: {
        ...m.lastMessage,
        content:
          m.lastMessage.type === "image"
            ? "📷 Photo"
            : decrypt(m.lastMessage.content || ""),
      },
    }));

    res.json(result);
  } catch (err) {
    console.error("LAST MESSAGE ERROR:", err);
    res.status(500).json({ error: "Failed to fetch last messages" });
  }
});


module.exports = router;
