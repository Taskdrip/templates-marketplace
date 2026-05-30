import type { Server as SocketIOServer } from "socket.io";

let _io: SocketIOServer | null = null;

export function setIO(io: SocketIOServer) {
  _io = io;
}

export function getIO(): SocketIOServer {
  if (!_io) throw new Error("Socket.IO not initialized");
  return _io;
}
