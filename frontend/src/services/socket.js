import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("token");

    socket = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });

    // DEBUG LOGS (DO NOT REMOVE UNTIL WORKING)
    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
    });
  }

  return socket;
};

