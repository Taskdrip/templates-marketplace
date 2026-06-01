import { useListPayments } from "@workspace/api-client-react";
import { useVerifyPayment, useUpdateOrderStatus } from "@/hooks/useMutations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, ExternalLink, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListPaymentsQueryKey, getListAdminOrdersQueryKey } from "@workspace/api-client-react";

const chainExplorer: Record<string, (txHash: string) => string> = {
  USDT_TRC20: (h) => `https://tronscan.org/#/transaction/${h}`,
  USDT_BEP20: (h) => `https://bscscan.com/tx/${h}`,
  USDT_TON:   (h) => `https://tonscan.org/tx/${h}`,
};

export default function AdminPayments() {
  const { data: paymentsData, isLoading } = useListPayments();
  const verifyPayment = useVerifyPayment();
  const updateOrderStatus = useUpdateOrderStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleVerify = (id: number, orderId: number, status: "confirmed" | "rejected") => {
    verifyPayment.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({
          title: status === "confirmed" ? "Payment Confirmed!" : "Payment Rejected",
          description: status === "confirmed"
            ? "Order moved to Confirmed — buyer can now download."
            : "Order has been rejected.",
        });
        queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListAdminOrdersQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      },
    });
  };

  const statusStyle: Record<string, string> = {
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    verified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Verification</h1>
        <p className="text-muted-foreground mt-1">Review on-chain transactions and confirm or reject buyer payments.</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Payment #</TableHead>
              <TableHead>Order #</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>TX Hash</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted rounded w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : !paymentsData?.payments?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No payments to review.
                </TableCell>
              </TableRow>
            ) : (
              paymentsData.payments.map((payment) => {
                const explorerUrl = payment.chain
                  ? chainExplorer[payment.chain]?.(payment.txHash)
                  : undefined;
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">#{payment.id}</TableCell>
                    <TableCell>
                      <span className="text-primary font-semibold">#{payment.orderId}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-secondary border-none text-xs">
                        {payment.chain?.replace("USDT_", "") ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <span className="truncate text-xs font-mono text-muted-foreground">{payment.txHash}</span>
                        {explorerUrl && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" asChild>
                            <a href={explorerUrl} target="_blank" rel="noreferrer" title="Verify on chain explorer">
                              <ExternalLink className="w-3 h-3 text-primary" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusStyle[payment.status] ?? statusStyle.pending} border text-xs`}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs"
                            onClick={() => handleVerify(payment.id, payment.orderId, "confirmed")}
                            disabled={verifyPayment.isPending}
                          >
                            <Check className="w-3.5 h-3.5" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 text-xs"
                            onClick={() => handleVerify(payment.id, payment.orderId, "rejected")}
                            disabled={verifyPayment.isPending}
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {(payment.status === "confirmed" || payment.status === "verified") && (
                        <div className="flex items-center justify-end gap-1.5 text-xs text-emerald-400">
                          <Check className="w-3.5 h-3.5" /> Verified
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm">
        <div className="flex items-center gap-2 text-blue-400 font-medium mb-2">
          <Shield className="w-4 h-4" />
          Verification Instructions
        </div>
        <ol className="space-y-1.5 list-decimal list-inside text-xs text-muted-foreground">
          <li>Click the external link icon to view the transaction on the blockchain explorer</li>
          <li>Verify the <strong>recipient address</strong> matches our wallet addresses (check Wallets settings)</li>
          <li>Verify the <strong>amount</strong> matches the order amount</li>
          <li>Verify the transaction is <strong>confirmed</strong> (not pending)</li>
          <li>Click <strong>Confirm</strong> to release download access to the buyer</li>
        </ol>
      </div>
    </div>
  );
}
