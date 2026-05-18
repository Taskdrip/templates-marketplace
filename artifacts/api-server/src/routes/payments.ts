import { Router } from "express";
import { db, paymentsTable, ordersTable, walletsTable, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

function toPayment(p: any) {
  return {
    id: p.id,
    orderId: p.orderId,
    amount: parseFloat(p.amount),
    chain: p.chain,
    txHash: p.txHash,
    screenshotUrl: p.screenshotUrl ?? null,
    status: p.status,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  };
}

router.get("/payments/wallets", async (_req, res): Promise<void> => {
  const wallets = await db.select().from(walletsTable).where(eq(walletsTable.isActive, true));
  res.json({
    wallets: wallets.map(w => ({
      id: w.id,
      chain: w.chain,
      address: w.address,
      label: w.label ?? null,
      isActive: w.isActive,
    })),
  });
});

router.post("/payments/submit", requireAuth, async (req, res): Promise<void> => {
  const { orderId, chain, txHash, amount, screenshotUrl } = req.body;
  if (!orderId || !chain || !txHash || !amount) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  if (order.userId !== req.userId) { res.status(403).json({ error: "Forbidden" }); return; }

  const [payment] = await db.insert(paymentsTable).values({
    orderId,
    amount: String(amount),
    chain,
    txHash,
    screenshotUrl,
    status: "pending",
  }).returning();

  await db.update(ordersTable).set({ status: "awaiting_confirmation" }).where(eq(ordersTable.id, orderId));

  await db.insert(notificationsTable).values({
    userId: order.userId,
    type: "payment",
    title: "Payment Submitted",
    message: "Your payment has been submitted and is awaiting admin confirmation.",
    link: `/dashboard/orders/${orderId}`,
    isRead: "false",
  });

  res.status(201).json(toPayment(payment));
});

router.patch("/payments/:id/verify", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { status, notes } = req.body;
  if (!status) { res.status(400).json({ error: "Missing status" }); return; }

  const [payment] = await db.update(paymentsTable)
    .set({ status, notes })
    .where(eq(paymentsTable.id, id))
    .returning();
  if (!payment) { res.status(404).json({ error: "Not found" }); return; }

  const orderStatus = status === "confirmed" ? "confirmed" : status === "rejected" ? "rejected" : "awaiting_confirmation";
  const [order] = await db.update(ordersTable)
    .set({ status: orderStatus })
    .where(eq(ordersTable.id, payment.orderId))
    .returning();

  if (order) {
    await db.insert(notificationsTable).values({
      userId: order.userId,
      type: "payment_update",
      title: status === "confirmed" ? "Payment Confirmed!" : "Payment Rejected",
      message: status === "confirmed"
        ? "Your payment has been confirmed. Your order is now being processed."
        : `Your payment was rejected. ${notes ?? ""}`,
      link: `/dashboard/orders/${order.id}`,
      isRead: "false",
    });
  }

  res.json(toPayment(payment));
});

router.get("/payments", requireAuth, async (req, res): Promise<void> => {
  let payments;
  if (req.userRole === "admin") {
    payments = await db.select().from(paymentsTable).orderBy(desc(paymentsTable.createdAt));
  } else {
    const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, req.userId!));
    const orderIds = orders.map(o => o.id);
    payments = orderIds.length > 0
      ? await db.select().from(paymentsTable).orderBy(desc(paymentsTable.createdAt))
      : [];
    payments = payments.filter(p => orderIds.includes(p.orderId));
  }
  res.json(payments.map(toPayment));
});

export default router;
