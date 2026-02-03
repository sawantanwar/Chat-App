import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export default function Profile({ onBack }) {
  const { user, token, setUser } = useContext(AuthContext);
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [file, setFile] = useState(null);

  const changeAvatar = async () => {
    const form = new FormData();
    form.append("avatar", file);
    const res = await api.post("/profile/avatar", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser({ ...user, avatar: res.data.avatar });
    alert("Profile picture updated");
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
    <div className="h-screen w-full bg-[#efeae2] flex justify-center items-center">
      <div className="bg-white w-100 rounded shadow p-6">
        <button onClick={onBack} className="text-green-600 mb-3">← Back</button>

        <div className="flex flex-col items-center">
          <img
            src={`http://localhost:5000${user.avatar}`}
            onError={(e)=> e.target.src="https://i.pravatar.cc/150"}
            className="w-32 h-32 rounded-full object-cover border"
          />
          <p className="mt-2 font-bold">{user.username}</p>

          <input type="file" onChange={(e)=>setFile(e.target.files[0])} />
          <button onClick={changeAvatar} className="bg-green-500 text-white px-4 py-1 mt-2 rounded">
            Change DP
          </button>
        </div>

        <div className="mt-6 space-y-2">
          <input placeholder="Old password" type="password" className="border p-2 w-full" onChange={(e)=>setOld(e.target.value)} />
          <input placeholder="New password" type="password" className="border p-2 w-full" onChange={(e)=>setNew(e.target.value)} />
          <input placeholder="Confirm password" type="password" className="border p-2 w-full" onChange={(e)=>setConfirm(e.target.value)} />
          <button onClick={changePassword} className="bg-blue-500 text-white w-full py-2 rounded">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
