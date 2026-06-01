import { Router } from "express";
import { db, productsTable, categoriesTable, ordersTable, paymentsTable, notificationsTable, usersTable } from "@workspace/db";
import { eq, and, desc, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

async function checkIsSeller(userId: number): Promise<boolean> {
  const [user] = await db.select({ isSeller: usersTable.isSeller }).from(usersTable).where(eq(usersTable.id, userId));
  return user?.isSeller === true;
}

function toProductResponse(p: any, categoryName?: string) {
  return {
    id: p.id,
    sellerId: p.sellerId ?? null,
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
    rating: null,
    reviewCount: 0,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  };
}

router.get("/seller/products", requireAuth, async (req, res): Promise<void> => {
  const isSeller = await checkIsSeller(req.userId!);
  if (!isSeller) { res.status(403).json({ error: "Seller account required" }); return; }

  const products = await db.select().from(productsTable)
    .where(eq(productsTable.sellerId, req.userId!))
    .orderBy(desc(productsTable.createdAt));

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));

  res.json(products.map(p => toProductResponse(p, catMap.get(p.categoryId))));
});

router.post("/seller/products", requireAuth, async (req, res): Promise<void> => {
  const isSeller = await checkIsSeller(req.userId!);
  if (!isSeller) { res.status(403).json({ error: "Seller account required" }); return; }

  const { name, description, shortDescription, price, originalPrice, categoryId, tags, previewImages, demoUrl, downloadUrl, version, documentation, videoPreviewUrl } = req.body;
  if (!name || !description || !price || !categoryId) {
    res.status(400).json({ error: "Missing required fields: name, description, price, categoryId" });
    return;
  }

  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`;

  const [product] = await db.insert(productsTable).values({
    sellerId: req.userId!,
    name,
    slug,
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
    status: "pending",
  }).returning();

  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, categoryId));
  res.status(201).json(toProductResponse(product, cat?.name));
});

router.patch("/seller/products/:id", requireAuth, async (req, res): Promise<void> => {
  const isSeller = await checkIsSeller(req.userId!);
  if (!isSeller) { res.status(403).json({ error: "Seller account required" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [existing] = await db.select().from(productsTable).where(and(eq(productsTable.id, id), eq(productsTable.sellerId, req.userId!)));
  if (!existing) { res.status(404).json({ error: "Product not found or not yours" }); return; }

  if (existing.status === "active") {
    res.status(400).json({ error: "Cannot edit an approved product. Contact admin." });
    return;
  }

  const updateData: any = {};
  const fields = ["name", "description", "shortDescription", "price", "originalPrice", "categoryId", "tags", "previewImages", "demoUrl", "downloadUrl", "version", "documentation", "videoPreviewUrl"];
  for (const field of fields) {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  }
  if (updateData.price) updateData.price = String(updateData.price);
  if (updateData.originalPrice) updateData.originalPrice = String(updateData.originalPrice);
  updateData.status = "pending";

  const [product] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
  res.json(toProductResponse(product, cat?.name));
});

router.delete("/seller/products/:id", requireAuth, async (req, res): Promise<void> => {
  const isSeller = await checkIsSeller(req.userId!);
  if (!isSeller) { res.status(403).json({ error: "Seller account required" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [existing] = await db.select().from(productsTable).where(and(eq(productsTable.id, id), eq(productsTable.sellerId, req.userId!)));
  if (!existing) { res.status(404).json({ error: "Product not found or not yours" }); return; }

  if (existing.status === "active" && existing.salesCount > 0) {
    res.status(400).json({ error: "Cannot delete a product with existing sales." });
    return;
  }

  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ message: "Deleted" });
});

router.get("/seller/earnings", requireAuth, async (req, res): Promise<void> => {
  const isSeller = await checkIsSeller(req.userId!);
  if (!isSeller) { res.status(403).json({ error: "Seller account required" }); return; }

  const myProducts = await db.select().from(productsTable)
    .where(eq(productsTable.sellerId, req.userId!));

  if (myProducts.length === 0) {
    res.json({ totalEarnings: 0, pendingPayout: 0, releasedPayout: 0, orders: [] });
    return;
  }

  const productIds = myProducts.map(p => p.id);
  const productMap = new Map(myProducts.map(p => [p.id, p]));

  const allOrders = await db.select().from(ordersTable)
    .where(inArray(ordersTable.productId, productIds))
    .orderBy(desc(ordersTable.createdAt));

  const payments = allOrders.length > 0
    ? await db.select().from(paymentsTable)
    : [];
  const paymentMap = new Map(payments.map(p => [p.orderId, p]));

  const PLATFORM_FEE = 0.10;

  let totalEarnings = 0;
  let pendingPayout = 0;
  let releasedPayout = 0;

  const ordersWithDetails = allOrders.map(o => {
    const product = productMap.get(o.productId);
    const payment = paymentMap.get(o.id);
    const amount = parseFloat(o.amount);
    const sellerAmount = amount * (1 - PLATFORM_FEE);

    if (o.status === "delivered" || o.status === "funds_released") {
      if (o.status === "funds_released") {
        releasedPayout += sellerAmount;
        totalEarnings += sellerAmount;
      } else {
        pendingPayout += sellerAmount;
        totalEarnings += sellerAmount;
      }
    }

    return {
      id: o.id,
      productId: o.productId,
      productName: product?.name ?? null,
      buyerAmount: amount,
      sellerAmount,
      platformFee: amount * PLATFORM_FEE,
      status: o.status,
      paymentStatus: payment?.status ?? null,
      chain: payment?.chain ?? null,
      createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
    };
  });

  res.json({
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    pendingPayout: Math.round(pendingPayout * 100) / 100,
    releasedPayout: Math.round(releasedPayout * 100) / 100,
    platformFeePercent: PLATFORM_FEE * 100,
    orders: ordersWithDetails,
  });
});

export default router;
