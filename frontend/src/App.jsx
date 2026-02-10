import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Chat from "./pages/Chat";

export default function App() {
  const { user } = useContext(AuthContext);

  if (!user) return <Login />;

  return <Chat />;
}
