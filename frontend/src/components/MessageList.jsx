import { useState, useEffect, useRef, useContext } from "react";
import { Check, CheckCheck } from "lucide-react";
import { SocketContext } from "../context/SocketContext";

export default function MessageList({ messages, me }) {
  const { socket } = useContext(SocketContext);
  const [openImg, setOpenImg] = useState(null);
  const [menu, setMenu] = useState(null); // {x,y,message}
  const bottomRef = useRef(null);

  const handleDelete = (msg, mode) => {
  if (mode === "me") {
    socket.emit("delete_message_me", { messageId: msg._id });
  } else {
    socket.emit("delete_message_everyone", { messageId: msg._id });
  }
  setMenu(null);
};


  // 🔥 Auto scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://i.pinimg.com/originals/d3/6b/cc/d36bcceceaa1d390489ec70d93154311.jpg')]">
        {messages
          .filter((m) => !m._deletedForMe)
          .map((m) => {
            const isMe = m.sender === me;

            return (
              <div
                key={m._id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenu({
                    x: e.pageX,
                    y: e.pageY,
                    message: m,
                  });
                }}
                className={`max-w-xs p-2 rounded shadow cursor-pointer ${
                  isMe ? "bg-[#dcf8c6] ml-auto" : "bg-white"
                }`}
              >
                {m.type === "image" ? (
                  <img
                    src={m.content}
                    className="rounded max-w-50 cursor-pointer hover:opacity-80"
                    onClick={() => setOpenImg(m.content)}
                  />
                ) : (
                  <p
                    className={
                      m.type === "deleted"
                        ? "italic text-gray-500"
                        : ""
                    }
                  >
                    {m.content}
                  </p>
                )}

                <div className="flex justify-end items-center gap-1">
                  <span className="text-[10px] text-gray-500">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </span>

                  {isMe && (
                    <>
                      {m.status === "sent" && <Check size={14} />}
                      {m.status === "delivered" && <CheckCheck size={14} />}
                      {m.status === "seen" && (
                        <CheckCheck size={14} className="text-blue-500" />
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}

        <div ref={bottomRef}></div>
      </div>

      {/* CONTEXT MENU */}
      {menu && (
        <div
          className="fixed bg-white shadow rounded text-sm z-50"
          style={{ top: menu.y, left: menu.x }}
        >
          <div
            onClick={() => {
              navigator.clipboard.writeText(menu.message.content);
              setMenu(null);
            }}
            className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
          >
            Copy
          </div>

          <div
            onClick={() => handleDelete(menu.message, "me")}
            className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
          >
            Delete for me
          </div>

          <div
            onClick={() => handleDelete(menu.message, "everyone")}
            className="px-3 py-1 hover:bg-gray-100 cursor-pointer text-red-500"
          >
            Delete for everyone
          </div>
        </div>
      )}

      {/* FULL SCREEN IMAGE PREVIEW */}
      {openImg && (
        <div
          className="fixed inset-0 bg-black/85 flex justify-center items-center z-50"
          onClick={() => setOpenImg(null)}
        >
          <img
            src={openImg}
            className="max-w-[90%] max-h-[90%] rounded shadow"
          />
        </div>
      )}
    </>
  );
}





// import { useState, useEffect, useRef } from "react";
// import { Check, CheckCheck } from "lucide-react";

// export default function MessageList({ messages, me }) {
//   const [openImg, setOpenImg] = useState(null);
//   const bottomRef = useRef(null);

//   // 🔥 Auto scroll when messages change
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <>
//       <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://i.pinimg.com/originals/d3/6b/cc/d36bcceceaa1d390489ec70d93154311.jpg')]">
//         {messages.map((m, i) => {
//           const isMe = m.sender === me;

//           return (
//             <div
//               key={i}
//               className={`max-w-xs p-2 rounded shadow ${
//                 isMe ? "bg-[#dcf8c6] ml-auto" : "bg-white"
//               }`}
//             >
//               {m.type === "image" ? (
//                 <img
//                   src={m.content}
//                   className="rounded max-w-50 cursor-pointer hover:opacity-80"
//                   onClick={() => setOpenImg(m.content)}
//                 />
//               ) : (
//                 <p>{m.content}</p>
//               )}

//               <div className="flex justify-end items-center gap-1">
//                 <span className="text-[10px] text-gray-500">
//                   {new Date(m.createdAt).toLocaleTimeString()}
//                 </span>

//                 {isMe && (
//                   <>
//                     {m.status === "sent" && <Check size={14} />}
//                     {m.status === "delivered" && <CheckCheck size={14} />}
//                     {m.status === "seen" && (
//                       <CheckCheck size={14} className="text-blue-500" />
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//           );
//         })}

//         {/* 👇 invisible div to scroll into view */}
//         <div ref={bottomRef}></div>
//       </div>

//       {/* FULL SCREEN IMAGE PREVIEW */}
//       {openImg && (
//         <div
//           className="fixed inset-0 bg-black/85 flex justify-center items-center z-50"
//           onClick={() => setOpenImg(null)}
//         >
//           <img
//             src={openImg}
//             className="max-w-[90%] max-h-[90%] rounded shadow"
//           />
//         </div>
//       )}
//     </>
//   );
// }





// import { Check, CheckCheck } from "lucide-react";

// export default function MessageList({ messages, me }) {
//   return (
//     <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://i.pinimg.com/originals/d3/6b/cc/d36bcceceaa1d390489ec70d93154311.jpg')]">
//       {messages.map((m, i) => {
//         const isMe = m.sender === me;

//         return (
//           <div
//             key={i}
//             className={`max-w-xs p-2 rounded shadow ${
//               isMe ? "bg-[#dcf8c6] ml-auto" : "bg-white"
//             }`}
//           >
//             {m.type === "image" ? (
//               <img src={m.content} className="rounded max-w-[200px]" />
//             ) : (
//               <p>{m.content}</p>
//             )}

//             <div className="flex justify-end items-center gap-1">
//               <span className="text-[10px] text-gray-500">
//                 {new Date(m.createdAt).toLocaleTimeString()}
//               </span>

//               {isMe && (
//                 <>
//                   {m.status === "sent" && <Check size={14} />}
//                   {m.status === "delivered" && <CheckCheck size={14} />}
//                   {m.status === "seen" && (
//                     <CheckCheck size={14} className="text-blue-500" />
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }
