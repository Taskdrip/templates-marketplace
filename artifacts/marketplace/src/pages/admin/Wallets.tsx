import { useState, useEffect } from "react";
import { useUpdateWallet, useCreateWallet } from "@/hooks/useMutations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle, Copy } from "lucide-react";

const API_BASE = "/api";
function getToken() { return localStorage.getItem("cm_token"); }

async function fetchAdminWallets() {
  const res = await fetch(`${API_BASE}/wallets`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.json() as Promise<Array<{
    id: number; chain: string; address: string; label: string | null; customMessage: string | null; isActive: boolean;
  }>>;
}

const CHAINS = [
  { id: "PI", label: "Pi Network (π)",  network: "Pi Blockchain", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", placeholder: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
];

type WalletState = { id: number; address: string; originalAddress: string; customMessage: string; originalMessage: string };

export default function AdminWallets() {
  const { data: wallets = [], isLoading, refetch } = useQuery({ queryKey: ["admin-wallets"], queryFn: fetchAdminWallets });
  const updateWallet = useUpdateWallet();
  const createWallet = useCreateWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [state, setState] = useState<Record<string, WalletState>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const map: Record<string, WalletState> = {};
    wallets.forEach(w => {
      map[w.chain] = {
        id: w.id, address: w.address, originalAddress: w.address,
        customMessage: w.customMessage ?? "", originalMessage: w.customMessage ?? "",
      };
    });
    setState(map);
  }, [wallets]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-wallets"] });
    refetch();
  };

  const handleSave = async (chain: string) => {
    const data = state[chain];
    if (!data?.address.trim()) { toast({ title: "Address required", variant: "destructive" }); return; }
    setSaving(chain);
    try {
      const payload = { address: data.address.trim(), chain, label: chain, customMessage: data.customMessage, isActive: true };
      if (data.id) {
        await updateWallet.mutateAsync({ id: data.id, data: payload });
      } else {
        await createWallet.mutateAsync({ data: payload });
      }
      toast({ title: "Wallet saved", description: `${chain} address updated.` });
      invalidate();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({ title: "Copied", description: "Address copied to clipboard." });
  };

  const isDirty = (chain: string) => {
    const d = state[chain];
    return d && (d.address !== d.originalAddress || d.customMessage !== d.originalMessage);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checkout Wallets</h1>
        <p className="text-muted-foreground mt-1">
          Set the crypto addresses where customers send payments. Add a custom message displayed to buyers during checkout.
        </p>
      </div>

      <Card className="bg-amber-500/5 border-amber-500/30">
        <CardContent className="flex items-start gap-3 pt-4">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200/80">
            Always double-check addresses before saving. Payments sent to wrong addresses cannot be recovered.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {CHAINS.map(chain => {
          const current = state[chain.id];
          const isSaving = saving === chain.id;
          const hasAddress = !!current?.address;

          return (
            <Card key={chain.id} className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{chain.label}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{chain.network}</CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={hasAddress
                      ? "bg-emerald-500/10 text-emerald-400 border-none gap-1"
                      : "bg-muted/50 text-muted-foreground border-none"}
                  >
                    {hasAddress ? <><CheckCircle2 className="w-3 h-3" /> Active</> : "Not configured"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="h-10 bg-muted/50 animate-pulse rounded-md" />
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Receiving Address *</Label>
                      <div className="flex gap-2">
                        <Input
                          className="bg-background font-mono text-sm flex-1"
                          value={current?.address ?? ""}
                          onChange={e => setState(prev => ({
                            ...prev,
                            [chain.id]: { ...(prev[chain.id] ?? { id: 0, originalAddress: "", customMessage: "", originalMessage: "" }), address: e.target.value },
                          }))}
                          placeholder={chain.placeholder}
                        />
                        {hasAddress && (
                          <Button variant="ghost" size="icon" onClick={() => handleCopy(current!.address)} title="Copy address">
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Custom Message (shown to buyer during checkout)</Label>
                      <Textarea
                        className="bg-background text-sm resize-none min-h-[70px]"
                        value={current?.customMessage ?? ""}
                        onChange={e => setState(prev => ({
                          ...prev,
                          [chain.id]: { ...(prev[chain.id] ?? { id: 0, address: "", originalAddress: "", originalMessage: "" }), customMessage: e.target.value },
                        }))}
                        placeholder={`e.g. Send Pi (π) on ${chain.network}. Minimum: 1 π Pi.`}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleSave(chain.id)}
                        disabled={isSaving || !isDirty(chain.id)}
                        className="min-w-[120px]"
                      >
                        {isSaving ? "Saving..." : isDirty(chain.id) ? "Save Changes" : "Saved"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Payment Flow</CardTitle>
          <CardDescription>How customer payments work in Breedskoolpi.store</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Customer clicks <strong className="text-foreground">"Buy with Crypto"</strong> on a product page</li>
            <li>A Web3 checkout popup opens with a 30-minute timer</li>
            <li>Customer opens Pi Browser, selects Pi payment and sends π Pi</li>
            <li>Customer submits their TX hash + optional proof screenshot</li>
            <li>Admin verifies the payment in the <span className="text-foreground font-medium">Payments</span> tab</li>
            <li>Admin confirms → customer gets access to the download + chat notification</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
