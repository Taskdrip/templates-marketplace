import { pgTable, text, serial, timestamp, boolean, integer, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  categoryId: integer("category_id").notNull(),
  tags: text("tags").array().notNull().default([]),
  previewImages: text("preview_images").array().notNull().default([]),
  demoUrl: text("demo_url"),
  downloadUrl: text("download_url"),
  version: text("version"),
  changelog: text("changelog"),
  documentation: text("documentation"),
  videoPreviewUrl: text("video_preview_url"),
  status: text("status").notNull().default("pending"),
  isFeatured: boolean("is_featured").notNull().default(false),
  salesCount: integer("sales_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
