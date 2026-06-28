import { useState } from "react";
import { useListAdminOrders } from "@workspace/api-client-react";
import { useUpdateOrderStatus } from "@/hooks/useMutations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListAdminOrdersQueryKey } from "@workspace/api-client-react";
import { DollarSign, ExternalLink, Copy, Check, Eye, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PI_EXPLORER = "https://minepi.com/explorer";

function TxHashDisplay({ txHash, chain }: { txHash: string; chain: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const short = txHash.length > 16 ? `${txHash.slice(0, 8)}…${txHash.slice(-8)}` : txHash;
  return (
    <div className="flex items-center gap-1 mt-0.5">
      <code className="text-[10px] font-mono text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">{short}</code>
      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCopy}>
        {copied ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
      </Button>
      {chain === "PI" && (
        <a href={PI_EXPLORER} target="_blank" rel="noopener noreferrer" title="View on Pi Blockchain">
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <ExternalLink className="w-2.5 h-2.5 text-primary" />
          </Button>
        </a>
      )}
    </div>
  );
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "funds_released": return "bg-purple-500/20 text-purple-400 border-none";
    case "delivered": return "bg-emerald-500/20 text-emerald-500 border-none";
    case "rejected": return "bg-destructive/20 text-destructive border-none";
    case "confirmed": return "bg-blue-500/20 text-blue-400 border-none";
    case "awaiting_confirmation": return "bg-amber-500/20 text-amber-400 border-none";
    case "pending": return "bg-yellow-500/20 text-yellow-500 border-none";
    default: return "bg-secondary text-secondary-foreground border-none";
  }
};

const STATUS_LABEL: Record<string, string> = {
  funds_released: "Funds Released",
  awaiting_confirmation: "Awaiting",
  pending: "Pending",
  confirmed: "Confirmed",
  delivered: "Delivered",
  rejected: "Rejected",
};

export default function AdminOrders() {
  const { data: ordersData, isLoading } = useListAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [detailOrder, setDetailOrder] = useState<any | null>(null);

  const orders = (ordersData as any[]) ?? [];

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Status updated", description: `Order #${id} → ${STATUS_LABEL[status] ?? status}` });
        queryClient.invalidateQueries({ queryKey: getListAdminOrdersQueryKey() });
      },
      onError: (err: any) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleReleaseFunds = (order: any) => {
    if (!confirm(`Release π${order.sellerPayout ?? (order.amount * 0.9).toFixed(2)} Pi to seller for Order #${order.id} — "${order.productName}"?`)) return;
    updateStatus.mutate({ id: order.id, data: { status: "funds_released" } }, {
      onSuccess: () => {
        toast({ title: "Funds Released!", description: `Seller payout for Order #${order.id} confirmed.` });
        queryClient.invalidateQueries({ queryKey: getListAdminOrdersQueryKey() });
        if (detailOrder?.id === order.id) setDetailOrder({ ...detailOrder, status: "funds_released" });
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Orders</h1>
        <p className="text-muted-foreground mt-1">Track every transaction — buyer, seller, amount breakdown, and Pi blockchain TX.</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Product / Seller</TableHead>
              <TableHead>Breakdown (π Pi)</TableHead>
              <TableHead>Pi TX</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted rounded w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No orders yet.</TableCell>
              </TableRow>
            ) : (
              orders.map((order: any) => {
                const amount = order.amount ?? 0;
                const fee = order.platformFee ?? parseFloat((amount * 0.1).toFixed(2));
                const payout = order.sellerPayout ?? parseFloat((amount * 0.9).toFixed(2));
                return (
                  <TableRow key={order.id} className={cn("hover:bg-muted/20 transition-colors", order.status === "delivered" ? "bg-emerald-500/5" : "")}>
                    <TableCell className="font-semibold">
                      <span className="text-primary">#{order.id}</span>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate max-w-[120px]">{order.buyerName || `User #${order.userId}`}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{order.buyerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium max-w-[140px] truncate">{order.productName || `Product #${order.productId}`}</p>
                      {order.sellerName && (
                        <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">by {order.sellerName}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-bold text-sm"><span style={{ fontFamily: "serif" }}>π</span>{amount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-400/80">
                          <span>Fee (10%):</span><span>-π{fee.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-400">
                          <span>Seller (90%):</span><span className="font-semibold">π{payout.toFixed(2)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.payment?.txHash ? (
                        <TxHashDisplay txHash={order.payment.txHash} chain={order.payment.chain ?? "PI"} />
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(getStatusStyle(order.status), "capitalize text-xs whitespace-nowrap")}>
                        {STATUS_LABEL[order.status] ?? order.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailOrder(order)} title="View detail">
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                        </Button>
                        {order.status === "delivered" && (
                          <Button
                            size="sm"
                            className="h-7 gap-1 text-xs bg-emerald-600 hover:bg-emerald-500"
                            onClick={() => handleReleaseFunds(order)}
                            disabled={updateStatus.isPending}
                          >
                            <DollarSign className="w-3 h-3" /> Release
                          </Button>
                        )}
                        {order.status !== "funds_released" && (
                          <Select defaultValue={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                            <SelectTrigger className="w-[120px] h-7 text-xs">
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Escrow Process Guide */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm">
        <p className="font-medium text-emerald-400 mb-2">Escrow Release Process</p>
        <div className="flex items-start gap-3 flex-wrap text-xs text-muted-foreground">
          {["Buyer places order", "Buyer submits Pi TX hash", "Admin verifies → Confirmed", "Buyer downloads & confirms receipt", "Admin releases funds to seller"].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</div>
                <span>{step}</span>
              </div>
              {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={detailOrder !== null} onOpenChange={open => !open && setDetailOrder(null)}>
        <DialogContent className="max-w-lg">
          {detailOrder && (() => {
            const amount = detailOrder.amount ?? 0;
            const fee = detailOrder.platformFee ?? parseFloat((amount * 0.1).toFixed(2));
            const payout = detailOrder.sellerPayout ?? parseFloat((amount * 0.9).toFixed(2));
            return (
              <>
                <DialogHeader>
                  <DialogTitle>Order #{detailOrder.id} — Full Breakdown</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 py-2">
                  {/* Parties */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <p className="text-xs text-muted-foreground mb-1">Buyer</p>
                      <p className="font-medium text-sm">{detailOrder.buyerName || `User #${detailOrder.userId}`}</p>
                      <p className="text-xs text-muted-foreground">{detailOrder.buyerEmail}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                      <p className="text-xs text-muted-foreground mb-1">Seller</p>
                      <p className="font-medium text-sm">{detailOrder.sellerName || "—"}</p>
                      <p className="text-xs text-muted-foreground">{detailOrder.sellerEmail}</p>
                    </div>
                  </div>

                  {/* Product */}
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Product</p>
                    <p className="font-medium">{detailOrder.productName}</p>
                  </div>

                  {/* Transaction Breakdown */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Transaction Breakdown (Pi Blockchain)</p>
                    <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
                      <div className="flex justify-between items-center p-3 border-b border-border/30">
                        <span className="text-sm text-muted-foreground">Product Price</span>
                        <span className="font-bold"><span style={{ fontFamily: "serif" }}>π</span>{amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border-b border-border/30 text-red-400/80">
                        <span className="text-sm">Platform Fee (10%)</span>
                        <span className="font-medium">-<span style={{ fontFamily: "serif" }}>π</span>{fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 text-emerald-400">
                        <span className="text-sm font-medium">Seller Receives (90%)</span>
                        <span className="font-bold text-lg"><span style={{ fontFamily: "serif" }}>π</span>{payout.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pi Blockchain TX */}
                  {detailOrder.payment && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Pi Blockchain Record</p>
                      <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Network</span>
                          <span className="font-medium text-yellow-400">Pi Network</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Payment Status</span>
                          <Badge variant="outline" className={cn("capitalize text-xs", {
                            "bg-emerald-500/10 text-emerald-400 border-emerald-500/30": detailOrder.payment.status === "confirmed",
                            "bg-amber-500/10 text-amber-400 border-amber-500/30": detailOrder.payment.status === "pending",
                          })}>
                            {detailOrder.payment.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Transaction Hash</span>
                          <div className="flex items-center gap-2 bg-muted/40 p-2 rounded border border-border/40">
                            <code className="text-xs font-mono text-primary flex-1 break-all">{detailOrder.payment.txHash}</code>
                          </div>
                          <a
                            href={PI_EXPLORER}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Verify on Pi Blockchain Explorer
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Order Status</span>
                    <Badge variant="outline" className={cn("capitalize", getStatusStyle(detailOrder.status))}>
                      {STATUS_LABEL[detailOrder.status] ?? detailOrder.status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  {detailOrder.status === "delivered" && (
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-500 gap-2"
                      onClick={() => handleReleaseFunds(detailOrder)}
                      disabled={updateStatus.isPending}
                    >
                      <DollarSign className="w-4 h-4" />
                      Release π{payout.toFixed(2)} to Seller
                    </Button>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
