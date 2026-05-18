import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Code, Cpu, LineChart, Shield, Zap } from "lucide-react";
import { Link } from "wouter";
import { useListFeaturedProducts } from "@workspace/api-client-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: featuredProducts, isLoading } = useListFeaturedProducts();

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-48 flex flex-col items-center justify-center text-center px-4 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f4ec6ae?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-luminosity"></div>
        
        <div className="z-10 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            CryptoMarket 2.0 is live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 pb-2">
            The Premium Digital <br className="hidden md:block" /> Asset Exchange
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Trade high-quality code, trading bots, and digital tools securely using Web3 infrastructure. Build the future, faster.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-[0_0_40px_8px_rgba(var(--primary),0.2)] rounded-full w-full sm:w-auto" onClick={() => setLocation('/marketplace')}>
              Explore Marketplace <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-border/50 hover:bg-white/5 rounded-full w-full sm:w-auto" onClick={() => setLocation('/register')}>
              Start Selling
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full py-24 bg-card/30 border-y border-border/40 backdrop-blur-sm px-4">
        <div className="container max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-card border border-border/50 shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Secure Transactions</h3>
              <p className="text-muted-foreground leading-relaxed">Every transaction is verified on-chain. Pay seamlessly with USDT across multiple networks (TRC20, BEP20, TON).</p>
            </div>
            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-card border border-border/50 shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Premium Code</h3>
              <p className="text-muted-foreground leading-relaxed">Strict quality control ensures every script, template, and tool meets enterprise standards before listing.</p>
            </div>
            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-card border border-border/50 shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Instant Delivery</h3>
              <p className="text-muted-foreground leading-relaxed">Assets are delivered automatically the moment your blockchain transaction achieves required confirmations.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="w-full py-24 px-4 container max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Assets</h2>
            <p className="text-muted-foreground mt-2">Curated selections from top creators</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/marketplace">View all</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="bg-card border-border/50 overflow-hidden animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardFooter>
                  <div className="h-10 bg-muted rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.slice(0, 4).map((product) => (
              <Card key={product.id} className="bg-card/50 border-border/50 overflow-hidden hover:border-primary/50 transition-all duration-300 group cursor-pointer" onClick={() => setLocation(`/marketplace/${product.id}`)}>
                <div className="h-48 overflow-hidden relative">
                  {product.previewImages?.[0] ? (
                    <img src={product.previewImages[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <Cpu className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-semibold border border-border/50 shadow-sm">
                    ${product.price.toFixed(2)}
                  </div>
                </div>
                <CardHeader className="p-4">
                  <div className="text-xs text-primary font-medium mb-1">{product.categoryName}</div>
                  <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
            
            {(!featuredProducts || featuredProducts.length === 0) && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No featured products currently available.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
