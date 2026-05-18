import { Router } from "express";
import { db, ticketsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

function toTicket(t: any, username?: string) {
  return {
    id: t.id,
    userId: t.userId,
    username: username ?? null,
    subject: t.subject,
    description: t.description ?? null,
    status: t.status,
    priority: t.priority,
    adminReply: t.adminReply ?? null,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
    updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : t.updatedAt,
  };
}

router.get("/tickets", requireAuth, async (req, res): Promise<void> => {
  let tickets;
  if (req.userRole === "admin") {
    tickets = await db.select().from(ticketsTable).orderBy(desc(ticketsTable.createdAt));
  } else {
    tickets = await db.select().from(ticketsTable)
      .where(eq(ticketsTable.userId, req.userId!))
      .orderBy(desc(ticketsTable.createdAt));
  }

  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u.username]));

  res.json(tickets.map(t => toTicket(t, userMap.get(t.userId))));
});

router.post("/tickets", requireAuth, async (req, res): Promise<void> => {
  const { subject, description, priority } = req.body;
  if (!subject || !description) { res.status(400).json({ error: "Missing required fields" }); return; }

  const [ticket] = await db.insert(ticketsTable).values({
    userId: req.userId!,
    subject,
    description,
    priority: priority ?? "medium",
  }).returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  res.status(201).json(toTicket(ticket, user?.username));
});

router.get("/tickets/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, id));
  if (!ticket) { res.status(404).json({ error: "Not found" }); return; }
  if (req.userRole !== "admin" && ticket.userId !== req.userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, ticket.userId));
  res.json(toTicket(ticket, user?.username));
});

router.patch("/tickets/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [existing] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (req.userRole !== "admin" && existing.userId !== req.userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const { status, adminReply, priority } = req.body;
  const updateData: any = {};
  if (status) updateData.status = status;
  if (adminReply && req.userRole === "admin") updateData.adminReply = adminReply;
  if (priority) updateData.priority = priority;

  const [ticket] = await db.update(ticketsTable).set(updateData).where(eq(ticketsTable.id, id)).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, ticket.userId));
  res.json(toTicket(ticket, user?.username));
});

export default router;
