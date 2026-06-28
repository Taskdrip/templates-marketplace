import { useState } from "react";
import { useListOrders } from "@workspace/api-client-react";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Package, Clock, CheckCircle2, XCircle, AlertCircle,
  Eye, MessageCircle, Download, ArrowRight
} from "lucide-react";

function token() { return localStorage.getItem("cm_token"); }

async function startOrderConversation(orderId: number) {
  const res = await fetch("/api/messages/start", {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  if (!res.ok) throw new Error("Failed to start conversation");
  return res.json();
}

const STATUS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:               { label: "Payment Required",  color: "bg-amber-500/10 text-amber-400 border-amber-500/30",     icon: <Clock className="w-3 h-3" /> },
  awaiting_confirmation: { label: "Awaiting Confirm",  color: "bg-blue-500/10 text-blue-400 border-blue-500/30",        icon: <AlertCircle className="w-3 h-3" /> },
  confirmed:             { label: "Ready to Download", color: "bg-violet-500/10 text-violet-400 border-violet-500/30",  icon: <CheckCircle2 className="w-3 h-3" /> },
  delivered:             { label: "Delivered",          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",icon: <CheckCircle2 className="w-3 h-3" /> },
  funds_released:        { label: "Complete",          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected:              { label: "Rejected",           color: "bg-red-500/10 text-red-400 border-red-500/30",           icon: <XCircle className="w-3 h-3" /> },
};

export default function Orders() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: orders, isLoading } = useListOrders();
  const [chattingOrderId, setChattingOrderId] = useState<number | null>(null);

  const openChat = useMutation({
    mutationFn: (orderId: number) => startOrderConversation(orderId),
    onMutate: (orderId) => setChattingOrderId(orderId),
    onSuccess: () => {
      setChattingOrderId(null);
      setLocation("/dashboard/messages");
    },
    onError: () => {
      setChattingOrderId(null);
      toast({ title: "Error", description: "Could not open chat.", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground mt-1">Track your purchases and chat with sellers.</p>
        </div>
        <span className="text-sm text-muted-foreground">{orders?.length ?? 0} orders</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : !orders?.length ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <h3 className="font-semibold text-lg mb-1">No orders yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Browse the marketplace and purchase your first digital product.</p>
            <Button onClick={() => setLocation("/marketplace")} className="gap-2">
              Browse Marketplace <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = STATUS[order.status] ?? STATUS.pending;
            const canDownload = order.status === "confirmed" || order.status === "delivered" || order.status === "funds_released";
            const isChatting = chattingOrderId === order.id;
            return (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-colors"
              >
                {/* Product icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-primary" />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="font-semibold truncate">{(order as any).productName || "Unknown Product"}</p>
                    <Badge variant="outline" className={`${cfg.color} text-[11px] flex items-center gap-1 shrink-0`}>
                      {cfg.icon} {cfg.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>Order #{order.id}</span>
                    <span>·</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span className="font-medium text-foreground">
                      <span style={{ fontFamily: "serif" }}>π</span>{order.amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {canDownload && (
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                      <Download className="w-3.5 h-3.5" /> Download
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={(e) => { e.stopPropagation(); openChat.mutate(order.id); }}
                    disabled={isChatting}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {isChatting ? "Opening…" : "Chat"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 text-xs"
                    onClick={() => setLocation(`/orders/${order.id}`)}
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
