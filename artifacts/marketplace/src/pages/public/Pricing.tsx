import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12 md:py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Pay for exactly what you need using your preferred cryptocurrency. No hidden fees, instant delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <Card className="bg-card/50 border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Standard</CardTitle>
            <CardDescription>For personal projects and learning</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="mb-6">
              <span className="text-4xl font-bold">Pay per item</span>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="text-primary w-5 h-5" /> Lifetime access</li>
              <li className="flex items-center gap-2"><Check className="text-primary w-5 h-5" /> 6 months support</li>
              <li className="flex items-center gap-2"><Check className="text-primary w-5 h-5" /> Community access</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/marketplace">Browse Products</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-primary border-primary shadow-xl shadow-primary/20 flex flex-col relative overflow-hidden text-primary-foreground">
          <div className="absolute top-0 right-0 bg-white/20 px-3 py-1 text-xs font-semibold rounded-bl-lg">POPULAR</div>
          <CardHeader>
            <CardTitle className="text-2xl text-primary-foreground">Pro</CardTitle>
            <CardDescription className="text-primary-foreground/80">For professional developers</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="mb-6">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-primary-foreground/80">/month</span>
            </div>
            <ul className="space-y-3 text-primary-foreground/90">
              <li className="flex items-center gap-2"><Check className="w-5 h-5" /> All Standard features</li>
              <li className="flex items-center gap-2"><Check className="w-5 h-5" /> 10 premium downloads/mo</li>
              <li className="flex items-center gap-2"><Check className="w-5 h-5" /> Priority support</li>
              <li className="flex items-center gap-2"><Check className="w-5 h-5" /> Commercial license</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-white text-primary hover:bg-gray-100" asChild>
              <Link href="/register">Get Pro</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-card/50 border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Enterprise</CardTitle>
            <CardDescription>For teams and agencies</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="mb-6">
              <span className="text-4xl font-bold">$299</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="text-primary w-5 h-5" /> All Pro features</li>
              <li className="flex items-center gap-2"><Check className="text-primary w-5 h-5" /> Unlimited downloads</li>
              <li className="flex items-center gap-2"><Check className="text-primary w-5 h-5" /> 24/7 dedicated support</li>
              <li className="flex items-center gap-2"><Check className="text-primary w-5 h-5" /> Extended commercial license</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-24 max-w-4xl mx-auto bg-card/30 border border-border/50 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Crypto Payments Accepted</h2>
        <p className="text-muted-foreground mb-8">We accept USDT across multiple networks for fast, secure, and low-fee transactions.</p>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="px-6 py-3 bg-card border border-border/50 rounded-xl font-medium">USDT (TRC20)</div>
          <div className="px-6 py-3 bg-card border border-border/50 rounded-xl font-medium">USDT (BEP20)</div>
          <div className="px-6 py-3 bg-card border border-border/50 rounded-xl font-medium">USDT (TON)</div>
        </div>
      </div>
    </div>
  );
}
