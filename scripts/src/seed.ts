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

  // Categories
  const categories = await db
    .insert(categoriesTable)
    .values([
      { name: "Trading Bots", slug: "trading-bots", description: "Automated trading scripts and bots", iconName: "bot" },
      { name: "DeFi Tools", slug: "defi-tools", description: "Decentralized finance utilities", iconName: "coins" },
      { name: "Scripts & Automation", slug: "scripts-automation", description: "Automation scripts and utilities", iconName: "code" },
      { name: "Templates", slug: "templates", description: "Ready-to-use project templates", iconName: "layout" },
      { name: "Analytics", slug: "analytics", description: "Data analytics and charting tools", iconName: "bar-chart" },
      { name: "Security", slug: "security", description: "Blockchain security and auditing tools", iconName: "shield" },
      { name: "NFT Tools", slug: "nft-tools", description: "NFT creation and management tools", iconName: "image" },
      { name: "Wallets & SDKs", slug: "wallets-sdks", description: "Wallet integrations and SDKs", iconName: "wallet" },
      { name: "Price Alerts", slug: "price-alerts", description: "Crypto price monitoring and alerts", iconName: "bell" },
    ])
    .returning();

  console.log(`Inserted ${categories.length} categories`);

  // Users
  const adminHash = await bcrypt.hash("admin123", 10);
  const userHash = await bcrypt.hash("user123", 10);

  const users = await db
    .insert(usersTable)
    .values([
      {
        username: "admin",
        email: "admin@cryptomarket.io",
        passwordHash: adminHash,
        role: "admin",
        isActive: true,
      },
      {
        username: "john_doe",
        email: "john@example.com",
        passwordHash: userHash,
        role: "user",
        isActive: true,
      },
    ])
    .returning();

  console.log(`Inserted ${users.length} users`);

  // Wallets
  const wallets = await db
    .insert(walletsTable)
    .values([
      { chain: "USDT_TRC20", address: "TRXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", label: "USDT TRC20 Wallet", isActive: true },
      { chain: "USDT_TON", address: "EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", label: "USDT TON Wallet", isActive: true },
      { chain: "USDT_BEP20", address: "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", label: "USDT BEP20 Wallet", isActive: true },
    ])
    .returning();

  console.log(`Inserted ${wallets.length} wallets`);

  // Products
  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  const products = await db
    .insert(productsTable)
    .values([
      {
        name: "Binance Grid Trading Bot",
        slug: "binance-grid-trading-bot",
        description: "A fully automated grid trading bot for Binance Spot. Implements a configurable price grid and automatically places buy/sell orders to profit from price oscillations. Includes backtesting module and live dashboard.",
        shortDescription: "Automated grid trading for Binance with backtesting",
        price: "149.00",
        originalPrice: "249.00",
        categoryId: catMap.get("trading-bots")!,
        tags: ["binance", "grid", "bot", "automated"],
        previewImages: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format"],
        version: "2.3.1",
        status: "active",
        isFeatured: true,
        salesCount: 312,
        downloadUrl: "https://example.com/downloads/grid-bot.zip",
      },
      {
        name: "DeFi Yield Optimizer",
        slug: "defi-yield-optimizer",
        description: "Smart contract suite and frontend for automatically reallocating funds across Aave, Compound, and Curve to maximize yield. Includes gas optimization strategies and emergency withdrawal safeguards.",
        shortDescription: "Auto-rebalance DeFi yields across top protocols",
        price: "299.00",
        originalPrice: "399.00",
        categoryId: catMap.get("defi-tools")!,
        tags: ["defi", "yield", "aave", "compound"],
        previewImages: ["https://images.unsplash.com/photo-1639762681485-074b7f4ec6ae?w=800&auto=format"],
        version: "1.5.0",
        status: "active",
        isFeatured: true,
        salesCount: 187,
        downloadUrl: "https://example.com/downloads/yield-optimizer.zip",
      },
      {
        name: "Crypto Arbitrage Scanner",
        slug: "crypto-arbitrage-scanner",
        description: "Real-time cross-exchange arbitrage opportunity scanner. Monitors 15+ exchanges via WebSocket, calculates net profit after fees, and sends instant Telegram/Discord alerts. Includes a 30-day backtest dataset.",
        shortDescription: "Real-time arbitrage scanner for 15+ exchanges",
        price: "89.00",
        categoryId: catMap.get("scripts-automation")!,
        tags: ["arbitrage", "scanner", "real-time", "alerts"],
        previewImages: ["https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&auto=format"],
        version: "3.1.2",
        status: "active",
        isFeatured: true,
        salesCount: 543,
        downloadUrl: "https://example.com/downloads/arb-scanner.zip",
      },
      {
        name: "Next.js Crypto Dashboard Template",
        slug: "nextjs-crypto-dashboard",
        description: "Production-ready Next.js 14 dashboard template with live price feeds, portfolio tracker, TradingView chart integration, and wallet connect. Fully typed with TypeScript and styled with Tailwind CSS.",
        shortDescription: "Next.js 14 crypto dashboard with live data",
        price: "59.00",
        categoryId: catMap.get("templates")!,
        tags: ["nextjs", "dashboard", "template", "typescript"],
        previewImages: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format"],
        version: "1.2.0",
        status: "active",
        isFeatured: true,
        salesCount: 820,
        downloadUrl: "https://example.com/downloads/nextjs-dashboard.zip",
      },
      {
        name: "On-Chain Analytics Engine",
        slug: "onchain-analytics-engine",
        description: "Python library for on-chain analytics — whale wallet tracking, token holder distribution, DEX volume aggregation, and MEV detection. Ships with ready-made Jupyter notebooks and a Streamlit demo app.",
        shortDescription: "Python library for on-chain analytics & whale tracking",
        price: "199.00",
        categoryId: catMap.get("analytics")!,
        tags: ["python", "analytics", "on-chain", "whale"],
        previewImages: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format"],
        version: "2.0.1",
        status: "active",
        isFeatured: false,
        salesCount: 94,
        downloadUrl: "https://example.com/downloads/analytics-engine.zip",
      },
      {
        name: "Smart Contract Audit Toolkit",
        slug: "smart-contract-audit-toolkit",
        description: "Comprehensive Solidity audit toolkit — static analysis rules for Slither, custom Foundry fuzz tests, gas profiler, and a one-command CI pipeline. Catches reentrancy, overflow, and access-control vulnerabilities.",
        shortDescription: "Solidity audit toolkit with Slither rules & Foundry tests",
        price: "349.00",
        categoryId: catMap.get("security")!,
        tags: ["solidity", "audit", "security", "foundry"],
        previewImages: ["https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format"],
        version: "1.0.4",
        status: "active",
        isFeatured: false,
        salesCount: 61,
        downloadUrl: "https://example.com/downloads/audit-toolkit.zip",
      },
      {
        name: "NFT Bulk Minter & Metadata Generator",
        slug: "nft-bulk-minter",
        description: "CLI tool for generating layered NFT artwork, compiling IPFS metadata, and bulk-minting via ERC-721 / ERC-1155. Supports Pinata and NFT.Storage for IPFS pinning. Includes rarity calculator.",
        shortDescription: "Layered NFT art generator with IPFS & bulk minting",
        price: "79.00",
        categoryId: catMap.get("nft-tools")!,
        tags: ["nft", "mint", "ipfs", "erc721"],
        previewImages: ["https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&auto=format"],
        version: "4.2.0",
        status: "active",
        isFeatured: false,
        salesCount: 275,
        downloadUrl: "https://example.com/downloads/nft-minter.zip",
      },
      {
        name: "Multi-Chain Wallet SDK",
        slug: "multi-chain-wallet-sdk",
        description: "TypeScript SDK for integrating multi-chain wallet support (EVM, Solana, TON) into any web app. Handles connection, signing, transaction building, and token transfers behind a unified API.",
        shortDescription: "Unified TypeScript SDK for EVM, Solana & TON wallets",
        price: "129.00",
        categoryId: catMap.get("wallets-sdks")!,
        tags: ["sdk", "wallet", "multichain", "typescript"],
        previewImages: ["https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&auto=format"],
        version: "1.8.3",
        status: "active",
        isFeatured: false,
        salesCount: 158,
        downloadUrl: "https://example.com/downloads/wallet-sdk.zip",
      },
      {
        name: "Telegram Price Alert Bot",
        slug: "telegram-price-alert-bot",
        description: "Self-hosted Telegram bot for crypto price alerts with support for limit, percentage-change, and RSI-based triggers. Connects to CoinGecko and Binance APIs. Configurable via /commands — no coding required.",
        shortDescription: "Self-hosted Telegram bot for price & RSI alerts",
        price: "29.00",
        categoryId: catMap.get("price-alerts")!,
        tags: ["telegram", "alerts", "bot", "coingecko"],
        previewImages: ["https://images.unsplash.com/photo-1608229164949-c71b0c2a7b1f?w=800&auto=format"],
        version: "2.1.0",
        status: "active",
        isFeatured: false,
        salesCount: 1042,
        downloadUrl: "https://example.com/downloads/tg-alert-bot.zip",
      },
      {
        name: "Bybit Futures Scalping Bot",
        slug: "bybit-futures-scalping-bot",
        description: "High-frequency scalping bot for Bybit USDT perpetuals. Uses EMA cross + volume confirmation strategy with configurable risk management, trailing stop-loss, and Telegram trade notifications.",
        shortDescription: "HFT scalping bot for Bybit USDT perpetuals",
        price: "189.00",
        originalPrice: "289.00",
        categoryId: catMap.get("trading-bots")!,
        tags: ["bybit", "futures", "scalping", "hft"],
        previewImages: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format"],
        version: "1.4.2",
        status: "active",
        isFeatured: false,
        salesCount: 203,
        downloadUrl: "https://example.com/downloads/bybit-scalping.zip",
      },
      {
        name: "Uniswap V3 LP Manager",
        slug: "uniswap-v3-lp-manager",
        description: "Automated liquidity position manager for Uniswap V3. Monitors out-of-range positions and auto-rebalances to the optimal price range based on your volatility settings. Supports all EVM chains.",
        shortDescription: "Auto-rebalancing Uniswap V3 liquidity manager",
        price: "249.00",
        categoryId: catMap.get("defi-tools")!,
        tags: ["uniswap", "liquidity", "v3", "defi"],
        previewImages: ["https://images.unsplash.com/photo-1639762681485-074b7f4ec6ae?w=800&auto=format"],
        version: "1.1.0",
        status: "active",
        isFeatured: false,
        salesCount: 77,
        downloadUrl: "https://example.com/downloads/uni-lp-manager.zip",
      },
      {
        name: "Portfolio Tracker React App",
        slug: "portfolio-tracker-react",
        description: "Full-stack React + Node.js portfolio tracker with automatic price fetching, P&L calculation, tax report export (CSV/PDF), and multi-wallet support. Includes a Chrome extension for quick balance checks.",
        shortDescription: "Full-stack crypto portfolio tracker with tax reports",
        price: "49.00",
        categoryId: catMap.get("templates")!,
        tags: ["react", "portfolio", "tracker", "taxes"],
        previewImages: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format"],
        version: "3.0.0",
        status: "active",
        isFeatured: false,
        salesCount: 634,
        downloadUrl: "https://example.com/downloads/portfolio-tracker.zip",
      },
    ])
    .returning();

  console.log(`Inserted ${products.length} products`);
  console.log("\nSeed complete!");
  console.log("Admin: admin@cryptomarket.io / admin123");
  console.log("User:  john@example.com / user123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
