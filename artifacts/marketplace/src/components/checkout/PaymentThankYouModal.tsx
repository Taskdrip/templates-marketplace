import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { CheckCircle2, MessageCircle, ExternalLink, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface Props {
  open: boolean;
  onClose: () => void;
  orderId: number;
}

export default function PaymentThankYouModal({ open, onClose, orderId }: Props) {
  const [, setLocation] = useLocation();
  const { data: settings } = useSettings();

  const thankYouMessage = settings?.thank_you_message ??
    "🎉 Thank you for your payment! Our team is reviewing your transaction and will confirm it shortly. You'll receive a notification once confirmed.";
  const telegramLink = settings?.telegram_link ?? "";

  const handleChat = () => {
    onClose();
    setLocation(`/dashboard/messages`);
  };

  const handleViewOrder = () => {
    onClose();
    setLocation(`/dashboard/orders/${orderId}`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full bg-[#0f0f1a] border border-emerald-500/20 p-0 overflow-hidden">
        <div className="relative">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative p-8 text-center space-y-6">
            {/* Success icon */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Payment Submitted!</h2>
              <p className="text-sm text-muted-foreground">Order #{orderId}</p>
            </div>

            {/* Admin custom thank you message */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-300 leading-relaxed text-left">
              {thankYouMessage}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleChat}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 h-11 gap-2 font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with Admin In-App
              </Button>

              {telegramLink && (
                <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-11 gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Contact via Telegram
                  </Button>
                </a>
              )}

              <Button
                variant="ghost"
                onClick={handleViewOrder}
                className="w-full h-10 gap-2 text-muted-foreground hover:text-white"
              >
                View Order Status
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
