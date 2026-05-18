import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Download, 
  Wallet, 
  MessageSquare, 
  Bell, 
  Heart, 
  Ticket, 
  UserCircle,
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
    { href: "/dashboard/downloads", label: "Downloads", icon: Download },
    { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
    { href: "/dashboard/tickets", label: "Support Tickets", icon: Ticket },
    { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4">
      <div className="px-4 mb-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">CryptoMarket</span>
        </Link>
      </div>
      
      <div className="px-4 mb-6">
        <div className="p-3 bg-secondary/50 rounded-xl border border-border/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-medium truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <div className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
              location === link.href || (location.startsWith(link.href) && link.href !== "/dashboard")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}>
              <link.icon className="w-4 h-4" />
              {link.label}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-border/50" onClick={() => logout()}>
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-card/30 backdrop-blur-xl">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Wallet className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-lg">CryptoMarket</span>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-card border-border/40">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
