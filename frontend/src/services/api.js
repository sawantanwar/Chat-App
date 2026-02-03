import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api",
});



// import axios from "axios";

// export const api = axios.create({
//   baseURL: "http://localhost:5000/api",
// });
