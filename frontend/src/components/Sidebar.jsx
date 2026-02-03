import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ProfilePanel from "./ProfilePanel";

export default function Sidebar({ users, openChat, unread, onlineUsers, lastMsgs }) {
  const { user, setUser } = useContext(AuthContext);
  const [showProfile, setShowProfile] = useState(false);

  const logout = () => {
    setUser(null);
    window.location.reload();
  };

  return (
    <>
      <div className="w-1/4 bg-white border-r flex flex-col">
        {/* HEADER */}
        <div className="p-3 bg-green-600 text-white flex items-center justify-between">
          <div
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img
              src={`http://localhost:5000${user.avatar}`}
              className="w-10 h-10 rounded-full object-cover bg-white"
            />
            <span className="font-medium">{user.username}</span>
          </div>
          <button onClick={logout}>Logout</button>
        </div>

        {/* USER LIST */}
        <div className="flex-1 overflow-y-auto">
          {users.map((u) => {
            const isOnline = onlineUsers.includes(String(u._id));
            const last = lastMsgs[String(u._id)];

            return (
              <div
                key={u._id}
                onClick={() => openChat(u)}
                className="flex items-center gap-3 px-3 py-3 border-b hover:bg-gray-100 cursor-pointer"
              >
                {/* USER DP */}
                <img
                  src={
                    u.avatar
                      ? `http://localhost:5000${u.avatar}`
                      : "http://localhost:5000/uploads/default_profile.png"
                  }
                  className="w-12 h-12 rounded-full object-cover"
                  alt="dp"
                />

                {/* NAME + LAST MSG */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{u.username}</span>
                      {isOnline && (
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </div>

                    {last && (
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(last.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 truncate">
                      {last
                        ? last.type === "image"
                          ? "📷 Photo"
                          : last.content
                        : "No messages"}
                    </span>

                    {unread[String(u._id)] > 0 && (
                      <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs ml-2">
                        {unread[String(u._id)]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
    </>
  );
}





// import { useState, useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import ProfilePanel from "./ProfilePanel";

// export default function Sidebar({ users, openChat, unread, onlineUsers, lastMsgs }) {
//   const { user, setUser } = useContext(AuthContext);
//   const [showProfile, setShowProfile] = useState(false);

//   const logout = () => {
//     setUser(null);
//     window.location.reload();
//   };

//   return (
//     <>
//       <div className="w-1/4 bg-white border-r flex flex-col">
//         <div className="p-3 bg-green-600 text-white flex items-center justify-between">
//           <div
//             onClick={() => setShowProfile(true)}
//             className="flex items-center gap-2 cursor-pointer"
//           >
//             <img
//               src={`http://localhost:5000${user.avatar}`}
//               className="w-10 h-10 rounded-full object-cover bg-white"
//             />
//             <span>{user.username}</span>
//           </div>
//           <button onClick={logout}>Logout</button>
//         </div>

//         {users.map((u) => {
//           const isOnline = onlineUsers.includes(String(u._id));
//           const last = lastMsgs[String(u._id)];

//           return (
//             <div
//               key={u._id}
//               onClick={() => openChat(u)}
//               className="p-3 border-b hover:bg-gray-100 cursor-pointer flex gap-3"
//             >
//               {/* USER DP */}
//       <img
//         src={
//           u.avatar
//             ? `http://localhost:5000${u.avatar}`
//             : "http://localhost:5000/uploads/default_profile.png"
//         }
//         className="w-12 h-12 rounded-full object-cover"
//         alt="dp"
//       />
//               <div className="flex justify-between">
//                 <div>
//                 <span className="font-medium mr-4">{u.username}</span>
//                 {isOnline && (
//                 <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1"></span>
//                 )}
//                 </div>
//                 <div>
//                   {last && (
//                   <span className="text-xs text-gray-500">
//                     {new Date(last.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                   </span>
//                 )}
//                 </div>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-500 truncate max-w-40">
//                   {last
//                     ? last.type === "image"
//                       ? "📷 Photo"
//                       : last.content
//                     : "No messages"}
//                 </span>
                
//                 {unread[String(u._id)] > 0 && (
//                   <span className="bg-green-500 text-white px-2 rounded-full text-xs">
//                     {unread[String(u._id)]}
//                   </span>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
//     </>
//   );
// }




// import { useState, useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import ProfilePanel from "./ProfilePanel";

// export default function Sidebar({ users, openChat, unread, onlineUsers }) {
//   const { user, setUser } = useContext(AuthContext);
//   const [showProfile, setShowProfile] = useState(false);

//   const logout = () => {
//     setUser(null);
//     window.location.reload();
//   };

//   return (
//     <>
//       <div className="w-1/4 bg-white border-r flex flex-col">
//         <div className="p-3 bg-green-600 text-white flex items-center justify-between">
//           <div
//             onClick={() => setShowProfile(true)}
//             className="flex items-center gap-2 cursor-pointer"
//           >
//             <img
//               src={`http://localhost:5000${user.avatar}`}
//               className="w-10 h-10 rounded-full object-cover bg-white"
//             />
//             <span>{user.username}</span>
//           </div>
//           <button onClick={logout}>Logout</button>
//         </div>

//         {users.map((u) => {
//           const isOnline = onlineUsers.includes(String(u._id));

//           return (
//             <div
//               key={u._id}
//               onClick={() => openChat(u)}
//               className="p-3 border-b hover:bg-gray-100 cursor-pointer flex justify-between items-center"
//             >
//               <div className="flex items-center gap-2">
//                 <span>{u.username}</span>
//                 {isOnline && (
//                   <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                 )}
//               </div>

//               {unread[String(u._id)] > 0 && (
//                 <span className="bg-green-500 text-white px-2 rounded-full text-xs">
//                   {unread[String(u._id)]}
//                 </span>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
//     </>
//   );
// }





// import { useState, useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import ProfilePanel from "./ProfilePanel";

// export default function Sidebar({ users, openChat, unread, onlineUsers }) {
//   const { user, setUser } = useContext(AuthContext);
//   const [showProfile, setShowProfile] = useState(false);

//   const logout = () => {
//     setUser(null);
//     window.location.reload();
//   };

//   return (
//     <>
//       <div className="w-1/4 bg-white border-r flex flex-col">
//         <div className="p-3 bg-green-600 text-white flex items-center justify-between">
//           <div
//             onClick={() => setShowProfile(true)}
//             className="flex items-center gap-2 cursor-pointer"
//           >
//             <img
//               src={`http://localhost:5000${user.avatar}`}
//               className="w-10 h-10 rounded-full object-cover bg-white"
//             />
//             <span>{user.username}</span>
//           </div>
//           <button onClick={logout}>Logout</button>
//         </div>

//         {users.map((u) => (
//           <div
//             key={u._id}
//             onClick={() => openChat(u)}
//             className="p-3 border-b hover:bg-gray-100 cursor-pointer flex justify-between"
//           >
//             <span>{u.username}</span>
//             {unread[u._id] > 0 && (
//               <span className="bg-green-500 text-white px-2 rounded-full text-xs">
//                 {unread[u._id]}
//               </span>
//             )}
//           </div>
//         ))}
//       </div>

//       {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
//     </>
//   );
// }



// import { useState, useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import ProfilePanel from "./ProfilePanel";

// export default function Sidebar({ users, openChat, unread, onlineUsers }) {
//   const { user, setUser } = useContext(AuthContext);
//   const [showProfile, setShowProfile] = useState(false);

//   const logout = () => {
//     setUser(null);
//     window.location.reload();
//   };

//   return (
//     <>
//       <div className="w-1/4 bg-white border-r flex flex-col">
//         <div className="p-3 bg-green-600 text-white flex items-center justify-between">
//           <div
//             onClick={() => setShowProfile(true)}
//             className="flex items-center gap-2 cursor-pointer"
//           >
//             <img
//               src={`http://localhost:5000${user.avatar}`}
//               className="w-10 h-10 rounded-full object-cover bg-white"
//             />
//             <span>{user.username}</span>
//           </div>
//           <button onClick={logout}>Logout</button>
//         </div>

//         {users.map((u) => (
//           <div
//             key={u._id}
//             onClick={() => openChat(u)}
//             className="p-3 border-b hover:bg-gray-100 cursor-pointer flex justify-between"
//           >
//             <span>{u.username}</span>
//             {unread[u._id] > 0 && (
//               <span className="bg-green-500 text-white px-2 rounded-full text-xs">
//                 {unread[u._id]}
//               </span>
//             )}
//           </div>
//         ))}
//       </div>

//       {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
//     </>
//   );
// }

