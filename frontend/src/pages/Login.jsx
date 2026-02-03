import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login, register } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async () => {
    if (isRegister) {
      await register(username, password);
      alert("Registered! Now login.");
      setIsRegister(false);
    } else {
      await login(username, password);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-200">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4 text-center">
          {isRegister ? "Register" : "Login"}
        </h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="border p-2 w-full mb-2"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white w-full py-2 rounded"
        >
          {isRegister ? "Register" : "Login"}
        </button>

        <p
          className="text-sm text-center mt-2 cursor-pointer text-blue-500"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Already have account?" : "Create new account"}
        </p>
      </div>
    </div>
  );
}
