import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, ChevronLeft, ChevronRight, Shield, Zap, Users, Star,
  Code2, Globe, Facebook, Instagram, Twitter, Layers, ShoppingBag,
  TrendingUp, Lock, CheckCircle2, Store, Package, Cpu, ExternalLink,
} from "lucide-react";
import { useListFeaturedProducts, useListCategories } from "@workspace/api-client-react";

const SLIDES = [
  {
    badge: "🔥 #1 Digital Asset Marketplace",
    title: "Buy & Sell Premium\nSource Code & Apps",
    subtitle: "Access thousands of web apps, mobile apps, scripts, and templates. Instant delivery. Escrow-protected.",
    cta: "Browse Source Code",
    ctaLink: "/marketplace?cat=source-code-apps",
    bg: "from-[#0f0c29] via-[#302b63] to-[#24243e]",
    accent: "from-violet-500 to-purple-700",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop",
  },
  {
    badge: "✅ Verified Accounts Available",
    title: "Premium Social Media\nAccounts & Pages",
    subtitle: "Buy aged Facebook, Instagram, Twitter, and TikTok accounts with real followers. Verified and ready to use.",
    cta: "View Accounts",
    ctaLink: "/marketplace?cat=social-media-accounts",
    bg: "from-[#0f2027] via-[#203a43] to-[#2c5364]",
    accent: "from-sky-500 to-cyan-600",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&auto=format&fit=crop",
  },
  {
    badge: "🌐 Turnkey Digital Business",
    title: "Ready-Made Websites\n& Premium Domains",
    subtitle: "Launch your business instantly. Buy complete website packages, premium domain names, and landing pages.",
    cta: "Shop Websites",
    ctaLink: "/marketplace?cat=websites-domains",
    bg: "from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]",
    accent: "from-emerald-500 to-teal-600",
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&auto=format&fit=crop",
  },
  {
    badge: "🛡️ Admin Escrow Protection",
    title: "Safe P2P Trading\nWith Escrow",
    subtitle: "Every trade is protected by our admin escrow system. Crypto payments in USDT TRC20, BEP20, and TON.",
    cta: "Start Selling",
    ctaLink: "/seller-register",
    bg: "from-[#1a0533] via-[#2d1b69] to-[#11998e]",
    accent: "from-orange-500 to-yellow-500",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f4ec6ae?w=1200&auto=format&fit=crop",
  },
];

const CATEGORIES = [
  { name: "Source Code & Apps", slug: "source-code-apps", icon: <Code2 className="w-6 h-6" />, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { name: "HTML Templates", slug: "templates", icon: <Layers className="w-6 h-6" />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { name: "Social Media Accounts", slug: "social-media-accounts", icon: <Instagram className="w-6 h-6" />, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  { name: "Facebook Accounts", slug: "facebook-accounts", icon: <Facebook className="w-6 h-6" />, color: "text-blue-500", bg: "bg-blue-600/10 border-blue-600/20" },
  { name: "Websites & Domains", slug: "websites-domains", icon: <Globe className="w-6 h-6" />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { name: "Landing Pages", slug: "landing-pages", icon: <ExternalLink className="w-6 h-6" />, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { name: "Crypto & DeFi Tools", slug: "crypto-defi-tools", icon: <TrendingUp className="w-6 h-6" />, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { name: "SaaS Applications", slug: "saas-apps", icon: <Package className="w-6 h-6" />, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
];

const STATS = [
  { label: "Digital Products", value: "12,000+" },
  { label: "Active Sellers", value: "3,500+" },
  { label: "Happy Buyers", value: "85,000+" },
  { label: "Escrow Protected", value: "100%" },
];

const TRUST = [
  { icon: <Lock className="w-5 h-5 text-emerald-400" />, title: "Escrow Protection", desc: "Admin holds funds until delivery is confirmed" },
  { icon: <CheckCircle2 className="w-5 h-5 text-blue-400" />, title: "Verified Sellers", desc: "All sellers are ID-verified before listing" },
  { icon: <Zap className="w-5 h-5 text-yellow-400" />, title: "Instant Delivery", desc: "Digital files delivered immediately after payment" },
  { icon: <Shield className="w-5 h-5 text-violet-400" />, title: "Dispute Resolution", desc: "24/7 admin support for any transaction issues" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { data: featuredProducts, isLoading: loadingProducts } = useListFeaturedProducts();

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveSlide(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => goToSlide((activeSlide + 1) % SLIDES.length), [activeSlide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide((activeSlide - 1 + SLIDES.length) % SLIDES.length), [activeSlide, goToSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = SLIDES[activeSlide];

  return (
    <div className="flex flex-col w-full">

      {/* ─── HERO SLIDER ─── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "580px" }}>
        <div
          className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-all duration-700`}
        />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 transition-all duration-700"
          style={{ backgroundImage: `url(${slide.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

        <div className="relative z-10 container max-w-screen-xl mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-white/80 mb-6 animate-in fade-in duration-500">
            {slide.badge}
          </div>

          <h1
            key={activeSlide}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ whiteSpace: "pre-line" }}
          >
            {slide.title}
          </h1>

          <p
            key={`sub-${activeSlide}`}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100"
          >
            {slide.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <Button
              size="lg"
              className={`h-13 px-8 text-base font-semibold rounded-full bg-gradient-to-r ${slide.accent} border-0 shadow-xl hover:opacity-90 transition-opacity`}
              onClick={() => setLocation(slide.ctaLink)}
            >
              {slide.cta} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-13 px-8 text-base font-semibold rounded-full border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm"
              onClick={() => setLocation("/register")}
            >
              Create Free Account
            </Button>
          </div>
        </div>

        {/* Slider controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`rounded-full transition-all duration-300 ${i === activeSlide ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/30"}`}
            />
          ))}
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="w-full bg-card/80 border-y border-border/40 py-5">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORY GRID ─── */}
      <section className="w-full py-16 px-4 container max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Browse by Category</h2>
            <p className="text-muted-foreground mt-1 text-sm">Find exactly what you need</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/categories">All categories <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setLocation(`/marketplace?cat=${cat.slug}`)}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${cat.bg} hover:scale-[1.03] transition-all duration-200 cursor-pointer text-center group`}
            >
              <div className={`${cat.color} group-hover:scale-110 transition-transform duration-200`}>
                {cat.icon}
              </div>
              <span className="text-sm font-medium text-foreground/90 leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      <section className="w-full py-16 px-4 bg-card/20 border-y border-border/30">
        <div className="container max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Featured Listings</h2>
              <p className="text-muted-foreground mt-1 text-sm">Top picks curated by our team</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/marketplace">View all <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
            </Button>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-2xl bg-card border border-border/50 overflow-hidden animate-pulse">
                  <div className="h-44 bg-muted/50" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {(featuredProducts as any[])?.slice(0, 8).map((product: any) => (
                <ProductCard key={product.id} product={product} onClick={() => setLocation(`/marketplace/${product.id}`)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="w-full py-16 px-4 container max-w-screen-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-2">Simple, safe, and fast</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", icon: <Store className="w-7 h-7" />, title: "Browse & Select", desc: "Search thousands of digital products. Filter by category, price, and rating to find the perfect match.", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
            { step: "02", icon: <Lock className="w-7 h-7" />, title: "Pay with Crypto", desc: "Send USDT (TRC20, BEP20, or TON) to our escrow wallet. Funds are held securely until delivery is confirmed.", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            { step: "03", icon: <Zap className="w-7 h-7" />, title: "Instant Delivery", desc: "Once payment is verified, you get immediate access to your digital files and full seller support.", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
          ].map((step) => (
            <div key={step.step} className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border/50">
              <div className="absolute -top-3 -right-3 text-xs font-bold text-muted-foreground/30 text-5xl font-black select-none">{step.step}</div>
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 ${step.color}`}>
                {step.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TRUST BADGES ─── */}
      <section className="w-full py-16 px-4 bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent border-y border-border/30">
        <div className="container max-w-screen-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Why Trust Us</h2>
            <p className="text-muted-foreground mt-2">Your security is our top priority</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST.map((t) => (
              <div key={t.title} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-sm">
                <div className="w-11 h-11 rounded-xl bg-background flex items-center justify-center shadow-sm">
                  {t.icon}
                </div>
                <h3 className="font-semibold text-sm">{t.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BECOME A SELLER CTA ─── */}
      <section className="w-full py-16 px-4 container max-w-screen-xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-violet-600 to-purple-800 p-10 md:p-16 text-white text-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format')] bg-cover bg-center opacity-10" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <Badge className="bg-white/20 text-white border-white/20 mb-5 text-xs">💼 Seller Program</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Start Selling Today</h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              List your source code, templates, social media accounts, websites, or any digital product. Reach 85,000+ buyers globally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-bold rounded-full h-12 px-8"
                onClick={() => setLocation("/seller-register")}
              >
                <Users className="mr-2 w-4 h-4" /> Become a Seller
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 rounded-full h-12 px-8"
                onClick={() => setLocation("/pricing")}
              >
                View Commission Rates
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function ProductCard({ product, onClick }: { product: any; onClick: () => void }) {
  const isNew = Date.now() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  const isHot = product.salesCount > 200;
  const hasSale = product.originalPrice && Number(product.originalPrice) > Number(product.price);

  return (
    <div
      className="group rounded-2xl bg-card border border-border/50 overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={onClick}
    >
      <div className="relative h-44 overflow-hidden bg-muted/30">
        {product.previewImages?.[0] ? (
          <img
            src={product.previewImages[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-purple-500/10">
            <Cpu className="w-10 h-10 text-primary/30" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {isHot && <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">HOT</span>}
          {isNew && <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">NEW</span>}
          {hasSale && <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">SALE</span>}
        </div>
        <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-white">
          ${Number(product.price).toFixed(2)}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1">{product.categoryName}</div>
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2 flex-1">{product.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="font-medium text-foreground/80">4.8</span>
          <span className="ml-1">({product.salesCount} sales)</span>
        </div>
      </div>
    </div>
  );
}
