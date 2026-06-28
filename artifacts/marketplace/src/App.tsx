import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PiProvider } from "@/contexts/PiContext";
import NotFound from "@/pages/not-found";

// Layouts
import PublicLayout from "@/components/layout/PublicLayout";

// Public Pages
import Home from "@/pages/public/Home";
import Login from "@/pages/public/Login";
import Register from "@/pages/public/Register";
import SellerRegister from "@/pages/public/SellerRegister";
import Marketplace from "@/pages/public/Marketplace";
import ProductDetail from "@/pages/public/ProductDetail";
import Categories from "@/pages/public/Categories";
import Pricing from "@/pages/public/Pricing";
import About from "@/pages/public/About";
import FAQ from "@/pages/public/FAQ";
import Contact from "@/pages/public/Contact";
import BlogPage from "@/pages/public/BlogPage";
import Terms from "@/pages/public/Terms";
import Privacy from "@/pages/public/Privacy";
import HireDeveloper from "@/pages/public/HireDeveloper";
import HireSubmit from "@/pages/public/HireSubmit";

// Protected Routers
import DashboardRouter from "@/pages/dashboard/index";
import AdminRouter from "@/pages/admin/index";
import AdminLogin from "@/pages/admin/Login";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, adminOnly = false }: { component: any; adminOnly?: boolean }) {
  const { user, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (!isLoading && adminOnly && !isAdmin) {
      setLocation("/admin/login");
    }
  }, [user, isAdmin, isLoading, setLocation, adminOnly]);

  if (isLoading) return <PiLoadingScreen />;
  if (!user || (adminOnly && !isAdmin)) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Protected Dashboards — regex paths do prefix matching without nested context */}
      <Route path={/^\/dashboard(\/|$)/i}>
        <ProtectedRoute component={DashboardRouter} />
      </Route>
      <Route path="/admin/login">
        <AdminLogin />
      </Route>
      <Route path={/^\/admin(\/|$)/i}>
        <ProtectedRoute component={AdminRouter} adminOnly={true} />
      </Route>
      <Route path={/^\/seller(\/|$)/i}>
        <ProtectedRoute component={DashboardRouter} />
      </Route>

      {/* Public Routes with Layout */}
      <Route path="/">
        <PublicLayout><Home /></PublicLayout>
      </Route>
      <Route path="/marketplace">
        <PublicLayout><Marketplace /></PublicLayout>
      </Route>
      <Route path="/marketplace/:id">
        <PublicLayout><ProductDetail /></PublicLayout>
      </Route>
      <Route path="/categories">
        <PublicLayout><Categories /></PublicLayout>
      </Route>
      <Route path="/pricing">
        <PublicLayout><Pricing /></PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout><About /></PublicLayout>
      </Route>
      <Route path="/faq">
        <PublicLayout><FAQ /></PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout><Contact /></PublicLayout>
      </Route>
      <Route path="/blog">
        <PublicLayout><BlogPage /></PublicLayout>
      </Route>
      <Route path="/terms">
        <PublicLayout><Terms /></PublicLayout>
      </Route>
      <Route path="/privacy">
        <PublicLayout><Privacy /></PublicLayout>
      </Route>
      <Route path="/hire/submit">
        <PublicLayout><ProtectedRoute component={HireSubmit} /></PublicLayout>
      </Route>
      <Route path="/hire">
        <PublicLayout><HireDeveloper /></PublicLayout>
      </Route>
      <Route path="/login">
        <PublicLayout><Login /></PublicLayout>
      </Route>
      <Route path="/register">
        <PublicLayout><Register /></PublicLayout>
      </Route>
      <Route path="/seller-register">
        <PublicLayout><SellerRegister /></PublicLayout>
      </Route>

      {/* Fallback */}
      <Route>
        <PublicLayout><NotFound /></PublicLayout>
      </Route>
    </Switch>
  );
}

function PiLoadingScreen() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a0416] via-[#110a2e] to-[#0d0720]">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-2xl shadow-violet-500/40">
            <span className="text-4xl font-black text-white" style={{ fontFamily: "serif" }}>π</span>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-transparent animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-sm text-purple-300/60 font-medium tracking-wide">Loading Breedskoolpi…</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <PiProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </PiProvider>
  );
}

export default App;
