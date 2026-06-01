import { Router } from "express";
import { db, ordersTable, productsTable, paymentsTable, notificationsTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

function toOrderResponse(o: any, product?: any, payment?: any) {
  return {
    id: o.id,
    userId: o.userId,
    productId: o.productId,
    sellerId: product?.sellerId ?? null,
    productName: product?.name ?? null,
    productImage: product?.previewImages?.[0] ?? null,
    amount: parseFloat(o.amount),
    status: o.status,
    adminNotes: o.adminNotes ?? null,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
    updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt,
    payment: payment ? {
      id: payment.id,
      orderId: payment.orderId,
      amount: parseFloat(payment.amount),
      chain: payment.chain,
      txHash: payment.txHash,
      screenshotUrl: payment.screenshotUrl ?? null,
      status: payment.status,
      createdAt: payment.createdAt instanceof Date ? payment.createdAt.toISOString() : payment.createdAt,
    } : null,
  };
}

router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable)
    .where(req.userRole === "admin" ? undefined : eq(ordersTable.userId, req.userId!))
    .orderBy(desc(ordersTable.createdAt));

  const productIds = [...new Set(orders.map(o => o.productId))];
  const products = productIds.length > 0
    ? await db.select().from(productsTable)
    : [];
  const allProducts = products.filter(p => productIds.includes(p.id));
  const productMap = new Map(allProducts.map(p => [p.id, p]));

  const payments = await db.select().from(paymentsTable);
  const paymentMap = new Map(payments.map(p => [p.orderId, p]));

  res.json(orders.map(o => toOrderResponse(o, productMap.get(o.productId), paymentMap.get(o.id))));
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const { productId } = req.body;
  if (!productId) { res.status(400).json({ error: "Missing productId" }); return; }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  const [order] = await db.insert(ordersTable).values({
    userId: req.userId!,
    productId,
    amount: product.price,
    status: "pending",
  }).returning();

  await db.insert(notificationsTable).values({
    userId: req.userId!,
    type: "order",
    title: "Order Created",
    message: `Your order for "${product.name}" has been created. Please complete payment.`,
    link: `/dashboard/orders/${order.id}`,
    isRead: "false",
  });

  if (product.sellerId) {
    await db.insert(notificationsTable).values({
      userId: product.sellerId,
      type: "order",
      title: "New Order for Your Product!",
      message: `Someone ordered "${product.name}" — $${parseFloat(product.price).toFixed(2)} USDT is now in escrow.`,
      link: `/dashboard`,
      isRead: "false",
    });
  }

  res.status(201).json(toOrderResponse(order, product));
});

router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  if (req.userRole !== "admin" && order.userId !== req.userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, order.productId));
  const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.orderId, id));

  res.json(toOrderResponse(order, product, payment));
});

router.post("/orders/:id/confirm-receipt", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  if (order.userId !== req.userId) { res.status(403).json({ error: "Forbidden" }); return; }
  if (order.status !== "confirmed") {
    res.status(400).json({ error: "Order must be in confirmed status to confirm receipt" });
    return;
  }

  const [updatedOrder] = await db.update(ordersTable)
    .set({ status: "delivered" })
    .where(eq(ordersTable.id, id))
    .returning();

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, order.productId));

  await db.insert(notificationsTable).values({
    userId: order.userId,
    type: "order_update",
    title: "Receipt Confirmed",
    message: `You confirmed receipt for "${product?.name ?? `Order #${id}`}". Funds will be released to the seller.`,
    link: `/dashboard/orders/${id}`,
    isRead: "false",
  });

  if (product?.sellerId) {
    await db.insert(notificationsTable).values({
      userId: product.sellerId,
      type: "payment",
      title: "Buyer Confirmed Receipt!",
      message: `Buyer confirmed receipt for "${product.name}". Funds pending release by admin.`,
      link: `/dashboard`,
      isRead: "false",
    });
  }

  const admins = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.role, "admin"));
  for (const admin of admins) {
    await db.insert(notificationsTable).values({
      userId: admin.id,
      type: "order_update",
      title: "Buyer Confirmed Receipt — Release Funds",
      message: `Order #${id} buyer confirmed receipt for "${product?.name}". Please release funds to seller.`,
      link: `/admin/orders`,
      isRead: "false",
    });
  }

  const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.orderId, id));
  res.json(toOrderResponse(updatedOrder, product, payment));
});

router.patch("/orders/:id/status", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { status, adminNotes } = req.body;
  if (!status) { res.status(400).json({ error: "Missing status" }); return; }

  const [order] = await db.update(ordersTable)
    .set({ status, adminNotes })
    .where(eq(ordersTable.id, id))
    .returning();
  if (!order) { res.status(404).json({ error: "Not found" }); return; }

  const statusMessages: Record<string, string> = {
    confirmed: "Your payment has been confirmed. Your order is ready for download.",
    delivered: "Your order has been delivered successfully.",
    rejected: "Your order has been rejected.",
    funds_released: "The seller has been paid for this order.",
  };

  await db.insert(notificationsTable).values({
    userId: order.userId,
    type: "order_update",
    title: "Order Status Updated",
    message: statusMessages[status] ?? `Your order #${order.id} status has been updated to: ${status}`,
    link: `/dashboard/orders/${order.id}`,
    isRead: "false",
  });

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, order.productId));
  const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.orderId, id));

  if (status === "funds_released" && product?.sellerId) {
    const sellerAmount = parseFloat(order.amount) * 0.9;
    await db.insert(notificationsTable).values({
      userId: product.sellerId,
      type: "payment",
      title: "Funds Released to You!",
      message: `$${sellerAmount.toFixed(2)} USDT has been released for "${product.name}" (Order #${id}).`,
      link: `/dashboard`,
      isRead: "false",
    });
  }

  res.json(toOrderResponse(order, product, payment));
});

export default router;
