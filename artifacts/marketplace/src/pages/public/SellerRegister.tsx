import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@workspace/api-client-react";
import {
  Store, CheckCircle2, ArrowRight, DollarSign, Shield,
  Users, BarChart2, Package, Code2, Globe, Instagram,
  Facebook, TrendingUp, Layers, ExternalLink,
} from "lucide-react";

const PERKS = [
  { icon: <DollarSign className="w-5 h-5 text-emerald-400" />, title: "Earn in USDT", desc: "Receive payments in stable crypto. No bank needed." },
  { icon: <Shield className="w-5 h-5 text-blue-400" />, title: "Escrow Protection", desc: "Admin holds buyer funds securely until delivery." },
  { icon: <Users className="w-5 h-5 text-violet-400" />, title: "85K+ Buyers", desc: "Instantly reach a global audience of active buyers." },
  { icon: <BarChart2 className="w-5 h-5 text-orange-400" />, title: "Seller Analytics", desc: "Track views, sales, and revenue in real time." },
];

const CATEGORIES = [
  { icon: <Code2 className="w-4 h-4" />, name: "Source Code & Apps" },
  { icon: <Layers className="w-4 h-4" />, name: "HTML Templates" },
  { icon: <Instagram className="w-4 h-4" />, name: "Social Media Accounts" },
  { icon: <Facebook className="w-4 h-4" />, name: "Facebook Accounts" },
  { icon: <Globe className="w-4 h-4" />, name: "Websites & Domains" },
  { icon: <ExternalLink className="w-4 h-4" />, name: "Landing Pages" },
  { icon: <TrendingUp className="w-4 h-4" />, name: "Crypto & DeFi Tools" },
  { icon: <Package className="w-4 h-4" />, name: "SaaS Applications" },
];

export default function SellerRegister() {
  const [, setLocation] = useLocation();
  const { user, login: setAuth } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    phone: "",
    telegramHandle: "",
    password: "",
    confirmPassword: "",
    sellerBio: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (!form.displayName || !form.username || !form.email || !form.password) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await customFetch<any>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          displayName: form.displayName,
          phone: form.phone || undefined,
          telegramHandle: form.telegramHandle?.replace(/^@/, "") || undefined,
          isSeller: true,
          sellerBio: form.sellerBio || undefined,
        }),
      });
      setAuth(res.token, res.user);
      toast({ title: "Seller account created! 🎉", description: "Welcome! You can now list products." });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const field = (key: keyof typeof form, value: string) => setForm(f => ({ ...f, [key]: value }));

  if (user?.isSeller) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold">You're already a seller!</h2>
          <p className="text-muted-foreground">Go to your dashboard to manage listings and track orders.</p>
          <Button onClick={() => setLocation("/dashboard")}>Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" /></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative w-full py-16 bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&auto=format')] bg-cover bg-center opacity-5" />
        <div className="relative container max-w-screen-xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-5">
            <Store className="w-4 h-4" /> Seller Program
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Start Selling on Vaultrade.store
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            List your digital products and reach 85,000+ buyers globally. Receive USDT payments with full escrow protection.
          </p>
        </div>
      </div>

      <div className="container max-w-screen-xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: perks + categories */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-5">Why sell with us?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PERKS.map(p => (
                  <div key={p.title} className="flex gap-3 p-4 rounded-xl bg-card border border-border/50">
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                      {p.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{p.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">What can you sell?</h2>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(c => (
                  <div key={c.name} className="flex items-center gap-2.5 p-3 rounded-xl bg-card/60 border border-border/40 text-sm">
                    <span className="text-primary">{c.icon}</span>
                    <span className="text-foreground/80">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20 text-sm space-y-2">
              <p className="font-semibold text-foreground">Commission Structure</p>
              <p className="text-muted-foreground">Platform takes a flat <span className="text-primary font-semibold">10% commission</span> on each sale. You keep the rest in USDT.</p>
              <p className="text-muted-foreground">All payments go through our escrow wallet — funds are released to sellers after buyer confirms delivery.</p>
            </div>
          </div>

          {/* Right: registration form */}
          <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-5">Create Seller Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1.5 block">Full Name *</Label>
                  <Input placeholder="John Doe" value={form.displayName} onChange={e => field("displayName", e.target.value)} className="bg-background/50" required />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">Username *</Label>
                  <Input placeholder="john_doe" value={form.username} onChange={e => field("username", e.target.value)} className="bg-background/50" required />
                </div>
              </div>

              <div>
                <Label className="text-sm mb-1.5 block">Email *</Label>
                <Input type="email" placeholder="john@example.com" value={form.email} onChange={e => field("email", e.target.value)} className="bg-background/50" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1.5 block">Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input placeholder="+1 234 567 890" value={form.phone} onChange={e => field("phone", e.target.value)} className="bg-background/50" />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">Telegram <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input placeholder="@username" value={form.telegramHandle} onChange={e => field("telegramHandle", e.target.value)} className="bg-background/50" />
                </div>
              </div>

              <div>
                <Label className="text-sm mb-1.5 block">Seller Bio <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea
                  placeholder="Describe what you sell and your experience..."
                  value={form.sellerBio}
                  onChange={e => field("sellerBio", e.target.value)}
                  className="bg-background/50 resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1.5 block">Password *</Label>
                  <Input type="password" placeholder="Min. 6 chars" value={form.password} onChange={e => field("password", e.target.value)} className="bg-background/50" required />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">Confirm Password *</Label>
                  <Input type="password" placeholder="Repeat" value={form.confirmPassword} onChange={e => field("confirmPassword", e.target.value)} className="bg-background/50" required />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-semibold shadow-lg shadow-primary/20 rounded-xl" disabled={isLoading}>
                {isLoading ? "Creating account..." : (<><Store className="mr-2 w-4 h-4" /> Create Seller Account</>)}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
