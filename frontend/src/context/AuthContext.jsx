import { createContext, useState } from "react";
import { api } from "../services/api";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    setToken(res.data.token);
  };

  const register = async (username, password) => {
    await api.post("/auth/register", { username, password });
  };

    const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, login, register,logout }}>
      {children}
    </AuthContext.Provider>
  );
};
