import { Router } from "express";
import { db, usersTable, productsTable, ordersTable, paymentsTable, categoriesTable, notificationsTable } from "@workspace/db";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/admin/analytics", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  const [totalProducts] = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.status, "active"));
  const [totalOrders] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable);
  const [pendingOrders] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "pending"));
  const [pendingPayments] = await db.select({ count: sql<number>`count(*)` }).from(paymentsTable).where(eq(paymentsTable.status, "pending"));
  const revenueResult = await db.select({ total: sql<number>`sum(amount)` }).from(paymentsTable).where(eq(paymentsTable.status, "confirmed"));

  const recentOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5);
  const topProducts = await db.select().from(productsTable).where(eq(productsTable.status, "active")).orderBy(desc(productsTable.salesCount)).limit(5);
  const cats = await db.select().from(categoriesTable);

  const salesByCat = await db.select({
    categoryId: productsTable.categoryId,
    sales: sql<number>`sum(${productsTable.salesCount})`,
    revenue: sql<number>`sum(${productsTable.salesCount} * CAST(${productsTable.price} AS numeric))`,
  }).from(productsTable).groupBy(productsTable.categoryId);

  const catMap = new Map(cats.map(c => [c.id, c.name]));

  const recentOrdersWithDetails = await Promise.all(recentOrders.map(async o => {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, o.productId));
    return {
      id: o.id,
      userId: o.userId,
      productId: o.productId,
      productName: product?.name ?? null,
      productImage: product?.previewImages?.[0] ?? null,
      amount: parseFloat(o.amount),
      status: o.status,
      adminNotes: o.adminNotes ?? null,
      createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
      updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt,
      payment: null,
    };
  }));

  res.json({
    totalRevenue: parseFloat(String(revenueResult[0]?.total ?? 0)),
    totalOrders: parseInt(String(totalOrders.count), 10),
    totalUsers: parseInt(String(totalUsers.count), 10),
    totalProducts: parseInt(String(totalProducts.count), 10),
    pendingOrders: parseInt(String(pendingOrders.count), 10),
    pendingPayments: parseInt(String(pendingPayments.count), 10),
    recentOrders: recentOrdersWithDetails,
    topProducts: topProducts.map(p => ({
      id: p.id, name: p.name, slug: p.slug, description: p.description,
      shortDescription: p.shortDescription ?? null,
      price: parseFloat(p.price), originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
      categoryId: p.categoryId, categoryName: catMap.get(p.categoryId) ?? null,
      tags: p.tags ?? [], previewImages: p.previewImages ?? [],
      demoUrl: p.demoUrl ?? null, downloadUrl: p.downloadUrl ?? null,
      version: p.version ?? null, changelog: p.changelog ?? null,
      documentation: p.documentation ?? null, videoPreviewUrl: p.videoPreviewUrl ?? null,
      status: p.status, isFeatured: p.isFeatured, salesCount: p.salesCount,
      rating: null, reviewCount: 0,
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    })),
    salesByCategory: salesByCat.map(s => ({
      category: catMap.get(s.categoryId) ?? "Unknown",
      sales: parseInt(String(s.sales ?? 0), 10),
      revenue: parseFloat(String(s.revenue ?? 0)),
    })),
  });
});

router.get("/admin/users", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  res.json(users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatarUrl ?? null,
    isActive: u.isActive,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
    totalPurchases: 0,
  })));
});

router.patch("/admin/users/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { isActive, role, username, email, displayName, phone, telegramHandle } = req.body;
  const updateData: any = {};
  if (isActive !== undefined) updateData.isActive = isActive;
  if (role) updateData.role = role;
  if (username) updateData.username = username;
  if (email) updateData.email = email;
  if (displayName !== undefined) updateData.displayName = displayName;
  if (phone !== undefined) updateData.phone = phone;
  if (telegramHandle !== undefined) updateData.telegramHandle = telegramHandle;

  const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    displayName: user.displayName ?? null,
    phone: user.phone ?? null,
    telegramHandle: user.telegramHandle ?? null,
    isActive: user.isActive,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    totalPurchases: 0,
  });
});

router.delete("/admin/users/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ message: "Deleted" });
});

router.get("/admin/orders", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
  const products = await db.select().from(productsTable);
  const productMap = new Map(products.map(p => [p.id, p]));
  const payments = await db.select().from(paymentsTable);
  const paymentMap = new Map(payments.map(p => [p.orderId, p]));

  const allUserIds = [...new Set([
    ...orders.map(o => o.userId),
    ...products.map(p => p.sellerId).filter(Boolean) as number[],
  ])];
  const allUsers = allUserIds.length > 0
    ? await db.select({ id: usersTable.id, email: usersTable.email, displayName: usersTable.displayName }).from(usersTable).where(inArray(usersTable.id, allUserIds))
    : [];
  const userMap = new Map(allUsers.map(u => [u.id, u]));

  res.json(orders.map(o => {
    const product = productMap.get(o.productId);
    const payment = paymentMap.get(o.id);
    const buyer = userMap.get(o.userId);
    const seller = product?.sellerId ? userMap.get(product.sellerId) : null;
    const amount = parseFloat(o.amount);
    return {
      id: o.id,
      userId: o.userId,
      buyerEmail: buyer?.email ?? null,
      buyerName: buyer?.displayName ?? null,
      productId: o.productId,
      productName: product?.name ?? null,
      productImage: product?.previewImages?.[0] ?? null,
      sellerId: product?.sellerId ?? null,
      sellerEmail: seller?.email ?? null,
      sellerName: seller?.displayName ?? null,
      amount,
      platformFee: parseFloat((amount * 0.1).toFixed(2)),
      sellerPayout: parseFloat((amount * 0.9).toFixed(2)),
      status: o.status,
      adminNotes: o.adminNotes ?? null,
      createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
      updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt,
      payment: payment ? {
        id: payment.id, orderId: payment.orderId, amount: parseFloat(payment.amount),
        chain: payment.chain, txHash: payment.txHash,
        screenshotUrl: payment.screenshotUrl ?? null, status: payment.status,
        createdAt: payment.createdAt instanceof Date ? payment.createdAt.toISOString() : payment.createdAt,
      } : null,
    };
  }));
});

router.get("/admin/products/pending", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable).where(eq(productsTable.status, "pending")).orderBy(desc(productsTable.createdAt));
  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const sellerIds = [...new Set(products.map(p => p.sellerId).filter(Boolean))] as number[];
  const sellers = sellerIds.length > 0 ? await db.select({ id: usersTable.id, email: usersTable.email, displayName: usersTable.displayName }).from(usersTable).where(inArray(usersTable.id, sellerIds)) : [];
  const sellerMap = new Map(sellers.map(s => [s.id, s]));

  res.json(products.map(p => ({
    id: p.id, name: p.name, slug: p.slug, description: p.description,
    shortDescription: p.shortDescription ?? null,
    price: parseFloat(p.price), originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
    categoryId: p.categoryId, categoryName: catMap.get(p.categoryId) ?? null,
    tags: p.tags ?? [], previewImages: p.previewImages ?? [],
    demoUrl: p.demoUrl ?? null, downloadUrl: p.downloadUrl ?? null,
    version: p.version ?? null, changelog: p.changelog ?? null,
    documentation: p.documentation ?? null, videoPreviewUrl: p.videoPreviewUrl ?? null,
    status: p.status, isFeatured: p.isFeatured, salesCount: p.salesCount,
    rating: null, reviewCount: 0,
    sellerId: p.sellerId,
    sellerEmail: p.sellerId ? (sellerMap.get(p.sellerId)?.email ?? null) : null,
    sellerName: p.sellerId ? (sellerMap.get(p.sellerId)?.displayName ?? null) : null,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  })));
});

router.get("/admin/products", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { status } = req.query as any;
  let query = db.select().from(productsTable).$dynamic();
  if (status && status !== "all") {
    query = query.where(eq(productsTable.status, status));
  }
  const products = await query.orderBy(desc(productsTable.createdAt));

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const sellerIds = [...new Set(products.map(p => p.sellerId).filter(Boolean))] as number[];
  const sellers = sellerIds.length > 0 ? await db.select({ id: usersTable.id, email: usersTable.email, displayName: usersTable.displayName }).from(usersTable).where(inArray(usersTable.id, sellerIds)) : [];
  const sellerMap = new Map(sellers.map(s => [s.id, s]));

  res.json(products.map(p => ({
    id: p.id, name: p.name, slug: p.slug, description: p.description,
    shortDescription: p.shortDescription ?? null,
    price: parseFloat(p.price), originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
    categoryId: p.categoryId, categoryName: catMap.get(p.categoryId) ?? null,
    tags: p.tags ?? [], previewImages: p.previewImages ?? [],
    demoUrl: p.demoUrl ?? null, downloadUrl: p.downloadUrl ?? null,
    version: p.version ?? null, changelog: p.changelog ?? null,
    documentation: p.documentation ?? null, videoPreviewUrl: p.videoPreviewUrl ?? null,
    status: p.status, isFeatured: p.isFeatured, salesCount: p.salesCount,
    rating: null, reviewCount: 0,
    sellerId: p.sellerId,
    sellerEmail: p.sellerId ? (sellerMap.get(p.sellerId)?.email ?? null) : null,
    sellerName: p.sellerId ? (sellerMap.get(p.sellerId)?.displayName ?? null) : null,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  })));
});

router.patch("/admin/products/:id/approve", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [product] = await db.update(productsTable)
    .set({ status: "active" })
    .where(eq(productsTable.id, id))
    .returning();
  if (!product) { res.status(404).json({ error: "Not found" }); return; }

  if (product.sellerId) {
    await db.insert(notificationsTable).values({
      userId: product.sellerId,
      type: "order",
      title: "Product Approved!",
      message: `Your product "${product.name}" has been approved and is now live on the marketplace.`,
      link: `/seller/products`,
      isRead: "false",
    });
  }

  res.json({ id: product.id, name: product.name, status: product.status });
});

router.patch("/admin/products/:id/reject", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { reason } = req.body;

  const [product] = await db.update(productsTable)
    .set({ status: "rejected" })
    .where(eq(productsTable.id, id))
    .returning();
  if (!product) { res.status(404).json({ error: "Not found" }); return; }

  if (product.sellerId) {
    await db.insert(notificationsTable).values({
      userId: product.sellerId,
      type: "order",
      title: "Product Rejected",
      message: `Your product "${product.name}" was not approved.${reason ? ` Reason: ${reason}` : " Please review and resubmit."}`,
      link: `/seller/products`,
      isRead: "false",
    });
  }

  res.json({ id: product.id, name: product.name, status: product.status });
});

router.get("/admin/revenue", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.status, "confirmed")).orderBy(paymentsTable.createdAt);

  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  const monthlyMap = new Map<string, { revenue: number; orders: number }>();
  let total = 0;

  for (const p of payments) {
    const date = p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt);
    const day = date.toISOString().slice(0, 10);
    const month = date.toISOString().slice(0, 7);
    const amount = parseFloat(p.amount);
    total += amount;

    const d = dailyMap.get(day) ?? { revenue: 0, orders: 0 };
    d.revenue += amount; d.orders += 1;
    dailyMap.set(day, d);

    const m = monthlyMap.get(month) ?? { revenue: 0, orders: 0 };
    m.revenue += amount; m.orders += 1;
    monthlyMap.set(month, m);
  }

  res.json({
    daily: Array.from(dailyMap.entries()).map(([date, data]) => ({ date, ...data })),
    monthly: Array.from(monthlyMap.entries()).map(([date, data]) => ({ date, ...data })),
    total,
  });
});

export default router;
