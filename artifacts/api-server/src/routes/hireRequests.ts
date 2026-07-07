import { Router } from "express";
import { eq, desc, asc } from "drizzle-orm";
import { db, hireRequestsTable, hireMilestonesTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.post("/hire-requests", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { title, description, appType, blockchainType, features, budgetMin, budgetMax, timeline, contactWhatsapp, contactTelegram, includesHosting, includesDomain, hostingMonths, depositPiAmount } = req.body;
  if (!title || !description || !appType) { res.status(400).json({ error: "Title, description and app type are required" }); return; }
  const [request] = await db.insert(hireRequestsTable).values({
    userId, title: title.trim(), description: description.trim(), appType,
    blockchainType: blockchainType || "pi", features: features?.trim() || null,
    budgetMin: budgetMin ? String(budgetMin) : null, budgetMax: budgetMax ? String(budgetMax) : null,
    timeline: timeline || null, contactWhatsapp: contactWhatsapp?.trim() || null,
    contactTelegram: contactTelegram?.trim() || null, status: "pending",
    includesHosting: includesHosting === true, includesDomain: includesDomain === true,
    hostingMonths: hostingMonths ? Number(hostingMonths) : null,
    depositPiAmount: depositPiAmount ? String(depositPiAmount) : null,
  }).returning();
  res.status(201).json(request);
});

router.get("/hire-requests", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const requests = await db.select().from(hireRequestsTable).where(eq(hireRequestsTable.userId, userId)).orderBy(desc(hireRequestsTable.createdAt));
  res.json(requests);
});

router.get("/hire-requests/:id/milestones", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const milestones = await db.select().from(hireMilestonesTable).where(eq(hireMilestonesTable.requestId, id)).orderBy(asc(hireMilestonesTable.orderIndex));
  res.json(milestones);
});

router.post("/hire-milestones/:id/pay", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const userId = req.userId!;
  const { txHash } = req.body;
  if (!txHash?.trim()) { res.status(400).json({ error: "Pi Transaction ID (TXID) is required" }); return; }
  const [milestone] = await db.select().from(hireMilestonesTable).where(eq(hireMilestonesTable.id, id));
  if (!milestone) { res.status(404).json({ error: "Milestone not found" }); return; }
  if (milestone.status !== "active") { res.status(400).json({ error: "Milestone is not active for payment" }); return; }
  const [request] = await db.select().from(hireRequestsTable).where(eq(hireRequestsTable.id, milestone.requestId));
  if (!request || request.userId !== userId) { res.status(403).json({ error: "Unauthorized" }); return; }
  const [updated] = await db.update(hireMilestonesTable)
    .set({ status: "payment_submitted", paidTxHash: txHash.trim(), paidAt: new Date() })
    .where(eq(hireMilestonesTable.id, id))
    .returning();
  res.json(updated);
});

router.get("/admin/hire-requests", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const requests = await db.select().from(hireRequestsTable).orderBy(desc(hireRequestsTable.createdAt));
  res.json(requests);
});

router.patch("/admin/hire-requests/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { status, adminNotes } = req.body;
  if (!status) { res.status(400).json({ error: "Status is required" }); return; }
  const [updated] = await db.update(hireRequestsTable).set({ status, adminNotes: adminNotes || null }).where(eq(hireRequestsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Request not found" }); return; }
  res.json(updated);
});

router.get("/admin/hire-requests/:id/milestones", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const milestones = await db.select().from(hireMilestonesTable).where(eq(hireMilestonesTable.requestId, id)).orderBy(asc(hireMilestonesTable.orderIndex));
  res.json(milestones);
});

router.post("/admin/hire-requests/:id/milestones", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const requestId = parseInt(req.params.id);
  const { title, description, amountPi, orderIndex } = req.body;
  if (!title || !amountPi) { res.status(400).json({ error: "Title and amount are required" }); return; }
  const [milestone] = await db.insert(hireMilestonesTable).values({
    requestId, title: title.trim(), description: description?.trim() || null,
    amountPi: String(amountPi), orderIndex: orderIndex ?? 0, status: "locked",
  }).returning();
  res.status(201).json(milestone);
});

router.patch("/admin/hire-milestones/:id/release", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [updated] = await db.update(hireMilestonesTable).set({ status: "released", releasedAt: new Date() }).where(eq(hireMilestonesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Milestone not found" }); return; }
  res.json(updated);
});

router.patch("/admin/hire-milestones/:id/activate", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [updated] = await db.update(hireMilestonesTable).set({ status: "active" }).where(eq(hireMilestonesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Milestone not found" }); return; }
  res.json(updated);
});

router.delete("/admin/hire-milestones/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(hireMilestonesTable).where(eq(hireMilestonesTable.id, id));
  res.json({ ok: true });
});

export default router;
