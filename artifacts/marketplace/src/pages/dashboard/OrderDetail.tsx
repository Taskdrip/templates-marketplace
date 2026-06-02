import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetOrder, useGetWalletAddresses, useGetMessages } from "@workspace/api-client-react";
import { useSubmitPayment, useSendMessage, useStartConversation, useConfirmReceipt } from "@/hooks/useMutations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle2, AlertCircle, Clock, Check, Download, Package, MessageCircle, Send, User, ShieldCheck, ThumbsUp } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetOrderQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// ─── Escrow Chat ─────────────────────────────────────────────────────────────

interface EscrowChatProps {
  orderId: number;
}

function EscrowChat({ orderId }: EscrowChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [convId, setConvId] = useState<number | null>(null);

  const startConversation = useStartConversation();
  const sendMessage = useSendMessage();

  useEffect(() => {
    startConversation.mutate(
      { data: { subject: `Order #${orderId} Escrow Chat`, orderId } as any },
      { onSuccess: (conv: any) => setConvId(conv.id) }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const { data: msgData, refetch } = useGetMessages(
    convId as number,
    { query: { enabled: !!convId, refetchInterval: 5000 } }
  );

  const messages = (msgData as any)?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !convId) return;
    const content = text.trim();
    setText("");
    sendMessage.mutate(
      { conversationId: convId, data: { content } },
      {
        onSuccess: () => refetch(),
        onError: () => toast({ title: "Send failed", variant: "destructive" }),
      }
    );
  };

  if (!convId) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
        Starting escrow chat...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageCircle className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
            <p className="text-xs mt-1 opacity-60">Admin will reply within minutes.</p>
          </div>
        )}
        {messages.map((msg: any) => {
          const isMe = msg.senderId === user?.id;
          const isAdmin = msg.senderRole === "admin";
          return (
            <div key={msg.id} className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                isAdmin ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
              )}>
                {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div className={cn("max-w-[75%]", isMe ? "items-end" : "items-start", "flex flex-col gap-0.5")}>
                <div className={cn("flex items-center gap-1 text-[10px] text-muted-foreground", isMe && "flex-row-reverse")}>
                  <span className={isAdmin ? "text-purple-400 font-medium" : ""}>{isAdmin ? "Admin" : (msg.senderName || "You")}</span>
                  <span>·</span>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className={cn(
                  "rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  isMe
                    ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-tr-sm"
                    : isAdmin
                      ? "bg-purple-500/10 border border-purple-500/20 text-foreground rounded-tl-sm"
                      : "bg-muted/50 text-foreground rounded-tl-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border/40 p-3 flex gap-2">
        <Input
          className="flex-1 bg-background text-sm h-9"
          placeholder="Message admin about this order..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
        />
        <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSend} disabled={!text.trim() || sendMessage.isPending}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main OrderDetail ─────────────────────────────────────────────────────────

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: order, isLoading: isOrderLoading } = useGetOrder(id, {
    query: { enabled: !isNaN(id) }
  });
  
  const { data: walletData } = useGetWalletAddresses({
    query: { enabled: order?.status === "pending" }
  });
  
  const submitPayment = useSubmitPayment();
  const confirmReceipt = useConfirmReceipt();
  
  const [selectedChain, setSelectedChain] = useState<string>("USDT_TON");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
    toast({ description: "Address copied to clipboard" });
  };

  const handlePaymentSubmit = () => {
    if (!txHash) {
      toast({ title: "Error", description: "Transaction hash is required", variant: "destructive" });
      return;
    }
    if (!order) return;
    submitPayment.mutate({
      data: { orderId: order.id, chain: selectedChain, txHash, amount: order.amount }
    }, {
      onSuccess: () => {
        toast({ title: "Payment Submitted", description: "Your payment is now awaiting confirmation." });
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id) });
      },
      onError: (err: any) => {
        toast({ title: "Submission Failed", description: err.message || "Failed to submit payment", variant: "destructive" });
      }
    });
  };

  const handleConfirmReceipt = () => {
    if (!order) return;
    if (!confirm("Confirm that you have received and tested the product? This will release funds to the seller.")) return;
    confirmReceipt.mutate({ id: order.id }, {
      onSuccess: () => {
        toast({ title: "Receipt Confirmed!", description: "Thank you! Funds will be released to the seller." });
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id) });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  if (isOrderLoading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading order...</div>;
  if (!order) return <div className="text-center py-20 text-muted-foreground">Order not found</div>;

  const steps = [
    { id: "pending",              label: "Payment Required", icon: AlertCircle },
    { id: "awaiting_confirmation",label: "Confirming",       icon: Clock },
    { id: "confirmed",            label: "Ready to Download",icon: Download },
    { id: "delivered",            label: "Receipt Confirmed",icon: ThumbsUp },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status) !== -1
    ? steps.findIndex(s => s.id === order.status)
    : order.status === "rejected" ? -1 : order.status === "funds_released" ? steps.length - 1 : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
          <p className="text-muted-foreground mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <Badge
          variant="outline"
          className={cn("capitalize text-sm", {
            "bg-amber-500/10 text-amber-400 border-amber-500/30": order.status === "pending",
            "bg-blue-500/10 text-blue-400 border-blue-500/30": order.status === "awaiting_confirmation",
            "bg-violet-500/10 text-violet-400 border-violet-500/30": order.status === "confirmed",
            "bg-emerald-500/10 text-emerald-400 border-emerald-500/30": order.status === "delivered" || order.status === "funds_released",
            "bg-red-500/10 text-red-400 border-red-500/30": order.status === "rejected",
          })}
        >
          {order.status === "funds_released" ? "Complete" : order.status.replace(/_/g, " ")}
        </Badge>
      </div>

      {/* Progress Tracker */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <div className="relative flex justify-between items-center">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500"
              style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0}%` }}
            />
            {steps.map((step, index) => {
              const isCompleted = currentStepIndex >= index;
              const isCurrent = currentStepIndex === index;
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-card p-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    order.status === "rejected" && index === 0 ? "bg-destructive border-destructive text-destructive-foreground" :
                    isCompleted ? "bg-primary border-primary text-primary-foreground" :
                    isCurrent ? "bg-background border-primary text-primary" :
                    "bg-background border-muted text-muted-foreground"
                  }`}>
                    {isCompleted && !isCurrent ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium text-center max-w-[70px] ${isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {order.adminNotes && (
            <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border/50 text-sm">
              <span className="font-semibold">Note: </span>{order.adminNotes}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 py-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {order.productImage ? (
                    <img src={order.productImage} alt={order.productName || ""} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{order.productName}</h3>
                  <p className="text-sm text-muted-foreground">Digital Download</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${order.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">USDT</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${order.amount.toFixed(2)} USDT</span>
              </div>
            </CardContent>
          </Card>

          {/* Download + Confirm Receipt Section */}
          {(order.status === "confirmed" || order.status === "delivered" || order.status === "funds_released") && (
            <Card className={cn(
              "border",
              order.status === "confirmed" ? "bg-blue-500/5 border-blue-500/20" : "bg-emerald-500/5 border-emerald-500/20"
            )}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={cn("font-semibold text-lg", order.status === "confirmed" ? "text-blue-400" : "text-emerald-400")}>
                      {order.status === "confirmed" ? "Ready to Download" : "Download Available"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {order.status === "confirmed"
                        ? "Payment confirmed. Download your product and confirm receipt when satisfied."
                        : "You have confirmed receipt. Thank you!"}
                    </p>
                  </div>
                  <Button className="gap-2 bg-emerald-600 hover:bg-emerald-500">
                    <Download className="w-4 h-4" /> Download Files
                  </Button>
                </div>

                {order.status === "confirmed" && (
                  <div className="border-t border-border/30 pt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Once you've downloaded and verified the product works as described, click below to release funds to the seller.
                    </p>
                    <Button
                      variant="outline"
                      className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                      onClick={handleConfirmReceipt}
                      disabled={confirmReceipt.isPending}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {confirmReceipt.isPending ? "Confirming..." : "Confirm Receipt & Release Funds"}
                    </Button>
                  </div>
                )}

                {(order.status === "delivered" || order.status === "funds_released") && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Receipt confirmed. Funds are being released to the seller.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Escrow Chat */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-0">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                Order Chat
              </CardTitle>
              <CardDescription>Direct escrow chat with admin for this order</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-3 border-t border-border/40">
              <EscrowChat orderId={id} />
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Payment Section */}
          {order.status === "pending" ? (
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Complete Payment</CardTitle>
                <CardDescription>Send exactly {order.amount} USDT to one of our addresses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={selectedChain} onValueChange={setSelectedChain}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="USDT_TRC20">TRC20</TabsTrigger>
                    <TabsTrigger value="USDT_BEP20">BEP20</TabsTrigger>
                    <TabsTrigger value="USDT_TON">TON</TabsTrigger>
                  </TabsList>
                  {walletData?.wallets.map(wallet => (
                    <TabsContent key={wallet.chain} value={wallet.chain} className="space-y-4">
                      <div className="p-4 bg-black/40 rounded-xl border border-border/50 text-center">
                        <div className="w-32 h-32 bg-white mx-auto mb-4 rounded-lg p-2">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(wallet.address)}`}
                            alt="QR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <Label className="text-muted-foreground mb-1 block">Send to address</Label>
                        <div className="flex items-center gap-2 bg-background p-2 rounded border border-border/50">
                          <code className="text-xs truncate flex-1 text-primary">{wallet.address}</code>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleCopy(wallet.address)}>
                            {copied === wallet.address ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                <Separator />
                <div className="space-y-3">
                  <Label>Transaction Hash (TXID)</Label>
                  <Input
                    placeholder="Enter the transaction hash after sending"
                    value={txHash}
                    onChange={e => setTxHash(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">This helps us verify your payment quickly.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handlePaymentSubmit} disabled={submitPayment.isPending || !txHash}>
                  {submitPayment.isPending ? "Submitting..." : "I have made the payment"}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle>Payment Status</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Status</span>
                  <Badge variant="outline" className="capitalize">
                    {order.status === "funds_released" ? "Complete" : order.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                {order.payment && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Network</span>
                      <span>{order.payment.chain.replace("USDT_", "USDT ")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold">${order.payment.amount.toFixed(2)} USDT</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <span className="text-muted-foreground">TX Hash</span>
                      <p className="break-all font-mono text-xs bg-muted/50 p-2 rounded border border-border/40">{order.payment.txHash}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment</span>
                      <Badge variant="outline" className={cn("capitalize text-xs", {
                        "bg-emerald-500/10 text-emerald-400 border-emerald-500/30": order.payment.status === "confirmed",
                        "bg-red-500/10 text-red-400 border-red-500/30": order.payment.status === "rejected",
                        "bg-amber-500/10 text-amber-400 border-amber-500/30": order.payment.status === "pending",
                      })}>
                        {order.payment.status}
                      </Badge>
                    </div>
                  </>
                )}
                <Separator />
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setLocation("/messages")}
                >
                  <MessageCircle className="w-4 h-4" /> Open Support Chat
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
