import { useState, useEffect } from "react";
import { useGetWalletAddresses, useUpdateWallet, useCreateWallet } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetWalletAddressesQueryKey } from "@workspace/api-client-react";
import { CheckCircle2, AlertCircle, Copy } from "lucide-react";

const CHAINS = [
  {
    id: "USDT_TRC20",
    label: "USDT — TRON (TRC20)",
    network: "Tron Network",
    color: "text-red-400",
    bg: "bg-red-500/10",
    placeholder: "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "USDT_BEP20",
    label: "USDT — BNB Smart Chain (BEP20)",
    network: "BNB Chain",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    placeholder: "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "USDT_TON",
    label: "USDT — TON Network",
    network: "The Open Network",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    placeholder: "EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
];

export default function AdminWallets() {
  const { data: walletData, isLoading } = useGetWalletAddresses();
  const updateWallet = useUpdateWallet();
  const createWallet = useCreateWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [addresses, setAddresses] = useState<Record<string, { id: number; address: string; original: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (walletData?.wallets) {
      const map: Record<string, { id: number; address: string; original: string }> = {};
      walletData.wallets.forEach(w => {
        map[w.chain] = { id: w.id, address: w.address, original: w.address };
      });
      setAddresses(map);
    }
  }, [walletData]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetWalletAddressesQueryKey() });
  };

  const handleSave = async (chain: string) => {
    const data = addresses[chain];
    if (!data?.address.trim()) {
      toast({ title: "Address required", variant: "destructive" });
      return;
    }
    setSaving(chain);
    try {
      if (data.id) {
        await updateWallet.mutateAsync({ id: data.id, data: { address: data.address.trim(), chain, isActive: true } });
      } else {
        await createWallet.mutateAsync({ data: { address: data.address.trim(), chain, label: chain, isActive: true } });
      }
      toast({ title: "Wallet saved", description: `${chain} receiving address updated.` });
      invalidate();
    } catch {
      toast({ title: "Save failed", description: "Could not update wallet address.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({ title: "Copied", description: "Address copied to clipboard." });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checkout Wallets</h1>
        <p className="text-muted-foreground mt-1">
          Set the crypto addresses where customers send their payments. Changes take effect immediately.
        </p>
      </div>

      <Card className="bg-amber-500/5 border-amber-500/30">
        <CardContent className="flex items-start gap-3 pt-4">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200/80">
            Always double-check addresses before saving. Payments sent to wrong addresses cannot be recovered.
            Use hardware wallet addresses for maximum security.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {CHAINS.map(chain => {
          const current = addresses[chain.id];
          const isDirty = current && current.address !== current.original;
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
                    className={hasAddress ? "bg-emerald-500/10 text-emerald-400 border-none gap-1" : "bg-muted/50 text-muted-foreground border-none"}
                  >
                    {hasAddress ? (
                      <><CheckCircle2 className="w-3 h-3" /> Active</>
                    ) : "Not configured"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="h-10 bg-muted/50 animate-pulse rounded-md" />
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Receiving Address</Label>
                      <div className="flex gap-2">
                        <Input
                          className="bg-background font-mono text-sm flex-1"
                          value={current?.address ?? ""}
                          onChange={e => setAddresses(prev => ({
                            ...prev,
                            [chain.id]: { ...(prev[chain.id] ?? { id: 0, original: "" }), address: e.target.value },
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
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleSave(chain.id)}
                        disabled={isSaving || !isDirty}
                        className="min-w-[100px]"
                      >
                        {isSaving ? "Saving..." : isDirty ? "Save Changes" : "Saved"}
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
          <CardDescription>How customer payments work</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Customer selects a product and clicks "Buy Now"</li>
            <li>Customer chooses a payment chain (TRC20 / BEP20 / TON)</li>
            <li>Customer sends USDT to the displayed wallet address</li>
            <li>Customer submits their TX hash and/or payment screenshot</li>
            <li>Admin verifies the payment in the <span className="text-foreground font-medium">Payments</span> tab</li>
            <li>Admin confirms → customer gets access to the download</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
