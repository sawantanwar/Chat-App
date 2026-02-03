import { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../context/SocketContext";
import Picker from "emoji-picker-react";
import { Paperclip } from "lucide-react";

export default function MessageInput({ toUser }) {
  const { socket } = useContext(SocketContext);
  const [msg, setMsg] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef();
  const fileRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sendText = () => {
    if (!msg.trim()) return;
    socket.emit("private_message", {
      toUserId: toUser._id,
      message: msg,
      type: "text",
    });
    setMsg("");
  };

  const sendImage = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      socket.emit("private_message", {
        toUserId: toUser._id,
        message: reader.result,
        type: "image",
      });

      // 🔥 IMPORTANT FIX
      fileRef.current.value = ""; // allow same image again
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-3 bg-white border-t flex gap-2 items-center relative">
      <button onClick={() => setShowEmoji(!showEmoji)}>😊</button>

      {showEmoji && (
        <div ref={emojiRef} className="absolute bottom-14 left-2 z-10">
          <Picker onEmojiClick={(e) => setMsg((prev) => prev + e.emoji)} />
        </div>
      )}

      <label className="cursor-pointer">
        <Paperclip size={20} />
        <input
          ref={fileRef}
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => sendImage(e.target.files[0])}
        />
      </label>

      <input
        className="flex-1 border rounded p-2"
        placeholder="Type a message..."
        value={msg}
        onChange={(e) => {
          setMsg(e.target.value);
          socket.emit("typing", { toUserId: toUser._id });
          setTimeout(
            () => socket.emit("stop_typing", { toUserId: toUser._id }),
            800
          );
        }}
      />

      <button onClick={sendText} className="bg-green-500 text-white px-4 rounded">
        Send
      </button>
    </div>
  );
}





// import { useContext, useEffect, useRef, useState } from "react";
// import { SocketContext } from "../context/SocketContext";
// import Picker from "emoji-picker-react";
// import { Paperclip } from "lucide-react";

// export default function MessageInput({ toUser }) {
//   const { socket } = useContext(SocketContext);
//   const [msg, setMsg] = useState("");
//   const [showEmoji, setShowEmoji] = useState(false);
//   const emojiRef = useRef();

//   useEffect(() => {
//     const handler = (e) => {
//       if (emojiRef.current && !emojiRef.current.contains(e.target)) {
//         setShowEmoji(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const sendText = () => {
//     if (!msg.trim()) return;
//     socket.emit("private_message", {
//       toUserId: toUser._id,
//       message: msg,
//       type: "text",
//     });
//     setMsg("");
//   };

//   const sendImage = (file) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       socket.emit("private_message", {
//         toUserId: toUser._id,
//         message: reader.result, // base64
//         type: "image",
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   return (
//     <div className="p-3 bg-white border-t flex gap-2 items-center relative">
//       <button onClick={() => setShowEmoji(!showEmoji)}>😊</button>

//       {showEmoji && (
//         <div ref={emojiRef} className="absolute bottom-14 left-2 z-10">
//           <Picker onEmojiClick={(e) => setMsg((prev) => prev + e.emoji)} />
//         </div>
//       )}

//       <label className="cursor-pointer">
//         <Paperclip size={20} />
//         <input
//           type="file"
//           hidden
//           accept="image/*"
//           onChange={(e) => sendImage(e.target.files[0])}
//         />
//       </label>

//       <input
//         className="flex-1 border rounded p-2"
//         placeholder="Type a message..."
//         value={msg}
//         onChange={(e) => {
//           setMsg(e.target.value);
//           socket.emit("typing", { toUserId: toUser._id });
//           setTimeout(
//             () => socket.emit("stop_typing", { toUserId: toUser._id }),
//             800
//           );
//         }}
//       />

//       <button onClick={sendText} className="bg-green-500 text-white px-4 rounded">
//         Send
//       </button>
//     </div>
//   );
// }






// import { useContext, useEffect, useRef, useState } from "react";
// import { SocketContext } from "../context/SocketContext";
// import Picker from "emoji-picker-react";
// import { Paperclip } from "lucide-react";

// export default function MessageInput({ toUser }) {
//   const { socket } = useContext(SocketContext);
//   const [msg, setMsg] = useState("");
//   const [showEmoji, setShowEmoji] = useState(false);
//   const emojiRef = useRef();

//   useEffect(() => {
//     const handler = (e) => {
//       if (emojiRef.current && !emojiRef.current.contains(e.target)) {
//         setShowEmoji(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const sendMessage = () => {
//     if (!msg.trim()) return;
//     socket.emit("private_message", {
//       toUserId: toUser._id,
//       message: msg,
//     });
//     setMsg("");
//   };

//   return (
//     <div className="p-3 bg-white border-t flex gap-2 items-center relative">
//       <button onClick={() => setShowEmoji(!showEmoji)}>😊</button>

//       {showEmoji && (
//         <div ref={emojiRef} className="absolute bottom-14 left-2 z-10">
//           <Picker onEmojiClick={(e) => setMsg((prev) => prev + e.emoji)} />
//         </div>
//       )}

//       <label className="cursor-pointer">
//         <Paperclip size={20} />
//         <input type="file" hidden />
//       </label>

//       <input
//         className="flex-1 border rounded p-2"
//         placeholder="Type a message..."
//         value={msg}
//         onChange={(e) => {
//           setMsg(e.target.value);
//           socket.emit("typing", { toUserId: toUser._id });
//           setTimeout(() => socket.emit("stop_typing", { toUserId: toUser._id }), 800);
//         }}
//       />

//       <button onClick={sendMessage} className="bg-green-500 text-white px-4 rounded">
//         Send
//       </button>
//     </div>
//   );
// }


