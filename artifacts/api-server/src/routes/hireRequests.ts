import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, hireRequestsTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.post("/hire-requests", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).user.userId;
  const {
    title, description, appType, blockchainType, features,
    budgetMin, budgetMax, timeline, contactWhatsapp, contactTelegram,
  } = req.body;

  if (!title || !description || !appType) {
    res.status(400).json({ error: "Title, description and app type are required" });
    return;
  }

  const [request] = await db.insert(hireRequestsTable).values({
    userId,
    title: title.trim(),
    description: description.trim(),
    appType,
    blockchainType: blockchainType || "pi",
    features: features?.trim() || null,
    budgetMin: budgetMin ? String(budgetMin) : null,
    budgetMax: budgetMax ? String(budgetMax) : null,
    timeline: timeline || null,
    contactWhatsapp: contactWhatsapp?.trim() || null,
    contactTelegram: contactTelegram?.trim() || null,
    status: "pending",
  }).returning();

  res.status(201).json(request);
});

router.get("/hire-requests", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).user.userId;
  const requests = await db
    .select()
    .from(hireRequestsTable)
    .where(eq(hireRequestsTable.userId, userId))
    .orderBy(desc(hireRequestsTable.createdAt));

  res.json(requests);
});

router.get("/admin/hire-requests", requireAdmin, async (_req, res): Promise<void> => {
  const requests = await db
    .select()
    .from(hireRequestsTable)
    .orderBy(desc(hireRequestsTable.createdAt));

  res.json(requests);
});

router.patch("/admin/hire-requests/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { status, adminNotes } = req.body;

  if (!status) {
    res.status(400).json({ error: "Status is required" });
    return;
  }

  const [updated] = await db
    .update(hireRequestsTable)
    .set({ status, adminNotes: adminNotes || null })
    .where(eq(hireRequestsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  res.json(updated);
});

export default router;
