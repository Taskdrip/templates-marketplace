import { Router } from "express";
import { db, productsTable, categoriesTable, reviewsTable } from "@workspace/db";
import { eq, like, and, gte, lte, desc, asc, sql, ilike } from "drizzle-orm";
import { requireAuth, requireAdmin, optionalAuth } from "../middlewares/auth";

const router = Router();

function toProductResponse(p: any, categoryName?: string, rating?: number, reviewCount?: number) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription ?? null,
    price: parseFloat(p.price),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
    categoryId: p.categoryId,
    categoryName: categoryName ?? null,
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
    rating: rating ?? null,
    reviewCount: reviewCount ?? 0,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  };
}

router.get("/products", optionalAuth, async (req, res): Promise<void> => {
  const { page = "1", limit = "20", category, search, sort, minPrice, maxPrice } = req.query as any;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  let conditions: any[] = [eq(productsTable.status, "active")];

  if (category) {
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category));
    if (cat) conditions.push(eq(productsTable.categoryId, cat.id));
  }
  if (search) {
    conditions.push(ilike(productsTable.name, `%${search}%`));
  }
  if (minPrice) {
    conditions.push(gte(productsTable.price, minPrice));
  }
  if (maxPrice) {
    conditions.push(lte(productsTable.price, maxPrice));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy = desc(productsTable.createdAt);
  if (sort === "price_asc") orderBy = asc(productsTable.price as any);
  else if (sort === "price_desc") orderBy = desc(productsTable.price as any);
  else if (sort === "popular") orderBy = desc(productsTable.salesCount);
  else if (sort === "rating") orderBy = desc(productsTable.salesCount);

  const [products, countResult] = await Promise.all([
    db.select().from(productsTable).where(whereClause).orderBy(orderBy).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(whereClause),
  ]);

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));

  const reviews = await db.select({
    productId: reviewsTable.productId,
    avgRating: sql<number>`avg(${reviewsTable.rating})`,
    count: sql<number>`count(*)`,
  }).from(reviewsTable).groupBy(reviewsTable.productId);
  const reviewMap = new Map(reviews.map(r => [r.productId, { rating: r.avgRating, count: r.count }]));

  res.json({
    products: products.map(p => toProductResponse(
      p,
      catMap.get(p.categoryId),
      reviewMap.get(p.id)?.rating,
      reviewMap.get(p.id)?.count,
    )),
    total: parseInt(String(countResult[0]?.count ?? 0), 10),
    page: pageNum,
    limit: limitNum,
  });
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable)
    .where(and(eq(productsTable.isFeatured, true), eq(productsTable.status, "active")))
    .orderBy(desc(productsTable.salesCount))
    .limit(8);

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));

  res.json(products.map(p => toProductResponse(p, catMap.get(p.categoryId))));
});

router.get("/products/trending", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable)
    .where(eq(productsTable.status, "active"))
    .orderBy(desc(productsTable.salesCount))
    .limit(8);

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  res.json(products.map(p => toProductResponse(p, catMap.get(p.categoryId))));
});

router.get("/products/new-arrivals", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable)
    .where(eq(productsTable.status, "active"))
    .orderBy(desc(productsTable.createdAt))
    .limit(8);

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  res.json(products.map(p => toProductResponse(p, catMap.get(p.categoryId))));
});

router.get("/products/best-sellers", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable)
    .where(eq(productsTable.status, "active"))
    .orderBy(desc(productsTable.salesCount))
    .limit(8);

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  res.json(products.map(p => toProductResponse(p, catMap.get(p.categoryId))));
});

router.get("/products/:id", optionalAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) { res.status(404).json({ error: "Not found" }); return; }

  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));

  const reviews = await db.select({
    avgRating: sql<number>`avg(${reviewsTable.rating})`,
    count: sql<number>`count(*)`,
  }).from(reviewsTable).where(eq(reviewsTable.productId, id));

  res.json(toProductResponse(product, cat?.name, reviews[0]?.avgRating, Number(reviews[0]?.count ?? 0)));
});

router.post("/products", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { name, description, shortDescription, price, originalPrice, categoryId, tags, previewImages, demoUrl, downloadUrl, version, documentation, videoPreviewUrl } = req.body;
  if (!name || !description || !price || !categoryId) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const [product] = await db.insert(productsTable).values({
    name,
    slug: `${slug}-${Date.now()}`,
    description,
    shortDescription,
    price: String(price),
    originalPrice: originalPrice ? String(originalPrice) : undefined,
    categoryId,
    tags: tags ?? [],
    previewImages: previewImages ?? [],
    demoUrl,
    downloadUrl,
    version,
    documentation,
    videoPreviewUrl,
    status: "active",
  }).returning();

  res.status(201).json(toProductResponse(product));
});

router.patch("/products/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const updateData: any = {};
  const fields = ["name", "description", "shortDescription", "price", "originalPrice", "categoryId", "tags", "previewImages", "demoUrl", "downloadUrl", "version", "changelog", "documentation", "videoPreviewUrl", "isFeatured", "status"];
  for (const field of fields) {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  }
  if (updateData.price) updateData.price = String(updateData.price);
  if (updateData.originalPrice) updateData.originalPrice = String(updateData.originalPrice);

  const [product] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();
  if (!product) { res.status(404).json({ error: "Not found" }); return; }

  res.json(toProductResponse(product));
});

router.delete("/products/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ message: "Deleted" });
});

router.get("/products/:id/related", optionalAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) { res.status(404).json({ error: "Not found" }); return; }

  const related = await db.select().from(productsTable)
    .where(and(eq(productsTable.categoryId, product.categoryId), eq(productsTable.status, "active")))
    .limit(4);

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  res.json(related.filter(p => p.id !== id).map(p => toProductResponse(p, catMap.get(p.categoryId))));
});

export default router;
