import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Wallet, 
  MessageSquare, 
  Ticket, 
  LineChart,
  LogOut,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const links = [
    { href: "/admin", label: "Analytics", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/payments", label: "Payments", icon: Wallet },
    { href: "/admin/wallets", label: "Wallet Setup", icon: Wallet },
    { href: "/admin/messages", label: "Support Chat", icon: MessageSquare },
    { href: "/admin/tickets", label: "Tickets", icon: Ticket },
    { href: "/admin/revenue", label: "Revenue", icon: LineChart },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-black/40 backdrop-blur-xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
        <div className="flex flex-col h-full py-4">
          <div className="px-4 mb-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Admin Panel</span>
            </Link>
          </div>

          <nav className="flex-1 px-2 space-y-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  location === link.href || (location.startsWith(link.href) && link.href !== "/admin")
                    ? "bg-red-500/10 text-red-500"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}>
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </div>
              </Link>
            ))}
          </nav>

          <div className="p-4 mt-auto">
            <Button variant="outline" className="w-full justify-start border-border/50" asChild>
              <Link href="/dashboard">Back to App</Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <header className="flex items-center justify-between p-4 border-b border-border/40 bg-card/30 backdrop-blur-xl">
          <h2 className="font-semibold text-lg hidden md:block">CryptoMarket Administration</h2>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-muted-foreground">Signed in as <strong className="text-foreground">{user?.username}</strong></span>
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
