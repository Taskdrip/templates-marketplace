import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, User, Clock, CheckCircle2, XCircle, AlertCircle, ShoppingCart } from "lucide-react";

function token() { return localStorage.getItem("cm_token"); }

async function fetchSellerOrders() {
  const res = await fetch("/api/seller/orders", {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:               { label: "Pending Payment",   color: "bg-secondary text-secondary-foreground border-border/50",            icon: <Clock className="w-3 h-3" /> },
  awaiting_confirmation: { label: "Awaiting Confirm",  color: "bg-amber-500/10 text-amber-400 border-amber-500/30",                 icon: <AlertCircle className="w-3 h-3" /> },
  confirmed:             { label: "Payment Confirmed",  color: "bg-blue-500/10 text-blue-400 border-blue-500/30",                   icon: <CheckCircle2 className="w-3 h-3" /> },
  delivered:             { label: "Delivered",          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",           icon: <CheckCircle2 className="w-3 h-3" /> },
  funds_released:        { label: "Funds Released",    color: "bg-purple-500/10 text-purple-400 border-purple-500/30",              icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected:              { label: "Rejected",           color: "bg-red-500/10 text-red-400 border-red-500/30",                      icon: <XCircle className="w-3 h-3" /> },
};

export default function SellerOrders() {
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["seller-orders"], queryFn: fetchSellerOrders });

  const total = orders.length;
  const pending = orders.filter((o: any) => o.status === "pending" || o.status === "awaiting_confirmation").length;
  const confirmed = orders.filter((o: any) => o.status === "confirmed" || o.status === "delivered" || o.status === "funds_released").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Sales</h1>
        <p className="text-muted-foreground mt-1">All orders placed for your products.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{isLoading ? "—" : total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{isLoading ? "—" : pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Confirmed / Delivered</p>
              <p className="text-2xl font-bold">{isLoading ? "—" : confirmed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>Every purchase made for your products</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <p className="font-medium text-muted-foreground">No sales yet</p>
              <p className="text-sm text-muted-foreground/60 mt-1">When buyers purchase your products, orders will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: any) => {
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                const isPaid = order.status === "delivered" || order.status === "funds_released";
                return (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-background/30 hover:bg-background/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{order.productName}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{order.buyerDisplayName || order.buyerUsername || `User #${order.buyerId}`}</span>
                          <span className="text-muted-foreground/40">·</span>
                          <span>Order #{order.id}</span>
                          <span className="text-muted-foreground/40">·</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        {order.payment && (
                          <p className="text-xs text-muted-foreground/70 mt-0.5">
                            {order.payment.chain && `Pi Network · `}
                            {order.payment.txHash ? `TX: ${order.payment.txHash.slice(0, 12)}…` : "No TX hash yet"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 shrink-0">
                      <Badge variant="outline" className={`${cfg.color} text-xs flex items-center gap-1`}>
                        {cfg.icon} {cfg.label}
                      </Badge>
                      <div className="text-right">
                        {isPaid ? (
                          <p className="text-sm font-bold text-emerald-400">+π{order.sellerAmount.toFixed(2)}</p>
                        ) : (
                          <p className="text-sm font-medium">π{order.amount.toFixed(2)}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          {isPaid ? "Your cut (90%)" : "Buyer pays"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
