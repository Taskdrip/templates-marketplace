import { Link } from "wouter";
import { Store, Send, Twitter, Github, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/20 backdrop-blur-sm">
      <div className="container max-w-screen-2xl px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-sm">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-400">
                DigiMarket
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The premier Web3 marketplace for digital assets — source code, templates, social media accounts, websites, and more. Secured by crypto escrow.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-lg bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Send className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Github className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Marketplace</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/marketplace" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/marketplace?cat=source-code-apps" className="hover:text-primary transition-colors">Source Code</Link></li>
              <li><Link href="/marketplace?cat=social-media-accounts" className="hover:text-primary transition-colors">Social Accounts</Link></li>
              <li><Link href="/marketplace?cat=websites-domains" className="hover:text-primary transition-colors">Websites & Domains</Link></li>
              <li><Link href="/marketplace?cat=templates" className="hover:text-primary transition-colors">Templates</Link></li>
              <li><Link href="/marketplace?cat=landing-pages" className="hover:text-primary transition-colors">Landing Pages</Link></li>
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Sellers</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/seller-register" className="hover:text-primary transition-colors">Become a Seller</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Commission Rates</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">Seller FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Seller Support</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Help & Legal</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Payment badges */}
        <div className="mt-10 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DigiMarket. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {["USDT TRC20", "USDT BEP20", "USDT TON"].map(p => (
              <span key={p} className="text-[10px] font-semibold border border-border/50 rounded-md px-2 py-1 text-muted-foreground bg-card/50">
                {p}
              </span>
            ))}
            <span className="text-[10px] font-semibold border border-emerald-500/30 rounded-md px-2 py-1 text-emerald-500 bg-emerald-500/5">
              🔒 Escrow
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
