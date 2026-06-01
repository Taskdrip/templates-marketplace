import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings2, MessageSquare, Send, Globe, Info, CheckCircle2 } from "lucide-react";

export default function AdminSettings() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const [form, setForm] = useState({
    telegram_link: "",
    thank_you_message: "",
    payment_instructions: "",
    site_name: "",
    support_email: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        telegram_link: settings.telegram_link ?? "",
        thank_you_message: settings.thank_you_message ?? "",
        payment_instructions: settings.payment_instructions ?? "",
        site_name: settings.site_name ?? "",
        support_email: settings.support_email ?? "",
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(form, {
      onSuccess: () => toast({ title: "Settings saved", description: "All settings updated successfully." }),
      onError: () => toast({ title: "Save failed", variant: "destructive" }),
    });
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings2 className="w-7 h-7 text-primary" /> Site Settings
        </h1>
        <p className="text-muted-foreground mt-1">Control your marketplace messaging and configuration.</p>
      </div>

      {/* General */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4" /> General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Site Name</Label>
              <Input className="bg-background" value={form.site_name} onChange={set("site_name")} placeholder="Vaultrade.store" />
            </div>
            <div className="space-y-1.5">
              <Label>Support Email</Label>
              <Input className="bg-background" value={form.support_email} onChange={set("support_email")} placeholder="support@digimarket.io" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Telegram */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-400" /> Telegram Support Link
          </CardTitle>
          <CardDescription>
            Shown to users after payment — links to your Telegram group or personal username. Admin can change this anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Telegram URL</Label>
            <Input
              className="bg-background font-mono text-sm"
              value={form.telegram_link}
              onChange={set("telegram_link")}
              placeholder="https://t.me/your_username"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Examples: <code className="text-primary">https://t.me/digimarket_support</code> or <code className="text-primary">https://t.me/+groupinvitelink</code>
          </p>
          {form.telegram_link && (
            <a href={form.telegram_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
              ↗ Test link
            </a>
          )}
        </CardContent>
      </Card>

      {/* Thank You Message */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Thank You Message
          </CardTitle>
          <CardDescription>Shown to customers immediately after they submit a payment. You can use emojis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="bg-background min-h-[120px] resize-none"
            value={form.thank_you_message}
            onChange={set("thank_you_message")}
            placeholder="🎉 Thank you for your payment! Your order is being reviewed..."
          />
          <p className="text-xs text-muted-foreground mt-2">
            This appears in the payment confirmation popup alongside the chat/Telegram buttons.
          </p>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400" /> Checkout Payment Instructions
          </CardTitle>
          <CardDescription>Shown inside the checkout modal before users make payment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="bg-background min-h-[100px] resize-none"
            value={form.payment_instructions}
            onChange={set("payment_instructions")}
            placeholder="Send the exact USDT amount to the address shown, then submit your TXID..."
          />
        </CardContent>
      </Card>

      {/* Message box */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" /> Admin Contact Message
          </CardTitle>
          <CardDescription>This appears in your admin profile and support pages.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            className="bg-background"
            value={form.support_email}
            onChange={set("support_email")}
            placeholder="support@digimarket.io"
          />
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={updateSettings.isPending}
        className="min-w-[160px] gap-2"
      >
        {updateSettings.isPending ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
        ) : (
          <><CheckCircle2 className="w-4 h-4" /> Save All Settings</>
        )}
      </Button>
    </div>
  );
}
