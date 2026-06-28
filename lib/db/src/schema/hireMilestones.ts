import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";

export const hireMilestonesTable = pgTable("hire_milestones", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  amountPi: numeric("amount_pi", { precision: 12, scale: 2 }).notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  status: text("status").notNull().default("locked"),
  releasedAt: timestamp("released_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type HireMilestone = typeof hireMilestonesTable.$inferSelect;
export type InsertHireMilestone = typeof hireMilestonesTable.$inferInsert;
