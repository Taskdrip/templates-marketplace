import { Router } from "express";
import { db, notificationsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.post("/admin/push-notification", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { title, message, link } = req.body;
  if (!title || !message) { res.status(400).json({ error: "title and message required" }); return; }

  const allUsers = await db.select().from(usersTable);

  const notifications = allUsers.map(u => ({
    userId: u.id,
    type: "broadcast",
    title,
    message,
    link: (link as string) ?? null,
    isRead: "false" as const,
  }));

  if (notifications.length > 0) {
    await db.insert(notificationsTable).values(notifications);
  }

  // Try real-time socket push
  try {
    const { getIO } = await import("../socketInstance");
    const io = getIO();
    for (const u of allUsers) {
      io.to(`user:${u.id}`).emit("push_notification", { title, message, link: link ?? null });
    }
  } catch {}

  res.json({ sent: allUsers.length, title, message });
});

router.get("/admin/push-notifications/history", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const recent = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.type, "broadcast"))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);
  res.json(recent.map(n => ({
    id: n.id, userId: n.userId, title: n.title, message: n.message,
    link: n.link ?? null, isRead: n.isRead,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
  })));
});

export default router;
