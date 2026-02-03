const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, req.user.id + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Change avatar
router.post("/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.avatar = "/uploads/" + req.file.filename;
    await user.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("avatar_updated", {
        userId: user._id,
        avatar: user.avatar,
      });
    }

    res.json({ avatar: user.avatar });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ message: "Avatar upload failed" });
  }
});

// Change password
router.post("/change-password", auth, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  const user = await User.findById(req.user.id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) return res.status(400).json({ message: "Old password wrong" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password changed" });
});

module.exports = router;
