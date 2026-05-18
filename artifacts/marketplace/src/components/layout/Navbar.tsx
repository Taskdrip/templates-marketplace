import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, ShieldAlert, Wallet, Menu } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
              CryptoMarket
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link 
              href="/marketplace"
              className={`transition-colors hover:text-foreground/80 ${location === "/marketplace" ? "text-foreground" : "text-foreground/60"}`}
            >
              Marketplace
            </Link>
            <Link 
              href="/categories"
              className={`transition-colors hover:text-foreground/80 ${location === "/categories" ? "text-foreground" : "text-foreground/60"}`}
            >
              Categories
            </Link>
            <Link 
              href="/pricing"
              className={`transition-colors hover:text-foreground/80 ${location === "/pricing" ? "text-foreground" : "text-foreground/60"}`}
            >
              Pricing
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex">
            {/* Search could go here */}
          </div>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-border/50">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
                    <AvatarFallback className="bg-primary/10 text-primary">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{user.username}</p>
                    <p className="w-[200px] truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="w-full cursor-pointer flex items-center text-primary">
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="w-full cursor-pointer flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
