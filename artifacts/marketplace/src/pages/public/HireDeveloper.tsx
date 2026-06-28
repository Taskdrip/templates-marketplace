import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Code2, Globe, Smartphone, Bot, Shield, Zap, Users, CheckCircle2,
  ArrowRight, MessageSquare, Clock, Star, Cpu, TrendingUp, Database,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

const APP_TYPES = [
  { icon: <Globe className="w-6 h-6" />, title: "Web Apps & SaaS", desc: "Full-stack web applications, dashboards, admin panels, e-commerce platforms", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { icon: <Smartphone className="w-6 h-6" />, title: "Mobile Apps", desc: "iOS & Android apps built with React Native or Flutter for the Pi ecosystem", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { icon: <Code2 className="w-6 h-6" />, title: "Pi DeFi & Blockchain", desc: "Pi Network smart contracts, dApps, payment integrations, and Pi SDK apps", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { icon: <Bot className="w-6 h-6" />, title: "Bots & Automation", desc: "Telegram bots, trading bots, workflow automation tools and Pi payment bots", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { icon: <Database className="w-6 h-6" />, title: "Scripts & APIs", desc: "Backend services, REST APIs, data scrapers, and custom business logic", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { icon: <TrendingUp className="w-6 h-6" />, title: "Pi Network Tools", desc: "Pi mining dashboards, referral systems, Pi wallet trackers, and analytics", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
];

const PROCESS = [
  { step: "01", title: "Submit Your Brief", desc: "Fill out our project form with your idea, budget, and timeline. Takes 5 minutes." },
  { step: "02", title: "Get a Quote", desc: "Our Pi developer reviews your brief and sends you a detailed quote within 24 hours." },
  { step: "03", title: "Agree & Escrow", desc: "Approve the quote and deposit Pi into escrow. Funds are only released on delivery." },
  { step: "04", title: "Build & Deliver", desc: "We build your app, keep you updated, and deliver clean code with documentation." },
];

const WHY = [
  { icon: <Shield className="w-5 h-5 text-yellow-400" />, title: "Pi Escrow Protected", desc: "All payments held in Pi escrow until you approve the delivered work" },
  { icon: <Cpu className="w-5 h-5 text-violet-400" />, title: "Pi Network Specialists", desc: "Deep expertise in Pi SDK, Pi Payments, and the full Pi ecosystem" },
  { icon: <Zap className="w-5 h-5 text-emerald-400" />, title: "Fast Turnaround", desc: "Most projects completed in 1–4 weeks with daily progress updates" },
  { icon: <MessageSquare className="w-5 h-5 text-blue-400" />, title: "Direct Communication", desc: "Chat directly via in-app messages, WhatsApp, or Telegram throughout" },
  { icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, title: "Source Code Included", desc: "Full ownership of source code. No lock-in, no recurring fees." },
  { icon: <Users className="w-5 h-5 text-cyan-400" />, title: "Post-Launch Support", desc: "30-day free bug fixes and support after project delivery" },
];

export default function HireDeveloper() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleCTA = () => {
    if (!user) { setLocation("/login"); return; }
    setLocation("/hire/submit");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0416] via-[#130a35] to-[#0d0720] py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,184,0,0.08),_transparent_60%)]" />
        <div className="container max-w-5xl mx-auto relative z-10">
          <div className="text-center">
            <Badge className="mb-6 bg-yellow-400/10 text-yellow-400 border-yellow-400/20 px-4 py-1.5 text-sm gap-2">
              <span className="font-black" style={{ fontFamily: "serif" }}>π</span>
              Pi Network Developer for Hire
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-[1.05]">
              Build Your Dream App<br />
              <span className="bg-gradient-to-r from-violet-400 to-yellow-400 bg-clip-text text-transparent">on Pi Network</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Work directly with our expert Pi developer to build web apps, mobile apps, DeFi tools, bots, 
              and custom blockchain solutions — all paid safely with Pi escrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="h-14 px-8 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-bold text-base rounded-xl shadow-2xl shadow-violet-500/30 gap-2"
                onClick={handleCTA}
              >
                Submit Your Project Brief <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 rounded-xl font-semibold text-base gap-2"
                asChild
              >
                <a href="https://wa.me/breedskoolpi" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
                </a>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free quote</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-yellow-400" /> Pi escrow protected</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-violet-400" /> 24h response</span>
            </div>
          </div>
        </div>
      </section>

      {/* What We Build */}
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">What We Build</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Expert Pi Network development across all major application types</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {APP_TYPES.map(t => (
              <Card key={t.title} className={`bg-card/50 border-border/50 hover:border-violet-500/30 transition-all hover:-translate-y-0.5`}>
                <CardContent className="p-5">
                  <div className={`w-11 h-11 rounded-xl ${t.bg} flex items-center justify-center mb-4`}>
                    <span className={t.color}>{t.icon}</span>
                  </div>
                  <h3 className="font-bold text-base mb-2">{t.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-card/20 border-y border-border/30">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground">Simple, transparent, and protected by Pi escrow</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map((p, i) => (
              <div key={p.step} className="relative">
                <div className="text-5xl font-black text-violet-500/20 mb-3">{p.step}</div>
                <h3 className="font-bold text-base mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                {i < PROCESS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-3 text-violet-500/30 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Why Build With Us</h2>
            <p className="text-muted-foreground">Everything you need for a successful Pi Network project</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY.map(w => (
              <div key={w.title} className="flex gap-4 p-4 rounded-xl bg-card/50 border border-border/40">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/40">
                  {w.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{w.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-violet-900/20 via-background to-yellow-900/10 border-t border-border/30">
        <div className="container max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/30">
            <span className="text-3xl font-black text-white" style={{ fontFamily: "serif" }}>π</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build on Pi?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Submit your project brief today. Free quote within 24 hours. Pi escrow protected.
          </p>
          <Button
            size="lg"
            className="h-14 px-10 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-bold text-base rounded-xl shadow-2xl shadow-violet-500/30 gap-2"
            onClick={handleCTA}
          >
            Start Your Project <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">No commitment required · Free consultation</p>
        </div>
      </section>
    </div>
  );
}
