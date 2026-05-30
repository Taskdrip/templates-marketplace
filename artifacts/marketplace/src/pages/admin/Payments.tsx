import { useListPayments } from "@workspace/api-client-react";
import { useVerifyPayment } from "@/hooks/useMutations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListPaymentsQueryKey, getListAdminOrdersQueryKey } from "@workspace/api-client-react";

export default function AdminPayments() {
  const { data: paymentsData, isLoading } = useListPayments();
  const verifyPayment = useVerifyPayment();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleVerify = (id: number, status: string) => {
    verifyPayment.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Payment verified", description: `Payment marked as ${status}.` });
        queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListAdminOrdersQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Verification</h1>
        <p className="text-muted-foreground mt-1">Review and verify on-chain transactions.</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Order ID</TableHead>
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
                  <TableCell><div className="h-4 bg-muted rounded w-16"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-16"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-20"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-24"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-32"></div></TableCell>
                  <TableCell><div className="h-6 bg-muted rounded w-24"></div></TableCell>
                  <TableCell><div className="h-8 bg-muted rounded w-24 ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : paymentsData?.payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No pending payments to review.
                </TableCell>
              </TableRow>
            ) : (
              paymentsData?.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">#{payment.id}</TableCell>
                  <TableCell>#{payment.orderId}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-secondary">
                      {payment.chain.replace('USDT_', '')}
                    </Badge>
                  </TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-[200px]">
                      <span className="truncate text-xs font-mono">{payment.txHash}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" asChild>
                        <a href={`https://tronscan.org/#/transaction/${payment.txHash}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      payment.status === 'verified' ? 'bg-emerald-500/20 text-emerald-500 border-none' : 
                      payment.status === 'rejected' ? 'bg-destructive/20 text-destructive border-none' : 
                      'bg-yellow-500/20 text-yellow-500 border-none'
                    }>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleVerify(payment.id, 'verified')}>
                          <Check className="w-4 h-4 text-emerald-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleVerify(payment.id, 'rejected')}>
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
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
