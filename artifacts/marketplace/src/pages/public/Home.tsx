import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, ChevronLeft, ChevronRight, Shield, Zap, Users, Star,
  Code2, Globe, Instagram, Layers, ShoppingBag,
  TrendingUp, Lock, CheckCircle2, Store, Package, Cpu,
  Monitor, FileCode2, Bot, Smartphone,
} from "lucide-react";
import { useListFeaturedProducts, useListCategories } from "@workspace/api-client-react";
import { usePi } from "@/contexts/PiContext";

const PI_SYMBOL = "π";

const SLIDES = [
  {
    badge: `🔥 #1 Marketplace on Pi Network`,
    title: `Buy & Sell Digital\nProducts with ${PI_SYMBOL}i`,
    subtitle: "The premier marketplace for developers, creators and entrepreneurs on the Pi Network ecosystem. Escrow-protected.",
    cta: "Browse Products",
    ctaLink: "/marketplace",
    bg: "from-[#0a0416] via-[#1a0b40] to-[#0d1030]",
    accent: "from-violet-500 to-purple-700",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop",
  },
  {
    badge: "💻 Web Apps & Software",
    title: "Deploy Ready-Made\nWeb Applications",
    subtitle: "Buy complete SaaS apps, admin dashboards, e-commerce systems, and business tools. Source code included.",
    cta: "Browse Web Apps",
    ctaLink: "/marketplace?cat=web-apps",
    bg: "from-[#060b2e] via-[#0f1a50] to-[#080e30]",
    accent: "from-blue-500 to-indigo-600",
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&auto=format&fit=crop",
  },
  {
    badge: "✅ Verified Social Accounts",
    title: "Premium Social Media\nAccounts & Pages",
    subtitle: "Buy aged, verified Facebook, Instagram, Twitter and TikTok accounts with real followers. Ready to use.",
    cta: "View Accounts",
    ctaLink: "/marketplace?cat=social-media-accounts",
    bg: "from-[#0f1a20] via-[#152535] to-[#0a1520]",
    accent: "from-pink-500 to-rose-600",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&auto=format&fit=crop",
  },
  {
    badge: "🛡️ Admin Escrow Protection",
    title: `Safe P2P Trading\nWith ${PI_SYMBOL}i Escrow`,
    subtitle: `Every trade is protected by our admin escrow system. Pay safely with Pi (${PI_SYMBOL}) — the world's fastest growing crypto.`,
    cta: "Start Selling",
    ctaLink: "/seller-register",
    bg: "from-[#1a0533] via-[#2d1b69] to-[#0d0420]",
    accent: "from-yellow-400 to-orange-500",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f4ec6ae?w=1200&auto=format&fit=crop",
  },
  {
    badge: "👨‍💻 Hire a Pi Developer",
    title: `Build Your Custom\nPi Network App`,
    subtitle: "Need a custom web app, DeFi tool, bot, or Pi SDK integration? Hire our expert developer. Submit your brief, get a quote, pay with Pi escrow.",
    cta: "Hire a Developer",
    ctaLink: "/hire",
    bg: "from-[#0a1a0a] via-[#0f2a1a] to-[#050f08]",
    accent: "from-emerald-400 to-cyan-500",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop",
  },
];

const CATEGORIES = [
  { name: "Web Apps & SaaS", slug: "web-apps", icon: <Monitor className="w-6 h-6" />, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { name: "Scripts & Software", slug: "scripts-software", icon: <FileCode2 className="w-6 h-6" />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { name: "Social Media Accounts", slug: "social-media-accounts", icon: <Instagram className="w-6 h-6" />, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  { name: "Templates & Themes", slug: "templates", icon: <Layers className="w-6 h-6" />, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { name: "Websites & Domains", slug: "websites-domains", icon: <Globe className="w-6 h-6" />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { name: "Bots & Automation", slug: "bots-automation", icon: <Bot className="w-6 h-6" />, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { name: "Mobile Apps", slug: "mobile-apps", icon: <Smartphone className="w-6 h-6" />, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  { name: "Pi Network Tools", slug: "pi-network-tools", icon: <TrendingUp className="w-6 h-6" />, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
];

const STATS = [
  { label: "Digital Products", value: "12,000+" },
  { label: "Pi Pioneers Selling", value: "3,500+" },
  { label: "Happy Buyers", value: "85,000+" },
  { label: "Escrow Protected", value: "100%" },
];

const TRUST = [
  { icon: <Lock className="w-5 h-5 text-yellow-400" />, title: "Pi Escrow Protection", desc: "Admin holds Pi funds until delivery is confirmed by buyer" },
  { icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, title: "Verified Pi Pioneers", desc: "All sellers verified through Pi Network KYC process" },
  { icon: <Zap className="w-5 h-5 text-violet-400" />, title: "Instant Delivery", desc: "Digital products delivered immediately after Pi payment confirmed" },
  { icon: <Shield className="w-5 h-5 text-blue-400" />, title: "Dispute Resolution", desc: "24/7 admin support for any Pi transaction issues" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { data: featuredProducts, isLoading: loadingProducts } = useListFeaturedProducts();
  const { isInPiBrowser } = usePi();

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

      {/* Pi Browser Banner */}
      {!isInPiBrowser && (
        <div className="w-full bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-yellow-500/20 border-b border-yellow-500/30 py-2 px-4 text-center">
          <p className="text-xs text-yellow-300 font-medium">
            🌐 For the best experience and Pi payments, open Breedskoolpi in the{" "}
            <span className="font-bold text-yellow-400">Pi Browser</span>
          </p>
        </div>
      )}

      {/* ─── HERO SLIDER ─── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "580px" }}>
        <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-all duration-700`} />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-8 transition-all duration-700"
          style={{ backgroundImage: `url(${slide.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

        {/* Pi network grid background */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(167,139,250,0.8) 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }} />

        <div className="relative z-10 container max-w-screen-xl mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/5 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-yellow-300/90 mb-6 animate-in fade-in duration-500">
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
              Join Breedskoolpi Free
            </Button>
          </div>

          {/* Pi payment badge */}
          <div className="mt-8 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white/60">
            <span className="text-yellow-400 font-bold text-base">π</span>
            Pay with Pi Network · Escrow Protected · Instant Delivery
          </div>
        </div>

        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-colors backdrop-blur-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-colors backdrop-blur-sm">
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goToSlide(i)} className={`rounded-full transition-all duration-300 ${i === activeSlide ? "w-8 h-2 bg-yellow-400" : "w-2 h-2 bg-white/30"}`} />
          ))}
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="w-full bg-card/80 border-y border-border/40 py-5">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-yellow-400">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PI NETWORK INFO BAR ─── */}
      <section className="w-full py-8 px-4 bg-gradient-to-r from-violet-900/20 via-purple-900/10 to-violet-900/20 border-b border-violet-500/20">
        <div className="container max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
                <span className="text-2xl font-black text-white" style={{ fontFamily: "serif" }}>π</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Powered by Pi Network</h3>
                <p className="text-xs text-muted-foreground">The world's most inclusive cryptocurrency ecosystem</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Pi Browser Compatible</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Pi KYC Verified Sellers</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Pi Escrow Payments</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mobile-First Design</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORY GRID ─── */}
      <section className="w-full py-16 px-4 container max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Browse by Category</h2>
            <p className="text-muted-foreground mt-1 text-sm">Everything a Pi Pioneer needs</p>
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
              <p className="text-muted-foreground mt-1 text-sm">Top picks curated for Pi Pioneers</p>
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
          <h2 className="text-2xl md:text-3xl font-bold">How Breedskoolpi Works</h2>
          <p className="text-muted-foreground mt-2">Simple, safe, and built for Pi Pioneers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              icon: <Store className="w-7 h-7" />,
              title: "Browse & Select",
              desc: "Search thousands of digital products — web apps, scripts, social accounts, templates and more. Filter by category, price, and rating.",
              color: "text-violet-400 bg-violet-500/10 border-violet-500/20"
            },
            {
              step: "02",
              icon: <span className="text-3xl font-black" style={{ fontFamily: "serif" }}>π</span>,
              title: "Pay with Pi",
              desc: "Send Pi to our escrow wallet through the Pi Browser. Funds are held securely until your delivery is confirmed.",
              color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
            },
            {
              step: "03",
              icon: <Zap className="w-7 h-7" />,
              title: "Instant Delivery",
              desc: "Once your Pi payment is verified by admin, you get immediate access to your digital files and full seller support.",
              color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            },
          ].map((step) => (
            <div key={step.step} className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border/50">
              <div className="absolute -top-3 -right-3 text-5xl font-black text-muted-foreground/10 select-none">{step.step}</div>
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
      <section className="w-full py-16 px-4 bg-gradient-to-br from-violet-950/30 via-purple-900/10 to-transparent border-y border-border/30">
        <div className="container max-w-screen-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Why Pi Pioneers Trust Us</h2>
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

      {/* ─── SELLER CTA ─── */}
      <section className="w-full py-16 px-4 container max-w-screen-xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 p-10 md:p-16 text-white text-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format')] bg-cover bg-center opacity-5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30 mb-5 text-xs">
              <span className="mr-1 font-black" style={{ fontFamily: "serif" }}>π</span> Pi Pioneer Seller Program
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Start Earning Pi Today</h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              List your web apps, scripts, software, social accounts, templates, or websites. Reach 85,000+ Pi Pioneers globally and earn Pi cryptocurrency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-yellow-400 text-purple-900 hover:bg-yellow-300 font-bold rounded-full h-12 px-8"
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

  return (
    <div
      className="group rounded-2xl bg-card border border-border/50 overflow-hidden hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={onClick}
    >
      <div className="relative h-44 overflow-hidden bg-muted/30">
        {true ? (
          <img
            src={product.previewImages?.[0] || "/default-product.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.src = "/default-product.svg"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/10 to-purple-500/10">
            <Cpu className="w-10 h-10 text-violet-400/30" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {isHot && <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">HOT</span>}
          {isNew && <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">NEW</span>}
        </div>
        <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-yellow-400 flex items-center gap-0.5">
          <span className="font-black" style={{ fontFamily: "serif" }}>π</span>
          {Number(product.price).toFixed(2)}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-[11px] font-semibold text-violet-400 uppercase tracking-wide mb-1">{product.categoryName}</div>
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
