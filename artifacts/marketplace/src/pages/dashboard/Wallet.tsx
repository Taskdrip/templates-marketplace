import { useListOrders } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ExternalLink, Wallet, AlertCircle, CheckCircle2, Clock, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const PI_SYMBOL = "π";

export default function WalletPage() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useListOrders();
  const { toast } = useToast();

  const piWalletAddress = (user as any)?.piWalletAddress;

  const transactions = (orders ?? []).filter((o: any) => o.payment);
  const totalSpent = transactions.reduce((sum: number, t: any) => sum + Number(t.amount ?? 0), 0);
  const confirmedTxs = transactions.filter((t: any) => t.payment?.status === "confirmed" || t.payment?.status === "verified");
  const pendingTxs = transactions.filter((t: any) => t.payment?.status === "pending");

  const copyAddress = () => {
    if (piWalletAddress) {
      navigator.clipboard.writeText(piWalletAddress);
      toast({ title: "Copied!", description: "Pi wallet address copied to clipboard." });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pi Wallet & Transactions</h1>
        <p className="text-muted-foreground mt-1">Manage your Pi wallet address and view your payment history.</p>
      </div>

      {/* Pi Wallet Address Card */}
      <Card className={`border-2 ${piWalletAddress ? "border-emerald-500/30 bg-gradient-to-br from-emerald-900/10 to-violet-900/10" : "border-amber-500/30 bg-gradient-to-br from-amber-900/10 to-violet-900/10"}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-lg font-black text-white" style={{ fontFamily: "serif" }}>π</span>
            </div>
            Your Pi Wallet Address
          </CardTitle>
          <CardDescription>
            This address is used to receive seller payouts and refunds. Keep it updated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {piWalletAddress ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-background/60 border border-emerald-500/20 p-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-mono text-sm text-emerald-300 break-all flex-1">{piWalletAddress}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copyAddress}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                ✓ Wallet address is set. Admin will send funds here when releasing seller payouts or processing refunds.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-400">No Pi wallet address set</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You need a Pi wallet address to receive funds from product sales or refunds from cancelled orders.
                  </p>
                </div>
              </div>
              <Button asChild className="w-full bg-violet-600 hover:bg-violet-500">
                <Link href="/dashboard/profile">
                  <Wallet className="w-4 h-4 mr-2" />
                  Add Pi Wallet Address in Profile
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-900/30 to-purple-800/20 border-violet-500/30">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Spent</span>
              <Badge variant="outline" className="bg-background/50 border-violet-500/20 text-violet-300 text-xs">Lifetime</Badge>
            </div>
            <div className="text-2xl font-bold flex items-center gap-1">
              <span className="text-yellow-400 font-black" style={{ fontFamily: "serif" }}>π</span>
              {totalSpent.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/20 to-green-900/10 border-emerald-500/20">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Confirmed Payments</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">{confirmedTxs.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/20 to-yellow-900/10 border-amber-500/20">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">{pendingTxs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
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
              <div className="text-5xl font-black text-muted-foreground/20 mb-3" style={{ fontFamily: "serif" }}>π</div>
              <p>No Pi transactions yet.</p>
              <p className="text-sm mt-1">Browse the marketplace to make your first purchase.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/marketplace">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.productName || `Order #${t.id}`}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-mono">{t.payment?.chain || "PI"}</span>
                        {t.payment?.txHash && (
                          <>
                            <span>•</span>
                            <span className="font-mono truncate max-w-[80px]">{t.payment.txHash}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <p className="font-bold text-base text-foreground flex items-center gap-1">
                      <span className="text-yellow-400 font-black" style={{ fontFamily: "serif" }}>-π</span>
                      {Number(t.amount ?? 0).toFixed(2)}
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        t.payment?.status === "verified" || t.payment?.status === "confirmed"
                          ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10 text-xs"
                          : t.payment?.status === "rejected"
                          ? "text-destructive border-destructive/20 bg-destructive/10 text-xs"
                          : "text-yellow-500 border-yellow-500/20 bg-yellow-500/10 text-xs"
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

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm">
        <div className="flex items-center gap-2 text-violet-400 font-medium mb-2">
          <span className="text-base font-black" style={{ fontFamily: "serif" }}>π</span>
          About Pi Network Payments
        </div>
        <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
          <li>All transactions use Pi cryptocurrency via the Pi Network blockchain</li>
          <li>Payments are held in escrow until admin confirms receipt</li>
          <li>Sellers receive 90% of the sale price after buyer confirms delivery</li>
          <li>Refunds are sent to your Pi wallet address if an order is rejected</li>
        </ul>
        <a href="https://minepi.com" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-3">
          Learn about Pi Network <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
