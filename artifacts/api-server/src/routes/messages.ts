import { Router } from "express";
import { db, conversationsTable, messagesTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/messages/conversations", requireAuth, async (req, res): Promise<void> => {
  let convs;
  if (req.userRole === "admin") {
    convs = await db.select().from(conversationsTable).orderBy(desc(conversationsTable.lastMessageAt));
  } else {
    convs = await db.select().from(conversationsTable)
      .where(eq(conversationsTable.userId, req.userId!))
      .orderBy(desc(conversationsTable.lastMessageAt));
  }

  const userIds = [...new Set(convs.map(c => c.userId))];
  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json(convs.map(c => ({
    id: c.id,
    userId: c.userId,
    username: userMap.get(c.userId)?.username ?? null,
    avatarUrl: userMap.get(c.userId)?.avatarUrl ?? null,
    subject: c.subject ?? null,
    lastMessage: c.lastMessage ?? null,
    lastMessageAt: c.lastMessageAt instanceof Date ? c.lastMessageAt.toISOString() : c.lastMessageAt ?? null,
    unreadCount: 0,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
  })));
});

router.post("/messages/start", requireAuth, async (req, res): Promise<void> => {
  const { subject } = req.body;

  const existing = await db.select().from(conversationsTable).where(eq(conversationsTable.userId, req.userId!));
  if (existing.length > 0) {
    const conv = existing[0];
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, conv.userId));
    res.status(201).json({
      id: conv.id,
      userId: conv.userId,
      username: user?.username ?? null,
      avatarUrl: user?.avatarUrl ?? null,
      subject: conv.subject ?? null,
      lastMessage: conv.lastMessage ?? null,
      lastMessageAt: conv.lastMessageAt instanceof Date ? conv.lastMessageAt.toISOString() : conv.lastMessageAt ?? null,
      unreadCount: 0,
      createdAt: conv.createdAt instanceof Date ? conv.createdAt.toISOString() : conv.createdAt,
    });
    return;
  }

  const [conv] = await db.insert(conversationsTable).values({
    userId: req.userId!,
    subject: subject ?? "Support Chat",
  }).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));

  res.status(201).json({
    id: conv.id,
    userId: conv.userId,
    username: user?.username ?? null,
    avatarUrl: user?.avatarUrl ?? null,
    subject: conv.subject ?? null,
    lastMessage: null,
    lastMessageAt: null,
    unreadCount: 0,
    createdAt: conv.createdAt instanceof Date ? conv.createdAt.toISOString() : conv.createdAt,
  });
});

router.get("/messages/:conversationId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
  const convId = parseInt(raw, 10);
  if (isNaN(convId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const msgs = await db.select().from(messagesTable)
    .where(eq(messagesTable.conversationId, convId))
    .orderBy(desc(messagesTable.createdAt));

  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json(msgs.reverse().map(m => ({
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderName: userMap.get(m.senderId)?.username ?? null,
    senderAvatar: userMap.get(m.senderId)?.avatarUrl ?? null,
    content: m.content,
    fileUrl: m.fileUrl ?? null,
    isRead: m.isRead === "true",
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
  })));
});

router.post("/messages/:conversationId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
  const convId = parseInt(raw, 10);
  if (isNaN(convId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { content, fileUrl } = req.body;
  if (!content) { res.status(400).json({ error: "Missing content" }); return; }

  const [msg] = await db.insert(messagesTable).values({
    conversationId: convId,
    senderId: req.userId!,
    content,
    fileUrl,
    isRead: "false",
  }).returning();

  await db.update(conversationsTable).set({
    lastMessage: content,
    lastMessageAt: new Date(),
  }).where(eq(conversationsTable.id, convId));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));

  res.status(201).json({
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    senderName: user?.username ?? null,
    senderAvatar: user?.avatarUrl ?? null,
    content: msg.content,
    fileUrl: msg.fileUrl ?? null,
    isRead: false,
    createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt,
  });
});

export default router;
