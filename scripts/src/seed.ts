import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import {
  usersTable,
  categoriesTable,
  productsTable,
  walletsTable,
} from "@workspace/db/schema";

async function seed() {
  console.log("Seeding database...");

  // Categories matching the new marketplace focus
  const categories = await db
    .insert(categoriesTable)
    .values([
      { name: "Source Code & Apps", slug: "source-code-apps", description: "Full web apps, mobile apps, scripts and tools", iconName: "code-2" },
      { name: "HTML Templates", slug: "templates", description: "Website templates, admin dashboards, UI kits", iconName: "layers" },
      { name: "Social Media Accounts", slug: "social-media-accounts", description: "Aged Instagram, Twitter, TikTok accounts", iconName: "instagram" },
      { name: "Facebook Accounts", slug: "facebook-accounts", description: "Aged and verified Facebook accounts & pages", iconName: "facebook" },
      { name: "Websites & Domains", slug: "websites-domains", description: "Turnkey websites and premium domain names", iconName: "globe" },
      { name: "Landing Pages", slug: "landing-pages", description: "High-converting landing page designs", iconName: "external-link" },
      { name: "Crypto & DeFi Tools", slug: "crypto-defi-tools", description: "Trading bots, DeFi scripts, blockchain utilities", iconName: "trending-up" },
      { name: "SaaS Applications", slug: "saas-apps", description: "Full SaaS app source code with billing", iconName: "package" },
      { name: "SEO & Marketing Tools", slug: "seo-marketing", description: "SEO tools, email templates, marketing automation", iconName: "bar-chart-2" },
    ])
    .returning();

  console.log(`Inserted ${categories.length} categories`);

  // Users
  const adminHash = await bcrypt.hash("admin123", 10);
  const userHash = await bcrypt.hash("user123", 10);
  const sellerHash = await bcrypt.hash("seller123", 10);

  const users = await db
    .insert(usersTable)
    .values([
      {
        username: "admin",
        email: "admin@digimarket.io",
        passwordHash: adminHash,
        role: "admin",
        displayName: "DigiMarket Admin",
        isActive: true,
      },
      {
        username: "john_doe",
        email: "john@example.com",
        passwordHash: userHash,
        role: "user",
        displayName: "John Doe",
        phone: "+1234567890",
        telegramHandle: "johndoe",
        isActive: true,
      },
      {
        username: "techseller",
        email: "seller@example.com",
        passwordHash: sellerHash,
        role: "user",
        displayName: "TechSeller Pro",
        telegramHandle: "techsellerpro",
        isSeller: true,
        sellerBio: "Professional developer selling premium source code and templates",
        isActive: true,
      },
    ])
    .returning();

  console.log(`Inserted ${users.length} users`);

  // Wallets
  await db
    .insert(walletsTable)
    .values([
      { chain: "USDT_TRC20", address: "TRCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", label: "USDT TRC20 Escrow", isActive: true },
      { chain: "USDT_TON", address: "EQCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", label: "USDT TON Escrow", isActive: true },
      { chain: "USDT_BEP20", address: "0xBEP20xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", label: "USDT BEP20 Escrow", isActive: true },
    ])
    .returning();

  console.log("Inserted 3 wallets");

  // Build category map
  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  // Products
  const products = await db
    .insert(productsTable)
    .values([
      // Source Code & Apps
      {
        name: "Next.js SaaS Boilerplate with Auth & Billing",
        slug: "nextjs-saas-boilerplate",
        description: "Production-ready Next.js 14 SaaS starter with Stripe billing, Clerk auth, Postgres, Drizzle ORM, email notifications, and full admin dashboard. Save 200+ hours of setup.",
        shortDescription: "Next.js 14 SaaS boilerplate with billing, auth & admin panel",
        price: "199.00",
        originalPrice: "349.00",
        categoryId: catMap.get("source-code-apps")!,
        tags: ["nextjs", "saas", "stripe", "typescript", "boilerplate"],
        previewImages: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop"],
        version: "3.1.0",
        status: "active",
        isFeatured: true,
        salesCount: 487,
        downloadUrl: "https://example.com/dl/nextjs-saas.zip",
      },
      {
        name: "React Native E-Commerce Mobile App",
        slug: "react-native-ecommerce-app",
        description: "Full e-commerce mobile app built with React Native + Expo. Includes product listing, cart, checkout, order tracking, push notifications, and admin API. iOS & Android.",
        shortDescription: "Full React Native e-commerce app for iOS & Android",
        price: "149.00",
        originalPrice: "249.00",
        categoryId: catMap.get("source-code-apps")!,
        tags: ["react-native", "expo", "mobile", "ecommerce"],
        previewImages: ["https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop"],
        version: "2.0.1",
        status: "active",
        isFeatured: true,
        salesCount: 312,
        downloadUrl: "https://example.com/dl/rn-ecommerce.zip",
      },
      {
        name: "Python Telegram Bot Framework",
        slug: "python-telegram-bot-framework",
        description: "Advanced Python Telegram bot framework with command routing, inline keyboards, payment integration, database support, and admin broadcast. Deploy to any VPS in minutes.",
        shortDescription: "Advanced Python Telegram bot with payments & admin panel",
        price: "49.00",
        categoryId: catMap.get("source-code-apps")!,
        tags: ["python", "telegram", "bot", "automation"],
        previewImages: ["https://images.unsplash.com/photo-1527430253228-e93688616381?w=800&auto=format&fit=crop"],
        version: "4.2.0",
        status: "active",
        isFeatured: false,
        salesCount: 1203,
        downloadUrl: "https://example.com/dl/tg-bot.zip",
      },
      // HTML Templates
      {
        name: "CryptoX - Web3 Landing Page Template",
        slug: "cryptox-web3-template",
        description: "Stunning Web3 / crypto landing page template built with HTML5, CSS3, and vanilla JS. Includes hero section, tokenomics, roadmap, team, and FAQ components. Fully responsive.",
        shortDescription: "Web3 crypto landing page — HTML5 + animations",
        price: "29.00",
        categoryId: catMap.get("templates")!,
        tags: ["html", "web3", "crypto", "landing-page", "responsive"],
        previewImages: ["https://images.unsplash.com/photo-1639762681485-074b7f4ec6ae?w=800&auto=format&fit=crop"],
        version: "1.5.0",
        status: "active",
        isFeatured: true,
        salesCount: 892,
        downloadUrl: "https://example.com/dl/cryptox-template.zip",
      },
      {
        name: "AdminPro - React Dashboard Template",
        slug: "adminpro-dashboard-template",
        description: "Premium React + Tailwind CSS admin dashboard with 50+ components, dark/light mode, data tables, charts, auth pages, and e-commerce module. Built with TypeScript.",
        shortDescription: "React + Tailwind admin dashboard — 50+ components",
        price: "59.00",
        originalPrice: "89.00",
        categoryId: catMap.get("templates")!,
        tags: ["react", "dashboard", "tailwind", "typescript", "admin"],
        previewImages: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop"],
        version: "2.3.0",
        status: "active",
        isFeatured: false,
        salesCount: 654,
        downloadUrl: "https://example.com/dl/adminpro.zip",
      },
      // Social Media Accounts
      {
        name: "Instagram Account — 50K Followers (Fashion Niche)",
        slug: "instagram-50k-fashion",
        description: "Aged 3-year-old Instagram account in the fashion/lifestyle niche with 50,000 real followers. High engagement rate (3.8%). Includes original email. Verified with phone.",
        shortDescription: "50K real followers, fashion niche, 3-year-old IG account",
        price: "299.00",
        originalPrice: "450.00",
        categoryId: catMap.get("social-media-accounts")!,
        tags: ["instagram", "fashion", "50k", "aged-account", "real-followers"],
        previewImages: ["https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop"],
        status: "active",
        isFeatured: true,
        salesCount: 34,
        downloadUrl: "",
      },
      {
        name: "Twitter/X Account — 25K Followers (Crypto/Finance)",
        slug: "twitter-25k-crypto",
        description: "Established Twitter/X account in the crypto & finance niche with 25,000 engaged followers. 5-year-old account, blue checkmark eligible. Original email included.",
        shortDescription: "25K followers crypto/finance Twitter account — 5yrs old",
        price: "189.00",
        categoryId: catMap.get("social-media-accounts")!,
        tags: ["twitter", "x", "crypto", "finance", "25k"],
        previewImages: ["https://images.unsplash.com/photo-1611162616305-c69b3037c7bb?w=800&auto=format&fit=crop"],
        status: "active",
        isFeatured: false,
        salesCount: 28,
        downloadUrl: "",
      },
      {
        name: "TikTok Account — 100K Followers (Tech Reviews)",
        slug: "tiktok-100k-tech",
        description: "Viral TikTok account in the tech review niche. 100,000 followers, 2M+ total likes. Consistent posting history. Original credentials with full account transfer.",
        shortDescription: "100K follower TikTok tech review account, 2M likes",
        price: "499.00",
        categoryId: catMap.get("social-media-accounts")!,
        tags: ["tiktok", "tech", "100k", "viral"],
        previewImages: ["https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&auto=format&fit=crop"],
        status: "active",
        isFeatured: false,
        salesCount: 12,
        downloadUrl: "",
      },
      // Facebook Accounts
      {
        name: "Facebook Business Page — 80K Likes (E-Commerce)",
        slug: "facebook-page-80k-ecommerce",
        description: "Aged Facebook Business Page in the e-commerce/shopping niche with 80,000 page likes and 75,000 followers. 4-year-old page with consistent engagement history.",
        shortDescription: "80K liked Facebook business page — e-commerce niche",
        price: "349.00",
        originalPrice: "550.00",
        categoryId: catMap.get("facebook-accounts")!,
        tags: ["facebook", "page", "80k", "ecommerce", "business"],
        previewImages: ["https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&auto=format&fit=crop"],
        status: "active",
        isFeatured: true,
        salesCount: 21,
        downloadUrl: "",
      },
      {
        name: "Facebook Personal Account — 5K Friends (USA)",
        slug: "facebook-personal-5k-usa",
        description: "Aged US Facebook personal account with 5,000 friends, established profile since 2018. Original email included. Clean history, ad-account ready.",
        shortDescription: "US Facebook account, 5K friends, ad-account ready",
        price: "89.00",
        categoryId: catMap.get("facebook-accounts")!,
        tags: ["facebook", "personal", "5k", "usa", "aged"],
        previewImages: ["https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop"],
        status: "active",
        isFeatured: false,
        salesCount: 67,
        downloadUrl: "",
      },
      // Websites & Domains
      {
        name: "Dropshipping Store — Beauty Niche (DA 28)",
        slug: "dropshipping-beauty-store",
        description: "Fully built Shopify dropshipping store in the beauty & skincare niche. DA 28, 1,200 monthly organic visitors, AliExpress connected, 180 products imported. Includes social media assets.",
        shortDescription: "Shopify beauty store, DA 28, 1.2K monthly visitors",
        price: "799.00",
        originalPrice: "1200.00",
        categoryId: catMap.get("websites-domains")!,
        tags: ["shopify", "dropshipping", "beauty", "ecommerce", "domain"],
        previewImages: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop"],
        status: "active",
        isFeatured: true,
        salesCount: 8,
        downloadUrl: "",
      },
      {
        name: "Premium Domain — CryptoVault.io",
        slug: "domain-cryptovault-io",
        description: "Premium aged domain CryptoVault.io — perfect for a crypto wallet, exchange, or DeFi project. DA 12, clean backlink profile, 2019 registration date. Instant transfer.",
        shortDescription: "CryptoVault.io — aged premium domain, DA 12",
        price: "450.00",
        categoryId: catMap.get("websites-domains")!,
        tags: ["domain", "crypto", "premium", "aged", "io"],
        previewImages: ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop"],
        status: "active",
        isFeatured: false,
        salesCount: 3,
        downloadUrl: "",
      },
      // Landing Pages
      {
        name: "SaaS Launch Landing Page (Webflow)",
        slug: "saas-launch-landing-webflow",
        description: "High-converting SaaS launch landing page built in Webflow. Includes hero, features, pricing, FAQ, testimonials, and email capture. Optimized for conversions — 8.2% avg CVR.",
        shortDescription: "Webflow SaaS landing page — 8.2% avg conversion rate",
        price: "79.00",
        originalPrice: "129.00",
        categoryId: catMap.get("landing-pages")!,
        tags: ["webflow", "landing-page", "saas", "conversion"],
        previewImages: ["https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&auto=format&fit=crop"],
        status: "active",
        isFeatured: false,
        salesCount: 203,
        downloadUrl: "https://example.com/dl/saas-lp.zip",
      },
      // Crypto & DeFi Tools
      {
        name: "Binance Grid Trading Bot (Python)",
        slug: "binance-grid-trading-bot",
        description: "Automated grid trading bot for Binance Spot & Futures. Configurable grid levels, TP/SL, Telegram notifications, and live dashboard. Includes 30-day backtest results.",
        shortDescription: "Binance grid bot — Python, backtested, Telegram alerts",
        price: "149.00",
        originalPrice: "249.00",
        categoryId: catMap.get("crypto-defi-tools")!,
        tags: ["binance", "bot", "trading", "python", "grid"],
        previewImages: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop"],
        version: "2.3.1",
        status: "active",
        isFeatured: false,
        salesCount: 312,
        downloadUrl: "https://example.com/dl/grid-bot.zip",
      },
      // SaaS Applications
      {
        name: "Link-in-Bio SaaS — Full Source Code",
        slug: "link-in-bio-saas",
        description: "Complete link-in-bio SaaS application like Linktree. Built with Next.js 14, Stripe subscriptions, custom domains, analytics dashboard, 5 themes. Ready to deploy and monetize.",
        shortDescription: "Linktree-style SaaS — Next.js, Stripe, custom domains",
        price: "299.00",
        originalPrice: "499.00",
        categoryId: catMap.get("saas-apps")!,
        tags: ["saas", "nextjs", "stripe", "linktree", "full-source"],
        previewImages: ["https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop"],
        version: "1.2.0",
        status: "active",
        isFeatured: true,
        salesCount: 156,
        downloadUrl: "https://example.com/dl/link-bio-saas.zip",
      },
      // SEO & Marketing
      {
        name: "1000 High-DA Guest Post Opportunities (CSV)",
        slug: "guest-post-opportunities-da40plus",
        description: "Curated database of 1,000+ websites accepting guest posts with DA 40+. Includes contact emails, niche, pricing, and submission guidelines. Updated monthly.",
        shortDescription: "1,000 DA40+ guest post sites with emails — updated monthly",
        price: "39.00",
        categoryId: catMap.get("seo-marketing")!,
        tags: ["seo", "guest-post", "backlinks", "database"],
        previewImages: ["https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&auto=format&fit=crop"],
        status: "active",
        isFeatured: false,
        salesCount: 445,
        downloadUrl: "https://example.com/dl/guest-posts.csv",
      },
    ])
    .returning();

  console.log(`Inserted ${products.length} products`);
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
