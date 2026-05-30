import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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

// Protected Routers
import DashboardRouter from "@/pages/dashboard/index";
import AdminRouter from "@/pages/admin/index";

const queryClient = new QueryClient();

// Protected Route Wrapper
function ProtectedRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
  const { user, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (!isLoading && adminOnly && !isAdmin) {
      setLocation("/dashboard");
    }
  }, [user, isAdmin, isLoading, setLocation, adminOnly]);

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center"><div className="animate-pulse flex flex-col items-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div><p className="mt-4 text-muted-foreground">Loading...</p></div></div>;
  if (!user || (adminOnly && !isAdmin)) return null;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Protected Dashboards */}
      <Route path="/dashboard*">
        <ProtectedRoute component={DashboardRouter} />
      </Route>
      <Route path="/admin*">
        <ProtectedRoute component={AdminRouter} adminOnly={true} />
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

function App() {
  return (
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
  );
}

export default App;
