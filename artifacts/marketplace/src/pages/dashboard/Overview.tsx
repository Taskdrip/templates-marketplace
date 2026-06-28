import { useGetMe, useListOrders, useListNotifications } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, Bell, Package, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function token() { return localStorage.getItem("cm_token"); }

async function fetchSellerOrders() {
  const res = await fetch("/api/seller/orders", { headers: { Authorization: `Bearer ${token()}` } });
  if (!res.ok) throw new Error("not a seller");
  return res.json() as Promise<any[]>;
}

export default function Overview() {
  const { data: user } = useGetMe();
  const { data: orders } = useListOrders();
  const { data: notifications } = useListNotifications();
  const isSeller = (user as any)?.isSeller === true;
  const { data: sellerOrders = [] } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: fetchSellerOrders,
    enabled: isSeller,
  });

  const recentOrders = (orders ?? []).slice(0, 5);
  const recentNotifications = (notifications ?? []).slice(0, 5);
  const recentSales = sellerOrders.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {(user as any)?.displayName || user?.username}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(user as any)?.totalPurchases || orders?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(notifications ?? []).filter((n: any) => n.isRead === "false" || n.isRead === false).length}
            </div>
          </CardContent>
        </Card>
        {isSeller ? (
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sellerOrders.length}</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sellerOrders.filter((o: any) => o.status === "pending" || o.status === "awaiting_confirmation").length} awaiting action
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(orders ?? []).filter((o: any) => o.status === "pending" || o.status === "awaiting_confirmation").length}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {isSeller && recentSales.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Recent Sales
              </CardTitle>
              <CardDescription>Latest orders for your products</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seller/orders">View All <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales.map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{sale.productName || `Order #${sale.id}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {sale.buyerDisplayName || sale.buyerUsername || `Buyer #${sale.buyerId}`} · {new Date(sale.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-semibold text-sm text-emerald-400">π{sale.amount.toFixed(2)}</p>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                      sale.status === "funds_released" ? "text-purple-400 border-purple-500/30" :
                      sale.status === "delivered" ? "text-emerald-400 border-emerald-500/30" :
                      sale.status === "confirmed" ? "text-blue-400 border-blue-500/30" :
                      "text-yellow-400 border-yellow-500/30"
                    }`}>
                      {sale.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest purchases</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/orders">View All <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{order.productName || `Order #${order.id}`}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">${order.amount.toFixed(2)}</p>
                      <p className={`text-xs capitalize ${
                        order.status === 'delivered' || order.status === 'funds_released' ? 'text-emerald-500' :
                        order.status === 'rejected' ? 'text-destructive' :
                        'text-yellow-500'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No orders yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/marketplace">Explore Marketplace</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Recent account activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/notifications">View All <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentNotifications.length > 0 ? (
              <div className="space-y-3">
                {recentNotifications.map((notification: any) => (
                  <div key={notification.id} className={`flex gap-3 p-3 rounded-lg border border-border/50 ${!(notification.isRead === "true" || notification.isRead === true) ? 'bg-primary/5 border-primary/20' : 'bg-background/50'}`}>
                    <div className="mt-1">
                      <Bell className={`w-4 h-4 ${!(notification.isRead === "true" || notification.isRead === true) ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${!(notification.isRead === "true" || notification.isRead === true) ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(notification.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No notifications</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
