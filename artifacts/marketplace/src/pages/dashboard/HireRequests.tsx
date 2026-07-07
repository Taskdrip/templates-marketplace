import { useState, useRef } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useHireRequests, useHireRequestMilestones, useSubmitMilestonePayment } from "@/hooks/useHireRequests";
import { useSettings } from "@/hooks/useSettings";
import { useGetWalletAddresses } from "@workspace/api-client-react";
import { usePi } from "@/contexts/PiContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight, Plus, Clock, CheckCircle2, XCircle, AlertCircle,
  Wrench, MessageSquare, Phone, Send, Lock, PlayCircle, Unlock,
  FileText, Copy, Check, Loader2, X, Upload, ImageIcon, Shield,
  ChevronDown, ChevronUp, Printer, ExternalLink, Server, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:            { label: "Pending Review", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: <Clock className="w-3 h-3" /> },
  reviewing:          { label: "Under Review",   color: "bg-blue-500/10 text-blue-400 border-blue-500/30",    icon: <AlertCircle className="w-3 h-3" /> },
  in_progress:        { label: "In Progress",    color: "bg-violet-500/10 text-violet-400 border-violet-500/30", icon: <Wrench className="w-3 h-3" /> },
  completed:          { label: "Completed",      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelled:          { label: "Cancelled",      color: "bg-red-500/10 text-red-400 border-red-500/30",      icon: <XCircle className="w-3 h-3" /> },
};

const TYPE_LABELS: Record<string, string> = {
  "web-app": "Web App / SaaS", "mobile-app": "Mobile App", "defi": "DeFi / Blockchain",
  "bot": "Bot / Automation", "script-api": "Script / API", "pi-tool": "Pi Network Tool", "other": "Other",
};

const MILESTONE_STATUS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  locked:             { label: "Locked",            color: "border-border/40 text-muted-foreground",         icon: <Lock className="w-3 h-3" /> },
  active:             { label: "Ready to Pay",      color: "border-yellow-500/40 text-yellow-400",           icon: <PlayCircle className="w-3 h-3" /> },
  payment_submitted:  { label: "Payment Submitted", color: "border-blue-500/40 text-blue-400",               icon: <Clock className="w-3 h-3" /> },
  released:           { label: "Released",          color: "border-emerald-500/40 text-emerald-400",         icon: <Unlock className="w-3 h-3" /> },
};

function QRCode({ data }: { data: string }) {
  const encoded = encodeURIComponent(data);
  return (
    <div className="w-28 h-28 bg-white rounded-xl p-2 mx-auto shadow-lg shadow-black/30">
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encoded}&bgcolor=ffffff&color=000000`}
        alt="QR Code"
        className="w-full h-full object-contain rounded-lg"
      />
    </div>
  );
}

interface MilestonePayModalProps {
  open: boolean;
  onClose: () => void;
  milestone: { id: number; title: string; amountPi: string; requestId: number };
  requestTitle: string;
}

function MilestonePayModal({ open, onClose, milestone, requestTitle }: MilestonePayModalProps) {
  const { toast } = useToast();
  const { isInPiBrowser, piSdkReady, createPiPayment } = usePi();
  const submitPayment = useSubmitMilestonePayment();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPiPending, setIsPiPending] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [mode, setMode] = useState<"pi-sdk" | "manual">(
    isInPiBrowser && piSdkReady ? "pi-sdk" : "manual"
  );

  const { data: walletData } = useGetWalletAddresses({ query: { enabled: open } });
  const piWallet = (walletData?.wallets as any[] ?? []).find((w: any) => w.chain === "PI");

  const amount = Number(milestone.amountPi);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    toast({ description: "Address copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const token = localStorage.getItem("cm_token");
      const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setProofUrl(data.url);
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
      setProofPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePiSdkPay = () => {
    setIsPiPending(true);
    createPiPayment(
      {
        amount,
        memo: `Milestone: ${milestone.title.slice(0, 50)}`,
        metadata: { milestoneId: milestone.id, requestTitle },
      },
      {
        onReadyForServerApproval: (paymentId) => setTxHash(paymentId),
        onReadyForServerCompletion: (_paymentId, txid) => {
          submitPayment.mutate(
            { id: milestone.id, txHash: txid || _paymentId, requestId: milestone.requestId },
            {
              onSuccess: () => { setIsPiPending(false); toast({ description: "Milestone payment submitted! Admin will verify shortly." }); onClose(); },
              onError: () => { setIsPiPending(false); toast({ title: "Submission error", description: "Pi sent but submission failed. Contact support.", variant: "destructive" }); },
            }
          );
        },
        onCancel: () => { setIsPiPending(false); toast({ description: "Payment cancelled." }); },
        onError: (err) => { setIsPiPending(false); toast({ title: "Pi error", description: err.message, variant: "destructive" }); },
      }
    );
  };

  const handleManualSubmit = () => {
    if (!txHash.trim()) {
      toast({ title: "Required", description: "Please enter your Pi Transaction ID.", variant: "destructive" });
      return;
    }
    submitPayment.mutate(
      { id: milestone.id, txHash: txHash.trim(), requestId: milestone.requestId },
      {
        onSuccess: () => { toast({ description: "Payment submitted! Admin will verify and release milestone." }); onClose(); },
        onError: (err: any) => toast({ title: "Failed", description: err?.message || "Please try again.", variant: "destructive" }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full bg-[#08041a] border border-violet-500/20 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-violet-900/60 to-purple-900/40 px-6 pt-5 pb-4 border-b border-violet-500/20">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <span className="text-lg font-black text-purple-900" style={{ fontFamily: "serif" }}>π</span>
              </div>
              <DialogTitle className="text-base font-bold text-white">Pay Milestone</DialogTitle>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{milestone.title}</p>
                <p className="text-xs text-violet-300/70 mt-0.5 truncate max-w-[220px]">{requestTitle}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-white flex items-center gap-1">
                  <span className="text-yellow-400 font-black" style={{ fontFamily: "serif" }}>π</span>
                  {amount.toFixed(2)}
                </p>
                <p className="text-xs text-violet-300/70">Pi</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-3 text-xs text-violet-200/70 flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 shrink-0 text-violet-400 mt-0.5" />
            Send exactly <strong className="text-yellow-400 mx-1">π{amount.toFixed(2)} Pi</strong> to the escrow wallet, then submit your Transaction ID below.
          </div>

          {isInPiBrowser && piSdkReady && (
            <div className="flex gap-2">
              <button
                onClick={() => setMode("pi-sdk")}
                className={cn("flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all",
                  mode === "pi-sdk" ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-400" : "bg-white/[0.03] border-white/10 text-muted-foreground hover:border-white/20"
                )}
              >
                <span className="text-xl font-black" style={{ fontFamily: "serif" }}>π</span>
                <span>Pi Browser Pay</span>
              </button>
              <button
                onClick={() => setMode("manual")}
                className={cn("flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all",
                  mode === "manual" ? "bg-violet-500/10 border-violet-500/40 text-violet-400" : "bg-white/[0.03] border-white/10 text-muted-foreground hover:border-white/20"
                )}
              >
                <Upload className="w-4 h-4" />
                <span>Manual TXID</span>
              </button>
            </div>
          )}

          {isInPiBrowser && piSdkReady && mode === "pi-sdk" ? (
            <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-5 flex flex-col items-center gap-4">
              <div className="text-5xl font-black text-yellow-400" style={{ fontFamily: "serif" }}>π</div>
              <p className="text-sm font-semibold text-white">π{amount.toFixed(2)} Pi</p>
              <Button
                className="w-full h-11 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-purple-900 font-bold gap-2"
                onClick={handlePiSdkPay}
                disabled={isPiPending}
              >
                {isPiPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : <><span className="text-lg font-black" style={{ fontFamily: "serif" }}>π</span> Pay with Pi Browser</>}
              </Button>
            </div>
          ) : (
            <>
              {piWallet && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
                  <QRCode data={piWallet.address} />
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block text-center">
                      Send <strong className="text-yellow-400">π{amount.toFixed(2)} Pi</strong> to:
                    </Label>
                    <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2 border border-white/10">
                      <code className="text-xs flex-1 break-all text-violet-300">{piWallet.address}</code>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 hover:bg-white/10" onClick={() => handleCopy(piWallet.address)}>
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5">
                  Pi Transaction ID (TXID) <span className="text-red-400">*</span>
                </Label>
                <Input
                  placeholder="Paste your Pi TXID here"
                  className="bg-black/30 border-white/10 font-mono text-xs h-10"
                  value={txHash}
                  onChange={e => setTxHash(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">Find your TXID in Pi Browser → Wallet → Transaction History</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-violet-400" />
                  Screenshot <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                {proofPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-violet-500/30 bg-black/30">
                    <img src={proofPreview} alt="Proof" className="w-full max-h-36 object-contain" />
                    {isUploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="w-5 h-5 text-white animate-spin" /></div>}
                    {!isUploading && proofUrl && <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Uploaded</div>}
                    <button onClick={() => { setProofPreview(null); setProofUrl(""); }} className="absolute top-2 left-2 bg-black/70 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-violet-500/30 hover:border-violet-500/60 bg-violet-500/5 hover:bg-violet-500/10 rounded-xl p-4 transition-all flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="w-6 h-6 opacity-60" />
                    <span className="text-xs">Click to upload screenshot</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              <Button
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-semibold gap-2"
                onClick={handleManualSubmit}
                disabled={submitPayment.isPending || !txHash.trim() || isUploading}
              >
                {submitPayment.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Check className="w-4 h-4" /> Submit Pi Payment</>}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  request: any;
  milestones: any[];
}

function InvoiceModal({ open, onClose, request, milestones }: InvoiceModalProps) {
  const now = new Date();
  const totalPi = milestones.reduce((s, m) => s + Number(m.amountPi), 0);
  const paidPi = milestones.filter(m => m.status === "released").reduce((s, m) => s + Number(m.amountPi), 0);
  const invoiceNum = `INV-${String(request.id).padStart(4, "0")}`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl w-full bg-[#08041a] border border-violet-500/20 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6" id="invoice-print-area">
          {/* Invoice Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
                  <span className="text-xl font-black text-white" style={{ fontFamily: "serif" }}>π</span>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Breedskoolpi</p>
                  <p className="text-xs text-muted-foreground">Pi Network Marketplace</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Development Services</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{invoiceNum}</p>
              <p className="text-xs text-muted-foreground mt-1">Issued: {now.toLocaleDateString()}</p>
              <Badge className={cn("mt-2 text-xs", request.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-violet-500/10 text-violet-400 border-violet-500/30")}>
                {request.status === "completed" ? "Paid" : "In Progress"}
              </Badge>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Project Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Project</p>
              <p className="font-semibold text-white">{request.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{TYPE_LABELS[request.appType] || request.appType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Request ID</p>
              <p className="font-semibold text-white">#{request.id}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Submitted {new Date(request.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Milestones Table */}
          {milestones.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Payment Schedule</p>
              <div className="space-y-1.5">
                <div className="grid grid-cols-12 text-[10px] text-muted-foreground/60 uppercase tracking-wider px-2 pb-1 border-b border-white/5">
                  <span className="col-span-1">#</span>
                  <span className="col-span-6">Milestone</span>
                  <span className="col-span-2 text-right">Amount</span>
                  <span className="col-span-3 text-right">Status</span>
                </div>
                {milestones.map((m, i) => {
                  const ms = MILESTONE_STATUS[m.status] ?? MILESTONE_STATUS.locked;
                  return (
                    <div key={m.id} className={cn("grid grid-cols-12 items-center px-3 py-2.5 rounded-lg border text-sm",
                      m.status === "released" ? "bg-emerald-500/5 border-emerald-500/15" :
                      m.status === "active" ? "bg-yellow-500/5 border-yellow-500/20" :
                      m.status === "payment_submitted" ? "bg-blue-500/5 border-blue-500/15" :
                      "bg-white/[0.02] border-white/5"
                    )}>
                      <span className="col-span-1 text-xs text-muted-foreground font-mono">{i + 1}</span>
                      <div className="col-span-6">
                        <p className="font-medium text-xs text-white">{m.title}</p>
                        {m.description && <p className="text-[10px] text-muted-foreground">{m.description}</p>}
                        {m.paidTxHash && <p className="text-[9px] text-muted-foreground/60 font-mono mt-0.5 truncate">TXID: {m.paidTxHash}</p>}
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-xs font-bold text-yellow-400">
                          <span style={{ fontFamily: "serif" }}>π</span>{Number(m.amountPi).toFixed(2)}
                        </span>
                      </div>
                      <div className="col-span-3 flex justify-end">
                        <Badge variant="outline" className={cn("text-[9px] flex items-center gap-1", ms.color)}>
                          {ms.icon} {ms.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Project Value</span>
                  <span className="font-bold text-white"><span style={{ fontFamily: "serif" }}>π</span>{totalPi.toFixed(2)} Pi</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Released</span>
                  <span className="font-semibold text-emerald-400"><span style={{ fontFamily: "serif" }}>π</span>{paidPi.toFixed(2)} Pi</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-semibold">Remaining</span>
                  <span className="font-bold text-yellow-400"><span style={{ fontFamily: "serif" }}>π</span>{(totalPi - paidPi).toFixed(2)} Pi</span>
                </div>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {request.adminNotes && (
            <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-3">
              <p className="text-xs font-semibold text-violet-400 mb-1">Developer Note:</p>
              <p className="text-xs text-violet-200">{request.adminNotes}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 border-border/40 gap-2 text-sm" onClick={onClose}>
              <X className="w-4 h-4" /> Close
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white gap-2 text-sm"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MilestoneSection({ requestId, requestTitle }: { requestId: number; requestTitle: string }) {
  const { data: milestones, isLoading } = useHireRequestMilestones(requestId);
  const [payingMilestone, setPayingMilestone] = useState<any | null>(null);

  if (isLoading) return <div className="h-8 bg-muted/30 animate-pulse rounded-lg mt-3" />;
  if (!milestones?.length) return null;

  const released = milestones.filter(m => m.status === "released").length;
  const totalPi = milestones.reduce((s, m) => s + Number(m.amountPi), 0);
  const paidPi = milestones.filter(m => m.status === "released").reduce((s, m) => s + Number(m.amountPi), 0);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="font-semibold uppercase tracking-wide">Payment Milestones</span>
        <span>{released}/{milestones.length} released · <span style={{ fontFamily: "serif" }}>π</span>{paidPi.toFixed(2)}/{totalPi.toFixed(2)} Pi</span>
      </div>
      <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full transition-all"
          style={{ width: `${totalPi > 0 ? (paidPi / totalPi) * 100 : 0}%` }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        {milestones.map((m, i) => {
          const ms = MILESTONE_STATUS[m.status] ?? MILESTONE_STATUS.locked;
          return (
            <div key={m.id} className={cn("flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg border",
              m.status === "released" ? "bg-emerald-500/5 border-emerald-500/20" :
              m.status === "active" ? "bg-yellow-500/5 border-yellow-500/25" :
              m.status === "payment_submitted" ? "bg-blue-500/5 border-blue-500/20" :
              "bg-muted/30 border-border/30"
            )}>
              <span className="text-muted-foreground font-mono w-4 shrink-0">{i + 1}.</span>
              {ms.icon}
              <div className="flex-1 min-w-0">
                <p className={cn("truncate font-medium", m.status === "released" ? "text-emerald-300" : m.status === "active" ? "text-yellow-300" : m.status === "payment_submitted" ? "text-blue-300" : "text-muted-foreground")}>
                  {m.title}
                </p>
                {m.paidTxHash && <p className="text-[9px] text-muted-foreground/60 font-mono truncate">TXID: {m.paidTxHash}</p>}
              </div>
              <span className="font-bold shrink-0 text-[10px] text-yellow-400">
                <span style={{ fontFamily: "serif" }}>π</span>{Number(m.amountPi).toFixed(2)}
              </span>
              {m.status === "active" ? (
                <Button
                  size="sm"
                  className="h-6 text-[10px] px-2.5 bg-gradient-to-r from-yellow-500 to-yellow-400 text-purple-900 font-bold hover:from-yellow-400 hover:to-yellow-300 shrink-0"
                  onClick={() => setPayingMilestone(m)}
                >
                  Pay Now
                </Button>
              ) : (
                <Badge variant="outline" className={cn("text-[9px] shrink-0", ms.color)}>
                  {ms.label}
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {payingMilestone && (
        <MilestonePayModal
          open={!!payingMilestone}
          onClose={() => setPayingMilestone(null)}
          milestone={payingMilestone}
          requestTitle={requestTitle}
        />
      )}
    </div>
  );
}

function HireRequestCard({ req, settings }: { req: any; settings: any }) {
  const { data: milestones } = useHireRequestMilestones(req.id);
  const [expanded, setExpanded] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const status = STATUS_MAP[req.status] ?? STATUS_MAP.pending;
  const whatsappNumber = settings?.hire_whatsapp?.replace(/\D/g, "") || "";
  const telegramHandle = settings?.hire_telegram?.replace("@", "") || "";
  const message = encodeURIComponent(`Hi! Regarding my hire request #${req.id}: "${req.title}". I'd like to follow up.`);
  const hasMilestones = milestones && milestones.length > 0;
  const hasActiveMilestone = milestones?.some(m => m.status === "active");

  return (
    <Card className={cn("bg-card/50 border-border/50 transition-all", hasActiveMilestone && "border-yellow-500/30 shadow-lg shadow-yellow-500/5")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-base truncate">{req.title}</h3>
              <Badge className={`${status.color} flex items-center gap-1 text-xs shrink-0`}>
                {status.icon} {status.label}
              </Badge>
              {hasActiveMilestone && (
                <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 text-[10px] animate-pulse">
                  Action Required
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{req.description}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-muted-foreground">#{req.id}</span>
            <button onClick={() => setExpanded(e => !e)} className="ml-1 p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {req.appType && <Badge variant="outline" className="text-[10px] border-border/50">{TYPE_LABELS[req.appType] || req.appType}</Badge>}
              {req.blockchainType && <Badge variant="outline" className="text-[10px] border-border/50 text-yellow-400 border-yellow-500/20">{req.blockchainType === "pi" ? "π Pi Network" : req.blockchainType}</Badge>}
              {(req.budgetMin || req.budgetMax) && (
                <Badge variant="outline" className="text-[10px] border-border/50">
                  <span className="text-yellow-400 font-black mr-0.5" style={{ fontFamily: "serif" }}>π</span>
                  {req.budgetMin && req.budgetMax ? `${req.budgetMin}–${req.budgetMax}` : req.budgetMin || req.budgetMax}
                </Badge>
              )}
              {req.timeline && <Badge variant="outline" className="text-[10px] border-border/50">{req.timeline}</Badge>}
              {req.includesHosting && (
                <Badge variant="outline" className="text-[10px] text-violet-400 border-violet-500/20 flex items-center gap-1">
                  <Server className="w-2.5 h-2.5" /> Hosting {req.hostingMonths ? `(${req.hostingMonths}mo)` : ""}
                </Badge>
              )}
              {req.includesDomain && (
                <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/20 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" /> Domain
                </Badge>
              )}
            </div>

            {req.adminNotes && (
              <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground font-semibold mb-1">Developer Note:</p>
                <p className="text-xs text-violet-200">{req.adminNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Milestone progress always visible */}
        <MilestoneSection requestId={req.id} requestTitle={req.title} />

        <div className="flex items-center gap-2 pt-3 border-t border-border/30 mt-3 flex-wrap">
          <span className="text-[10px] text-muted-foreground mr-auto">{new Date(req.createdAt).toLocaleDateString()}</span>
          {hasMilestones && (
            <Button size="sm" variant="outline" className="h-7 text-xs border-violet-500/30 text-violet-400 hover:bg-violet-500/10 gap-1" onClick={() => setShowInvoice(true)}>
              <FileText className="w-3 h-3" /> Invoice
            </Button>
          )}
          {whatsappNumber && (
            <a href={`https://wa.me/${whatsappNumber}?text=${message}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-1">
                <Phone className="w-3 h-3" /> WhatsApp
              </Button>
            </a>
          )}
          {telegramHandle && (
            <a href={`https://t.me/${telegramHandle}?text=${message}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="h-7 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10 gap-1">
                <Send className="w-3 h-3" /> Telegram
              </Button>
            </a>
          )}
          <Link href="/dashboard/messages">
            <Button size="sm" variant="outline" className="h-7 text-xs border-violet-500/30 text-violet-400 hover:bg-violet-500/10 gap-1">
              <MessageSquare className="w-3 h-3" /> Chat
            </Button>
          </Link>
        </div>
      </CardContent>

      {showInvoice && milestones && (
        <InvoiceModal
          open={showInvoice}
          onClose={() => setShowInvoice(false)}
          request={req}
          milestones={milestones}
        />
      )}
    </Card>
  );
}

export default function HireRequestsDashboard() {
  const { data: requests, isLoading } = useHireRequests();
  const { data: settings } = useSettings();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hire Requests</h1>
          <p className="text-muted-foreground mt-1">Track your custom development projects and pay milestones with Pi</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 gap-2">
          <Link href="/hire/submit">
            <Plus className="w-4 h-4" /> New Request
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : !requests?.length ? (
        <Card className="bg-card/50 border-border/50 border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
              <span className="text-3xl font-black text-violet-400" style={{ fontFamily: "serif" }}>π</span>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">No requests yet</h3>
              <p className="text-sm text-muted-foreground">Submit your first project brief and our developer will respond within 24 hours with a quote.</p>
            </div>
            <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-700 gap-2">
              <Link href="/hire/submit"><Plus className="w-4 h-4" /> Submit a Project</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <HireRequestCard key={req.id} req={req} settings={settings} />
          ))}
        </div>
      )}
    </div>
  );
}
