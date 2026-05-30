import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, Users, Megaphone, Link as LinkIcon } from "lucide-react";
import { useGetSettings } from "@workspace/api-client-react";

const API_BASE = "/api";
function getToken() { return localStorage.getItem("cm_token"); }

export default function AdminPushNotifications() {
  const { toast } = useToast();
  const { data: settings } = useGetSettings();
  const [form, setForm] = useState({ title: "", message: "", link: "" });
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<Array<{ title: string; message: string; sent: number; time: string }>>([]);

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast({ title: "Title and message required", variant: "destructive" }); return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/admin/push-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setHistory(prev => [{ title: form.title, message: form.message, sent: data.sent, time: new Date().toLocaleTimeString() }, ...prev]);
      toast({ title: "Push notification sent!", description: `Delivered to ${data.sent} users.` });
      setForm({ title: "", message: "", link: "" });
    } catch (e: any) {
      toast({ title: "Failed to send", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const telegramLink = settings?.telegram_link;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="w-7 h-7 text-primary" /> Push Notifications
        </h1>
        <p className="text-muted-foreground mt-1">Broadcast messages to all users in real-time, in-app.</p>
      </div>

      {/* Composer */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> New Broadcast
          </CardTitle>
          <CardDescription>This will send an in-app notification to every registered user instantly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Notification Title *</Label>
            <Input
              className="bg-background"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. New products added!"
              maxLength={80}
            />
            <p className="text-xs text-muted-foreground text-right">{form.title.length}/80</p>
          </div>

          <div className="space-y-1.5">
            <Label>Message *</Label>
            <Textarea
              className="bg-background resize-none"
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="Write your broadcast message here..."
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">{form.message.length}/300</p>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> Link (optional)</Label>
            <Input
              className="bg-background"
              value={form.link}
              onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
              placeholder="/marketplace or https://..."
            />
            <p className="text-xs text-muted-foreground">Users can click this in their notifications panel.</p>
          </div>

          <Button onClick={handleSend} disabled={sending} className="gap-2 min-w-[160px]">
            {sending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Broadcast to All Users</>}
          </Button>
        </CardContent>
      </Card>

      {/* Telegram Broadcast */}
      {telegramLink && (
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-blue-400">
              <Send className="w-4 h-4" /> Telegram Channel
            </CardTitle>
            <CardDescription>Also broadcast to your Telegram community.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={telegramLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                <Send className="w-4 h-4" /> Open Telegram Channel
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-2">
              Telegram group link: <code className="text-blue-400">{telegramLink}</code>
              {" · "}You can change this in <strong>Settings</strong>.
            </p>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Recent Broadcasts (this session)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="flex items-start justify-between gap-4 p-3 bg-muted/30 rounded-lg border border-border/30">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{h.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{h.message}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="secondary" className="gap-1 text-xs"><Users className="w-2.5 h-2.5" /> {h.sent}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{h.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
