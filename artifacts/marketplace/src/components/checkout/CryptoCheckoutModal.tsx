import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGetWalletAddresses, useSubmitPayment } from "@workspace/api-client-react";
import { useSettings } from "@/hooks/useSettings";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, Check, Clock, Shield, Upload, AlertTriangle, Zap, ChevronRight } from "lucide-react";

const CHAIN_META: Record<string, { name: string; network: string; color: string; bg: string; border: string; icon: string }> = {
  USDT_TRC20: { name: "TRON",      network: "TRC20",  color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30",    icon: "🔴" },
  USDT_TON:   { name: "TON",       network: "TON",    color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/30",   icon: "💎" },
  USDT_BEP20: { name: "BNB Chain", network: "BEP20",  color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: "🟡" },
};

function QRCode({ data }: { data: string }) {
  const encoded = encodeURIComponent(data);
  return (
    <div className="w-36 h-36 bg-white rounded-xl p-2 mx-auto shadow-lg shadow-black/30">
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}&bgcolor=ffffff&color=000000`}
        alt="QR Code"
        className="w-full h-full object-contain rounded-lg"
      />
    </div>
  );
}

function CountdownTimer({ expiresAt, onExpire }: { expiresAt: Date; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, expiresAt.getTime() - Date.now());
      setRemaining(diff);
      if (diff === 0) onExpire();
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const pct = Math.max(0, (remaining / (30 * 60 * 1000)) * 100);
  const isUrgent = remaining < 5 * 60 * 1000;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono font-semibold ${
      isUrgent ? "bg-red-500/10 border-red-500/40 text-red-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"
    }`}>
      <Clock className="w-3.5 h-3.5" />
      <span>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? "bg-red-500" : "bg-amber-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (orderId: number) => void;
  orderId: number;
  amount: number;
  productName: string;
}

export default function CryptoCheckoutModal({ open, onClose, onSuccess, orderId, amount, productName }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChain, setSelectedChain] = useState("USDT_TRC20");
  const [txHash, setTxHash] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [expiresAt] = useState(() => new Date(Date.now() + 30 * 60 * 1000));
  const [expired, setExpired] = useState(false);

  const { data: walletData } = useGetWalletAddresses({ query: { enabled: open } });
  const { data: settings } = useSettings();
  const submitPayment = useSubmitPayment();

  const wallets = (walletData?.wallets ?? []) as Array<{
    id: number; chain: string; address: string; label: string | null; customMessage?: string | null; isActive: boolean;
  }>;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    toast({ description: "Address copied!" });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleExpire = useCallback(() => setExpired(true), []);

  const handleSubmit = () => {
    if (!txHash.trim()) {
      toast({ title: "Required", description: "Please enter your Transaction Hash (TXID).", variant: "destructive" });
      return;
    }
    submitPayment.mutate({
      data: { orderId, chain: selectedChain, txHash: txHash.trim(), amount, screenshotUrl: proofUrl || undefined }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries();
        onSuccess(orderId);
      },
      onError: (err: any) => {
        toast({ title: "Submission Failed", description: err?.message || "Please try again.", variant: "destructive" });
      }
    });
  };

  const paymentInstructions = settings?.payment_instructions ??
    "Send the exact USDT amount to the address shown, then submit your TXID and proof screenshot.";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-full bg-[#0f0f1a] border border-purple-500/20 p-0 overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-900/50 to-blue-900/30 px-6 pt-6 pb-4 border-b border-purple-500/20">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <DialogTitle className="text-lg font-bold text-white">Crypto Checkout</DialogTitle>
              </div>
              {!expired ? (
                <CountdownTimer expiresAt={expiresAt} onExpire={handleExpire} />
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" /> Expired
                </Badge>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-purple-300/70 truncate max-w-[240px]">{productName}</p>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">${amount.toFixed(2)}</p>
                <p className="text-xs text-purple-300/70">USDT</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-5">
          {/* Instructions */}
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3 text-xs text-purple-200/70 leading-relaxed">
            <Shield className="w-3.5 h-3.5 inline mr-1.5 text-purple-400" />
            {paymentInstructions}
          </div>

          {/* Network Selection */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Select Payment Network</Label>
            <Tabs value={selectedChain} onValueChange={setSelectedChain}>
              <TabsList className="grid grid-cols-3 gap-1 h-auto bg-transparent p-0">
                {(["USDT_TRC20", "USDT_TON", "USDT_BEP20"] as const).map(chain => {
                  const meta = CHAIN_META[chain];
                  const active = selectedChain === chain;
                  return (
                    <TabsTrigger
                      key={chain}
                      value={chain}
                      className={`flex flex-col gap-0.5 py-2 px-3 rounded-xl border transition-all data-[state=active]:shadow-none ${
                        active
                          ? `${meta.bg} ${meta.border} ${meta.color}`
                          : "bg-white/[0.03] border-white/10 text-muted-foreground hover:border-white/20"
                      }`}
                    >
                      <span className="text-base">{meta.icon}</span>
                      <span className="text-[11px] font-semibold">{meta.name}</span>
                      <span className="text-[9px] opacity-70">{meta.network}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {(["USDT_TRC20", "USDT_TON", "USDT_BEP20"] as const).map(chain => {
                const wallet = wallets.find(w => w.chain === chain);
                const meta = CHAIN_META[chain];
                return (
                  <TabsContent key={chain} value={chain} className="mt-4 space-y-3">
                    {wallet ? (
                      <div className={`rounded-xl border p-4 space-y-3 ${meta.bg} ${meta.border}`}>
                        <QRCode data={wallet.address} />
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block text-center">
                            Send exactly <strong>{amount} USDT</strong> to:
                          </Label>
                          <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2 border border-white/10">
                            <code className={`text-xs flex-1 break-all ${meta.color}`}>{wallet.address}</code>
                            <Button
                              variant="ghost" size="icon"
                              className="h-7 w-7 shrink-0 hover:bg-white/10"
                              onClick={() => handleCopy(wallet.address)}
                            >
                              {copied === wallet.address
                                ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                                : <Copy className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                        </div>
                        {wallet.customMessage && (
                          <p className={`text-xs ${meta.color} opacity-80 text-center`}>{wallet.customMessage}</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground text-sm bg-muted/20 rounded-xl border border-border/30">
                        This network is not configured yet.
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>

          <Separator className="bg-white/5" />

          {/* Payment Proof */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                Transaction Hash (TXID) <span className="text-red-400">*</span>
              </Label>
              <Input
                placeholder="e.g. 0x8f3b2c1d... or TxHash from your wallet"
                className="bg-black/30 border-white/10 font-mono text-xs h-10 focus:border-purple-500/50"
                value={txHash}
                onChange={e => setTxHash(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">Copy the TXID from your crypto wallet transaction history.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                Payment Screenshot URL <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                placeholder="https://imgbb.com/... or imgur.com/..."
                className="bg-black/30 border-white/10 text-xs h-10 focus:border-purple-500/50"
                value={proofUrl}
                onChange={e => setProofUrl(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Upload your screenshot to imgbb.com or imgur.com and paste the URL here.
              </p>
            </div>
          </div>

          {expired && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Payment window expired. Please close and create a new order.
            </div>
          )}

          <Button
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm gap-2 shadow-lg shadow-purple-500/25"
            onClick={handleSubmit}
            disabled={submitPayment.isPending || expired || !txHash.trim()}
          >
            {submitPayment.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                I Have Completed Payment
              </span>
            )}
          </Button>

          <p className="text-[10px] text-center text-muted-foreground">
            Order #{orderId} · Secured by DigiMarket Escrow
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
