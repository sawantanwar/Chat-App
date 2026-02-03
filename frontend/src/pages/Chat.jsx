import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import { api } from "../services/api";

export default function Chat() {
  const { user, token } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [lastMsgs, setLastMsgs] = useState({}); // { userId: lastMessage }

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await api.get("/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data.filter((u) => u._id !== user.id));
  };

  const fetchUnread = async () => {
    const res = await api.get("/messages/unread", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const obj = {};
    res.data.forEach((u) => {
      obj[String(u._id)] = u.count;
    });

    setUnread(obj);
  };

  const fetchLastMsgs = async () => {
    const res = await api.get("/messages/last", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const obj = {};
    res.data.forEach((m) => {
      obj[String(m._id)] = m.lastMessage;
    });

    setLastMsgs(obj);
  };

  // ✅ SAFE last message updater
  const updateLastMsg = (msg) => {
    if (!msg || !user) return;

    const myId = String(user.id || user._id);
    const senderId = String(msg.sender);
    const receiverId = String(msg.receiver);

    const otherUserId =
      senderId === myId ? receiverId : senderId;

    setLastMsgs((prev) => ({
      ...prev,
      [otherUserId]: msg,
    }));
  };

  useEffect(() => {
    if (!user) return;
    fetchUsers();
    fetchUnread();
    fetchLastMsgs();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on("online_users", (list) => {
      setOnlineUsers(list.map((id) => String(id)));
    });

    socket.on("chat_history", (msgs) => {
      setMessages(msgs);
    });

    socket.on("message_deleted_me", ({ messageId }) => {
  setMessages((prev) => prev.filter((m) => m._id !== messageId));
});

socket.on("message_deleted_everyone", (msg) => {
  setMessages((prev) =>
    prev.map((m) => (m._id === msg._id ? msg : m))
  );
});

socket.on("avatar_updated", ({ userId, avatar }) => {
  setUsers((prev) =>
    prev.map((u) =>
      u._id === userId ? { ...u, avatar } : u
    )
  );

  // if open chat user updated avatar
  if (selectedUser && selectedUser._id === userId) {
    setSelectedUser((prev) => ({ ...prev, avatar }));
  }
});


    socket.on("private_message", async (msg) => {
      updateLastMsg(msg);

      if (msg.receiver === user.id) {
        await fetchUnread();
      }

      if (
        selectedUser &&
        (msg.sender === selectedUser._id || msg.receiver === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, msg]);

        if (msg.sender === selectedUser._id) {
          socket.emit("mark_seen", { fromUserId: selectedUser._id });
        }
      }
    });

    socket.on("typing", ({ from }) => {
      if (selectedUser && from === selectedUser._id) setTyping(true);
    });

    socket.on("stop_typing", ({ from }) => {
      if (selectedUser && from === selectedUser._id) {
        setTimeout(() => setTyping(false), 3000);
      }
    });

    socket.on("messages_seen", () => {
      setMessages((prev) =>
        prev.map((m) =>
          m.sender === user.id ? { ...m, status: "seen" } : m
        )
      );
    });

    return () => {
      socket.off("online_users");
      socket.off("chat_history");
      socket.off("private_message");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("messages_seen");
      socket.off("message_deleted_me");
      socket.off("message_deleted_everyone");
      socket.off("avatar_updated");


    };
  }, [socket, selectedUser, user]);

  const openChat = (u) => {
    setSelectedUser(u);
    socket.emit("load_chat", { withUserId: u._id });
    socket.emit("mark_seen", { fromUserId: u._id });
    setTimeout(() => {
      fetchUnread();
    }, 400);
  };

  return (
    <div className="h-screen flex bg-[#efeae2]">
      <Sidebar
        users={users}
        openChat={openChat}
        unread={unread}
        onlineUsers={onlineUsers}
        lastMsgs={lastMsgs}
      />

      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <ChatHeader user={selectedUser} typing={typing} onlineUsers={onlineUsers} />
            <MessageList messages={messages} me={user.id} />
            <MessageInput toUser={selectedUser} />
          </>
        ) : (
          <div className="flex-1 flex justify-center items-center text-gray-500">
            Select a chat
          </div>
        )}
      </div>
    </div>
  );
}




// import { useContext, useEffect, useState } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { SocketContext } from "../context/SocketContext";
// import Sidebar from "../components/Sidebar";
// import ChatHeader from "../components/ChatHeader";
// import MessageList from "../components/MessageList";
// import MessageInput from "../components/MessageInput";
// import { api } from "../services/api";

// export default function Chat() {
//   const { user, token } = useContext(AuthContext);
//   const { socket } = useContext(SocketContext);
//   const [lastMsgs, setLastMsgs] = useState({}); // { userId: lastMessage }

//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [typing, setTyping] = useState(false);
//   const [unread, setUnread] = useState({});
//   const [onlineUsers, setOnlineUsers] = useState([]);

//   const fetchUsers = async () => {
//     const res = await api.get("/users", {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setUsers(res.data.filter((u) => u._id !== user.id));
//   };

//   const fetchUnread = async () => {
//     const res = await api.get("/messages/unread", {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const obj = {};
//     res.data.forEach((u) => {
//       obj[String(u._id)] = u.count;
//     });

//     setUnread(obj);
//   };

//   const fetchLastMsgs = async () => {
//   const res = await api.get("/messages/last", {
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   const obj = {};
//   res.data.forEach((m) => {
//     obj[String(m._id)] = m.lastMessage;
//   });

//   setLastMsgs(obj);
// };


//   useEffect(() => {
//     if (!user) return;
//     fetchUsers();
//     fetchUnread();
//     fetchLastMsgs(); 
//   }, [user]);

//   useEffect(() => {
//     if (!socket) return;

//     socket.on("online_users", (list) => {
//       // 🔥 FORCE STRING IDS
//       setOnlineUsers(list.map((id) => String(id)));
//     });

//     socket.on("chat_history", (msgs) => {
//       setMessages(msgs);
//     });

//    socket.on("private_message", async (msg) => {
//   // 🔥 only refresh unread if I am receiver
//   if (msg.receiver === user.id) {
//     await fetchUnread();
//   }

//   if (
//     selectedUser &&
//     (msg.sender === selectedUser._id || msg.receiver === selectedUser._id)
//   ) {
//     setMessages((prev) => [...prev, msg]);

//     if (msg.sender === selectedUser._id) {
//       socket.emit("mark_seen", { fromUserId: selectedUser._id });
//     }
//   }
// });


//     socket.on("typing", ({ from }) => {
//       if (selectedUser && from === selectedUser._id) setTyping(true);
//     });

//     socket.on("stop_typing", ({ from }) => {
//       if (selectedUser && from === selectedUser._id) { setTimeout(() => setTyping(false), 3000);}
//     });

//     socket.on("messages_seen", () => {
//       setMessages((prev) =>
//         prev.map((m) =>
//           m.sender === user.id ? { ...m, status: "seen" } : m
//         )
//       );
//     });

//     return () => {
//       socket.off("online_users");
//       socket.off("chat_history");
//       socket.off("private_message");
//       socket.off("typing");
//       socket.off("stop_typing");
//       socket.off("messages_seen");
//     };
//   }, [socket, selectedUser, user]);

//   const openChat = (u) => {
//     setSelectedUser(u);
//     socket.emit("load_chat", { withUserId: u._id });
//     socket.emit("mark_seen", { fromUserId: u._id });
//     setTimeout(() => {
//     fetchUnread();
//   }, 400);
//   };

//   return (
//     <div className="h-screen flex bg-[#efeae2]">
//       <Sidebar
//         users={users}
//         openChat={openChat}
//         unread={unread}
//         onlineUsers={onlineUsers}
//         lastMsgs={lastMsgs}
//       />

//       <div className="flex-1 flex flex-col">
//         {selectedUser ? (
//           <>
//             <ChatHeader user={selectedUser} typing={typing} onlineUsers={onlineUsers} />
//             <MessageList messages={messages} me={user.id} />
//             <MessageInput toUser={selectedUser} />
//           </>
//         ) : (
//           <div className="flex-1 flex justify-center items-center text-gray-500">
//             Select a chat
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





// import { useContext, useEffect, useState } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { SocketContext } from "../context/SocketContext";
// import Sidebar from "../components/Sidebar";
// import ChatHeader from "../components/ChatHeader";
// import MessageList from "../components/MessageList";
// import MessageInput from "../components/MessageInput";
// import { api } from "../services/api";

// export default function Chat() {
//   const { user, token } = useContext(AuthContext);
//   const { socket } = useContext(SocketContext);

//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [typing, setTyping] = useState(false);
//   const [unread, setUnread] = useState({});
//   const [onlineUsers, setOnlineUsers] = useState([]);

//   const fetchUsers = async () => {
//     const res = await api.get("/users", {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setUsers(res.data.filter((u) => u._id !== user.id));
//   };

//   const fetchUnread = async () => {
//     const res = await api.get("/messages/unread", {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const obj = {};
//     res.data.forEach((u) => {
//       obj[u._id] = u.count;
//     });

//     setUnread(obj);
//   };

//   useEffect(() => {
//     fetchUsers();
//     fetchUnread(); // 🔥 load unread from DB
//   }, []);

//   useEffect(() => {
//     if (!socket) return;

//     socket.on("online_users", (list) => {
//       setOnlineUsers(list);
//       fetchUsers();
//     });

//     socket.on("chat_history", (msgs) => {
//       setMessages(msgs);
//     });

//     socket.on("private_message", (msg) => {
//       if (
//         selectedUser &&
//         (msg.sender === selectedUser._id || msg.receiver === selectedUser._id)
//       ) {
//         setMessages((prev) => [...prev, msg]);

//         if (msg.sender === selectedUser._id) {
//           socket.emit("mark_seen", { fromUserId: selectedUser._id });
//         }
//       } else {
//         const otherUser =
//           msg.sender === user.id ? msg.receiver : msg.sender;

//         setUnread((prev) => ({
//           ...prev,
//           [otherUser]: (prev[otherUser] || 0) + 1,
//         }));
//       }
//     });

//     socket.on("typing", ({ from }) => {
//       if (selectedUser && from === selectedUser._id) setTyping(true);
//     });

//     socket.on("stop_typing", ({ from }) => {
//       if (selectedUser && from === selectedUser._id) setTyping(false);
//     });

//     socket.on("messages_seen", () => {
//       setMessages((prev) =>
//         prev.map((m) =>
//           m.sender === user.id ? { ...m, status: "seen" } : m
//         )
//       );
//     });

//     return () => {
//       socket.off("online_users");
//       socket.off("chat_history");
//       socket.off("private_message");
//       socket.off("typing");
//       socket.off("stop_typing");
//       socket.off("messages_seen");
//     };
//   }, [socket, selectedUser]);

//   const openChat = (u) => {
//     setSelectedUser(u);
//     setUnread((prev) => ({ ...prev, [u._id]: 0 }));
//     socket.emit("load_chat", { withUserId: u._id });
//     socket.emit("mark_seen", { fromUserId: u._id });
//   };

//   return (
//     <div className="h-screen flex bg-[#efeae2]">
//       <Sidebar
//         users={users}
//         openChat={openChat}
//         unread={unread}
//         onlineUsers={onlineUsers}
//       />

//       <div className="flex-1 flex flex-col">
//         {selectedUser ? (
//           <>
//             <ChatHeader user={selectedUser} typing={typing} />
//             <MessageList messages={messages} me={user.id} />
//             <MessageInput toUser={selectedUser} />
//           </>
//         ) : (
//           <div className="flex-1 flex justify-center items-center text-gray-500">
//             Select a chat
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




// import { useContext, useEffect, useState } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { SocketContext } from "../context/SocketContext";
// import Sidebar from "../components/Sidebar";
// import ChatHeader from "../components/ChatHeader";
// import MessageList from "../components/MessageList";
// import MessageInput from "../components/MessageInput";
// import { api } from "../services/api";

// export default function Chat() {
//   const { user, token } = useContext(AuthContext);
//   const { socket } = useContext(SocketContext);

//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [typing, setTyping] = useState(false);
//   const [unread, setUnread] = useState({});
//   const [onlineUsers, setOnlineUsers] = useState([]);

//   const fetchUsers = async () => {
//     const res = await api.get("/users", {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setUsers(res.data.filter((u) => u._id !== user.id));
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   useEffect(() => {
//     if (!socket) return;

//     socket.on("online_users", (list) => {
//       setOnlineUsers(list);
//       fetchUsers();
//     });

//     socket.on("chat_history", (msgs) => {
//       setMessages(msgs);
//     });

//     socket.on("private_message", (msg) => {
//       // CASE 1: message from selected user
//       if (
//         selectedUser &&
//         (msg.sender === selectedUser._id || msg.receiver === selectedUser._id)
//       ) {
//         setMessages((prev) => [...prev, msg]);

//         if (msg.sender === selectedUser._id) {
//           socket.emit("mark_seen", { fromUserId: selectedUser._id });
//         }
//       } else {
//         // unread for other chats
//         const otherUser =
//           msg.sender === user.id ? msg.receiver : msg.sender;

//         setUnread((prev) => ({
//           ...prev,
//           [otherUser]: (prev[otherUser] || 0) + 1,
//         }));
//       }
//     });

//     socket.on("typing", ({ from }) => {
//       if (selectedUser && from === selectedUser._id) setTyping(true);
//     });

//     socket.on("stop_typing", ({ from }) => {
//       if (selectedUser && from === selectedUser._id) setTyping(false);
//     });

//     socket.on("messages_seen", () => {
//       setMessages((prev) =>
//         prev.map((m) =>
//           m.sender === user.id ? { ...m, status: "seen" } : m
//         )
//       );
//     });

//     return () => {
//       socket.off("online_users");
//       socket.off("chat_history");
//       socket.off("private_message");
//       socket.off("typing");
//       socket.off("stop_typing");
//       socket.off("messages_seen");
//     };
//   }, [socket, selectedUser]);

//   const openChat = (u) => {
//     setSelectedUser(u);
//     setUnread((prev) => ({ ...prev, [u._id]: 0 }));
//     socket.emit("load_chat", { withUserId: u._id });
//     socket.emit("mark_seen", { fromUserId: u._id });
//   };

//   return (
//     <div className="h-screen flex bg-[#efeae2]">
//       <Sidebar
//         users={users}
//         openChat={openChat}
//         unread={unread}
//         onlineUsers={onlineUsers}
//       />

//       <div className="flex-1 flex flex-col">
//         {selectedUser ? (
//           <>
//             <ChatHeader user={selectedUser} typing={typing} />
//             <MessageList messages={messages} me={user.id} />
//             <MessageInput toUser={selectedUser} />
//           </>
//         ) : (
//           <div className="flex-1 flex justify-center items-center text-gray-500">
//             Select a chat
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



// import { useContext, useEffect, useState } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { SocketContext } from "../context/SocketContext";
// import Sidebar from "../components/Sidebar";
// import ChatHeader from "../components/ChatHeader";
// import MessageList from "../components/MessageList";
// import MessageInput from "../components/MessageInput";
// import { api } from "../services/api";

// export default function Chat() {
//   const { user, token } = useContext(AuthContext);
//   const { socket } = useContext(SocketContext);

//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [typing, setTyping] = useState(false);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       const res = await api.get("/users", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setUsers(res.data.filter((u) => u._id !== user.id));
//     };
//     fetchUsers();
//   }, []);

//   useEffect(() => {
//     if (!socket) return;

//     socket.on("chat_history", (msgs) => setMessages(msgs));
//     socket.on("private_message", (msg) =>
//       setMessages((prev) => [...prev, msg])
//     );

//     socket.on("typing", () => setTyping(true));
//     socket.on("stop_typing", () => setTyping(false));

//     socket.on("messages_seen", () => {
//       setMessages((prev) =>
//         prev.map((m) =>
//           m.sender === user.id ? { ...m, status: "seen" } : m
//         )
//       );
//     });

//     return () => {
//       socket.off("chat_history");
//       socket.off("private_message");
//       socket.off("typing");
//       socket.off("stop_typing");
//       socket.off("messages_seen");
//     };
//   }, [socket]);

//   useEffect(() => {
//     if (socket && selectedUser) {
//       socket.emit("mark_seen", { fromUserId: selectedUser._id });
//     }
//   }, [selectedUser]);

//   return (
//     <div className="h-screen flex bg-[#efeae2]">
//       <Sidebar users={users} setSelectedUser={setSelectedUser} />
//       <div className="flex-1 flex flex-col">
//         {selectedUser ? (
//           <>
//             <ChatHeader user={selectedUser} typing={typing} />
//             <MessageList messages={messages} me={user.id} />
//             <MessageInput toUser={selectedUser} />
//           </>
//         ) : (
//           <div className="flex-1 flex justify-center items-center text-gray-500">
//             Select a chat
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
