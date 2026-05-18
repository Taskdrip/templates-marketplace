import { useListAdminOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListAdminOrdersQueryKey } from "@workspace/api-client-react";

export default function AdminOrders() {
  const { data: ordersData, isLoading } = useListAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Status updated", description: `Order #${id} status changed to ${status}.` });
        queryClient.invalidateQueries({ queryKey: getListAdminOrdersQueryKey() });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-emerald-500/20 text-emerald-500';
      case 'rejected': return 'bg-destructive/20 text-destructive';
      case 'confirmed': return 'bg-blue-500/20 text-blue-500';
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Orders</h1>
        <p className="text-muted-foreground mt-1">Manage all platform orders and fulfillments.</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Update Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell><div className="h-4 bg-muted rounded w-16"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-16"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-24"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-24"></div></TableCell>
                  <TableCell><div className="h-6 bg-muted rounded w-24"></div></TableCell>
                  <TableCell><div className="h-8 bg-muted rounded w-32 ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : ordersData?.orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              ordersData?.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.userId}</TableCell>
                  <TableCell>${order.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(order.status)} border-none capitalize`}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select defaultValue={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                      <SelectTrigger className="w-[140px] ml-auto h-8 text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="awaiting_confirmation">Awaiting</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
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
