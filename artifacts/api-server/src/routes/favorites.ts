import { Router } from "express";
import { db, favoritesTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/favorites", requireAuth, async (req, res): Promise<void> => {
  const favs = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, req.userId!));
  const productIds = favs.map(f => f.productId);

  if (productIds.length === 0) {
    res.json([]);
    return;
  }

  const products = await db.select().from(productsTable);
  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));

  const favProducts = products.filter(p => productIds.includes(p.id));
  res.json(favProducts.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription ?? null,
    price: parseFloat(p.price),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
    categoryId: p.categoryId,
    categoryName: catMap.get(p.categoryId) ?? null,
    tags: p.tags ?? [],
    previewImages: p.previewImages ?? [],
    demoUrl: p.demoUrl ?? null,
    downloadUrl: p.downloadUrl ?? null,
    version: p.version ?? null,
    changelog: p.changelog ?? null,
    documentation: p.documentation ?? null,
    videoPreviewUrl: p.videoPreviewUrl ?? null,
    status: p.status,
    isFeatured: p.isFeatured,
    salesCount: p.salesCount,
    rating: null,
    reviewCount: 0,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  })));
});

router.post("/favorites/:productId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(raw, 10);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const existing = await db.select().from(favoritesTable)
    .where(and(eq(favoritesTable.userId, req.userId!), eq(favoritesTable.productId, productId)));

  if (existing.length === 0) {
    await db.insert(favoritesTable).values({ userId: req.userId!, productId });
  }

  res.status(201).json({ message: "Added to favorites" });
});

router.delete("/favorites/:productId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(raw, 10);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(favoritesTable)
    .where(and(eq(favoritesTable.userId, req.userId!), eq(favoritesTable.productId, productId)));

  res.json({ message: "Removed from favorites" });
});

export default router;
