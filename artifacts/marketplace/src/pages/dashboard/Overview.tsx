import { useGetMe, useListOrders, useListNotifications } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, Bell, Package, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Overview() {
  const { data: user } = useGetMe();
  const { data: ordersData } = useListOrders({ limit: 5 });
  const { data: notificationsData } = useListNotifications({ limit: 5 });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.username}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.totalPurchases || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest purchases</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {ordersData?.orders && ordersData.orders.length > 0 ? (
              <div className="space-y-4">
                {ordersData.orders.map(order => (
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
                        order.status === 'delivered' ? 'text-emerald-500' :
                        order.status === 'rejected' ? 'text-destructive' :
                        'text-yellow-500'
                      }`}>
                        {order.status.replace('_', ' ')}
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
              <Link href="/dashboard/notifications">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {notificationsData?.notifications && notificationsData.notifications.length > 0 ? (
              <div className="space-y-4">
                {notificationsData.notifications.map(notification => (
                  <div key={notification.id} className={`flex gap-3 p-3 rounded-lg border border-border/50 ${!notification.isRead ? 'bg-primary/5 border-primary/20' : 'bg-background/50'}`}>
                    <div className="mt-1">
                      <Bell className={`w-4 h-4 ${!notification.isRead ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
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
