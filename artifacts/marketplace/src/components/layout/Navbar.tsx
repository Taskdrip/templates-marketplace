import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { usePi } from "@/contexts/PiContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LogOut, LayoutDashboard, ShieldAlert, Search, Menu,
  ChevronDown, Bell, Package, Monitor, FileCode2,
  Globe, Instagram, Layers, Bot, Smartphone, TrendingUp, Zap, FileText,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { VaultradeLogomark, VaultradeWordmark } from "@/components/VaultradeLogo";

const CATEGORIES = [
  { name: "Web Apps & SaaS",        slug: "web-apps",              icon: <Monitor className="w-4 h-4" /> },
  { name: "Scripts & Software",     slug: "scripts-software",      icon: <FileCode2 className="w-4 h-4" /> },
  { name: "Social Media Accounts",  slug: "social-media-accounts", icon: <Instagram className="w-4 h-4" /> },
  { name: "Templates & Themes",     slug: "templates",             icon: <Layers className="w-4 h-4" /> },
  { name: "Websites & Domains",     slug: "websites-domains",      icon: <Globe className="w-4 h-4" /> },
  { name: "Bots & Automation",      slug: "bots-automation",       icon: <Bot className="w-4 h-4" /> },
  { name: "Mobile Apps",            slug: "mobile-apps",           icon: <Smartphone className="w-4 h-4" /> },
  { name: "Pi Network Tools",       slug: "pi-network-tools",      icon: <TrendingUp className="w-4 h-4" /> },
];

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { isInPiBrowser, piSdkReady } = usePi();
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

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:text-foreground ${
        location === href ? "text-foreground bg-accent" : "text-foreground/60"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="container flex h-16 max-w-screen-2xl items-center gap-4 px-4 md:px-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <VaultradeLogomark size={34} />
            <span className="hidden sm:block">
              <VaultradeWordmark className="text-lg" />
            </span>
          </Link>

          {/* Pi Browser indicator */}
          {isInPiBrowser && piSdkReady && (
            <Badge className="hidden md:flex bg-yellow-400/10 text-yellow-400 border-yellow-400/20 text-[10px] gap-1 px-2 py-0.5">
              <span className="font-black" style={{ fontFamily: "serif" }}>π</span> Pi Browser
            </Badge>
          )}

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 ml-2">
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

            {navLink("/marketplace", "Marketplace")}
            {navLink("/pricing", "Pricing")}
            {navLink("/blog", "Blog")}
            {navLink("/about", "About")}
          </nav>

          {/* Search bar - desktop */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search apps, scripts, accounts..."
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
                className="hidden sm:flex gap-1.5 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 rounded-full text-xs font-semibold"
                onClick={() => setLocation("/seller-register")}
              >
                <Zap className="w-3.5 h-3.5" /> Start Selling
              </Button>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9 border-2 border-purple-500/30">
                      <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-600/30 to-purple-600/30 text-violet-300 text-xs font-bold">
                        {(user.displayName || user.username).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center gap-2.5 p-3 border-b border-border/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-violet-500/10 text-violet-400 text-xs font-bold">
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
                <Button size="sm" asChild className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 rounded-full text-sm font-semibold px-4 shadow-md shadow-violet-500/20">
                  <Link href="/register">Join Free</Link>
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
              <SheetContent side="right" className="w-72 pt-6">
                <div className="flex items-center gap-2 mb-6 px-3">
                  <VaultradeLogomark size={28} />
                  <VaultradeWordmark className="text-base" />
                  {isInPiBrowser && (
                    <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20 text-[9px] ml-1">
                      <span className="font-black" style={{ fontFamily: "serif" }}>π</span>
                    </Badge>
                  )}
                </div>
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
                  <Link href="/blog" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-accent text-sm font-medium">
                    <FileText className="w-4 h-4 text-muted-foreground" /> Blog
                  </Link>
                  <Link href="/about" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-accent text-sm font-medium">
                    About
                  </Link>
                  <div className="border-t border-border/50 my-2" />
                  <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Categories</p>
                  {CATEGORIES.map(cat => (
                    <Link key={cat.slug} href={`/marketplace?cat=${cat.slug}`} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground">
                      {cat.icon} {cat.name}
                    </Link>
                  ))}
                  {!user && (
                    <>
                      <div className="border-t border-border/50 my-2" />
                      <Link href="/login" className="px-3 py-2.5 rounded-lg hover:bg-accent text-sm font-medium">Sign In</Link>
                      <Link href="/register" className="px-3 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-medium text-center">Join Free</Link>
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
                placeholder="Search PiMarket..."
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
