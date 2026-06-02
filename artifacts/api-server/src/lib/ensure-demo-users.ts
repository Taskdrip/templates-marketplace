import bcrypt from "bcrypt";
import { db, usersTable } from "@workspace/db";
import { logger } from "./logger";

const DEMO_USERS = [
  {
    username: "admin",
    email: "admin@digimarket.io",
    password: "admin123",
    role: "admin" as const,
    displayName: "DigiMarket Admin",
    isActive: true,
    isSeller: false,
  },
  {
    username: "john_buyer",
    email: "john@example.com",
    password: "user123",
    role: "user" as const,
    displayName: "John Buyer",
    isActive: true,
    isSeller: false,
  },
  {
    username: "cryptodevpro",
    email: "seller@example.com",
    password: "seller123",
    role: "user" as const,
    displayName: "CryptoDevPro",
    isActive: true,
    isSeller: true,
    sellerBio: "Professional DeFi developer with 5+ years of experience building high-performance trading bots and blockchain automation tools.",
  },
];

export async function ensureDemoUsers(): Promise<void> {
  try {
    for (const u of DEMO_USERS) {
      const { password, ...rest } = u;
      const passwordHash = await bcrypt.hash(password, 10);
      await db
        .insert(usersTable)
        .values({ ...rest, passwordHash })
        .onConflictDoNothing();
    }
    logger.info("Demo users verified/created");
  } catch (err) {
    logger.warn({ err }, "Could not ensure demo users (non-fatal)");
  }
}
