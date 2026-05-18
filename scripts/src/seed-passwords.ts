import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

async function seedPasswords() {
  const adminHash = await bcrypt.hash("admin123", 10);
  const userHash = await bcrypt.hash("user123", 10);

  await db
    .update(users)
    .set({ passwordHash: adminHash })
    .where(eq(users.email, "admin@cryptomarket.io"));

  await db
    .update(users)
    .set({ passwordHash: userHash })
    .where(eq(users.email, "john@example.com"));

  console.log("Passwords updated successfully");
  console.log("admin@cryptomarket.io / admin123");
  console.log("john@example.com / user123");
  process.exit(0);
}

seedPasswords().catch((err) => {
  console.error(err);
  process.exit(1);
});
