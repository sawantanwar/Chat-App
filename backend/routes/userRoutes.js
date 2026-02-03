const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const users = await User.find()
    .select("_id username avatar"); // 👈 sirf required fields
  res.json(users);
});

module.exports = router;
