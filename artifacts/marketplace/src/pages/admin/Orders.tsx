import { useListAdminOrders } from "@workspace/api-client-react";
import { useUpdateOrderStatus } from "@/hooks/useMutations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListAdminOrdersQueryKey } from "@workspace/api-client-react";
import { DollarSign } from "lucide-react";

export default function AdminOrders() {
  const { data: ordersData, isLoading } = useListAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Status updated", description: `Order #${id} → ${status.replace(/_/g, " ")}` });
        queryClient.invalidateQueries({ queryKey: getListAdminOrdersQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Update failed", description: err.message, variant: "destructive" });
      },
    });
  };

  const handleReleaseFunds = (id: number, productName: string) => {
    if (!confirm(`Release funds to seller for Order #${id} — "${productName}"?`)) return;
    updateStatus.mutate({ id, data: { status: "funds_released" } }, {
      onSuccess: () => {
        toast({ title: "Funds Released!", description: `Seller has been notified for Order #${id}.` });
        queryClient.invalidateQueries({ queryKey: getListAdminOrdersQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      },
    });
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'funds_released': return 'bg-purple-500/20 text-purple-400 border-none';
      case 'delivered': return 'bg-emerald-500/20 text-emerald-500 border-none';
      case 'rejected': return 'bg-destructive/20 text-destructive border-none';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-none';
      case 'awaiting_confirmation': return 'bg-amber-500/20 text-amber-400 border-none';
      case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-none';
      default: return 'bg-secondary text-secondary-foreground border-none';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Orders</h1>
        <p className="text-muted-foreground mt-1">Manage orders and release funds to sellers upon buyer confirmation.</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted rounded w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : !ordersData?.orders?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              ordersData.orders.map((order) => (
                <TableRow key={order.id} className={order.status === "delivered" ? "bg-emerald-500/5" : ""}>
                  <TableCell className="font-medium">
                    <p className="font-semibold">#{order.id}</p>
                    <p className="text-xs text-muted-foreground">User #{order.userId}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-sm max-w-[160px] truncate">{order.productName || `Product #${order.productId}`}</p>
                    {order.payment && (
                      <p className="text-xs text-muted-foreground">{order.payment.chain?.replace("USDT_", "")}</p>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">${order.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusStyle(order.status)} capitalize text-xs`}>
                      {order.status === "funds_released" ? "Funds Released" : order.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {order.status === "delivered" && (
                        <Button
                          size="sm"
                          className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500"
                          onClick={() => handleReleaseFunds(order.id, order.productName || "")}
                          disabled={updateStatus.isPending}
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Release Funds
                        </Button>
                      )}
                      {order.status !== "funds_released" && (
                        <Select
                          defaultValue={order.status}
                          onValueChange={(val) => handleStatusChange(order.id, val)}
                        >
                          <SelectTrigger className="w-[150px] h-8 text-xs">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="awaiting_confirmation">Awaiting</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="funds_released">Funds Released</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-emerald-400 mb-1">Escrow Release Process</p>
        <ol className="space-y-1 list-decimal list-inside text-xs">
          <li>Verify payment on the <strong>Payments</strong> tab → mark as Confirmed</li>
          <li>Set order status to <strong>Confirmed</strong> — buyer gets download access</li>
          <li>Buyer confirms receipt — order automatically moves to <strong>Delivered</strong></li>
          <li>Click <strong>Release Funds</strong> to pay the seller and close the escrow</li>
        </ol>
      </div>
    </div>
  );
}
