import { useListOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PI_SYMBOL = "π";

export default function WalletPage() {
  const { data: orders, isLoading } = useListOrders();

  const transactions = (orders ?? []).filter((o: any) => o.payment);
  const totalSpent = transactions.reduce((sum: number, t: any) => sum + Number(t.amount ?? 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pi Wallet & Transactions</h1>
        <p className="text-muted-foreground mt-1">Your Pi payment history and spending overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Spent */}
        <Card className="bg-gradient-to-br from-violet-900/30 to-purple-800/20 border-violet-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                <span className="text-xl font-black text-yellow-400" style={{ fontFamily: "serif" }}>π</span>
              </div>
              <Badge variant="outline" className="bg-background/50 border-violet-500/20 text-violet-300">Lifetime Spent</Badge>
            </div>
            <div className="text-3xl font-bold flex items-center gap-1">
              <span className="text-yellow-400 font-black" style={{ fontFamily: "serif" }}>π</span>
              {totalSpent.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Across {transactions.length} Pi transactions</p>
          </CardContent>
        </Card>

        {/* Pi Network info */}
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-yellow-400/5 to-violet-900/10 border-yellow-400/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
                <span className="text-2xl font-black text-white" style={{ fontFamily: "serif" }}>π</span>
              </div>
              <div>
                <h3 className="font-bold text-base">Pi Network Payments</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All transactions on PiMarket are settled in Pi cryptocurrency. Open Pi Browser to send payments and view your Pi balance.
                </p>
                <a
                  href="https://minepi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-2"
                >
                  Learn about Pi Network <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Pi Transaction History</CardTitle>
          <CardDescription>Your recent Pi Network payment activity</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-5xl font-black text-muted-foreground/20 mb-3 mx-auto" style={{ fontFamily: "serif" }}>π</div>
              <p>No Pi transactions yet.</p>
              <p className="text-sm mt-1">Browse the marketplace to make your first purchase.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{t.productName || `Order #${t.id}`}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-mono">{t.payment?.chain || "PI"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-foreground flex items-center gap-1 justify-end">
                      <span className="text-yellow-400 font-black" style={{ fontFamily: "serif" }}>-π</span>
                      {Number(t.amount ?? 0).toFixed(2)}
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        t.payment?.status === "verified" || t.payment?.status === "confirmed"
                          ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10"
                          : t.payment?.status === "rejected"
                          ? "text-destructive border-destructive/20 bg-destructive/10"
                          : "text-yellow-500 border-yellow-500/20 bg-yellow-500/10"
                      }
                    >
                      {t.payment?.status ?? "pending"}
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
