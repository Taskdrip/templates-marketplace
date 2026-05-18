import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const notifications = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, req.userId!))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  res.json(notifications.map(n => ({
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link ?? null,
    isRead: n.isRead === "true",
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
  })));
});

router.patch("/notifications/read-all", requireAuth, async (req, res): Promise<void> => {
  await db.update(notificationsTable)
    .set({ isRead: "true" })
    .where(eq(notificationsTable.userId, req.userId!));
  res.json({ message: "All notifications marked as read" });
});

router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [notif] = await db.update(notificationsTable)
    .set({ isRead: "true" })
    .where(eq(notificationsTable.id, id))
    .returning();
  if (!notif) { res.status(404).json({ error: "Not found" }); return; }

  res.json({
    id: notif.id,
    userId: notif.userId,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    link: notif.link ?? null,
    isRead: true,
    createdAt: notif.createdAt instanceof Date ? notif.createdAt.toISOString() : notif.createdAt,
  });
});

export default router;
