import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield, Zap, Globe, Cpu, Users, TrendingUp, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { VaultradeLogomark as PiMarketLogomark, VaultradeWordmark as PiMarketWordmark } from "@/components/VaultradeLogo";

const STATS = [
  { value: "12,000+", label: "Registered Users" },
  { value: "4,800+", label: "Digital Products" },
  { value: "$2.4M+", label: "Total Volume Traded" },
  { value: "99.8%", label: "Uptime SLA" },
];

const VALUES = [
  {
    icon: Shield,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    title: "Vault-Grade Security",
    desc: "Every transaction is protected by our multi-step escrow system. Funds are only released when you confirm delivery. No chargebacks, no fraud.",
  },
  {
    icon: Cpu,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    title: "Curated Quality",
    desc: "We are not a marketplace for junk. Every product is reviewed by our team before listing. Only verified, enterprise-grade digital assets pass our bar.",
  },
  {
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    title: "Instant Settlement",
    desc: "Pay with Pi (π) on TRON, BNB Chain, or TON Network. Once admin confirms, your download is available within minutes — no bank delays, ever.",
  },
  {
    icon: Globe,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    title: "Truly Borderless",
    desc: "Whether you are in Lagos, Kyiv, Buenos Aires, or Bangkok — PiMarket works for you. No geographic restrictions, no sanctions checks for digital commerce.",
  },
  {
    icon: Users,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    title: "Builder Community",
    desc: "Join thousands of developers, traders, and digital creators who buy and sell on PiMarket. Our community Telegram is active 24/7.",
  },
  {
    icon: TrendingUp,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    title: "Fair Revenue Split",
    desc: "Sellers keep the majority of every sale. We charge a transparent platform fee with no hidden costs. Your success is our success.",
  },
];

const TEAM = [
  { name: "Alex V.", role: "Co-founder & CEO", avatar: "AV", bio: "Former DeFi engineer at a top-10 exchange. 8 years in Web3 infrastructure." },
  { name: "Maya R.", role: "Co-founder & CTO", avatar: "MR", bio: "Smart contract auditor turned marketplace builder. Solidity + TypeScript specialist." },
  { name: "Jin Park", role: "Head of Product", avatar: "JP", bio: "Previously led growth at two Web3 unicorns. Obsessed with frictionless UX." },
  { name: "Sara K.", role: "Head of Security", avatar: "SK", bio: "Penetration tester with 6 years protecting DeFi protocols and digital asset platforms." },
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32 border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-background to-blue-950/30 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container max-w-screen-xl mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <PiMarketLogomark size={52} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              About{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-blue-400">
                PiMarket
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              We're building the infrastructure for the next generation of digital commerce — where anyone in the world can buy or sell premium digital assets, securely, instantly, and without borders.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 gap-2 rounded-full px-6" asChild>
                <Link href="/marketplace">Browse Marketplace <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button variant="outline" className="rounded-full px-6" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-b border-border/30">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-blue-400 mb-1">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 md:py-28">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" /> Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Vault-Level Trust for Every Digital Transaction</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                PiMarket was born from a simple frustration: buying and selling digital products online was broken. PayPal chargebacks wiped out sellers. Wire transfers locked out buyers from developing nations. Intermediaries took 30%+ cuts.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We built PiMarket to fix this. By anchoring every transaction to Pi (π) and wrapping it in our escrow layer, we give both buyers and sellers the confidence they need to trade freely — across any border, at any time.
              </p>
              <div className="space-y-3">
                {[
                  "Zero chargebacks — payments are final and on-chain",
                  "Admin-verified escrow protects both parties",
                  "Available in 140+ countries with no geographic restrictions",
                  "Sub-1% platform fee for verified power sellers",
                ].map(item => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden border border-border/50 bg-card/30">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-blue-600/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <PiMarketLogomark size={80} />
                  <p className="text-sm text-muted-foreground font-medium">Secure · Borderless · Instant</p>
                </div>
              </div>
              {/* Decorative hex grid */}
              <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 400">
                {Array.from({ length: 6 }).map((_, r) =>
                  Array.from({ length: 5 }).map((_, c) => (
                    <polygon
                      key={`${r}-${c}`}
                      points="30,0 60,17 60,52 30,69 0,52 0,17"
                      transform={`translate(${c * 70 + (r % 2 === 0 ? 0 : 35)},${r * 60})`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  ))
                )}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 border-t border-border/30 bg-card/10">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground text-lg">Six principles that define how PiMarket operates every day.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <Card key={v.title} className="bg-card/50 border-border/50 hover:border-border transition-colors">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${v.bg} flex items-center justify-center mb-4`}>
                    <v.icon className={`w-6 h-6 ${v.color}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 border-t border-border/30">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Team Behind PiMarket</h2>
            <p className="text-muted-foreground text-lg">Ex-DeFi engineers, security researchers, and product builders united by one mission.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <Card key={member.name} className="bg-card/50 border-border/50 text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 border border-violet-500/30 flex items-center justify-center text-xl font-bold text-violet-400 mx-auto mb-4">
                    {member.avatar}
                  </div>
                  <h3 className="font-bold mb-0.5">{member.name}</h3>
                  <p className="text-xs text-violet-400 font-medium mb-3">{member.role}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/30 bg-gradient-to-br from-violet-950/30 to-blue-950/20">
        <div className="container max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Trade on PiMarket?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of buyers and sellers who trust PiMarket for secure, crypto-native digital commerce.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 gap-2 rounded-full px-8 h-12 text-base font-semibold shadow-xl shadow-violet-500/20" asChild>
              <Link href="/register">Create Free Account <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" className="rounded-full px-8 h-12 text-base" asChild>
              <Link href="/marketplace">Browse Products</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
