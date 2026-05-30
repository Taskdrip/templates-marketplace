import { Router } from "express";
import { db, walletsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

function toWallet(w: any) {
  return {
    id: w.id,
    chain: w.chain,
    address: w.address,
    label: w.label ?? null,
    customMessage: w.customMessage ?? null,
    isActive: w.isActive,
  };
}

router.get("/wallets", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const wallets = await db.select().from(walletsTable);
  res.json(wallets.map(toWallet));
});

router.post("/wallets", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { chain, address, label, customMessage, isActive } = req.body;
  if (!chain || !address) { res.status(400).json({ error: "Missing required fields" }); return; }
  const [wallet] = await db.insert(walletsTable).values({ chain, address, label, customMessage, isActive: isActive ?? true }).returning();
  res.status(201).json(toWallet(wallet));
});

router.patch("/wallets/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { chain, address, label, customMessage, isActive } = req.body;
  const [wallet] = await db.update(walletsTable).set({ chain, address, label, customMessage, isActive }).where(eq(walletsTable.id, id)).returning();
  if (!wallet) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toWallet(wallet));
});

router.delete("/wallets/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(walletsTable).where(eq(walletsTable.id, id));
  res.json({ message: "Deleted" });
});

export default router;
