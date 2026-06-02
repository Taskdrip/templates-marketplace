import { useListOrders } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Eye, Package } from "lucide-react";

export default function Orders() {
  const [, setLocation] = useLocation();
  const { data: orders, isLoading } = useListOrders();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30';
      case 'rejected': return 'bg-destructive/20 text-destructive-foreground hover:bg-destructive/30';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30';
      case 'awaiting_confirmation': return 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30';
      case 'funds_released': return 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
        <p className="text-muted-foreground mt-1">View and manage your purchases.</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell><div className="h-4 bg-muted rounded w-16"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-32"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-24"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-16"></div></TableCell>
                  <TableCell><div className="h-6 bg-muted rounded w-24"></div></TableCell>
                  <TableCell><div className="h-8 bg-muted rounded w-8 ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : !orders?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation(`/orders/${order.id}`)}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{(order as any).productName || "Unknown Product"}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>${order.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${getStatusColor(order.status)} border-none capitalize`}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
