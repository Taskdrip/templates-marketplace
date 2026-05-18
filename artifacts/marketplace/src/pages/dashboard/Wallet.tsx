import { useListOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WalletPage() {
  const { data: ordersData, isLoading } = useListOrders();

  // Filter out only payments that were actually made
  const transactions = ordersData?.orders.filter(o => o.payment) || [];
  
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet & Transactions</h1>
        <p className="text-muted-foreground mt-1">Your payment history and balances.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/20 to-purple-600/20 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <WalletIcon className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="bg-background/50 border-primary/20">Lifetime Spent</Badge>
            </div>
            <div className="text-3xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">Across {transactions.length} transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent crypto payments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>)}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No transactions found.
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Payment for {t.productName || `Order #${t.id}`}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-mono">{t.payment?.chain.replace('USDT_', '')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-foreground">-{t.amount.toFixed(2)} USDT</p>
                    <Badge variant="outline" className={
                      t.payment?.status === 'verified' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 
                      t.payment?.status === 'rejected' ? 'text-destructive border-destructive/20 bg-destructive/10' : 
                      'text-yellow-500 border-yellow-500/20 bg-yellow-500/10'
                    }>
                      {t.payment?.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
