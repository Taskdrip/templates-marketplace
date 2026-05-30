import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await db.select().from(siteSettingsTable);
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  res.json(map);
});

router.patch("/settings", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const updates: Record<string, string> = req.body;
  if (!updates || typeof updates !== "object") {
    res.status(400).json({ error: "Body must be a key-value object" });
    return;
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (typeof value !== "string") continue;
    const [existing] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key));
    if (existing) {
      const [updated] = await db.update(siteSettingsTable).set({ value }).where(eq(siteSettingsTable.key, key)).returning();
      result[updated.key] = updated.value;
    } else {
      const [created] = await db.insert(siteSettingsTable).values({ key, value }).returning();
      result[created.key] = created.value;
    }
  }

  res.json(result);
});

export default router;
