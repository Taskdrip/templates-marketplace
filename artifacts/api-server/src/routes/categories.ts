import { Router } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable);

  const counts = await db.select({
    categoryId: productsTable.categoryId,
    count: sql<number>`count(*)`,
  }).from(productsTable).where(eq(productsTable.status, "active")).groupBy(productsTable.categoryId);
  const countMap = new Map(counts.map(c => [c.categoryId, c.count]));

  res.json(categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    iconName: c.iconName ?? null,
    productCount: Number(countMap.get(c.id) ?? 0),
  })));
});

router.post("/categories", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { name, slug, description, iconName } = req.body;
  if (!name || !slug) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [cat] = await db.insert(categoriesTable).values({ name, slug, description, iconName }).returning();
  res.status(201).json({ id: cat.id, name: cat.name, slug: cat.slug, description: cat.description ?? null, iconName: cat.iconName ?? null, productCount: 0 });
});

router.patch("/categories/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { name, slug, description, iconName } = req.body;
  const [cat] = await db.update(categoriesTable).set({ name, slug, description, iconName }).where(eq(categoriesTable.id, id)).returning();
  if (!cat) { res.status(404).json({ error: "Not found" }); return; }

  res.json({ id: cat.id, name: cat.name, slug: cat.slug, description: cat.description ?? null, iconName: cat.iconName ?? null, productCount: 0 });
});

router.delete("/categories/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.json({ message: "Deleted" });
});

export default router;
