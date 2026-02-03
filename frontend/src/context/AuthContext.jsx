import { createContext, useState } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    setUser(res.data.user);
    setToken(res.data.token);
  };

  const register = async (username, password) => {
    await api.post("/auth/register", { username, password });
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};




// import { createContext, useState } from "react";
// import { api } from "../services/api";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);

//   const login = async (username, password) => {
//     const res = await api.post("/auth/login", { username, password });
//     setUser(res.data.user);
//     setToken(res.data.token);
//   };

//   const register = async (username, password) => {
//     await api.post("/auth/register", { username, password });
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, setUser, login, register }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };



// import { createContext, useState } from "react";
// import { api } from "../services/api";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);

//   const login = async (username, password) => {
//     const res = await api.post("/auth/login", { username, password });
//     setUser(res.data.user);
//     setToken(res.data.token);
//   };

//   const register = async (username, password) => {
//     await api.post("/auth/register", { username, password });
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, register }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
