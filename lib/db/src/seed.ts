import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcrypt";
import * as schema from "./schema/index.js";
import { eq } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  // ─── Reset all tables ────────────────────────────────────────────────────
  await pool.query(`
    DO $$ BEGIN
      TRUNCATE TABLE
        downloads, reviews, favorites, notifications,
        payments, orders, tickets, messages, conversations,
        blog_posts, products, wallets, categories, users
      RESTART IDENTITY CASCADE;
    EXCEPTION WHEN undefined_table THEN NULL;
    END $$;
  `);

  console.log("  ✓ Tables cleared");

  // ─── Users ───────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("admin123", 10);
  const userHash  = await bcrypt.hash("user123",  10);
  const sellerHash = await bcrypt.hash("seller123", 10);

  const [admin] = await db.insert(schema.usersTable).values({
    username: "admin",
    email: "admin@digimarket.io",
    passwordHash: adminHash,
    role: "admin",
    displayName: "DigiMarket Admin",
    isActive: true,
    isSeller: false,
  }).returning();

  const [buyer] = await db.insert(schema.usersTable).values({
    username: "john_buyer",
    email: "john@example.com",
    passwordHash: userHash,
    role: "user",
    displayName: "John Buyer",
    isActive: true,
    isSeller: false,
  }).returning();

  const [seller] = await db.insert(schema.usersTable).values({
    username: "cryptodevpro",
    email: "seller@example.com",
    passwordHash: sellerHash,
    role: "user",
    displayName: "CryptoDevPro",
    isActive: true,
    isSeller: true,
    sellerBio: "Professional DeFi developer with 5+ years of experience building high-performance trading bots, arbitrage scripts, and blockchain automation tools. All products come with full documentation and 30-day support.",
  }).returning();

  console.log(`  ✓ Users created — admin: ${admin.id}, buyer: ${buyer.id}, seller: ${seller.id}`);

  // ─── Categories ──────────────────────────────────────────────────────────
  const categoryData = [
    { name: "Trading Bots",       slug: "trading-bots",        description: "Automated crypto trading bots for every strategy",    iconName: "Bot" },
    { name: "DeFi Tools",         slug: "defi-tools",          description: "Decentralized finance automation and yield tools",     iconName: "Layers" },
    { name: "Arbitrage Scripts",  slug: "arbitrage-scripts",   description: "Cross-exchange and cross-chain arbitrage automation",  iconName: "ArrowLeftRight" },
    { name: "Wallet Tools",       slug: "wallet-tools",        description: "Wallet management, monitoring, and security",          iconName: "Wallet" },
    { name: "NFT Tools",          slug: "nft-tools",           description: "NFT sniping, monitoring, and trading automation",      iconName: "Image" },
    { name: "Price Trackers",     slug: "price-trackers",      description: "Real-time crypto price alerts and monitoring systems", iconName: "TrendingUp" },
    { name: "Smart Contracts",    slug: "smart-contracts",     description: "Audited Solidity smart contract templates and tools",  iconName: "Code2" },
    { name: "Analytics",          slug: "analytics",           description: "Portfolio analytics, on-chain insights, reporting",   iconName: "BarChart2" },
    { name: "Security Tools",     slug: "security-tools",      description: "Wallet auditing, rug-pull detection, security scans", iconName: "Shield" },
  ];

  const categories = await db.insert(schema.categoriesTable).values(categoryData).returning();
  const catBySlug = new Map(categories.map(c => [c.slug, c]));
  console.log(`  ✓ ${categories.length} categories created`);

  // ─── Wallets ─────────────────────────────────────────────────────────────
  await db.insert(schema.walletsTable).values([
    {
      chain: "PI",
      address: "GBREEDSKOOLPI000000000000000000000000000000000000",
      label: "Pi Network Escrow Wallet",
      isActive: true,
      customMessage: "Send Pi to this escrow address and submit your TXID as proof of payment.",
    },
  ]);
  console.log("  ✓ Wallets created");

  // ─── Products ────────────────────────────────────────────────────────────
  const products = await db.insert(schema.productsTable).values([
    {
      sellerId: seller.id,
      name: "Flash Loan Arbitrage Bot",
      slug: "flash-loan-arbitrage-bot",
      description: "Exploit price discrepancies across DEXes using Aave flash loans with zero upfront capital. This bot scans Uniswap, Sushiswap, Curve, and Balancer in real-time, executes atomic arbitrage transactions, and returns profit to your wallet — all in a single block.\n\nFeatures:\n• Supports Ethereum, BSC, Arbitrum, Polygon\n• Built-in gas optimization engine\n• Configurable minimum profit threshold\n• Slippage protection\n• 24/7 operation with auto-restart\n• Full TypeScript source with tests",
      shortDescription: "Zero-capital DEX arbitrage using Aave flash loans across Uniswap, Sushiswap & more.",
      price: "299.00",
      originalPrice: "499.00",
      categoryId: catBySlug.get("defi-tools")!.id,
      tags: ["flash-loan", "arbitrage", "defi", "uniswap", "aave", "ethereum"],
      previewImages: [
        "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80",
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
      ],
      demoUrl: "https://youtu.be/demo1",
      downloadUrl: "https://vaultrade.store/files/flash-loan-bot-v2.1.zip",
      version: "2.1.0",
      documentation: "## Setup Guide\n\n1. Install Node.js 20+ and yarn\n2. Copy `.env.example` to `.env` and fill in your RPC URLs\n3. Run `yarn install`\n4. Configure `config.json` with your wallet private key and min profit threshold\n5. Run `yarn start`\n\n## Requirements\n- Ethereum wallet with ETH for gas\n- RPC endpoint (Alchemy/Infura recommended)\n- Node.js >= 20",
      status: "active",
      isFeatured: true,
      salesCount: 47,
    },
    {
      sellerId: seller.id,
      name: "Advanced Grid Trading Bot",
      slug: "advanced-grid-trading-bot",
      description: "Fully automated grid trading bot that profits from market sideways movement. Supports Binance, Bybit, OKX, and KuCoin via official APIs. Place buy and sell orders at intervals automatically, capture small profits continuously, and compound gains over time.\n\nFeatures:\n• Multi-exchange support\n• Dynamic grid sizing based on volatility\n• Stop-loss and take-profit automation\n• Email/Telegram alerts\n• Web dashboard for live monitoring\n• Backtesting module included",
      shortDescription: "Multi-exchange grid bot with dynamic grid sizing, backtesting, and live dashboard.",
      price: "249.00",
      originalPrice: "350.00",
      categoryId: catBySlug.get("trading-bots")!.id,
      tags: ["grid-trading", "binance", "bybit", "automated", "bot"],
      previewImages: [
        "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&q=80",
        "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&q=80",
      ],
      demoUrl: "https://youtu.be/demo2",
      downloadUrl: "https://vaultrade.store/files/grid-trading-bot-v3.0.zip",
      version: "3.0.2",
      status: "active",
      isFeatured: true,
      salesCount: 83,
    },
    {
      sellerId: seller.id,
      name: "Cross-Exchange Arbitrage Scanner",
      slug: "cross-exchange-arbitrage-scanner",
      description: "High-speed arbitrage scanner that monitors price differences across 15+ CEX and DEX platforms simultaneously. Identifies profitable arb opportunities in milliseconds and provides execution signals with estimated profit after fees.\n\nIncludes a companion trade executor that can automate entry on confirmed opportunities, with configurable size limits and daily profit caps.",
      shortDescription: "Real-time arbitrage scanner across 15+ exchanges with automatic execution signals.",
      price: "199.00",
      categoryId: catBySlug.get("arbitrage-scripts")!.id,
      tags: ["arbitrage", "scanner", "cex", "dex", "real-time"],
      previewImages: [
        "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&q=80",
      ],
      downloadUrl: "https://vaultrade.store/files/arb-scanner-v1.5.zip",
      version: "1.5.1",
      status: "active",
      isFeatured: false,
      salesCount: 31,
    },
    {
      sellerId: seller.id,
      name: "Multi-Chain Portfolio Tracker",
      slug: "multi-chain-portfolio-tracker",
      description: "Track your entire crypto portfolio across Ethereum, BSC, Arbitrum, Optimism, Avalanche, and Solana from a single dashboard. Automatically detects tokens, calculates P&L, shows historical performance charts, and exports reports.\n\nNo API keys required — reads directly from public blockchain RPCs.",
      shortDescription: "Unified portfolio tracker across 6 chains with P&L history and CSV export.",
      price: "79.00",
      categoryId: catBySlug.get("analytics")!.id,
      tags: ["portfolio", "tracker", "multichain", "analytics", "defi"],
      previewImages: [
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
      ],
      downloadUrl: "https://vaultrade.store/files/portfolio-tracker-v1.2.zip",
      version: "1.2.0",
      status: "active",
      isFeatured: true,
      salesCount: 156,
    },
    {
      sellerId: seller.id,
      name: "NFT Floor Price Sniper",
      slug: "nft-floor-price-sniper",
      description: "Automatically snipes NFTs listed below floor price on OpenSea, Blur, and MagicEden. Uses WebSocket order-stream APIs for sub-100ms detection and instant purchase execution. Supports ETH, SOL, and MATIC chains.\n\nFeatures:\n• Floor price % threshold setting\n• Rarity-aware filtering\n• Gas price ceilings\n• Per-collection whitelist\n• Telegram/Discord webhook alerts",
      shortDescription: "Sub-100ms NFT floor sniper for OpenSea, Blur & MagicEden with rarity filters.",
      price: "349.00",
      originalPrice: "499.00",
      categoryId: catBySlug.get("nft-tools")!.id,
      tags: ["nft", "sniper", "opensea", "blur", "floor-price", "ethereum"],
      previewImages: [
        "https://images.unsplash.com/photo-1646463394040-93f26f0f6e2a?w=800&q=80",
      ],
      downloadUrl: "https://vaultrade.store/files/nft-sniper-v2.3.zip",
      version: "2.3.0",
      status: "active",
      isFeatured: true,
      salesCount: 29,
    },
    {
      sellerId: seller.id,
      name: "Crypto Price Alert System",
      slug: "crypto-price-alert-system",
      description: "Self-hosted price alert system for 5000+ cryptocurrencies. Set price targets, percentage moves, RSI levels, and custom indicator conditions. Get notified instantly via Telegram, Discord, Email, or webhook.\n\nRuns as a lightweight Node.js service. Supports CoinGecko, Binance, and Coinbase price feeds.",
      shortDescription: "Self-hosted alerts for 5000+ coins via Telegram, Discord & email with custom indicators.",
      price: "49.00",
      categoryId: catBySlug.get("price-trackers")!.id,
      tags: ["price-alerts", "telegram", "discord", "monitoring", "crypto"],
      previewImages: [
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
      ],
      downloadUrl: "https://vaultrade.store/files/price-alerts-v1.0.zip",
      version: "1.0.3",
      status: "active",
      isFeatured: false,
      salesCount: 214,
    },
    {
      sellerId: seller.id,
      name: "Token Launch Sniper Bot",
      slug: "token-launch-sniper-bot",
      description: "Be among the first buyers when new tokens launch on Uniswap, PancakeSwap, and Raydium. Monitors pending transactions in the mempool, detects liquidity additions, and fires buy transactions in the same block.\n\nIncludes anti-honeypot checks, buy tax detection, and max slippage guard to protect against rugpulls.",
      shortDescription: "Mempool-based new token sniper with anti-rug and honeypot detection built-in.",
      price: "399.00",
      categoryId: catBySlug.get("trading-bots")!.id,
      tags: ["sniper", "new-tokens", "uniswap", "pancakeswap", "mempool", "defi"],
      previewImages: [
        "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80",
      ],
      downloadUrl: "https://vaultrade.store/files/token-sniper-v4.1.zip",
      version: "4.1.0",
      status: "active",
      isFeatured: true,
      salesCount: 62,
    },
    {
      sellerId: seller.id,
      name: "Solidity Smart Contract Templates",
      slug: "solidity-smart-contract-templates",
      description: "Pack of 20 professionally audited Solidity smart contract templates covering: ERC-20 tokens, ERC-721 NFT collections, staking contracts, vesting schedules, multisig wallets, DAO governance, liquidity pools, and more.\n\nEach template includes NatSpec documentation, full test suite (Hardhat), deployment scripts, and audit report.",
      shortDescription: "20 audited Solidity templates: tokens, NFTs, staking, DAO, and more with tests.",
      price: "99.00",
      categoryId: catBySlug.get("smart-contracts")!.id,
      tags: ["solidity", "smart-contracts", "erc20", "nft", "hardhat", "templates"],
      previewImages: [
        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
      ],
      downloadUrl: "https://vaultrade.store/files/solidity-templates-v1.3.zip",
      version: "1.3.0",
      status: "active",
      isFeatured: false,
      salesCount: 98,
    },
    {
      sellerId: seller.id,
      name: "Hardware Wallet Security Scanner",
      slug: "hardware-wallet-security-scanner",
      description: "Desktop app that audits your Ledger or Trezor wallet for potential security risks: checks for malicious token approvals, suspicious contract interactions, known phishing contracts, and provides a detailed remediation report.\n\nWorks offline — your private key never leaves the device.",
      shortDescription: "Audit your Ledger/Trezor for malicious approvals, phishing contracts & security risks.",
      price: "89.00",
      categoryId: catBySlug.get("security-tools")!.id,
      tags: ["ledger", "trezor", "security", "audit", "token-approvals", "phishing"],
      previewImages: [
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
      ],
      downloadUrl: "https://vaultrade.store/files/hw-security-scanner-v1.1.zip",
      version: "1.1.0",
      status: "active",
      isFeatured: false,
      salesCount: 73,
    },
    {
      sellerId: seller.id,
      name: "DEX Liquidity Monitor",
      slug: "dex-liquidity-monitor",
      description: "Real-time liquidity monitoring tool for Uniswap v2/v3, Curve, and Balancer pools. Track TVL changes, fee revenue, impermanent loss estimates, and get alerts when significant liquidity enters or exits a pool you're providing in.\n\nIdeal for LP managers and DeFi yield farmers who need real-time insight into pool health.",
      shortDescription: "Real-time Uniswap/Curve/Balancer LP monitoring with IL estimates and alerts.",
      price: "149.00",
      categoryId: catBySlug.get("defi-tools")!.id,
      tags: ["liquidity", "uniswap", "curve", "lp", "defi", "impermanent-loss"],
      previewImages: [
        "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&q=80",
      ],
      downloadUrl: "https://vaultrade.store/files/dex-liquidity-monitor-v1.0.zip",
      version: "1.0.2",
      status: "active",
      isFeatured: false,
      salesCount: 44,
    },
    {
      sellerId: seller.id,
      name: "Automated DCA Bot",
      slug: "automated-dca-bot",
      description: "Dollar-cost averaging bot that executes scheduled buys on Binance, Coinbase, and Kraken. Set your target assets, allocation percentages, and schedule (daily/weekly/monthly). The bot handles execution, tracks your cost basis, and generates tax reports.\n\nPerfect for long-term holders who want to automate their accumulation strategy.",
      shortDescription: "Scheduled DCA execution on Binance, Coinbase & Kraken with tax report generation.",
      price: "129.00",
      categoryId: catBySlug.get("trading-bots")!.id,
      tags: ["dca", "dollar-cost-averaging", "binance", "coinbase", "automation"],
      previewImages: [
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
      ],
      downloadUrl: "https://vaultrade.store/files/dca-bot-v2.0.zip",
      version: "2.0.1",
      status: "active",
      isFeatured: false,
      salesCount: 127,
    },
    {
      sellerId: seller.id,
      name: "Wallet Activity Monitor",
      slug: "wallet-activity-monitor",
      description: "Monitor any Ethereum, BSC, or Solana wallet address and get instant alerts whenever it makes a transaction. Track whale wallets, copy-trade signals, detect token approvals, and build a complete activity feed.\n\nSupports monitoring up to 100 wallets simultaneously with webhook integration.",
      shortDescription: "Monitor 100 wallets simultaneously — track whales, copy-trade signals, and get alerts.",
      price: "69.00",
      categoryId: catBySlug.get("wallet-tools")!.id,
      tags: ["wallet-tracking", "whale-watching", "alerts", "copy-trade", "ethereum"],
      previewImages: [
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
      ],
      downloadUrl: "https://vaultrade.store/files/wallet-monitor-v1.4.zip",
      version: "1.4.0",
      status: "active",
      isFeatured: false,
      salesCount: 88,
    },
  ]).returning();

  console.log(`  ✓ ${products.length} products created`);

  // ─── Blog Posts ──────────────────────────────────────────────────────────
  const now = new Date();
  const d = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000);

  await db.insert(schema.blogPostsTable).values([
    {
      title: "How to Set Up a Crypto Trading Bot in 2024: The Complete Beginner's Guide",
      slug: "how-to-set-up-crypto-trading-bot-2024",
      excerpt: "Automated trading bots now execute over 70% of all crypto volume. Here's everything you need to know to set up your first trading bot — from choosing a strategy to going live safely.",
      content: `# How to Set Up a Crypto Trading Bot in 2024: The Complete Beginner's Guide

Automated trading bots are no longer just for hedge funds and quant firms. Today, retail traders use crypto trading bots to execute strategies 24/7 without lifting a finger. In fact, industry estimates suggest that bots now handle over 70% of crypto trading volume on major exchanges.

This guide will walk you through everything you need to know to get started with a crypto trading bot — from choosing the right strategy to deploying safely in live markets.

## What Is a Crypto Trading Bot?

A crypto trading bot is a software program that connects to an exchange via API and automatically places buy and sell orders based on a predefined strategy. Unlike human traders, bots never sleep, never panic, and execute in milliseconds.

Bots can be configured to:
- Follow technical indicators (RSI, MACD, Bollinger Bands)
- Perform grid trading (buying low and selling high within a range)
- Execute arbitrage across multiple exchanges
- Dollar-cost average into positions on a schedule
- Snipe new token launches

## Choosing the Right Strategy for Your Bot

Before you write a single line of code (or purchase a bot), you need to decide on a strategy. The most popular approaches are:

### 1. Grid Trading
Grid bots place buy orders at regular intervals below the current price and sell orders above it. When prices oscillate in a range, the bot continuously profits from the spread. Grid trading works best in sideways or mildly volatile markets.

**Best for:** BTC/USDT, ETH/USDT during consolidation phases

### 2. DCA (Dollar-Cost Averaging)
A DCA bot automatically buys a fixed dollar amount of an asset on a schedule — daily, weekly, or monthly — regardless of price. This removes emotion from accumulation and smooths your average entry price over time.

**Best for:** Long-term holders of BTC, ETH, or blue-chip altcoins

### 3. Arbitrage
Arbitrage bots exploit price differences for the same asset across different exchanges. When BTC trades at $50,000 on Binance and $50,050 on Coinbase, a bot can buy on Binance and sell on Coinbase for a risk-free $50 profit (minus fees).

**Best for:** Traders who want near-risk-free returns but need significant capital

### 4. Technical Indicator Bots
These bots buy or sell based on signals from technical indicators. A classic example: buy ETH when the RSI drops below 30 (oversold) and sell when it rises above 70 (overbought).

**Best for:** Traders with backtested strategies and market knowledge

## Step-by-Step: Setting Up Your First Trading Bot

### Step 1: Choose an Exchange
The most bot-friendly exchanges in 2024 are:
- **Binance** — Largest volume, excellent API, low fees (0.1%)
- **Bybit** — Fast API, great for derivatives bots
- **OKX** — Solid API with good documentation
- **KuCoin** — Wide altcoin selection for strategy bots

### Step 2: Create API Keys
Log into your exchange, navigate to API Management, and create a new API key with **trading permissions only** (never withdrawal permissions for bot keys). Store the key and secret securely — ideally in environment variables, never in code.

### Step 3: Select or Build Your Bot
You have three options:
1. **Buy a pre-built bot** — Fastest to market, professionally coded, include documentation (available right here on Vaultrade)
2. **Use a SaaS platform** — Cryptohopper, 3Commas, Pionex (ongoing subscription fees)
3. **Build from scratch** — Maximum flexibility, steepest learning curve

### Step 4: Backtest Your Strategy
Before going live with real money, backtest your strategy against historical price data. A good backtest covers at least 12 months and includes a range of market conditions — bull runs, bear markets, and sideways periods.

Key metrics to evaluate:
- **Sharpe ratio** — Risk-adjusted returns (>1 is good, >2 is excellent)
- **Max drawdown** — The largest peak-to-trough decline
- **Win rate** — Percentage of profitable trades
- **Profit factor** — Gross profit / gross loss (>1.5 is target)

### Step 5: Paper Trade First
Before risking real capital, run your bot in paper trading (simulation) mode for 2–4 weeks. Most major exchanges offer a testnet environment. This lets you identify bugs and unexpected behavior without financial risk.

### Step 6: Go Live with Small Capital
When you're confident in the strategy, fund your bot with a small amount — 5–10% of what you plan to allocate. Monitor it closely for the first week. Look for:
- Unexpected order sizes
- Failed API calls
- Unusual trading patterns
- Fee accumulation

## Common Mistakes to Avoid

**1. Over-optimizing (curve fitting)**
A strategy that performs perfectly on historical data often fails on live data. Keep strategies simple and robust.

**2. Ignoring fees**
Every trade has a cost. A strategy that generates 0.1% profit per trade is unprofitable if the exchange charges 0.1% in fees. Always factor in taker vs. maker fees.

**3. No stop-loss**
Even the best strategies can lose in extreme market conditions. Always configure a maximum drawdown limit that pauses the bot.

**4. Withdrawal permissions on bot API keys**
Never enable withdrawal permissions on API keys used by trading bots. If the bot is compromised, an attacker can drain your funds.

**5. Running on a personal laptop**
Bots need 24/7 uptime. Run them on a VPS (AWS, DigitalOcean, Hetzner) for reliability.

## Getting Started with Pre-Built Bots

If you're not a developer, purchasing a professionally built trading bot is the fastest way to get started. Look for bots with:
- Complete source code (not just an executable)
- Comprehensive documentation
- Version history and active maintenance
- Community support or direct seller support

Browse our marketplace for vetted, professionally built crypto trading bots with full source code and support.

## Conclusion

Crypto trading bots can be powerful tools when used correctly. The key is starting with a well-defined strategy, backtesting thoroughly, and scaling capital gradually. Begin with paper trading, move to small live positions, and only scale up once you've seen consistent performance.

Ready to automate your trading? Explore our collection of professional trading bots built by experienced developers.`,
      authorId: admin.id,
      status: "published",
      publishedAt: d(14),
      coverImage: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&q=80",
    },
    {
      title: "Top 10 DeFi Yield Farming Strategies to Maximize Your Returns in 2024",
      slug: "top-defi-yield-farming-strategies-2024",
      excerpt: "DeFi protocols are offering yields that traditional finance can't match. Here are the 10 most effective yield farming strategies — ranked by risk-adjusted return — for experienced DeFi participants.",
      content: `# Top 10 DeFi Yield Farming Strategies to Maximize Your Returns in 2024

Yield farming has evolved dramatically since the DeFi Summer of 2020. Today's strategies are more sophisticated, better-tooled, and — when done correctly — more profitable than ever. But the landscape is also more complex, with hundreds of protocols competing for liquidity.

This guide cuts through the noise with 10 yield farming strategies ranked by their risk-adjusted returns, along with the tools you need to execute each one.

## What Is Yield Farming?

Yield farming is the practice of deploying crypto assets into DeFi protocols to earn returns in the form of:
- **Lending interest** — from borrowers on protocols like Aave and Compound
- **Trading fees** — from providing liquidity to AMMs like Uniswap
- **Governance token rewards** — emission incentives from protocols seeking liquidity

The total value locked (TVL) in DeFi exceeds $80 billion as of 2024, creating enormous opportunities for savvy yield farmers.

## Risk Framework

Before diving into strategies, understand the core risks:

1. **Smart contract risk** — Protocol code exploits (use audited protocols)
2. **Impermanent loss (IL)** — Price divergence reduces LP value vs. holding
3. **Token price risk** — Farming rewards in volatile tokens can erode returns
4. **Protocol risk** — Governance changes or protocol insolvency

Rate each strategy: 🟢 Low | 🟡 Medium | 🔴 High risk

---

## Strategy 1: Stablecoin Lending on Aave 🟢

**APY range:** 3–8%
**Risk:** Very Low
**Capital efficiency:** Medium

Deploy USDC or USDT on Aave v3 to earn borrowing interest. Stablecoin yields on Aave fluctuate with borrowing demand but consistently outperform traditional savings accounts. Enable the "supply collateral" option to simultaneously use your supply as collateral for additional leverage.

**Tools:** Aave v3 (Ethereum, Arbitrum, Optimism), our DEX Liquidity Monitor

---

## Strategy 2: Curve Finance Stablecoin LP 🟢

**APY range:** 4–15% (3pool base + CRV rewards)
**Risk:** Low
**Capital efficiency:** High

The Curve 3pool (USDC/USDT/DAI) and similar stablecoin pools offer trading fees plus CRV token emissions. Impermanent loss is near zero since all assets are pegged to $1. Boost rewards by locking CRV into veCRV for up to 2.5x multiplier.

**Pro tip:** Use Convex Finance to boost Curve rewards without locking CRV yourself.

---

## Strategy 3: Uniswap v3 Concentrated Liquidity 🟡

**APY range:** 20–100%+ (fee tier dependent)
**Risk:** Medium (impermanent loss)
**Capital efficiency:** Very High

Uniswap v3's concentrated liquidity lets you provide liquidity within a specific price range, earning far more fees per dollar deployed than v2. A tight range on ETH/USDC earns exceptional fees — but requires active management as prices can exit your range.

**Tools:** Our DEX Liquidity Monitor tracks your position health and alerts you when rebalancing is needed.

---

## Strategy 4: Liquid Staking + DeFi Loop 🟡

**APY range:** 10–25%
**Risk:** Medium
**Capital efficiency:** High

1. Stake ETH → receive stETH (Lido, 3.5–4% base yield)
2. Supply stETH to Aave as collateral
3. Borrow USDC against it
4. Deploy USDC into a stablecoin yield strategy
5. Net APY = staking yield + farming yield − borrowing cost

This "looping" strategy amplifies returns but increases liquidation risk if ETH price drops sharply.

---

## Strategy 5: Pendle Finance Yield Splitting 🟡

**APY range:** 15–40%
**Risk:** Medium
**Capital efficiency:** High

Pendle splits yield-bearing assets (like stETH or aUSDC) into Principal Tokens (PT) and Yield Tokens (YT). You can:
- Buy PT at a discount and hold to maturity for fixed yield
- Buy YT to speculate on rising yields
- Provide liquidity in Pendle's AMM for trading fees + PENDLE emissions

One of the most innovative yield strategies in DeFi currently.

---

## Strategy 6: Eigenlayer Restaking 🟡

**APY range:** 5–15% (variable, early stage)
**Risk:** Medium
**Capital efficiency:** Medium

Restake ETH or LSTs (liquid staking tokens) through Eigenlayer to secure multiple Actively Validated Services simultaneously. Earn stacking yield from multiple protocols. Early restakers captured significant airdrop allocations — ongoing rewards are being established.

---

## Strategy 7: Delta-Neutral Farming 🟡

**APY range:** 15–50%
**Risk:** Medium-Low (when executed properly)
**Capital efficiency:** Medium

Create a delta-neutral position to earn LP fees and token emissions without directional exposure:
1. Deposit collateral and borrow the token you'll LP with
2. Provide liquidity with the borrowed token + stablecoin
3. LP fees and rewards offset borrowing cost
4. Net: high yield with near-zero market exposure

Requires monitoring and occasional rebalancing.

---

## Strategy 8: Arbitrum/Optimism L2 Farming 🟡

**APY range:** 20–60%
**Risk:** Medium
**Capital efficiency:** High

L2 protocols actively incentivize liquidity with higher token emissions and lower fees. Protocols like GMX (Arbitrum) and Velodrome (Optimism) offer superior yields vs. Ethereum mainnet with lower gas costs.

---

## Strategy 9: New Protocol Launch Farming 🔴

**APY range:** 100–1000%+ (early days only)
**Risk:** High
**Capital efficiency:** Low (high APY collapses quickly)

New protocols offer astronomical APYs to attract early liquidity. The key is to enter early, take profits in stablecoins, and exit before token emissions dilute returns. High rug-pull risk — only farm audited protocols.

**Safety checklist:**
- Smart contract audit published?
- Team doxxed or reputation established?
- Emissions schedule clearly defined?
- Exit liquidity sufficient?

---

## Strategy 10: RWA (Real World Assets) Protocols 🟢

**APY range:** 5–12%
**Risk:** Low-Medium
**Capital efficiency:** Medium

Protocols like Centrifuge, Goldfinch, and MakerDAO's spark protocol tokenize real-world assets (loans, treasuries, real estate) and offer sustainable, non-inflationary yields. Unlike emission-based farming, RWA yields are backed by actual cash flows.

Ideal for risk-averse farmers seeking sustainable returns.

---

## Portfolio Allocation Framework

| Risk Tolerance | Allocation Suggestion |
|---------------|----------------------|
| Conservative | 70% stable (1,2,10) + 30% medium (4,5) |
| Moderate | 40% stable + 40% medium (3,6,7) + 20% L2 (8) |
| Aggressive | 20% stable + 40% medium + 30% L2 + 10% new launches |

## Essential Tools for Yield Farmers

To farm effectively, you need:
- **DEX Liquidity Monitor** — Track LP positions and IL in real-time
- **Portfolio Tracker** — Monitor yields across all positions
- **DeFi Llama** — Compare protocol APYs
- **Tenderly** — Simulate transactions before execution

## Conclusion

DeFi yield farming in 2024 rewards those who combine deep protocol knowledge with the right automation tools. Start with low-risk stablecoin strategies to understand the mechanics, then gradually add exposure to medium-risk concentrated liquidity and looping strategies as your confidence grows.

The highest long-term returns go to farmers who manage risk actively and use tools to monitor their positions 24/7.`,
      authorId: admin.id,
      status: "published",
      publishedAt: d(10),
      coverImage: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&q=80",
    },
    {
      title: "Flash Loan Arbitrage Explained: How to Profit from DeFi Price Gaps",
      slug: "flash-loan-arbitrage-explained-profit-defi",
      excerpt: "Flash loans let you borrow millions with zero collateral — and return it in the same block. Here's how flash loan arbitrage works and how traders are using it to extract profits from DEX price inefficiencies.",
      content: `# Flash Loan Arbitrage Explained: How to Profit from DeFi Price Gaps

In traditional finance, arbitrage requires significant capital. You need to own assets on Exchange A to sell them simultaneously on Exchange B. In DeFi, flash loans eliminate this capital requirement entirely — you can borrow millions of dollars, execute a trade, and repay the loan, all within a single blockchain transaction.

This is flash loan arbitrage, and it's one of the most sophisticated — and profitable — strategies in decentralized finance.

## What Is a Flash Loan?

A flash loan is an uncollateralized loan that must be borrowed and repaid within the same blockchain transaction (one block). If the loan isn't repaid with interest by the end of the transaction, the entire transaction reverts as if it never happened.

This atomic property is what makes flash loans safe for the lender: there's zero default risk because if you can't repay, nothing happens.

Major flash loan providers:
- **Aave** — Up to hundreds of millions in ETH, USDC, USDT, DAI (0.09% fee)
- **Uniswap v2/v3** — Flash swaps with no upfront fee
- **dYdX** — Zero-fee flash loans on Ethereum
- **MakerDAO** — DAI flash loans (flash minting)

## How Flash Loan Arbitrage Works

The classic flash loan arbitrage flow looks like this:

1. **Borrow** $1,000,000 USDC from Aave (0.09% fee = $900)
2. **Buy** ETH on Uniswap at $2,000/ETH → receive 500 ETH
3. **Sell** ETH on SushiSwap at $2,010/ETH → receive $1,005,000 USDC
4. **Repay** $1,000,900 to Aave
5. **Pocket** $4,100 profit — in one transaction, zero capital

The entire sequence executes atomically. If the SushiSwap price moved before your transaction confirmed, the whole thing reverts and you lose nothing but gas.

## Finding Arbitrage Opportunities

Price differences between DEXes are typically small (0.1–0.5%) and short-lived (minutes or seconds). Finding them requires:

### Real-Time Price Monitoring
Monitor token prices across Uniswap v2/v3, SushiSwap, Curve, Balancer, and PancakeSwap simultaneously. Our **Flash Loan Arbitrage Bot** scans 12 DEX pairs per second to identify profitable opportunities before they close.

### Minimum Profit Calculation
Not every price difference is profitable. You need to account for:
- Flash loan fee (0.09% for Aave)
- Gas costs (can be $20–200 on Ethereum mainnet)
- Slippage from large trade size
- MEV/sandwich attack risk

The formula: **Net profit = Price difference % − Flash loan fee − (Gas cost / borrowed amount) − Slippage estimate**

For a $100,000 position on Ethereum, you need at least 0.3–0.5% price difference to profit after costs. Larger positions require smaller spreads.

### Layer 2 Advantages
Gas costs make small flash loan arb unprofitable on Ethereum mainnet. Layer 2 networks dramatically change the economics:

| Network | Gas Cost (typical) | Min profitable spread ($100k position) |
|---------|-------------------|----------------------------------------|
| Ethereum | $50–200 | 0.3–0.5% |
| Arbitrum | $1–5 | 0.01–0.05% |
| Polygon | $0.01–0.10 | <0.01% |
| BSC | $0.50–2 | 0.02–0.05% |

## Building a Flash Loan Arbitrage Bot

### Architecture Overview

A production flash loan arbitrage bot has three main components:

**1. Opportunity Scanner**
- Polls DEX pair reserves every block (or via WebSocket)
- Calculates theoretical profit for each cross-DEX pair
- Filters opportunities above minimum profit threshold
- Sorts by estimated profit

**2. Transaction Builder**
- Constructs the flash loan calldata
- Simulates the transaction via eth_call before submitting
- Estimates gas and calculates net profit post-gas
- Applies sandwich attack protection (private mempool)

**3. Execution Engine**
- Submits transaction via private relay (Flashbots, BloxRoute)
- Monitors transaction confirmation
- Logs profit/loss for each attempt
- Handles reverts gracefully

### Smart Contract Design

The arbitrage smart contract must:
1. Implement the flash loan callback interface (IFlashLoanReceiver for Aave)
2. Execute the swaps atomically within the callback
3. Approve and repay the loan before the callback returns

\`\`\`solidity
function executeOperation(
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata premiums,
    address /* initiator */,
    bytes calldata params
) external override returns (bool) {
    // Decode the target swaps from params
    (address dexA, address dexB, uint256 minProfit) = abi.decode(
        params, (address, address, uint256)
    );
    
    // Execute swap on DEX A
    uint256 received = _swapOnDex(dexA, assets[0], amounts[0]);
    
    // Execute reverse swap on DEX B
    uint256 finalAmount = _swapOnDex(dexB, targetToken, received);
    
    // Verify profit meets minimum threshold
    uint256 owed = amounts[0] + premiums[0];
    require(finalAmount >= owed + minProfit, "Insufficient profit");
    
    // Approve repayment
    IERC20(assets[0]).approve(address(POOL), owed);
    
    return true;
}
\`\`\`

## Advanced Strategies

### Multi-Hop Arbitrage
Instead of A→B, exploit A→B→C→A circular opportunities for higher margins.

### Liquidation Arbitrage
Combine flash loans with liquidation calls on Aave/Compound to acquire discounted collateral and immediately sell it for profit.

### Cross-Chain Arbitrage
Use bridging protocols (Stargate, Hop) within flash loan transactions to exploit price differences across chains. More complex but often more profitable.

## Risks and Challenges

**MEV Competition**
Hundreds of bots compete for the same opportunities. Profitable opportunities are often "sandwiched" or front-run by more sophisticated actors. Solutions include:
- Submitting via Flashbots bundles (private mempool)
- Gas price bidding strategies
- Finding opportunities others miss (less popular DEXes, LP tokens, exotic pairs)

**Smart Contract Bugs**
A single bug in your arbitrage contract can result in total loss. Always:
- Audit your contract professionally
- Run extensive tests on forked mainnet
- Start with small maximum loan sizes

**Gas Price Volatility**
Network congestion can make previously profitable opportunities unprofitable by the time your transaction lands.

## Getting Started

If you're not ready to build your own bot from scratch, our **Flash Loan Arbitrage Bot** provides:
- Fully tested, production-ready source code
- Support for Ethereum, Arbitrum, BSC, Polygon
- Built-in gas optimization
- Configurable minimum profit thresholds
- 90-day update guarantee

The barrier to flash loan arbitrage has never been lower. With the right tools, anyone can participate in one of DeFi's most elegant profit mechanisms.`,
      authorId: admin.id,
      status: "published",
      publishedAt: d(7),
      coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80",
    },
    {
      title: "NFT Sniping Bots: The Complete Guide to Automated NFT Floor Buying",
      slug: "nft-sniping-bots-complete-guide-automated-buying",
      excerpt: "NFT sniping bots have become essential tools for serious NFT traders. Learn how they work, what makes a good sniper, and how to use them profitably while managing the inherent risks.",
      content: `# NFT Sniping Bots: The Complete Guide to Automated NFT Floor Buying

The NFT market moves fast. A rare NFT listed below floor price can sell in under 10 seconds. Human reaction time simply can't compete with automated bots that scan listings in real-time and fire purchase transactions in milliseconds.

This guide covers everything you need to know about NFT sniping bots: how they work, the strategies they use, the risks involved, and how to use them profitably.

## What Is NFT Sniping?

NFT sniping is the practice of automatically detecting and purchasing NFTs listed significantly below their floor price or true rarity value before other buyers can react. A "snipe" typically refers to buying an NFT that was listed by mistake (wrong decimal, typo), listed below market by an uninformed seller, or listed below rarity-adjusted value.

## How NFT Sniping Bots Work

### Real-Time Order Stream Monitoring

Instead of polling API endpoints (which introduces latency), professional sniping bots connect directly to marketplace WebSocket order streams. When a new listing appears:

1. **Detection** — WebSocket event fires within milliseconds of the listing
2. **Evaluation** — Bot checks price vs. floor price and rarity score
3. **Decision** — If criteria met, immediately queue a purchase transaction
4. **Execution** — Transaction submitted with appropriate gas to confirm quickly

The entire process from listing detection to transaction submission can happen in under 50ms for a well-optimized bot.

### Marketplaces and Their APIs

| Marketplace | API Type | Typical Latency | Best For |
|-------------|----------|-----------------|----------|
| Blur | WebSocket (authenticated) | <100ms | ETH blue-chips |
| OpenSea | WebSocket (public) | 100–300ms | Wide selection |
| MagicEden | WebSocket | <100ms | Solana NFTs |
| X2Y2 | REST polling | 500ms+ | Lower-tier collections |

Blur has become the dominant marketplace for professional traders partly because of its superior API performance and pro-trader features.

### Rarity Scoring

Basic snipers just compare listing price to floor price. Advanced bots incorporate rarity:

- **Trait rarity score** — How rare are each of the NFT's traits?
- **Rarity rank** — Position within the collection (rank #1 is rarest)
- **Rarity-adjusted floor** — What would this NFT trade at based on its rarity?

A bot might buy an NFT listed at 1.5x floor if its rarity rank suggests it should trade at 3x floor.

### Gas Optimization

When multiple bots detect the same listing simultaneously, a gas war can occur. Bots bid increasing gas prices to get their transaction confirmed first. A good sniper:
- Estimates competitor gas levels dynamically
- Uses EIP-1559 priority fees for faster confirmation
- Sets maximum gas limits to avoid paying too much for marginal snipes
- Uses Flashbots bundles on Ethereum to avoid front-running

## Setting Up Your First NFT Sniper

### Prerequisites

1. **Crypto wallet** with ETH (or SOL for Solana NFTs) for purchases + gas
2. **NFT sniper bot** (our NFT Floor Price Sniper supports OpenSea, Blur, MagicEden)
3. **RPC endpoint** — Use Alchemy or Infura with WebSocket support
4. **Stable VPS** — Low-latency, 24/7 uptime (closer to blockchain nodes = faster)

### Configuration

Key parameters to configure:

**Floor price threshold:** Buy if listed at X% below floor (e.g., 15% below)
**Maximum price:** Absolute maximum price to prevent buying overpriced NFTs
**Collections whitelist:** Only snipe specific collections you understand
**Rarity filter:** Minimum rarity rank to buy (e.g., top 20% rarest only)
**Daily spend cap:** Maximum ETH to spend per day
**Gas ceiling:** Never pay more than X gwei to avoid gas wars on low-value snipes

### Choosing Target Collections

The best collections for sniping share certain characteristics:
- **High liquidity** — Frequent sales mean floors are accurate and exits are possible
- **Active Discord/Twitter** — Community activity affects floor prices
- **Established reputation** — Avoid low-quality projects that might collapse to zero
- **Reasonable floor** (0.1–5 ETH) — Small enough to buy multiple, large enough to matter

Top collection categories for sniping: Bored Apes/mutants, Azuki/Elementals, DeGods, Pudgy Penguins, and Milady Maker.

## Profitability Analysis

### When Sniping Is Profitable

Sniping generates consistent profit when:
1. You buy genuinely below fair value (not just below floor)
2. You resell quickly at market price (within hours)
3. Gas costs are controlled
4. You avoid holding NFTs during market downturns

### The Math of NFT Sniping

Example snipe:
- Floor price: 1.0 ETH
- Buy price: 0.82 ETH (18% below floor)
- Gas cost: 0.02 ETH
- Marketplace fee: 0.025 ETH (2.5%)
- Total cost: 0.865 ETH
- Resale at 0.95 ETH (5% below floor for quick sale)
- Profit: 0.085 ETH (~9.8% return)

On a day with 5 successful snipes, that's 0.425 ETH profit on ~4.25 ETH deployed.

### Risks to Account For

**Floor price drops:** If the collection's floor crashes after you buy, your profit evaporates. Never hold sniped NFTs long-term unless you have fundamental conviction.

**Failed transactions:** Multiple bots may target the same listing. Failed transactions still cost gas ($5–50 per attempt).

**Wash trading floors:** Some collections have artificially inflated floor prices. Check authentic sale history.

**Illiquid markets:** In bear conditions, even good snipes may be difficult to resell.

## Ethical Considerations

NFT sniping is a legal activity, but it raises some community ethics questions. From the marketplace perspective, sniping improves price discovery — sellers should know the true value of what they're listing. Most professional NFT communities accept sniping as part of the market dynamic.

If you're considering sniping, be transparent in your community about using bots. Avoid targeting vulnerable sellers (people clearly in distress, obviously making mistakes).

## Conclusion

NFT sniping bots have become table stakes for professional NFT traders. As the market matures, the edge from basic floor-price sniping is being competed away — the opportunity increasingly lies in rarity-adjusted pricing, cross-marketplace arbitrage, and superior execution speed.

Ready to start sniping? Our **NFT Floor Price Sniper** comes with full source code, OpenSea/Blur/MagicEden integration, rarity scoring, and 24/7 VPS deployment instructions.`,
      authorId: admin.id,
      status: "published",
      publishedAt: d(4),
      coverImage: "https://images.unsplash.com/photo-1646463394040-93f26f0f6e2a?w=1200&q=80",
    },
    {
      title: "Crypto Wallet Security in 2024: 10 Practices That Could Save Your Funds",
      slug: "crypto-wallet-security-2024-best-practices",
      excerpt: "Over $3 billion in crypto is stolen each year through wallet compromises, phishing, and malicious contracts. Here are the 10 security practices every crypto holder must implement — from seed phrase storage to token approval management.",
      content: `# Crypto Wallet Security in 2024: 10 Practices That Could Save Your Funds

In 2023, over $3.8 billion in cryptocurrency was stolen through hacks, phishing attacks, private key compromises, and malicious smart contracts. The vast majority of these losses were preventable.

Whether you hold $100 or $1 million in crypto, these 10 security practices are non-negotiable.

## Practice 1: Use a Hardware Wallet for Significant Holdings

A hardware wallet (Ledger, Trezor) stores your private keys in a secure chip that never exposes them to your computer or the internet. Even if your computer is completely compromised with malware, a hardware wallet cannot be drained without physical access.

**Rule of thumb:** Any amount you wouldn't leave in cash on your kitchen table belongs on a hardware wallet.

Popular options:
- **Ledger Nano X** — Bluetooth, 100+ apps, $149
- **Trezor Model T** — Open-source firmware, touchscreen, $219
- **Coldcard** — Bitcoin-only, air-gapped, most security-focused

## Practice 2: Treat Your Seed Phrase Like Nuclear Launch Codes

Your 12 or 24-word seed phrase is the master key to all funds in that wallet — forever. Whoever has your seed phrase has your money.

**Never:**
- Enter your seed phrase on any website (even "Ledger" websites asking you to verify)
- Store it in a photo, cloud storage (Google Drive, iCloud, Dropbox)
- Screenshot it
- Email it to yourself
- Store it in a password manager (online ones are vulnerable)
- Tell anyone — including support staff, family, or anyone claiming to be from a protocol

**Do:**
- Write it on paper in permanent ink (waterproof is better)
- Make 2–3 copies stored in different physical locations
- Consider a cryptosteel or metal backup for fireproof/waterproof storage
- Store copies in a safe, safety deposit box, or trusted attorney's sealed envelope

## Practice 3: Use Separate Wallets for Different Purposes

Never use your main holding wallet for DeFi interactions. Establish a wallet hierarchy:

**Cold Storage Wallet** (hardware wallet)
→ Long-term holdings: BTC, ETH, large positions
→ Interact with: Nothing. Ever.

**DeFi Wallet** (software wallet with small balance)
→ Active DeFi interactions, LP farming, yield protocols
→ Fund from cold storage as needed, never keep more than you can afford to lose

**Hot Wallet / Trading Wallet**
→ Exchange interactions, NFT purchases, new protocol experiments
→ Small amounts only

This compartmentalization means a single phishing attack or malicious contract can only drain your hot wallet, not your life savings.

## Practice 4: Audit and Revoke Token Approvals Regularly

Every time you interact with a DeFi protocol, you typically grant it permission to spend your tokens. These approvals persist indefinitely and can be exploited if the protocol is later hacked or turns malicious.

Check and revoke approvals using:
- **Revoke.cash** — The most comprehensive approval manager
- **Etherscan Token Approval Checker**
- Our **Hardware Wallet Security Scanner** — Automatically scans for dangerous approvals

**Best practices:**
- Revoke approvals immediately after completing a transaction
- Never approve "unlimited" spending amounts — approve only what you need
- Review approvals before any major market event (hacks often spike during volatility)

## Practice 5: Verify Every Contract Before Interacting

Before approving any transaction, verify:
1. **Is this the real contract address?** Look up the official contract on the project's GitHub or documentation — never trust links from Twitter/Discord
2. **Is it audited?** Check for a published audit from a reputable firm (Trail of Bits, Consensys Diligence, OpenZeppelin, Certik)
3. **How long has it been live?** New contracts have unknown vulnerabilities

Resources:
- **Etherscan** — Check contract verification status and transaction history
- **DeFiLlama** — Verify TVL and protocol legitimacy
- **DeBank** — View what contracts have your approvals

## Practice 6: Never Click Links in Discord or Twitter DMs

The #1 vector for crypto theft is phishing. Attackers impersonate team members, post fake "exclusive mint" links, and distribute malicious contract approval requests.

**Always:**
- Navigate directly to official URLs (bookmark them)
- Verify URLs character by character (0 vs O, 1 vs l are common tricks)
- Enable anti-phishing features in MetaMask
- Report suspicious DMs immediately

If someone DMs you about a "private presale," "whitelist opportunity," or "NFT claim" — it's a scam, 100% of the time.

## Practice 7: Use a Dedicated Browser for Crypto

Install a separate browser (Brave or Firefox) exclusively for crypto interactions. Keep it free of:
- Unnecessary extensions (each extension is a potential attack vector)
- Saved passwords for non-crypto sites
- Auto-fill enabled

Consider using a virtual machine for high-value DeFi interactions.

## Practice 8: Enable Multi-Factor Authentication Everywhere

For all exchange accounts and any crypto service:
- **Use hardware security keys** (YubiKey) when supported — most secure
- **Use authenticator apps** (Google Authenticator, Authy) — never SMS/email 2FA
- **Never** use SMS 2FA — SIM swap attacks are common in the crypto space

SIM swap attacks have cost users millions: attackers convince mobile carriers to transfer your phone number to their SIM, intercepting your 2FA codes.

## Practice 9: Run Regular Security Audits

At minimum quarterly, conduct a security audit of your crypto holdings:

1. **Check all token approvals** — Revoke any you don't recognize or need
2. **Update hardware wallet firmware** — Apply security patches
3. **Check for address poisoning** — Look for transactions to/from addresses that look like yours
4. **Review exchange API keys** — Delete any unused API keys with trading/withdrawal permissions
5. **Verify your seed phrase backup is intact** — Check that physical backups are legible and accessible

Our **Hardware Wallet Security Scanner** automates much of this process, providing a detailed report and actionable remediation steps.

## Practice 10: Understand and Prepare for Inheritance

Crypto is irretrievably lost when the private key holder dies without sharing access instructions. Millions in Bitcoin and Ethereum are permanently locked in wallets of deceased holders.

Prepare a "crypto inheritance plan":
- Document all wallets and holdings (not the keys themselves) in a secure location
- Create a sealed envelope with access instructions to be opened only after your death
- Consider a multi-signature setup (2-of-3 keys) where a trusted attorney holds one key
- Some hardware wallets support Shamir's Secret Sharing to split keys among multiple trusted parties

## Conclusion

Crypto security is not optional — it's table stakes for serious participation in digital assets. The question isn't whether you'll face a security threat; it's whether you'll be prepared when you do.

Start with the fundamentals: hardware wallet for significant holdings, proper seed phrase storage, separate wallets for DeFi, and regular approval audits. These four practices alone will protect you from the vast majority of attacks.

For comprehensive wallet security auditing, our **Hardware Wallet Security Scanner** provides automated checks across all these vectors in minutes.`,
      authorId: admin.id,
      status: "published",
      publishedAt: d(2),
      coverImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80",
    },
    {
      title: "Smart Contract Auditing: A Developer's Complete Guide to Securing DeFi Code",
      slug: "smart-contract-auditing-developers-complete-guide",
      excerpt: "DeFi exploits cost over $1 billion per year — the vast majority targeting preventable smart contract vulnerabilities. This guide covers the most critical vulnerability classes, audit methodologies, and the tools every Solidity developer should master.",
      content: `# Smart Contract Auditing: A Developer's Complete Guide to Securing DeFi Code

Since DeFi emerged as a significant market, smart contract exploits have siphoned over $1 billion per year from protocols. The Ronin bridge hack ($625M), the Poly Network exploit ($611M), and the Wormhole hack ($320M) all shared a common thread: vulnerabilities that an experienced auditor would have caught.

This guide is for Solidity developers who want to write secure smart contracts and understand the auditing process — whether you're hiring an auditor or preparing code for audit.

## Why Smart Contract Security Is Different

Smart contracts are immutable once deployed (without upgrade patterns), handle real money, and are open-source — attackers can read your code and probe for vulnerabilities without any access restrictions. A single bug can result in total loss of funds with no recourse.

This is categorically different from traditional software security, where:
- Bugs can be patched quickly after discovery
- Attackers need to find and exploit bugs without seeing the source code
- Most bugs result in service disruption, not financial theft

## The Most Critical Vulnerability Classes

### 1. Reentrancy Attacks

The most famous vulnerability type, responsible for the 2016 DAO hack ($60M). A reentrancy attack occurs when a contract calls an external contract before updating its internal state, allowing the external contract to call back into the original function.

**Vulnerable code:**
\`\`\`solidity
function withdraw(uint amount) external {
    require(balances[msg.sender] >= amount);
    (bool success, ) = msg.sender.call{value: amount}(""); // External call BEFORE state update
    require(success);
    balances[msg.sender] -= amount; // State update AFTER external call — VULNERABLE
}
\`\`\`

**Fixed code:**
\`\`\`solidity
function withdraw(uint amount) external {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount; // Update state FIRST
    (bool success, ) = msg.sender.call{value: amount}(""); // Then external call
    require(success);
}
\`\`\`

**Best practice:** Use the Checks-Effects-Interactions pattern. Always update state before making external calls. Use ReentrancyGuard from OpenZeppelin.

### 2. Integer Overflow/Underflow

Before Solidity 0.8.0, arithmetic operations could silently overflow or underflow. A uint256 at its maximum (2^256 - 1) incremented by 1 becomes 0.

Modern Solidity (0.8.0+) has built-in overflow protection with automatic reverts. For older contracts or code using unchecked{} blocks, this remains critical.

### 3. Access Control Vulnerabilities

Many hacks result from missing or incorrect access controls — anyone calling a function that should be admin-only.

**Common patterns:**
- Missing onlyOwner modifier on privileged functions
- Incorrect role assignments in RBAC systems
- Initialization functions that can be called by anyone
- Proxied contracts where the implementation can be directly initialized

**Real example:** The Parity wallet hack (2017) — a public initialization function allowed an attacker to claim ownership of the library contract.

### 4. Flash Loan Attack Vectors

Flash loans can be used to manipulate protocol state temporarily:
- Inflating/deflating token prices used as oracle inputs
- Temporarily gaining governance voting power to pass malicious proposals
- Draining lending protocols that rely on spot prices

**Mitigation:** Never use spot prices from DEXes as oracles. Use Chainlink or time-weighted average prices (TWAP).

### 5. Oracle Manipulation

Price oracles tell your contract what assets are worth. If the oracle is manipulated, attackers can:
- Borrow more than collateral is worth
- Trigger liquidations at wrong prices
- Exploit arbitrage between oracle price and market price

**Use:** Chainlink decentralized oracles, Uniswap v3 TWAP, or multi-oracle systems with deviation checks.

### 6. Timestamp Manipulation

Block timestamps in Solidity can be manipulated by miners within a 15-second window. Don't use block.timestamp for:
- Random number generation
- Time locks shorter than 15 seconds
- Precise timing logic

### 7. Signature Replay Attacks

If your contract accepts signed messages, an attacker might replay a valid signature in a different context. Always include:
- Chain ID (EIP-712 structured data)
- Contract address
- Nonce (to prevent replay of the same action)
- Expiry timestamp

## The Audit Process

### Phase 1: Documentation Review

Auditors start by reviewing:
- Technical documentation and architecture diagrams
- Whitepaper and tokenomics
- Known risks and assumptions
- Test coverage reports

**Developers should prepare:** Comprehensive README, NatSpec documentation on all public functions, architecture diagram, list of external dependencies.

### Phase 2: Manual Code Review

Line-by-line review focusing on:
- Business logic correctness
- Access control completeness
- State machine integrity
- Economic attack vectors

Most critical findings come from manual review — automated tools miss complex business logic errors.

### Phase 3: Automated Analysis

Run automated tools to catch common patterns:

**Slither** (Trail of Bits)
\`\`\`bash
pip install slither-analyzer
slither . --print human-summary
\`\`\`
Detects: reentrancy, uninitialized variables, dangerous operations, incorrect ERC implementations

**Mythril** (ConsenSys)
Symbolic execution tool that explores all execution paths to find vulnerabilities.

**Echidna** (property-based fuzzing)
Generates thousands of random transactions to test invariants you define.

### Phase 4: Proof of Concept Exploits

For critical vulnerabilities, auditors typically write PoC exploit code to:
- Prove exploitability beyond doubt
- Help developers understand the exact attack vector
- Validate the fix after remediation

### Phase 5: Remediation Review

After developers fix reported issues, auditors verify:
- Fix addresses the root cause (not just the symptom)
- Fix doesn't introduce new vulnerabilities
- Fix passes existing and new test cases

## Severity Classification

| Severity | Definition | Example |
|----------|------------|---------|
| Critical | Loss of funds possible | Reentrancy draining ETH |
| High | Significant impact, likely exploitable | Access control bypass |
| Medium | Significant impact, unlikely or conditional | Token accounting errors |
| Low | Minor impact or very unlikely | Unused variables |
| Informational | Code quality, best practices | Missing events |

## Top Audit Firms in 2024

| Firm | Specialty | Approximate Cost |
|------|-----------|-----------------|
| Trail of Bits | All protocols | $50k–$250k |
| ConsenSys Diligence | Ethereum, DeFi | $30k–$150k |
| OpenZeppelin | All protocols | $50k–$200k |
| Halborn | DeFi, bridges | $20k–$100k |
| Certik | Many protocols | $10k–$50k |

**Important:** A Certik audit badge does not mean the protocol is safe. Multiple "audited" protocols have been exploited. Always read the full audit report.

## Developer Security Checklist

Before deploying:

**Code Quality**
- [ ] Compiler version locked (pragma solidity =0.8.x)
- [ ] OpenZeppelin libraries used for standard functionality
- [ ] All state changes emit events
- [ ] No unused variables or imports

**Access Control**
- [ ] All privileged functions have appropriate modifiers
- [ ] Initialization functions can only be called once
- [ ] Upgradeable contracts follow UUPS or Transparent Proxy pattern correctly

**Economics**
- [ ] No reliance on spot prices for critical logic
- [ ] Flash loan attack vectors considered
- [ ] Token accounting uses internal balance tracking

**External Interactions**
- [ ] Checks-Effects-Interactions pattern followed
- [ ] ReentrancyGuard used where appropriate
- [ ] Return values from external calls checked

**Testing**
- [ ] 100% line coverage on critical functions
- [ ] Property-based fuzzing completed
- [ ] Integration tests with forked mainnet

## Conclusion

Smart contract security requires a multi-layered approach: secure design patterns, comprehensive testing, automated analysis, and professional audit. No single tool or audit guarantees security — the goal is reducing risk systematically.

For developers deploying smart contracts with our **Solidity Smart Contract Templates**, each template has been professionally audited and includes a full security report and test suite. Build on verified foundations rather than starting from scratch.`,
      authorId: admin.id,
      status: "published",
      publishedAt: d(1),
      coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80",
    },
  ]);

  console.log("  ✓ 6 blog posts created");

  // ─── Demo Orders & Payments (showcasing escrow flow) ─────────────────────
  const [order1] = await db.insert(schema.ordersTable).values({
    userId: buyer.id,
    productId: products[0].id,
    amount: products[0].price,
    status: "delivered",
    adminNotes: "Payment confirmed on TRC20. Product delivered. Funds released to seller.",
  }).returning();

  const [order2] = await db.insert(schema.ordersTable).values({
    userId: buyer.id,
    productId: products[1].id,
    amount: products[1].price,
    status: "confirmed",
    adminNotes: "Payment verified. Download link active.",
  }).returning();

  const [order3] = await db.insert(schema.ordersTable).values({
    userId: buyer.id,
    productId: products[9].id,
    amount: products[9].price,
    status: "awaiting_confirmation",
  }).returning();

  await db.insert(schema.paymentsTable).values([
    {
      orderId: order1.id,
      amount: products[0].price,
      chain: "USDT_TRC20",
      txHash: "8f2a9e1b7c4d3e6f0a5b9c2d4e7f1a3b6c8d2e5f",
      status: "confirmed",
    },
    {
      orderId: order2.id,
      amount: products[1].price,
      chain: "USDT_BEP20",
      txHash: "0xd4e8f2a1b5c9e3f7a2b6c0d4e8f1a5b9c3d7e1f5",
      status: "confirmed",
    },
    {
      orderId: order3.id,
      amount: products[9].price,
      chain: "USDT_TON",
      txHash: "3b7c1e5f9a2d6b0e4c8f2a6d0b4e8c2f6a0d4b8",
      status: "pending",
    },
  ]);

  console.log("  ✓ Demo orders and payments created");

  // ─── Notifications ────────────────────────────────────────────────────────
  await db.insert(schema.notificationsTable).values([
    {
      userId: buyer.id,
      type: "order_update",
      title: "Payment Confirmed!",
      message: `Your payment for "${products[0].name}" has been confirmed. Download is ready.`,
      link: `/dashboard/orders/${order1.id}`,
      isRead: "false",
    },
    {
      userId: buyer.id,
      type: "order_update",
      title: "Order Delivered",
      message: `Your order for "${products[0].name}" has been delivered. Enjoy your product!`,
      link: `/dashboard/orders/${order1.id}`,
      isRead: "false",
    },
    {
      userId: seller.id,
      type: "order_update",
      title: "New Order for Your Product!",
      message: `Someone purchased "${products[0].name}". Payment is in escrow.`,
      link: `/dashboard`,
      isRead: "false",
    },
    {
      userId: seller.id,
      type: "payment",
      title: "Funds Released to You!",
      message: `$${products[0].price} USDT has been released to your wallet for order #${order1.id}.`,
      link: `/dashboard`,
      isRead: "false",
    },
  ]);

  console.log("  ✓ Notifications created");

  await pool.end();
  console.log("\n✅ Database seeded successfully!");
  console.log("\nDemo credentials:");
  console.log("  Admin:  admin@digimarket.io / admin123");
  console.log("  Buyer:  john@example.com / user123");
  console.log("  Seller: seller@example.com / seller123");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
