import { useContext, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export default function ProfilePanel({ onClose }) {
  const { user, token, setUser } = useContext(AuthContext);
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmPassword, setConfirm] = useState("");

  const uploadAvatar = async (file) => {
    const form = new FormData();
    form.append("avatar", file);

    const res = await api.post("/profile/avatar", form, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUser({ ...user, avatar: res.data.avatar });
  };

  const changePassword = async () => {
    await api.post(
      "/profile/change-password",
      { oldPassword, newPassword, confirmPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Password changed");
  };

  return (
    <div className="w-3/4 bg-[#efeae2] h-screen p-6">
      <button onClick={onClose} className="text-green-600 mb-4">
        ← Back to chat
      </button>

      <div className="bg-white p-6 rounded shadow w-87.5">
        <div className="flex flex-col items-center">
          <img
            src={
              preview
                ? preview
                : `${import.meta.env.VITE_BACKEND_URL}${user.avatar}`
            }
            className="w-32 h-32 rounded-full object-cover border"
          />

          <button
            onClick={() => fileRef.current.click()}
            className="mt-2 text-green-600"
          >
            Change profile picture
          </button>

          <input
            type="file"
            hidden
            ref={fileRef}
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              setPreview(URL.createObjectURL(file));
              uploadAvatar(file);
            }}
          />

          <p className="mt-3 font-bold">{user.username}</p>
        </div>

        <div className="mt-6 space-y-2">
          <input
            placeholder="Old password"
            type="password"
            className="border p-2 w-full"
            onChange={(e) => setOld(e.target.value)}
          />
          <input
            placeholder="New password"
            type="password"
            className="border p-2 w-full"
            onChange={(e) => setNew(e.target.value)}
          />
          <input
            placeholder="Confirm password"
            type="password"
            className="border p-2 w-full"
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button
            onClick={changePassword}
            className="bg-blue-500 text-white w-full py-2 rounded"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}



// import { useContext, useRef, useState } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { api } from "../services/api";

// export default function ProfilePanel({ onClose }) {
//   const { user, token, setUser } = useContext(AuthContext);
//   const fileRef = useRef();
//   const [preview, setPreview] = useState(null);
//   const [oldPassword, setOld] = useState("");
//   const [newPassword, setNew] = useState("");
//   const [confirmPassword, setConfirm] = useState("");

//   const uploadAvatar = async (file) => {
//     const form = new FormData();
//     form.append("avatar", file);

//     const res = await api.post("/profile/avatar", form, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     // ✅ update context user (real-time everywhere)
//     setUser({ ...user, avatar: res.data.avatar });
//   };

//   const changePassword = async () => {
//     await api.post(
//       "/profile/change-password",
//       { oldPassword, newPassword, confirmPassword },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     alert("Password changed");
//   };

//   return (
//     <div className="w-3/4 bg-[#efeae2] h-screen p-6">
//       <button onClick={onClose} className="text-green-600 mb-4">
//         ← Back to chat
//       </button>

//       <div className="bg-white p-6 rounded shadow w-[350px]">
//         <div className="flex flex-col items-center">
//           <img
//             src={
//               preview
//                 ? preview
//                 : `http://localhost:5000${user.avatar}`
//             }
//             className="w-32 h-32 rounded-full object-cover border"
//           />

//           <button
//             onClick={() => fileRef.current.click()}
//             className="mt-2 text-green-600"
//           >
//             Change profile picture
//           </button>

//           <input
//             type="file"
//             hidden
//             ref={fileRef}
//             onChange={(e) => {
//               const file = e.target.files[0];
//               if (!file) return;
//               setPreview(URL.createObjectURL(file));
//               uploadAvatar(file);
//             }}
//           />

//           <p className="mt-3 font-bold">{user.username}</p>
//         </div>

//         <div className="mt-6 space-y-2">
//           <input
//             placeholder="Old password"
//             type="password"
//             className="border p-2 w-full"
//             onChange={(e) => setOld(e.target.value)}
//           />
//           <input
//             placeholder="New password"
//             type="password"
//             className="border p-2 w-full"
//             onChange={(e) => setNew(e.target.value)}
//           />
//           <input
//             placeholder="Confirm password"
//             type="password"
//             className="border p-2 w-full"
//             onChange={(e) => setConfirm(e.target.value)}
//           />
//           <button
//             onClick={changePassword}
//             className="bg-blue-500 text-white w-full py-2 rounded"
//           >
//             Change Password
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



