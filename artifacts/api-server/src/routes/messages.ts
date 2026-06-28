import { Router } from "express";
import { db, conversationsTable, messagesTable, usersTable, ordersTable, productsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function toConv(c: any, userMap: Map<number, any>) {
  const buyer = userMap.get(c.userId);
  const seller = c.sellerId ? userMap.get(c.sellerId) : null;
  return {
    id: c.id,
    userId: c.userId,
    sellerId: c.sellerId ?? null,
    orderId: c.orderId ?? null,
    buyerUsername: buyer?.username ?? null,
    buyerDisplayName: buyer?.displayName ?? null,
    buyerAvatarUrl: buyer?.avatarUrl ?? null,
    sellerUsername: seller?.username ?? null,
    sellerDisplayName: seller?.displayName ?? null,
    sellerAvatarUrl: seller?.avatarUrl ?? null,
    // Legacy compat: "username" = buyer, "displayName" = buyer
    username: buyer?.username ?? null,
    displayName: buyer?.displayName ?? null,
    avatarUrl: buyer?.avatarUrl ?? null,
    sellerName: seller?.displayName ?? seller?.username ?? null,
    subject: c.subject ?? null,
    lastMessage: c.lastMessage ?? null,
    lastMessageAt: c.lastMessageAt instanceof Date ? c.lastMessageAt.toISOString() : c.lastMessageAt ?? null,
    unreadCount: 0,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
  };
}

// List conversations – admin sees all, users see their own (buyer or seller side)
router.get("/messages/conversations", requireAuth, async (req, res): Promise<void> => {
  let convs;
  if (req.userRole === "admin") {
    convs = await db.select().from(conversationsTable).orderBy(desc(conversationsTable.lastMessageAt));
  } else {
    const uid = req.userId!;
    const all = await db.select().from(conversationsTable).orderBy(desc(conversationsTable.lastMessageAt));
    convs = all.filter(c => c.userId === uid || c.sellerId === uid);
  }
  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u]));
  res.json({ conversations: convs.map(c => toConv(c, userMap)) });
});

// Start or find a conversation (optionally linked to an order)
router.post("/messages/start", requireAuth, async (req, res): Promise<void> => {
  const { subject, orderId } = req.body;
  const uid = req.userId!;

  // If orderId provided, find/create escrow conversation for that order
  if (orderId) {
    const [existing] = await db.select().from(conversationsTable).where(eq(conversationsTable.orderId, orderId));
    if (existing) {
      const users = await db.select().from(usersTable);
      const userMap = new Map(users.map(u => [u.id, u]));
      res.status(200).json(toConv(existing, userMap));
      return;
    }
    // Look up order → product → seller
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
    let sellerId: number | null = null;
    if (order) {
      const [product] = await db.select({ sellerId: productsTable.sellerId }).from(productsTable).where(eq(productsTable.id, order.productId));
      sellerId = product?.sellerId ?? null;
    }
    const [conv] = await db.insert(conversationsTable).values({
      userId: uid, sellerId, orderId,
      subject: subject ?? `Order #${orderId} Chat`,
    }).returning();
    const users = await db.select().from(usersTable);
    const userMap = new Map(users.map(u => [u.id, u]));
    res.status(201).json(toConv(conv, userMap));
    return;
  }

  // Regular support conversation — one per user
  const existing = await db.select().from(conversationsTable).where(eq(conversationsTable.userId, uid));
  const regular = existing.find(c => !c.orderId);
  if (regular) {
    const users = await db.select().from(usersTable);
    const userMap = new Map(users.map(u => [u.id, u]));
    res.status(200).json(toConv(regular, userMap));
    return;
  }
  const [conv] = await db.insert(conversationsTable).values({
    userId: uid, subject: subject ?? "Support Chat",
  }).returning();
  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u]));
  res.status(201).json(toConv(conv, userMap));
});

// Get messages for a conversation
router.get("/messages/:conversationId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
  const convId = parseInt(raw, 10);
  if (isNaN(convId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, convId)).orderBy(messagesTable.createdAt);
  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json({
    messages: msgs.map(m => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: userMap.get(m.senderId)?.displayName ?? userMap.get(m.senderId)?.username ?? null,
      senderAvatar: userMap.get(m.senderId)?.avatarUrl ?? null,
      senderRole: userMap.get(m.senderId)?.role ?? "user",
      content: m.content,
      fileUrl: m.fileUrl ?? null,
      isRead: m.isRead === "true",
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    })),
  });
});

// Send a message in a conversation
router.post("/messages/:conversationId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
  const convId = parseInt(raw, 10);
  if (isNaN(convId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { content, fileUrl } = req.body;
  if (!content) { res.status(400).json({ error: "Missing content" }); return; }

  const [msg] = await db.insert(messagesTable).values({
    conversationId: convId, senderId: req.userId!,
    content, fileUrl, isRead: "false",
  }).returning();

  await db.update(conversationsTable).set({ lastMessage: content, lastMessageAt: new Date() }).where(eq(conversationsTable.id, convId));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));

  // Real-time emit
  try {
    const { getIO } = await import("../socketInstance");
    const io = getIO();
    io.to(`conversation:${convId}`).emit("new_message", {
      conversationId: convId, senderId: req.userId!,
      senderName: user?.displayName ?? user?.username ?? null,
      senderRole: user?.role ?? "user",
      content, fileUrl: fileUrl ?? null,
      createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt,
    });
  } catch {}

  res.status(201).json({
    id: msg.id, conversationId: msg.conversationId, senderId: msg.senderId,
    senderName: user?.displayName ?? user?.username ?? null,
    senderAvatar: user?.avatarUrl ?? null,
    senderRole: user?.role ?? "user",
    content: msg.content, fileUrl: msg.fileUrl ?? null, isRead: false,
    createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt,
  });
});

export default router;
