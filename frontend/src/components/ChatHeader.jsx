import { useState } from "react";

export default function ChatHeader({ user, typing ,onlineUsers}) {
  const [open,setOpen] = useState(false);
  const isOnline = onlineUsers.includes(String(user._id));
  return (
    <div className="p-3 bg-white border-b flex items-center gap-3">

      <div className="h-10 w-10 bg-white rounded-full" onClick={()=>{setOpen(true)}}>
        <img
              src={`http://localhost:5000${user.avatar}`}
              className="w-10 h-10 rounded-full object-cover"
        />
      </div>

      {/* Full screen preview */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 flex items-top justify-center z-50"
          onClick={() => setOpen(false)} // outside click
        >
          <img
            src={`http://localhost:5000${user.avatar}`}
            className="w-72 h-72 md:w-96 md:h-96 object-cover"
            onClick={(e) => e.stopPropagation()} // image pe click = close na ho
          />
        </div>
      )}

      <div>
        <p className="font-bold">{user.username}</p>
        {typing ? (
          <p className="text-sm text-blue-400">typing...</p>
        ) : isOnline ? (
          <p className="text-sm text-green-300">online</p>
        ) : (
          <p className="text-sm text-gray-400">offline</p>
        )}
      </div>
    </div>
  );
}

