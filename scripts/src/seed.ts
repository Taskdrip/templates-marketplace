import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import {
  usersTable,
  categoriesTable,
  productsTable,
  walletsTable,
  siteSettingsTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // --- Categories (idempotent) ---
  const existingCats = await db.select().from(categoriesTable);
  let categories = existingCats;
  if (categories.length === 0) {
    categories = await db.insert(categoriesTable).values([
      { name: "Source Code & Apps", slug: "source-code-apps", description: "Full web apps, mobile apps, scripts and tools", iconName: "code-2" },
      { name: "HTML Templates", slug: "templates", description: "Website templates, admin dashboards, UI kits", iconName: "layers" },
      { name: "Social Media Accounts", slug: "social-media-accounts", description: "Aged Instagram, Twitter, TikTok accounts", iconName: "instagram" },
      { name: "Facebook Accounts", slug: "facebook-accounts", description: "Aged and verified Facebook accounts & pages", iconName: "facebook" },
      { name: "Websites & Domains", slug: "websites-domains", description: "Turnkey websites and premium domain names", iconName: "globe" },
      { name: "Landing Pages", slug: "landing-pages", description: "High-converting landing page designs", iconName: "external-link" },
      { name: "Crypto & DeFi Tools", slug: "crypto-defi-tools", description: "Trading bots, DeFi scripts, blockchain utilities", iconName: "trending-up" },
      { name: "SaaS Applications", slug: "saas-apps", description: "Full SaaS app source code with billing", iconName: "package" },
      { name: "SEO & Marketing Tools", slug: "seo-marketing", description: "SEO tools, email templates, marketing automation", iconName: "bar-chart-2" },
    ]).returning();
    console.log(`Inserted ${categories.length} categories`);
  } else {
    console.log(`Skipped categories — already exist (${categories.length})`);
  }

  // --- Users (idempotent by email) ---
  const upsertUser = async (data: {
    username: string; email: string; password: string; role: "admin" | "user";
    displayName: string; phone?: string; telegramHandle?: string; isSeller?: boolean; sellerBio?: string;
  }) => {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, data.email));
    if (existing) { console.log(`  Skip user ${data.email} — already exists`); return existing; }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const [user] = await db.insert(usersTable).values({
      username: data.username, email: data.email, passwordHash,
      role: data.role, displayName: data.displayName,
      phone: data.phone, telegramHandle: data.telegramHandle,
      isSeller: data.isSeller ?? false, sellerBio: data.sellerBio, isActive: true,
    }).returning();
    console.log(`  Created user ${data.email}`);
    return user;
  };

  await upsertUser({ username: "admin", email: "admin@digimarket.io", password: "admin123", role: "admin", displayName: "Vaultrade Admin" });
  await upsertUser({ username: "john_doe", email: "john@example.com", password: "user123", role: "user", displayName: "John Doe", phone: "+1234567890", telegramHandle: "johndoe" });
  await upsertUser({ username: "techseller", email: "seller@example.com", password: "seller123", role: "user", displayName: "TechSeller Pro", telegramHandle: "techsellerpro", isSeller: true, sellerBio: "Professional developer selling premium source code and templates" });

  // --- Wallets (idempotent by chain) ---
  const upsertWallet = async (chain: string, address: string, label: string, customMessage: string) => {
    const [existing] = await db.select().from(walletsTable).where(eq(walletsTable.chain, chain));
    if (existing) { console.log(`  Skip wallet ${chain} — already exists`); return; }
    await db.insert(walletsTable).values({ chain, address, label, customMessage, isActive: true });
    console.log(`  Created wallet ${chain}`);
  };

  await upsertWallet("USDT_TRC20", "TRCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "USDT TRC20 Escrow", "Send USDT on the TRON network (TRC20). Fast and low fees. Minimum: $1 USDT.");
  await upsertWallet("USDT_TON", "EQCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "USDT TON Escrow", "Send USDT on The Open Network (TON). Lightning fast with near-zero fees.");
  await upsertWallet("USDT_BEP20", "0xBEP20xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "USDT BEP20 Escrow", "Send USDT on BNB Smart Chain (BEP20). Ensure you select BEP20 network in your wallet.");

  // --- Site Settings (idempotent by key) ---
  const upsertSetting = async (key: string, value: string) => {
    const [existing] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key));
    if (existing) { console.log(`  Skip setting ${key} — already exists`); return; }
    await db.insert(siteSettingsTable).values({ key, value });
    console.log(`  Created setting ${key}`);
  };

  await upsertSetting("telegram_link", "https://t.me/vaultrade_store");
  await upsertSetting("thank_you_message", "🎉 Thank you for your payment! Your order is being reviewed by our team. You will receive a notification once confirmed. If you need help, chat with us below or reach us on Telegram.");
  await upsertSetting("payment_instructions", "Complete your payment within 30 minutes. Send the exact USDT amount to the address shown, then enter your Transaction Hash (TXID) and upload a payment screenshot as proof.");
  await upsertSetting("site_name", "Vaultrade");
  await upsertSetting("support_email", "support@vaultrade.store");

  // --- Products (idempotent — only if none exist) ---
  const existingProducts = await db.select().from(productsTable);
  if (existingProducts.length > 0) {
    console.log(`Skipped products — already exist (${existingProducts.length})`);
  } else {
    const catMap = new Map(categories.map((c) => [c.slug, c.id]));
    const products = await db.insert(productsTable).values([
      {
        name: "Next.js SaaS Boilerplate with Auth & Billing",
        slug: "nextjs-saas-boilerplate",
        description: "Production-ready Next.js 14 SaaS starter with Stripe billing, Clerk auth, Postgres, Drizzle ORM, email notifications, and full admin dashboard. Save 200+ hours of setup.",
        shortDescription: "Next.js 14 SaaS boilerplate with billing, auth & admin panel",
        price: "199.00", originalPrice: "349.00",
        categoryId: catMap.get("source-code-apps")!,
        tags: ["nextjs", "saas", "stripe", "typescript", "boilerplate"],
        previewImages: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop"],
        version: "3.1.0", status: "active", isFeatured: true, salesCount: 487,
        downloadUrl: "https://example.com/dl/nextjs-saas.zip",
      },
      {
        name: "React Native E-Commerce Mobile App",
        slug: "react-native-ecommerce-app",
        description: "Full e-commerce mobile app built with React Native + Expo. Includes product listing, cart, checkout, order tracking, push notifications, and admin API. iOS & Android.",
        shortDescription: "Full React Native e-commerce app for iOS & Android",
        price: "149.00", originalPrice: "249.00",
        categoryId: catMap.get("source-code-apps")!,
        tags: ["react-native", "expo", "mobile", "ecommerce"],
        previewImages: ["https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop"],
        version: "2.0.1", status: "active", isFeatured: true, salesCount: 312,
        downloadUrl: "https://example.com/dl/rn-ecommerce.zip",
      },
      {
        name: "Python Telegram Bot Framework",
        slug: "python-telegram-bot-framework",
        description: "Advanced Python Telegram bot framework with command routing, inline keyboards, payment integration, database support, and admin broadcast.",
        shortDescription: "Advanced Python Telegram bot with payments & admin panel",
        price: "49.00",
        categoryId: catMap.get("source-code-apps")!,
        tags: ["python", "telegram", "bot", "automation"],
        previewImages: ["https://images.unsplash.com/photo-1527430253228-e93688616381?w=800&auto=format&fit=crop"],
        version: "4.2.0", status: "active", isFeatured: false, salesCount: 1203,
        downloadUrl: "https://example.com/dl/tg-bot.zip",
      },
      {
        name: "CryptoX - Web3 Landing Page Template",
        slug: "cryptox-web3-template",
        description: "Stunning Web3 / crypto landing page template built with HTML5, CSS3, and vanilla JS. Includes hero, tokenomics, roadmap, team, and FAQ. Fully responsive.",
        shortDescription: "Web3 crypto landing page — HTML5 + animations",
        price: "29.00",
        categoryId: catMap.get("templates")!,
        tags: ["html", "web3", "crypto", "landing-page", "responsive"],
        previewImages: ["https://images.unsplash.com/photo-1639762681485-074b7f4ec6ae?w=800&auto=format&fit=crop"],
        version: "1.5.0", status: "active", isFeatured: true, salesCount: 892,
        downloadUrl: "https://example.com/dl/cryptox-template.zip",
      },
      {
        name: "AdminPro - React Dashboard Template",
        slug: "adminpro-dashboard-template",
        description: "Premium React + Tailwind CSS admin dashboard with 50+ components, dark/light mode, data tables, charts, auth pages, and e-commerce module.",
        shortDescription: "React + Tailwind admin dashboard — 50+ components",
        price: "59.00", originalPrice: "89.00",
        categoryId: catMap.get("templates")!,
        tags: ["react", "dashboard", "tailwind", "typescript", "admin"],
        previewImages: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop"],
        version: "2.3.0", status: "active", isFeatured: false, salesCount: 654,
        downloadUrl: "https://example.com/dl/adminpro.zip",
      },
      {
        name: "Instagram Account — 50K Followers (Fashion Niche)",
        slug: "instagram-50k-fashion",
        description: "Aged 3-year-old Instagram account in the fashion/lifestyle niche with 50,000 real followers. High engagement rate (3.8%). Includes original email.",
        shortDescription: "50K real followers, fashion niche, 3-year-old IG account",
        price: "299.00", originalPrice: "450.00",
        categoryId: catMap.get("social-media-accounts")!,
        tags: ["instagram", "fashion", "50k", "aged-account"],
        previewImages: ["https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop"],
        status: "active", isFeatured: true, salesCount: 34, downloadUrl: "",
      },
      {
        name: "Twitter/X Account — 25K Followers (Crypto/Finance)",
        slug: "twitter-25k-crypto",
        description: "Established Twitter/X account in the crypto & finance niche with 25,000 engaged followers. 5-year-old account. Original email included.",
        shortDescription: "25K followers crypto/finance Twitter account — 5yrs old",
        price: "189.00",
        categoryId: catMap.get("social-media-accounts")!,
        tags: ["twitter", "x", "crypto", "finance", "25k"],
        previewImages: ["https://images.unsplash.com/photo-1611162616305-c69b3037c7bb?w=800&auto=format&fit=crop"],
        status: "active", isFeatured: false, salesCount: 28, downloadUrl: "",
      },
      {
        name: "TikTok Account — 100K Followers (Tech Reviews)",
        slug: "tiktok-100k-tech",
        description: "Viral TikTok account in the tech review niche. 100,000 followers, 2M+ total likes. Consistent posting history. Full account transfer.",
        shortDescription: "100K follower TikTok tech review account, 2M likes",
        price: "499.00",
        categoryId: catMap.get("social-media-accounts")!,
        tags: ["tiktok", "tech", "100k", "viral"],
        previewImages: ["https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&auto=format&fit=crop"],
        status: "active", isFeatured: false, salesCount: 12, downloadUrl: "",
      },
      {
        name: "Facebook Business Page — 80K Likes (E-Commerce)",
        slug: "facebook-page-80k-ecommerce",
        description: "Aged Facebook Business Page in the e-commerce/shopping niche with 80,000 page likes and 75,000 followers. 4-year-old page with consistent engagement.",
        shortDescription: "80K liked Facebook business page — e-commerce niche",
        price: "349.00", originalPrice: "550.00",
        categoryId: catMap.get("facebook-accounts")!,
        tags: ["facebook", "page", "80k", "ecommerce", "business"],
        previewImages: ["https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&auto=format&fit=crop"],
        status: "active", isFeatured: true, salesCount: 21, downloadUrl: "",
      },
      {
        name: "Dropshipping Store — Beauty Niche (DA 28)",
        slug: "dropshipping-beauty-store",
        description: "Fully built Shopify dropshipping store in the beauty & skincare niche. DA 28, 1,200 monthly organic visitors, 180 products imported.",
        shortDescription: "Shopify beauty store, DA 28, 1.2K monthly visitors",
        price: "799.00", originalPrice: "1200.00",
        categoryId: catMap.get("websites-domains")!,
        tags: ["shopify", "dropshipping", "beauty", "ecommerce"],
        previewImages: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop"],
        status: "active", isFeatured: true, salesCount: 8, downloadUrl: "",
      },
      {
        name: "Binance Grid Trading Bot (Python)",
        slug: "binance-grid-trading-bot",
        description: "Automated grid trading bot for Binance Spot & Futures. Configurable grid levels, TP/SL, Telegram notifications, and live dashboard. Includes 30-day backtest results.",
        shortDescription: "Binance grid bot — Python, backtested, Telegram alerts",
        price: "149.00", originalPrice: "249.00",
        categoryId: catMap.get("crypto-defi-tools")!,
        tags: ["binance", "bot", "trading", "python", "grid"],
        previewImages: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop"],
        version: "2.3.1", status: "active", isFeatured: false, salesCount: 312,
        downloadUrl: "https://example.com/dl/grid-bot.zip",
      },
      {
        name: "Link-in-Bio SaaS — Full Source Code",
        slug: "link-in-bio-saas",
        description: "Complete link-in-bio SaaS application like Linktree. Built with Next.js 14, Stripe subscriptions, custom domains, analytics, 5 themes. Ready to monetize.",
        shortDescription: "Linktree-style SaaS — Next.js, Stripe, custom domains",
        price: "299.00", originalPrice: "499.00",
        categoryId: catMap.get("saas-apps")!,
        tags: ["saas", "nextjs", "stripe", "linktree"],
        previewImages: ["https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop"],
        version: "1.2.0", status: "active", isFeatured: true, salesCount: 156,
        downloadUrl: "https://example.com/dl/link-bio-saas.zip",
      },
      {
        name: "1000 High-DA Guest Post Opportunities (CSV)",
        slug: "guest-post-opportunities-da40plus",
        description: "Curated database of 1,000+ websites accepting guest posts with DA 40+. Includes contact emails, niche, pricing, and submission guidelines. Updated monthly.",
        shortDescription: "1,000 DA40+ guest post sites with emails — updated monthly",
        price: "39.00",
        categoryId: catMap.get("seo-marketing")!,
        tags: ["seo", "guest-post", "backlinks", "database"],
        previewImages: ["https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&auto=format&fit=crop"],
        status: "active", isFeatured: false, salesCount: 445,
        downloadUrl: "https://example.com/dl/guest-posts.csv",
      },
    ]).returning();
    console.log(`Inserted ${products.length} products`);
  }

  console.log("\nSeed complete!");
  console.log("Admin:  admin@digimarket.io / admin123");
  console.log("Buyer:  john@example.com / user123");
  console.log("Seller: seller@example.com / seller123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
