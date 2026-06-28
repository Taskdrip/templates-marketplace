import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Clock, CheckCircle2, Package } from "lucide-react";

function token() { return localStorage.getItem("cm_token"); }

async function fetchEarnings() {
  const res = await fetch("/api/seller/earnings", {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error("Failed to load earnings");
  return res.json();
}

const statusColor: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  funds_released: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  awaiting_confirmation: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  pending: "bg-secondary text-secondary-foreground border-border/50",
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function SellerEarnings() {
  const { data, isLoading } = useQuery({ queryKey: ["seller-earnings"], queryFn: fetchEarnings });

  if (isLoading) return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground mt-1">Your revenue from product sales.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-2">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-7 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const earnings = data ?? { totalEarnings: 0, pendingPayout: 0, releasedPayout: 0, platformFeePercent: 10, orders: [] };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground mt-1">Your revenue from product sales on Breedskoolpi.store.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4.5 h-4.5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold">${earnings.totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">After {earnings.platformFeePercent}% platform fee</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Pending Payout</p>
              <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold">${earnings.pendingPayout.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting admin release</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Released to Wallet</p>
              <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold">${earnings.releasedPayout.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Successfully transferred</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All orders for your products</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <p className="font-medium text-muted-foreground">No sales yet</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Once buyers purchase your products, their orders will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {earnings.orders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/30 hover:bg-background/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{order.productName}</p>
                      <p className="text-xs text-muted-foreground">Order #{order.id} · {new Date(order.createdAt).toLocaleDateString()}</p>
                      {order.chain && <p className="text-xs text-muted-foreground">Pi Network</p>}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <Badge variant="outline" className={`${statusColor[order.status] ?? statusColor.pending} capitalize text-xs`}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                    <div>
                      {(order.status === "delivered" || order.status === "funds_released") ? (
                        <p className="text-sm font-bold text-emerald-400">+${order.sellerAmount.toFixed(2)}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">${order.buyerAmount.toFixed(2)}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {order.status === "delivered" ? "Pending release" :
                         order.status === "funds_released" ? "Released ✓" :
                         "In progress"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">How Payouts Work</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Buyer completes purchase and submits payment proof</li>
            <li>Admin verifies payment on the blockchain</li>
            <li>Buyer receives download access and confirms receipt</li>
            <li>Admin releases 90% of the sale amount to your Pi wallet</li>
            <li>You receive a notification when funds are released</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-4">Contact support if you have not received a payout within 48 hours of buyer confirmation.</p>
        </CardContent>
      </Card>
    </div>
  );
}
