import { Router } from "express";
import bcrypt from "bcrypt";
import { db, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { signToken } from "../lib/jwt";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const { username, email, password, displayName, phone, telegramHandle, isSeller, sellerBio } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    username,
    email,
    passwordHash,
    displayName: displayName || username,
    phone: phone || null,
    telegramHandle: telegramHandle || null,
    isSeller: isSeller === true,
    sellerBio: sellerBio || null,
  }).returning();

  const token = signToken({ userId: user.id, role: user.role });
  res.status(201).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      displayName: user.displayName,
      phone: user.phone,
      telegramHandle: user.telegramHandle,
      isSeller: user.isSeller,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      totalPurchases: 0,
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, phone, telegram, password } = req.body;

  if (!password) {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  let user;
  if (email) {
    [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  } else if (phone) {
    [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone));
  } else if (telegram) {
    const handle = telegram.startsWith("@") ? telegram.slice(1) : telegram;
    [user] = await db.select().from(usersTable).where(eq(usersTable.telegramHandle, handle));
  } else {
    res.status(400).json({ error: "Provide email, phone, or Telegram handle" });
    return;
  }

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: "Account is disabled" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      displayName: user.displayName,
      phone: user.phone,
      telegramHandle: user.telegramHandle,
      isSeller: user.isSeller,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      totalPurchases: 0,
    },
  });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    displayName: user.displayName,
    phone: user.phone,
    telegramHandle: user.telegramHandle,
    isSeller: user.isSeller,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    totalPurchases: 0,
  });
});

router.post("/auth/logout", requireAuth, async (_req, res): Promise<void> => {
  res.json({ message: "Logged out successfully" });
});

export default router;
