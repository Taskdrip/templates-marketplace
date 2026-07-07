import { pgTable, text, serial, timestamp, integer, numeric, boolean } from "drizzle-orm/pg-core";

export const hireRequestsTable = pgTable("hire_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  appType: text("app_type").notNull(),
  blockchainType: text("blockchain_type").notNull().default("pi"),
  features: text("features"),
  budgetMin: numeric("budget_min", { precision: 12, scale: 2 }),
  budgetMax: numeric("budget_max", { precision: 12, scale: 2 }),
  timeline: text("timeline"),
  status: text("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  contactWhatsapp: text("contact_whatsapp"),
  contactTelegram: text("contact_telegram"),
  includesHosting: boolean("includes_hosting").notNull().default(false),
  includesDomain: boolean("includes_domain").notNull().default(false),
  hostingMonths: integer("hosting_months"),
  depositPiAmount: numeric("deposit_pi_amount", { precision: 12, scale: 4 }),
  depositPaidAt: timestamp("deposit_paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type HireRequest = typeof hireRequestsTable.$inferSelect;
export type InsertHireRequest = typeof hireRequestsTable.$inferInsert;
