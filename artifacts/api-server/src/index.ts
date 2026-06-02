import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { logger } from "./lib/logger";
import { verifyToken } from "./lib/jwt";
import { setIO } from "./socketInstance";
import { ensureDemoUsers } from "./lib/ensure-demo-users";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  path: "/ws/socket.io",
  cors: { origin: true, credentials: true },
});

// Make IO accessible from routes
setIO(io);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) { next(new Error("No token provided")); return; }
  try {
    const payload = verifyToken(token);
    (socket as any).userId = payload.userId;
    (socket as any).userRole = payload.role;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = (socket as any).userId as number;
  const userRole = (socket as any).userRole as string;

  logger.info({ userId }, "Socket connected");
  socket.join(`user:${userId}`);
  if (userRole === "admin") socket.join("admin");

  socket.on("join_conversation", (conversationId: number) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on("leave_conversation", (conversationId: number) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on("send_message", (data: { conversationId: number; content: string; fileUrl?: string }) => {
    io.to(`conversation:${data.conversationId}`).emit("new_message", {
      conversationId: data.conversationId,
      senderId: userId,
      content: data.content,
      fileUrl: data.fileUrl ?? null,
      createdAt: new Date().toISOString(),
    });
    io.to("admin").emit("new_message_notification", { conversationId: data.conversationId });
  });

  socket.on("typing", (data: { conversationId: number }) => {
    socket.to(`conversation:${data.conversationId}`).emit("typing", { userId });
  });

  socket.on("stop_typing", (data: { conversationId: number }) => {
    socket.to(`conversation:${data.conversationId}`).emit("stop_typing", { userId });
  });

  socket.on("disconnect", () => {
    logger.info({ userId }, "Socket disconnected");
  });
});

export { io };

httpServer.listen(port, (err?: Error) => {
  if (err) { logger.error({ err }, "Error listening on port"); process.exit(1); }
  logger.info({ port }, "Server listening");
});

// Ensure demo users exist after startup (non-blocking)
ensureDemoUsers();
