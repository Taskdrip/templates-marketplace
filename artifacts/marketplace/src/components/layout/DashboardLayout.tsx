import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, ShoppingBag, Download, Wallet,
  MessageSquare, Bell, Heart, Ticket, UserCircle, LogOut, Menu,
  Package, TrendingUp, PlusCircle, Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { VaultradeLogomark, VaultradeWordmark } from "@/components/VaultradeLogo";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const buyerLinks = [
    { href: "/dashboard",                  label: "Overview",        icon: LayoutDashboard },
    { href: "/dashboard/orders",           label: "My Orders",       icon: ShoppingBag },
    { href: "/dashboard/downloads",        label: "Downloads",       icon: Download },
    { href: "/dashboard/wallet",           label: "Wallet",          icon: Wallet },
    { href: "/dashboard/hire-requests",    label: "Hire Requests",   icon: Cpu },
    { href: "/dashboard/messages",         label: "Messages",        icon: MessageSquare },
    { href: "/dashboard/notifications",    label: "Notifications",   icon: Bell },
    { href: "/dashboard/wishlist",         label: "Wishlist",        icon: Heart },
    { href: "/dashboard/tickets",          label: "Support Tickets", icon: Ticket },
    { href: "/dashboard/profile",          label: "Profile",         icon: UserCircle },
  ];

  const sellerLinks = [
    { href: "/seller/products",     label: "My Products",   icon: Package },
    { href: "/seller/products/new", label: "List Product",  icon: PlusCircle },
    { href: "/seller/earnings",     label: "Earnings",      icon: TrendingUp },
  ];

  const pathname = typeof window !== "undefined" ? window.location.pathname : location;
  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => (
    <Link key={href} href={href}>
      <div className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
        pathname === href || (pathname.startsWith(href) && href !== "/dashboard")
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
      )}>
        <Icon className="w-4 h-4" />
        {label}
      </div>
    </Link>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4">
      <div className="px-4 mb-6">
        <Link href="/" className="flex items-center gap-2">
          <VaultradeLogomark size={30} />
          <VaultradeWordmark className="text-base" />
        </Link>
      </div>
      
      <div className="px-4 mb-6">
        <div className="p-3 bg-secondary/50 rounded-xl border border-border/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center text-primary font-bold text-sm">
            {(user?.displayName || user?.username || "?").charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-medium text-sm truncate">{user?.displayName || user?.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.isSeller ? "Seller · " : ""}{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {buyerLinks.map((link) => (
          <NavLink key={link.href} {...link} />
        ))}

        {user?.isSeller && (
          <>
            <div className="px-3 pt-4 pb-1">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60">Seller Hub</p>
            </div>
            {sellerLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </>
        )}
      </nav>

      <div className="p-4 mt-auto space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-border/50"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-2" /> Log out
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" asChild>
          <Link href="/">← Back to Breedskoolpi</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-card/30 backdrop-blur-xl relative">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-600 to-blue-600" />
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2">
            <VaultradeLogomark size={26} />
            <VaultradeWordmark className="text-sm" />
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
