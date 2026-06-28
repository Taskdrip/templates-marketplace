import { Link } from "wouter";
import { Send, Twitter, Github, ExternalLink, Shield, Zap, Globe } from "lucide-react";
import { VaultradeLogomark, VaultradeWordmark } from "@/components/VaultradeLogo";

const MARKETPLACE_LINKS = [
  { label: "All Products", href: "/marketplace" },
  { label: "Source Code & Apps", href: "/marketplace?cat=source-code-apps" },
  { label: "Trading Bots & Scripts", href: "/marketplace?cat=trading-bots" },
  { label: "DeFi Tools", href: "/marketplace?cat=crypto-defi-tools" },
  { label: "Social Media Accounts", href: "/marketplace?cat=social-media-accounts" },
  { label: "HTML Templates", href: "/marketplace?cat=templates" },
  { label: "Websites & Domains", href: "/marketplace?cat=websites-domains" },
  { label: "SaaS Applications", href: "/marketplace?cat=saas-apps" },
];

const SELLER_LINKS = [
  { label: "Become a Seller", href: "/seller-register" },
  { label: "Commission & Pricing", href: "/pricing" },
  { label: "Seller Guidelines", href: "/faq#sellers" },
  { label: "Quality Standards", href: "/faq#quality" },
  { label: "Seller FAQ", href: "/faq" },
  { label: "Seller Support", href: "/contact" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
  { label: "Categories", href: "/categories" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

const LEGAL_LINKS = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/terms#refunds" },
  { label: "Cookie Policy", href: "/privacy#cookies" },
  { label: "Acceptable Use", href: "/terms#acceptable-use" },
  { label: "DMCA Policy", href: "/terms#dmca" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/20 backdrop-blur-sm">
      <div className="container max-w-screen-2xl px-4 md:px-8 pt-14 pb-8">

        {/* Trust bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12 py-5 border border-border/30 rounded-2xl bg-card/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Escrow-Protected Payments</span>
          </div>
          <div className="w-px h-5 bg-border/50 hidden sm:block" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Instant Crypto Settlement</span>
          </div>
          <div className="w-px h-5 bg-border/50 hidden sm:block" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Borderless — Available Worldwide</span>
          </div>
          <div className="w-px h-5 bg-border/50 hidden sm:block" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="w-4 h-4 text-violet-500" />
            <span>Verified Sellers Only</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-12">

          {/* Brand — 2 columns */}
          <div className="col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5">
              <VaultradeLogomark size={36} />
              <VaultradeWordmark className="text-xl" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Breedskoolpi is the premier Pi Network marketplace for digital products — web apps, scripts, social accounts, templates, and more. Every transaction is escrow-protected.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://t.me/breedskoolpi_official" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all hover:scale-110">
                <Send className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/breedskoolpi_app" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all hover:scale-110">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://github.com/breedskoolpi-store" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all hover:scale-110">
                <Github className="w-4 h-4" />
              </a>
            </div>
            {/* Payment networks */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Accepted Payments</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-semibold border border-yellow-500/30 rounded-md px-2 py-1 text-yellow-400 bg-yellow-500/10 flex items-center gap-1">
                  <span className="font-black" style={{ fontFamily: "serif" }}>π</span> Pi Network
                </span>
              </div>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">Marketplace</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {MARKETPLACE_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary transition-colors hover:translate-x-0.5 inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">Sellers</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {SELLER_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary transition-colors hover:translate-x-0.5 inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">Company</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {COMPANY_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary transition-colors hover:translate-x-0.5 inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {LEGAL_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary transition-colors hover:translate-x-0.5 inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} <span className="text-foreground font-medium">Breedskoolpi</span>. All rights reserved. Not financial advice. Use at your own risk.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
