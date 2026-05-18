import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Globe, Cpu } from "lucide-react";

export default function About() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12 md:py-24">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">About CryptoMarket</h1>
        <p className="text-xl text-muted-foreground">
          We're building the infrastructure for the next generation of digital commerce.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            CryptoMarket was founded with a single goal: to bridge the gap between premium digital assets and decentralized finance. We believe that buying software, scripts, and digital tools should be as seamless, borderless, and secure as the blockchain itself.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            By leveraging USDT and smart contracts, we eliminate high fees, chargebacks, and geographical restrictions, empowering creators and developers worldwide.
          </p>
        </div>
        <div className="relative h-[400px] rounded-2xl overflow-hidden bg-muted border border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 mix-blend-overlay"></div>
          <div className="w-full h-full flex items-center justify-center">
            <Globe className="w-32 h-32 text-primary/40" />
          </div>
        </div>
      </div>

      <div className="mb-24">
        <h2 className="text-3xl font-bold text-center mb-12">Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-card/50 border-border/50 text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Absolute Security</h3>
              <p className="text-muted-foreground">Every transaction is verified on-chain. Every product is rigorously tested for malware and backdoors.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50 text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mx-auto mb-6">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Premium Quality</h3>
              <p className="text-muted-foreground">We are a curated marketplace. We prioritize high-quality, enterprise-grade code over sheer volume.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50 text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Frictionless</h3>
              <p className="text-muted-foreground">No banks, no holds, no waiting. Pay with crypto and receive your digital assets instantly.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
