require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { socketHandler } = require("./socket/socket");
const profileRoutes = require("./routes/profileRoutes");
const messageRoutes = require("./routes/messageRoutes");

connectDB();

const app = express();
const server = http.createServer(app);

// ✅ CORS CONFIG (SAFE)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://chat-app-beige-xi-60.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/messages", messageRoutes);

// ✅ SOCKET.IO CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chat-app-beige-xi-60.vercel.app"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

socketHandler(io);

// ⚠️ Render dynamic port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server running on", PORT));




// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");

// const connectDB = require("./config/db");
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const { socketHandler } = require("./socket/socket");
// const profileRoutes = require("./routes/profileRoutes");
// const messageRoutes = require("./routes/messageRoutes");

// connectDB();

// const app = express();
// const server = http.createServer(app);

// app.use(cors({ origin: process.env.CLIENT_URL }));
// app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);

// app.use("/uploads", express.static("uploads"));
// app.use("/api/profile", profileRoutes);
// app.use("/api/messages", messageRoutes);

// const io = new Server(server, {
//   cors: { origin: process.env.CLIENT_URL },
// });
// app.set("io", io);
// socketHandler(io);

// server.listen(5000, () => console.log("Server running on 5000"));
