import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Package, Users, ShoppingCart, Wallet,
  MessageSquare, Ticket, LineChart, LogOut, ShieldAlert,
  Settings, FileText, Bell, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VaultradeLogomark, VaultradeWordmark } from "@/components/VaultradeLogo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const links = [
    { href: "/admin",          label: "Analytics",          icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: "Products",           icon: Package },
    { href: "/admin/orders",   label: "Orders",             icon: ShoppingCart },
    { href: "/admin/users",    label: "Users",              icon: Users },
    { href: "/admin/payments", label: "Payments",           icon: CreditCard },
    { href: "/admin/wallets",  label: "Wallet Setup",       icon: Wallet },
    { href: "/admin/messages", label: "Support Chat",       icon: MessageSquare },
    { href: "/admin/tickets",  label: "Tickets",            icon: Ticket },
    { href: "/admin/revenue",  label: "Revenue",            icon: LineChart },
    { href: "/admin/blog",     label: "Blog",               icon: FileText },
    { href: "/admin/push",     label: "Push Notifications", icon: Bell },
    { href: "/admin/settings", label: "Settings",           icon: Settings },
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) return location === href;
    return location === href || (location.startsWith(href) && href !== "/admin");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-black/40 backdrop-blur-xl relative">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-600 to-blue-600" />
        <div className="flex flex-col h-full py-4">
          <div className="px-4 mb-6">
            <Link href="/" className="flex items-center gap-2">
              <VaultradeLogomark size={30} />
              <div>
                <VaultradeWordmark className="text-sm" />
                <p className="text-[10px] text-violet-400 leading-none mt-0.5">Admin Panel</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  isActive(link.href, link.exact)
                    ? "bg-violet-500/15 text-violet-400 border border-violet-500/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent"
                )}>
                  <link.icon className="w-4 h-4 shrink-0" />
                  {link.label}
                </div>
              </Link>
            ))}
          </nav>

          <div className="p-4 mt-auto space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-red-400 gap-2" onClick={logout}>
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start border-border/50 text-xs" asChild>
              <Link href="/dashboard">← Back to App</Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <header className="flex items-center justify-between p-4 border-b border-border/40 bg-card/30 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-violet-400" />
            <h2 className="font-semibold text-sm hidden md:block text-muted-foreground">
              Vaultrade.store <span className="text-foreground">Administration</span>
            </h2>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-muted-foreground">
              {user?.username}
              <span className="ml-2 text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-semibold">ADMIN</span>
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
