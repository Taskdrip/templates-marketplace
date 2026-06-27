import { Router } from "express";
import bcrypt from "bcrypt";
import { createRequire } from "node:module";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { signToken, signPendingToken, verifyToken } from "../lib/jwt";
import { requireAuth } from "../middlewares/auth";

// otplib and qrcode are CJS modules — use createRequire for ESM interop
const _require = createRequire(import.meta.url);
const { authenticator } = _require("otplib") as {
  authenticator: {
    generateSecret: () => string;
    keyuri: (user: string, service: string, secret: string) => string;
    check: (token: string, secret: string) => boolean;
  };
};
const { toDataURL } = _require("qrcode") as {
  toDataURL: (data: string) => Promise<string>;
};

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
  res.status(201).json({ token, user: toUserResponse(user) });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, phone, telegram, password } = req.body;

  if (!password) { res.status(400).json({ error: "Password is required" }); return; }

  let user;
  if (email) {
    [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  } else if (phone) {
    [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone));
  } else if (telegram) {
    const handle = telegram.startsWith("@") ? telegram.slice(1) : telegram;
    [user] = await db.select().from(usersTable).where(eq(usersTable.telegramHandle, handle));
  } else {
    res.status(400).json({ error: "Provide email, phone, or Telegram handle" }); return;
  }

  if (!user) { res.status(401).json({ error: "Invalid credentials" }); return; }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }

  if (!user.isActive) { res.status(403).json({ error: "Account is disabled" }); return; }

  // Admin with 2FA enabled — issue a short-lived pending token instead
  if (user.role === "admin" && user.totpEnabled && user.totpSecret) {
    const pendingToken = signPendingToken({ userId: user.id, role: user.role });
    res.json({ requires2fa: true, pendingToken });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({ token, user: toUserResponse(user) });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(toUserResponse(user));
});

router.post("/auth/logout", requireAuth, async (_req, res): Promise<void> => {
  res.json({ message: "Logged out successfully" });
});

// ─── 2FA routes (admin only) ─────────────────────────────────────────────────

router.get("/auth/2fa/status", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ enabled: user.totpEnabled ?? false });
});

router.post("/auth/2fa/setup", requireAuth, async (req, res): Promise<void> => {
  if (req.userRole !== "admin") { res.status(403).json({ error: "Admin only" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email, "Vaultrade Admin", secret);
  const qrCodeDataUri = await toDataURL(otpauth);

  await db.update(usersTable)
    .set({ totpSecret: secret, totpEnabled: false })
    .where(eq(usersTable.id, req.userId!));

  res.json({ secret, qrCodeDataUri, otpauth });
});

router.post("/auth/2fa/enable", requireAuth, async (req, res): Promise<void> => {
  if (req.userRole !== "admin") { res.status(403).json({ error: "Admin only" }); return; }

  const { totpCode } = req.body;
  if (!totpCode) { res.status(400).json({ error: "TOTP code required" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user?.totpSecret) { res.status(400).json({ error: "Run setup first" }); return; }

  const isValid = authenticator.check(String(totpCode), user.totpSecret);
  if (!isValid) { res.status(400).json({ error: "Invalid code — try again." }); return; }

  await db.update(usersTable).set({ totpEnabled: true }).where(eq(usersTable.id, req.userId!));
  res.json({ message: "2FA enabled successfully" });
});

router.post("/auth/2fa/disable", requireAuth, async (req, res): Promise<void> => {
  if (req.userRole !== "admin") { res.status(403).json({ error: "Admin only" }); return; }

  const { totpCode } = req.body;
  if (!totpCode) { res.status(400).json({ error: "TOTP code required" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user?.totpSecret || !user.totpEnabled) { res.status(400).json({ error: "2FA is not enabled" }); return; }

  const isValid = authenticator.check(String(totpCode), user.totpSecret);
  if (!isValid) { res.status(400).json({ error: "Invalid code" }); return; }

  await db.update(usersTable)
    .set({ totpEnabled: false, totpSecret: null })
    .where(eq(usersTable.id, req.userId!));
  res.json({ message: "2FA disabled" });
});

router.post("/auth/2fa/verify", async (req, res): Promise<void> => {
  const { pendingToken, totpCode } = req.body;
  if (!pendingToken || !totpCode) { res.status(400).json({ error: "Missing fields" }); return; }

  let payload: any;
  try {
    payload = verifyToken(pendingToken);
  } catch {
    res.status(401).json({ error: "Invalid or expired token. Please log in again." }); return;
  }

  if (!payload.pending2fa) { res.status(400).json({ error: "Not a pending 2FA token" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
  if (!user?.totpSecret) { res.status(400).json({ error: "2FA not configured" }); return; }

  const isValid = authenticator.check(String(totpCode), user.totpSecret);
  if (!isValid) { res.status(401).json({ error: "Invalid authenticator code" }); return; }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({ token, user: toUserResponse(user) });
});

// ─── Pi Network Auth ──────────────────────────────────────────────────────────

router.post("/auth/pi-login", async (req, res): Promise<void> => {
  const { piUid, piUsername } = req.body;
  if (!piUid || !piUsername) {
    res.status(400).json({ error: "Missing Pi Network credentials" });
    return;
  }

  const piEmail = `${piUid}@pi.network`;
  let [user] = await db.select().from(usersTable).where(eq(usersTable.email, piEmail));

  if (!user) {
    let username = piUsername.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const [existingUsername] = await db.select().from(usersTable).where(eq(usersTable.username, username));
    if (existingUsername) username = `${username}_${Date.now().toString(36)}`;

    [user] = await db.insert(usersTable).values({
      username,
      email: piEmail,
      passwordHash: `pi_auth_${piUid}`,
      displayName: piUsername,
      telegramHandle: piUid,
      isActive: true,
    }).returning();
  }

  if (!user.isActive) {
    res.status(403).json({ error: "Account is deactivated" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({ token, user: toUserResponse(user) });
});

// ─── Helper ───────────────────────────────────────────────────────────────────

function toUserResponse(user: any) {
  return {
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
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    totalPurchases: 0,
  };
}

export default router;
