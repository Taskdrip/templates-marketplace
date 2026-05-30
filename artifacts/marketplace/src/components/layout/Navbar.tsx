import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LogOut, LayoutDashboard, ShieldAlert, Search, Menu, X,
  Store, ChevronDown, Bell, Package, TrendingUp,
  Globe, Code2, Instagram, Facebook, Layers, ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const CATEGORIES = [
  { name: "Source Code & Apps", slug: "source-code-apps", icon: <Code2 className="w-4 h-4" /> },
  { name: "HTML Templates", slug: "templates", icon: <Layers className="w-4 h-4" /> },
  { name: "Social Media Accounts", slug: "social-media-accounts", icon: <Instagram className="w-4 h-4" /> },
  { name: "Facebook Accounts", slug: "facebook-accounts", icon: <Facebook className="w-4 h-4" /> },
  { name: "Websites & Domains", slug: "websites-domains", icon: <Globe className="w-4 h-4" /> },
  { name: "Landing Pages", slug: "landing-pages", icon: <ExternalLink className="w-4 h-4" /> },
  { name: "Crypto & DeFi Tools", slug: "crypto-defi-tools", icon: <TrendingUp className="w-4 h-4" /> },
  { name: "SaaS Applications", slug: "saas-apps", icon: <Package className="w-4 h-4" /> },
];

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="container flex h-16 max-w-screen-2xl items-center gap-4 px-4 md:px-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-md shadow-primary/30">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-400">
              DigiMarket
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 text-foreground/70 hover:text-foreground">
                  Categories <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2" align="start">
                <div className="grid grid-cols-1 gap-0.5">
                  {CATEGORIES.map(cat => (
                    <DropdownMenuItem key={cat.slug} asChild>
                      <Link href={`/marketplace?cat=${cat.slug}`} className="flex items-center gap-2.5 px-2 py-2 cursor-pointer">
                        <span className="text-muted-foreground">{cat.icon}</span>
                        <span className="text-sm">{cat.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/marketplace"
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:text-foreground ${location === "/marketplace" ? "text-foreground bg-accent" : "text-foreground/60"}`}
            >
              Marketplace
            </Link>

            <Link
              href="/pricing"
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:text-foreground ${location === "/pricing" ? "text-foreground bg-accent" : "text-foreground/60"}`}
            >
              Pricing
            </Link>
          </nav>

          {/* Search bar - desktop */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9 h-9 bg-muted/40 border-border/30 text-sm rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Mobile search */}
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="w-4 h-4" />
            </Button>

            {/* Sell button */}
            {!user?.isSeller && (
              <Button
                size="sm"
                variant="outline"
                className="hidden sm:flex gap-1.5 border-primary/30 text-primary hover:bg-primary/10 rounded-full text-xs font-semibold"
                onClick={() => setLocation("/seller-register")}
              >
                <Store className="w-3.5 h-3.5" /> Start Selling
              </Button>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9 border-2 border-primary/20">
                      <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-violet-500/20 text-primary text-xs font-bold">
                        {(user.displayName || user.username).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center gap-2.5 p-3 border-b border-border/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {(user.displayName || user.username).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{user.displayName || user.username}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[130px]">{user.email}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 cursor-pointer text-violet-400">
                        <ShieldAlert className="w-4 h-4" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer focus:text-destructive"
                    onClick={() => logout()}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-sm">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary hover:bg-primary/90 rounded-full text-sm font-semibold px-4">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 ml-1">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-8">
                <div className="flex flex-col gap-1">
                  <Link href="/marketplace" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-accent text-sm font-medium">
                    Marketplace
                  </Link>
                  <Link href="/categories" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-accent text-sm font-medium">
                    Categories
                  </Link>
                  <Link href="/pricing" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-accent text-sm font-medium">
                    Pricing
                  </Link>
                  <div className="border-t border-border/50 my-2" />
                  {CATEGORIES.map(cat => (
                    <Link key={cat.slug} href={`/marketplace?cat=${cat.slug}`} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground">
                      {cat.icon} {cat.name}
                    </Link>
                  ))}
                  {!user && (
                    <>
                      <div className="border-t border-border/50 my-2" />
                      <Link href="/login" className="px-3 py-2.5 rounded-lg hover:bg-accent text-sm font-medium">Sign In</Link>
                      <Link href="/register" className="px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium text-center">Sign Up</Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3 border-t border-border/40 pt-2">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9 h-9 bg-muted/40 border-border/30 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </form>
          </div>
        )}
      </header>
    </>
  );
}
