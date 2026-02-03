const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const { encrypt, decrypt } = require("../utils/encrypt");

const onlineUsers = new Map(); // userId -> socketId

exports.socketHandler = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Auth error"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Auth error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    onlineUsers.set(userId, socket.id);
    io.emit("online_users", Array.from(onlineUsers.keys()));

    // LOAD CHAT
    socket.on("load_chat", async ({ withUserId }) => {
      const messages = await Message.find({
  $or: [
    { sender: userId, receiver: withUserId },
    { sender: withUserId, receiver: userId },
  ],
  deletedFor: { $ne: userId },
}).sort({ createdAt: 1 });


      const decryptedMsgs = messages.map((m) => ({
        ...m._doc,
        content: m.type === "image" ? m.content : decrypt(m.content),
      }));

      socket.emit("chat_history", decryptedMsgs);
    });

    // DELETE FOR ME (only hide for current user)
socket.on("delete_message_me", async ({ messageId }) => {
  const msg = await Message.findById(messageId);
  if (!msg) return;

  // only sender or receiver can delete for themselves
  if (
    String(msg.sender) !== userId &&
    String(msg.receiver) !== userId
  ) return;

  await Message.findByIdAndUpdate(messageId, {
    $addToSet: { deletedFor: userId },
  });

  socket.emit("message_deleted_me", { messageId });
});


// DELETE FOR EVERYONE (ONLY sender allowed)
socket.on("delete_message_everyone", async ({ messageId }) => {
  const msg = await Message.findById(messageId);
  if (!msg) return;

  // ❗ ONLY sender can delete for everyone
  if (String(msg.sender) !== userId) return;

  const updated = await Message.findByIdAndUpdate(
    messageId,
    {
      type: "deleted",
      content: encrypt("This message was deleted"),
    },
    { new: true }
  );

  const finalMsg = {
    _id: updated._id,
    sender: updated.sender,
    receiver: updated.receiver,
    content: "This message was deleted",
    type: "deleted",
    status: updated.status,
    createdAt: updated.createdAt,
  };

  const targetSocketId = onlineUsers.get(String(updated.receiver));
  if (targetSocketId) {
    io.to(targetSocketId).emit("message_deleted_everyone", finalMsg);
  }

  socket.emit("message_deleted_everyone", finalMsg);
});


    // PRIVATE MESSAGE
    socket.on("private_message", async ({ toUserId, message, type }) => {
      let storedContent =
        type === "image" ? message : encrypt(message);

      const targetSocketId = onlineUsers.get(toUserId);

      let status = targetSocketId ? "delivered" : "sent";

      const msgDoc = await Message.create({
        sender: userId,
        receiver: toUserId,
        content: storedContent,
        type,
        status,
      });

      const finalMsg = {
        _id: msgDoc._id,
        sender: userId,
        receiver: toUserId,
        content: message,
        type,
        status: msgDoc.status,
        createdAt: msgDoc.createdAt,
      };

      if (targetSocketId) {
        io.to(targetSocketId).emit("private_message", finalMsg);
      }

      socket.emit("private_message", finalMsg);
    });

    socket.on("mark_seen", async ({ fromUserId }) => {
      await Message.updateMany(
        { sender: fromUserId, receiver: userId, status: { $ne: "seen" } },
        { status: "seen" }
      );

      const senderSocket = onlineUsers.get(fromUserId);
      if (senderSocket) {
        io.to(senderSocket).emit("messages_seen", { by: userId });
      }
    });

    socket.on("typing", ({ toUserId }) => {
      const targetSocketId = onlineUsers.get(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("typing", { from: userId });
      }
    });

    socket.on("stop_typing", ({ toUserId }) => {
      const targetSocketId = onlineUsers.get(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("stop_typing", { from: userId });
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });
};






// const jwt = require("jsonwebtoken");
// const Message = require("../models/Message");
// const { encrypt, decrypt } = require("../utils/encrypt");

// const onlineUsers = new Map(); // userId -> socketId

// exports.socketHandler = (io) => {
//   io.use((socket, next) => {
//     const token = socket.handshake.auth?.token;
//     if (!token) return next(new Error("Auth error"));

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.user = decoded; // { id, username }
//       next();
//     } catch {
//       next(new Error("Auth error"));
//     }
//   });

//   io.on("connection", (socket) => {
//     const userId = socket.user.id;
//     const username = socket.user.username;

//     onlineUsers.set(userId, socket.id);
//     io.emit("online_users", Array.from(onlineUsers.keys()));

//     // LOAD CHAT (per user)
//     socket.on("load_chat", async ({ withUserId }) => {
//       const messages = await Message.find({
//         $or: [
//           { sender: userId, receiver: withUserId },
//           { sender: withUserId, receiver: userId },
//         ],
//       }).sort({ createdAt: 1 });

//       const decryptedMsgs = messages.map((m) => ({
//         ...m._doc,
//         content: decrypt(m.content),
//       }));

//       socket.emit("chat_history", decryptedMsgs);
//     });

//     // PRIVATE MESSAGE
//     socket.on("private_message", async ({ toUserId, message, type }) => {
//   const encryptedMsg = encrypt(message);

//   let status = "sent";
//   const targetSocketId = onlineUsers.get(toUserId);
//   if (targetSocketId) status = "delivered";

//   const msgDoc = await Message.create({
//     sender: userId,
//     receiver: toUserId,
//     content: encryptedMsg,
//     type, // 👈 save type
//     status,
//   });

//   const finalMsg = {
//     _id: msgDoc._id,
//     sender: userId,
//     receiver: toUserId,
//     content: message,
//     type,
//     status: msgDoc.status,
//     createdAt: msgDoc.createdAt,
//   };

//   if (targetSocketId) {
//     io.to(targetSocketId).emit("private_message", finalMsg);
//   }
//   socket.emit("private_message", finalMsg);
// });

//     // MARK SEEN
//     socket.on("mark_seen", async ({ fromUserId }) => {
//       await Message.updateMany(
//         { sender: fromUserId, receiver: userId, status: { $ne: "seen" } },
//         { status: "seen" }
//       );

//       const senderSocket = onlineUsers.get(fromUserId);
//       if (senderSocket) {
//         io.to(senderSocket).emit("messages_seen", { by: userId });
//       }
//     });

//     // TYPING
//     socket.on("typing", ({ toUserId }) => {
//       const targetSocketId = onlineUsers.get(toUserId);
//       if (targetSocketId) {
//         io.to(targetSocketId).emit("typing", { from: userId });
//       }
//     });

//     socket.on("stop_typing", ({ toUserId }) => {
//       const targetSocketId = onlineUsers.get(toUserId);
//       if (targetSocketId) {
//         io.to(targetSocketId).emit("stop_typing", { from: userId });
//       }
//     });

//     socket.on("disconnect", () => {
//       onlineUsers.delete(userId);
//       io.emit("online_users", Array.from(onlineUsers.keys()));
//     });
//   });
// };







// const jwt = require("jsonwebtoken");
// const Message = require("../models/Message");
// const { encrypt, decrypt } = require("../utils/encrypt");

// const onlineUsers = new Map(); // userId -> socketId

// exports.socketHandler = (io) => {
//   io.use((socket, next) => {
//     const token = socket.handshake.auth?.token;
//     if (!token) return next(new Error("Auth error"));

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.user = decoded; // { id, username }
//       next();
//     } catch {
//       next(new Error("Auth error"));
//     }
//   });

//   io.on("connection", async (socket) => {
//     const userId = socket.user.id;
//     const username = socket.user.username;

//     onlineUsers.set(userId, socket.id);
//     io.emit("online_users", Array.from(onlineUsers.keys()));

//     // Send chat history
//     socket.on("load_chat", async ({ withUserId }) => {
//   const messages = await Message.find({
//     $or: [
//       { sender: userId, receiver: withUserId },
//       { sender: withUserId, receiver: userId }
//     ]
//   }).sort({ createdAt: 1 });

//   const decryptedMsgs = messages.map(m => ({
//     ...m._doc,
//     content: decrypt(m.content)
//   }));

//   socket.emit("chat_history", decryptedMsgs);
// });


//     // PRIVATE MESSAGE
//     socket.on("private_message", async ({ toUserId, message }) => {
//       const encryptedMsg = encrypt(message);

//       let status = "sent";
//       const targetSocketId = onlineUsers.get(toUserId);
//       if (targetSocketId) status = "delivered";

//       const msgDoc = await Message.create({
//         sender: userId,
//         receiver: toUserId,
//         content: encryptedMsg,
//         status,
//       });

//       const finalMsg = {
//         _id: msgDoc._id,
//         sender: userId,
//         receiver: toUserId,
//         content: message,
//         status: msgDoc.status,
//         createdAt: msgDoc.createdAt,
//       };

//       if (targetSocketId) {
//         io.to(targetSocketId).emit("private_message", finalMsg);
//       }
//       socket.emit("private_message", finalMsg);
//     });

//     // MARK AS SEEN
//     socket.on("mark_seen", async ({ fromUserId }) => {
//       await Message.updateMany(
//         { sender: fromUserId, receiver: userId, status: { $ne: "seen" } },
//         { status: "seen" }
//       );

//       const senderSocket = onlineUsers.get(fromUserId);
//       if (senderSocket) {
//         io.to(senderSocket).emit("messages_seen", { by: userId });
//       }
//     });

//     // TYPING
//     socket.on("typing", ({ toUserId }) => {
//       const targetSocketId = onlineUsers.get(toUserId);
//       if (targetSocketId) {
//         io.to(targetSocketId).emit("typing", { from: userId, username });
//       }
//     });

//     socket.on("stop_typing", ({ toUserId }) => {
//       const targetSocketId = onlineUsers.get(toUserId);
//       if (targetSocketId) {
//         io.to(targetSocketId).emit("stop_typing", { from: userId });
//       }
//     });

//     socket.on("disconnect", () => {
//       onlineUsers.delete(userId);
//       io.emit("online_users", Array.from(onlineUsers.keys()));
//     });
//   });
// };


// const jwt = require("jsonwebtoken");
// const Message = require("../models/Message");
// const { encrypt, decrypt } = require("../utils/encrypt");

// const onlineUsers = new Map(); // userId -> socketId

// exports.socketHandler = (io) => {
//   io.use((socket, next) => {
//     const token = socket.handshake.auth?.token;
//     if (!token) return next(new Error("Auth error"));

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.user = decoded; // { id, username }
//       next();
//     } catch {
//       next(new Error("Auth error"));
//     }
//   });

//   io.on("connection", async (socket) => {
//     const userId = socket.user.id;
//     const username = socket.user.username;

//     onlineUsers.set(userId, socket.id);
//     io.emit("online_users", Array.from(onlineUsers.keys()));

//     // send chat history
//     const messages = await Message.find({
//       $or: [{ sender: userId }, { receiver: userId }],
//     }).sort({ createdAt: 1 });

//     const decryptedMsgs = messages.map((m) => ({
//       ...m._doc,
//       content: decrypt(m.content),
//     }));

//     socket.emit("chat_history", decryptedMsgs);

//     // private message
//     socket.on("private_message", async ({ toUserId, message }) => {
//       const encryptedMsg = encrypt(message);

//       const msgDoc = await Message.create({
//         sender: userId,
//         receiver: toUserId,
//         content: encryptedMsg,
//       });

//       const finalMsg = {
//         _id: msgDoc._id,
//         sender: userId,
//         receiver: toUserId,
//         content: message,
//         createdAt: msgDoc.createdAt,
//       };

//       const targetSocketId = onlineUsers.get(toUserId);

//       if (targetSocketId) {
//         io.to(targetSocketId).emit("private_message", finalMsg);
//       }
//       socket.emit("private_message", finalMsg);
//     });

//     // TYPING
//     socket.on("typing", ({ toUserId }) => {
//       const targetSocketId = onlineUsers.get(toUserId);
//       if (targetSocketId) {
//         io.to(targetSocketId).emit("typing", {
//           from: userId,
//           username,
//         });
//       }
//     });

//     socket.on("stop_typing", ({ toUserId }) => {
//       const targetSocketId = onlineUsers.get(toUserId);
//       if (targetSocketId) {
//         io.to(targetSocketId).emit("stop_typing", {
//           from: userId,
//         });
//       }
//     });

//     socket.on("disconnect", () => {
//       onlineUsers.delete(userId);
//       io.emit("online_users", Array.from(onlineUsers.keys()));
//     });
//   });
// };