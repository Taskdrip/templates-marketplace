import { Router } from "express";
import { db, reviewsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/products/:id/reviews", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const productId = parseInt(raw, 10);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const reviews = await db.select().from(reviewsTable)
    .where(eq(reviewsTable.productId, productId))
    .orderBy(desc(reviewsTable.createdAt));

  const userIds = [...new Set(reviews.map(r => r.userId))];
  const users = userIds.length > 0
    ? await db.select().from(usersTable)
    : [];
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json(reviews.map(r => ({
    id: r.id,
    productId: r.productId,
    userId: r.userId,
    username: userMap.get(r.userId)?.username ?? null,
    avatarUrl: userMap.get(r.userId)?.avatarUrl ?? null,
    rating: r.rating,
    comment: r.comment ?? null,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  })));
});

router.post("/products/:id/reviews", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const productId = parseInt(raw, 10);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { rating, comment } = req.body;
  if (!rating) { res.status(400).json({ error: "Missing rating" }); return; }

  const [review] = await db.insert(reviewsTable).values({
    productId,
    userId: req.userId!,
    rating,
    comment,
  }).returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));

  res.status(201).json({
    id: review.id,
    productId: review.productId,
    userId: review.userId,
    username: user?.username ?? null,
    avatarUrl: user?.avatarUrl ?? null,
    rating: review.rating,
    comment: review.comment ?? null,
    createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt,
  });
});

export default router;
