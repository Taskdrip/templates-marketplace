import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGetWalletAddresses, useSubmitPayment } from "@workspace/api-client-react";
import { useSettings } from "@/hooks/useSettings";
import { useQueryClient } from "@tanstack/react-query";
import { usePi } from "@/contexts/PiContext";
import {
  Copy, Check, Clock, Shield, Upload, AlertTriangle, Zap,
  ChevronRight, X, ImageIcon, Loader2, ExternalLink,
} from "lucide-react";

const PI_SYMBOL = "π";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isInPiBrowser, piSdkReady, createPiPayment } = usePi();

  const [txHash, setTxHash] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPiPaymentPending, setIsPiPaymentPending] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [expiresAt] = useState(() => new Date(Date.now() + 30 * 60 * 1000));
  const [expired, setExpired] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"pi-sdk" | "manual">(
    isInPiBrowser && piSdkReady ? "pi-sdk" : "manual"
  );

  const { data: walletData } = useGetWalletAddresses({ query: { enabled: open } });
  const { data: settings } = useSettings();
  const submitPayment = useSubmitPayment();

  const piWallet = (walletData?.wallets as any[] ?? []).find((w: any) => w.chain === "PI");

  useEffect(() => {
    setPaymentMode(isInPiBrowser && piSdkReady ? "pi-sdk" : "manual");
  }, [isInPiBrowser, piSdkReady]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    toast({ description: "Address copied!" });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleExpire = useCallback(() => setExpired(true), []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const token = localStorage.getItem("cm_token");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setProofUrl(data.url);
      toast({ description: "Screenshot uploaded ✓" });
    } catch {
      toast({ title: "Upload failed", description: "Could not upload screenshot.", variant: "destructive" });
      setProofPreview(null);
      setProofUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  const removeProof = () => {
    setProofUrl("");
    setProofPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePiPayment = () => {
    setIsPiPaymentPending(true);
    createPiPayment(
      {
        amount,
        memo: `Breedskoolpi: ${productName.slice(0, 50)}`,
        metadata: { orderId, productName },
      },
      {
        onReadyForServerApproval: (paymentId) => {
          console.log("Pi payment ready for approval:", paymentId);
          setTxHash(paymentId);
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          submitPayment.mutate(
            { data: { orderId, chain: "PI", txHash: txid || paymentId, amount } },
            {
              onSuccess: () => {
                queryClient.invalidateQueries();
                setIsPiPaymentPending(false);
                onSuccess(orderId);
              },
              onError: () => {
                setIsPiPaymentPending(false);
                toast({ title: "Submission error", description: "Pi payment sent but submission failed. Contact support.", variant: "destructive" });
              },
            }
          );
        },
        onCancel: (paymentId) => {
          console.log("Pi payment cancelled:", paymentId);
          setIsPiPaymentPending(false);
          toast({ title: "Payment cancelled", description: "You cancelled the Pi payment." });
        },
        onError: (error) => {
          console.error("Pi payment error:", error);
          setIsPiPaymentPending(false);
          toast({ title: "Pi payment error", description: error.message, variant: "destructive" });
        },
      }
    );
  };

  const handleManualSubmit = () => {
    if (!txHash.trim()) {
      toast({ title: "Required", description: "Please enter your Pi Transaction ID (TXID).", variant: "destructive" });
      return;
    }
    submitPayment.mutate(
      { data: { orderId, chain: "PI", txHash: txHash.trim(), amount, screenshotUrl: proofUrl || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries();
          onSuccess(orderId);
        },
        onError: (err: any) => {
          toast({ title: "Submission Failed", description: err?.message || "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const paymentInstructions = settings?.payment_instructions ??
    `Send exactly ${PI_SYMBOL}${amount.toFixed(2)} Pi to the escrow wallet address below, then submit your Pi Transaction ID as proof.`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-full bg-[#08041a] border border-violet-500/20 p-0 overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-violet-900/60 to-purple-900/40 px-6 pt-6 pb-4 border-b border-violet-500/20">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <span className="text-lg font-black text-white" style={{ fontFamily: "serif" }}>π</span>
                </div>
                <DialogTitle className="text-lg font-bold text-white">Pi Checkout</DialogTitle>
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
              <p className="text-xs text-violet-300/70 truncate max-w-[200px]">{productName}</p>
              <div className="text-right">
                <p className="text-2xl font-bold text-white flex items-center gap-1">
                  <span className="text-yellow-400 font-black" style={{ fontFamily: "serif" }}>π</span>
                  {amount.toFixed(2)}
                </p>
                <p className="text-xs text-violet-300/70">Pi Network</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-5">
          {/* Instructions */}
          <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-3 text-xs text-violet-200/70 leading-relaxed">
            <Shield className="w-3.5 h-3.5 inline mr-1.5 text-violet-400" />
            {paymentInstructions}
          </div>

          {/* Pi Browser SDK payment */}
          {isInPiBrowser && piSdkReady && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground">Payment Method</Label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMode("pi-sdk")}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-sm font-medium ${
                    paymentMode === "pi-sdk"
                      ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-400"
                      : "bg-white/[0.03] border-white/10 text-muted-foreground hover:border-white/20"
                  }`}
                >
                  <span className="text-2xl font-black" style={{ fontFamily: "serif" }}>π</span>
                  <span className="text-xs">Pi Browser Pay</span>
                  <span className="text-[9px] opacity-60">Recommended</span>
                </button>
                <button
                  onClick={() => setPaymentMode("manual")}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-sm font-medium ${
                    paymentMode === "manual"
                      ? "bg-violet-500/10 border-violet-500/40 text-violet-400"
                      : "bg-white/[0.03] border-white/10 text-muted-foreground hover:border-white/20"
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Manual Proof</span>
                  <span className="text-[9px] opacity-60">Upload TXID</span>
                </button>
              </div>

              {paymentMode === "pi-sdk" && (
                <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-5 flex flex-col items-center gap-4">
                  <div className="text-center">
                    <div className="text-5xl font-black text-yellow-400 mb-1" style={{ fontFamily: "serif" }}>π</div>
                    <p className="text-sm font-semibold text-white">{PI_SYMBOL}{amount.toFixed(2)} Pi</p>
                    <p className="text-xs text-muted-foreground mt-1">Click below to pay via Pi Browser</p>
                  </div>
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-purple-900 font-bold text-sm gap-2 shadow-lg shadow-yellow-500/20"
                    onClick={handlePiPayment}
                    disabled={isPiPaymentPending || expired}
                  >
                    {isPiPaymentPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing Pi Payment…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="text-lg font-black" style={{ fontFamily: "serif" }}>π</span>
                        Pay {PI_SYMBOL}{amount.toFixed(2)} with Pi
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Non-Pi-Browser info */}
          {!isInPiBrowser && (
            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center shrink-0">
                <span className="text-xl font-black text-yellow-400" style={{ fontFamily: "serif" }}>π</span>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-300">Pay via Pi Browser</p>
                <p className="text-xs text-muted-foreground mt-0.5">Open this page in the <strong className="text-yellow-400">Pi Browser</strong> app to pay directly with Pi. Or submit your Pi TXID below after paying manually.</p>
              </div>
            </div>
          )}

          {/* Manual payment section */}
          {(paymentMode === "manual" || !isInPiBrowser) && (
            <>
              {/* Pi wallet address */}
              {piWallet && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
                  <QRCode data={piWallet.address} />
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block text-center">
                      Send exactly <strong className="text-yellow-400">{PI_SYMBOL}{amount.toFixed(2)} Pi</strong> to:
                    </Label>
                    <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2 border border-white/10">
                      <code className="text-xs flex-1 break-all text-violet-300">{piWallet.address}</code>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 shrink-0 hover:bg-white/10"
                        onClick={() => handleCopy(piWallet.address)}
                      >
                        {copied === piWallet.address
                          ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                          : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                    {piWallet.customMessage && (
                      <p className="text-xs text-violet-400/80 text-center mt-2">{piWallet.customMessage}</p>
                    )}
                  </div>
                </div>
              )}

              <Separator className="bg-white/5" />

              {/* TXID input */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
                    Pi Transaction ID (TXID) <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    placeholder="Paste your Pi payment Transaction ID"
                    className="bg-black/30 border-white/10 font-mono text-xs h-10 focus:border-violet-500/50"
                    value={txHash}
                    onChange={e => setTxHash(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">Find the TXID in Pi Browser → Wallet → Transaction History.</p>
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-violet-400" />
                    Payment Screenshot <span className="text-muted-foreground text-xs">(optional but recommended)</span>
                  </Label>

                  {proofPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-violet-500/30 bg-black/30">
                      <img src={proofPreview} alt="Payment proof" className="w-full max-h-48 object-contain" />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                          <span className="ml-2 text-white text-sm">Uploading…</span>
                        </div>
                      )}
                      {!isUploading && proofUrl && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-full">
                          <Check className="w-3 h-3" /> Uploaded
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={removeProof}
                        className="absolute top-2 left-2 bg-black/70 hover:bg-black text-white rounded-full p-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-violet-500/30 hover:border-violet-500/60 bg-violet-500/5 hover:bg-violet-500/10 rounded-xl p-6 transition-all flex flex-col items-center gap-2 text-muted-foreground hover:text-violet-300"
                    >
                      <ImageIcon className="w-8 h-8 opacity-60" />
                      <span className="text-sm font-medium">Click to upload screenshot</span>
                      <span className="text-xs opacity-60">JPEG, PNG, WebP up to 10 MB</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {expired && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Payment window expired. Please close and create a new order.
                </div>
              )}

              <Button
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-semibold text-sm gap-2 shadow-lg shadow-violet-500/25"
                onClick={handleManualSubmit}
                disabled={submitPayment.isPending || expired || !txHash.trim() || isUploading}
              >
                {submitPayment.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    I've Completed Pi Payment
                  </span>
                )}
              </Button>
            </>
          )}

          <p className="text-[10px] text-center text-muted-foreground">
            Order #{orderId} · Secured by Breedskoolpi Escrow · <span className="font-black" style={{ fontFamily: "serif" }}>π</span> Pi Network
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
