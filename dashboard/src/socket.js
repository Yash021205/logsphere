import { io } from "socket.io-client";
export const socket = io("http://localhost:5000");

socket.on("connect", () => {
  const token = localStorage.getItem("token");
  if (token) {
    socket.emit("authenticate", token);
  }
});
