import { io } from "socket.io-client";

export const connectSocket = (token) => {
  return io(import.meta.env.VITE_BACKEND_URL, {
    auth: { token },
    transports: ["websocket"],
  });
};



// import { io } from "socket.io-client";

// export const connectSocket = (token) => {
//   return io("http://localhost:5000", {
//     auth: { token },
//   });
// };
