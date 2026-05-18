import { Router } from "express";
import { db, downloadsTable, ordersTable, productsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/downloads", requireAuth, async (req, res): Promise<void> => {
  const downloads = await db.select().from(downloadsTable)
    .where(eq(downloadsTable.userId, req.userId!))
    .orderBy(desc(downloadsTable.downloadedAt));

  const productIds = [...new Set(downloads.map(d => d.productId))];
  const products = await db.select().from(productsTable);
  const productMap = new Map(products.map(p => [p.id, p]));

  res.json(downloads.map(d => ({
    id: d.id,
    orderId: d.orderId,
    productId: d.productId,
    productName: productMap.get(d.productId)?.name ?? "Unknown Product",
    productImage: productMap.get(d.productId)?.previewImages?.[0] ?? null,
    downloadedAt: d.downloadedAt instanceof Date ? d.downloadedAt.toISOString() : d.downloadedAt,
    version: productMap.get(d.productId)?.version ?? null,
  })));
});

router.get("/downloads/:orderId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const orderId = parseInt(raw, 10);
  if (isNaN(orderId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  if (order.userId !== req.userId) { res.status(403).json({ error: "Forbidden" }); return; }
  if (order.status !== "delivered" && order.status !== "confirmed") {
    res.status(403).json({ error: "Order not yet delivered" }); return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, order.productId));

  // Log the download
  const existingDownloads = await db.select().from(downloadsTable)
    .where(eq(downloadsTable.orderId, orderId));
  if (existingDownloads.length === 0) {
    await db.insert(downloadsTable).values({
      userId: req.userId!,
      orderId,
      productId: order.productId,
    });
  }

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  res.json({
    url: product?.downloadUrl ?? `https://example.com/downloads/${orderId}`,
    expiresAt: expiresAt.toISOString(),
  });
});

export default router;
