import { Router } from "express";
import { db, blogPostsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

function toPost(p: any, authorName?: string | null) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? null,
    content: p.content,
    coverImage: p.coverImage ?? null,
    authorId: p.authorId,
    authorName: authorName ?? null,
    status: p.status,
    publishedAt: p.publishedAt ? (p.publishedAt instanceof Date ? p.publishedAt.toISOString() : p.publishedAt) : null,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  };
}

router.get("/blog", async (_req, res): Promise<void> => {
  const posts = await db.select().from(blogPostsTable).where(eq(blogPostsTable.status, "published")).orderBy(desc(blogPostsTable.publishedAt));
  res.json(posts.map(p => toPost(p)));
});

router.get("/blog/all", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const posts = await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt));
  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u.displayName || u.username]));
  res.json(posts.map(p => toPost(p, userMap.get(p.authorId))));
});

router.get("/blog/:slug", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, raw));
  if (!post) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toPost(post));
});

router.post("/blog", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { title, slug, excerpt, content, coverImage, status } = req.body;
  if (!title || !slug || !content) { res.status(400).json({ error: "title, slug, content required" }); return; }

  const finalStatus = status || "draft";
  const [post] = await db.insert(blogPostsTable).values({
    title, slug, excerpt, content, coverImage,
    authorId: req.userId!,
    status: finalStatus,
    publishedAt: finalStatus === "published" ? new Date() : null,
  }).returning();

  res.status(201).json(toPost(post));
});

router.patch("/blog/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { title, slug, excerpt, content, coverImage, status } = req.body;
  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (slug !== undefined) updateData.slug = slug;
  if (excerpt !== undefined) updateData.excerpt = excerpt;
  if (content !== undefined) updateData.content = content;
  if (coverImage !== undefined) updateData.coverImage = coverImage;
  if (status !== undefined) {
    updateData.status = status;
    if (status === "published") updateData.publishedAt = new Date();
  }

  const [post] = await db.update(blogPostsTable).set(updateData).where(eq(blogPostsTable.id, id)).returning();
  if (!post) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toPost(post));
});

router.delete("/blog/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
  res.json({ message: "Deleted" });
});

export default router;
