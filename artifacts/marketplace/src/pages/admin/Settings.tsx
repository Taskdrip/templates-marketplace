import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Settings2, MessageSquare, Send, Globe, Info, CheckCircle2, ShieldCheck, ShieldOff, KeyRound, QrCode, Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminSettings() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();
  const { user } = useAuth();

  const [form, setForm] = useState({
    telegram_link: "",
    thank_you_message: "",
    payment_instructions: "",
    site_name: "",
    support_email: "",
    hire_whatsapp: "",
    hire_telegram: "",
  });

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [setupStep, setSetupStep] = useState<"idle" | "scanning" | "confirming" | "disabling">("idle");
  const [qrDataUri, setQrDataUri] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        telegram_link: settings.telegram_link ?? "",
        thank_you_message: settings.thank_you_message ?? "",
        payment_instructions: settings.payment_instructions ?? "",
        site_name: settings.site_name ?? "",
        support_email: settings.support_email ?? "",
        hire_whatsapp: settings.hire_whatsapp ?? "",
        hire_telegram: settings.hire_telegram ?? "",
      });
    }
  }, [settings]);

  // Fetch 2FA status on mount
  useEffect(() => {
    const token = localStorage.getItem("cm_token");
    if (!token) return;
    fetch("/api/auth/2fa/status", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setTwoFAEnabled(d.enabled ?? false))
      .catch(() => {});
  }, []);

  const handleSave = () => {
    updateSettings.mutate(form, {
      onSuccess: () => toast({ title: "Settings saved", description: "All settings updated successfully." }),
      onError: () => toast({ title: "Save failed", variant: "destructive" }),
    });
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const authFetch = async (path: string, method = "GET", body?: object) => {
    const token = localStorage.getItem("cm_token");
    const res = await fetch(`/api${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  const handle2FASetup = async () => {
    setTwoFALoading(true);
    try {
      const data = await authFetch("/auth/2fa/setup", "POST");
      setQrDataUri(data.qrCodeDataUri);
      setTotpSecret(data.secret);
      setSetupStep("scanning");
      setTotpCode("");
    } catch (err: any) {
      toast({ title: "Setup failed", description: err.message, variant: "destructive" });
    } finally {
      setTwoFALoading(false);
    }
  };

  const handle2FAEnable = async () => {
    if (!totpCode.trim()) { toast({ title: "Required", description: "Enter the 6-digit code.", variant: "destructive" }); return; }
    setTwoFALoading(true);
    try {
      await authFetch("/auth/2fa/enable", "POST", { totpCode });
      setTwoFAEnabled(true);
      setSetupStep("idle");
      setTotpCode("");
      setQrDataUri("");
      setTotpSecret("");
      toast({ title: "2FA Enabled!", description: "Your admin account is now protected with two-factor authentication." });
    } catch (err: any) {
      toast({ title: "Enable failed", description: err.message, variant: "destructive" });
      setTotpCode("");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handle2FADisable = async () => {
    if (!totpCode.trim()) { toast({ title: "Required", description: "Enter the 6-digit code.", variant: "destructive" }); return; }
    setTwoFALoading(true);
    try {
      await authFetch("/auth/2fa/disable", "POST", { totpCode });
      setTwoFAEnabled(false);
      setSetupStep("idle");
      setTotpCode("");
      toast({ title: "2FA Disabled", description: "Two-factor authentication has been removed." });
    } catch (err: any) {
      toast({ title: "Disable failed", description: err.message, variant: "destructive" });
      setTotpCode("");
    } finally {
      setTwoFALoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings2 className="w-7 h-7 text-primary" /> Site Settings
        </h1>
        <p className="text-muted-foreground mt-1">Control your marketplace messaging and configuration.</p>
      </div>

      {/* 2FA Security Card */}
      <Card className="bg-card/50 border-violet-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            Two-Factor Authentication (2FA)
            {twoFAEnabled ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-xs ml-1">Enabled</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground text-xs ml-1">Disabled</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your admin account using an authenticator app like Google Authenticator or Authy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {setupStep === "idle" && (
            <div className="flex items-center gap-3">
              {twoFAEnabled ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => { setSetupStep("disabling"); setTotpCode(""); }}
                >
                  <ShieldOff className="w-4 h-4" /> Disable 2FA
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500"
                  onClick={handle2FASetup}
                  disabled={twoFALoading}
                >
                  {twoFALoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Set Up 2FA
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                {twoFAEnabled
                  ? "Your account requires a 6-digit code on every admin login."
                  : "Protect your admin account from unauthorised access."}
              </p>
            </div>
          )}

          {/* Setup: scanning QR */}
          {setupStep === "scanning" && (
            <div className="space-y-4">
              <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4 space-y-4">
                <p className="text-sm font-medium text-center">Step 1 — Scan this QR code with your authenticator app</p>
                {qrDataUri && (
                  <div className="flex justify-center">
                    <img src={qrDataUri} alt="2FA QR Code" className="w-44 h-44 rounded-xl border-4 border-white" />
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground text-center">Or enter this secret manually:</p>
                  <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2 border border-white/10">
                    <code className="text-xs flex-1 text-violet-300 font-mono break-all">
                      {showSecret ? totpSecret : "•".repeat(totpSecret.length)}
                    </code>
                    <button type="button" onClick={() => setShowSecret(s => !s)} className="text-muted-foreground hover:text-white">
                      {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-violet-400" />
                  Step 2 — Enter the 6-digit code from your app
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="000000"
                  maxLength={6}
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="bg-background text-center text-xl tracking-[0.4em] font-mono h-12"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setSetupStep("idle"); setTotpCode(""); setQrDataUri(""); setTotpSecret(""); }}>Cancel</Button>
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 gap-2"
                  onClick={handle2FAEnable}
                  disabled={twoFALoading || totpCode.length !== 6}
                >
                  {twoFALoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Verify &amp; Enable 2FA
                </Button>
              </div>
            </div>
          )}

          {/* Disable 2FA */}
          {setupStep === "disabling" && (
            <div className="space-y-3 border border-destructive/20 rounded-xl p-4 bg-destructive/5">
              <p className="text-sm text-muted-foreground">Enter your current authenticator code to disable 2FA:</p>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="000000"
                maxLength={6}
                value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="bg-background text-center text-xl tracking-[0.4em] font-mono h-12"
                autoFocus
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setSetupStep("idle"); setTotpCode(""); }}>Cancel</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={handle2FADisable}
                  disabled={twoFALoading || totpCode.length !== 6}
                >
                  {twoFALoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
                  Confirm Disable 2FA
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* General */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4" /> General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Site Name</Label>
              <Input className="bg-background" value={form.site_name} onChange={set("site_name")} placeholder="Breedskoolpi.store" />
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
            Shown to users after payment — links to your Telegram group or personal username.
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
            Examples: <code className="text-primary">https://t.me/digimarket_support</code>
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
          <CardDescription>Shown to customers immediately after they submit a payment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="bg-background min-h-[120px] resize-none"
            value={form.thank_you_message}
            onChange={set("thank_you_message")}
            placeholder="🎉 Thank you for your payment! Your order is being reviewed..."
          />
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
            placeholder="Send the exact Pi amount to the address shown, then submit your transaction ID..."
          />
        </CardContent>
      </Card>

      {/* Admin Contact Message */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" /> Admin Contact Message
          </CardTitle>
          <CardDescription>This appears in your admin profile and support pages.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input className="bg-background" value={form.support_email} onChange={set("support_email")} placeholder="support@digimarket.io" />
        </CardContent>
      </Card>

      {/* Hire a Developer Contact */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" /> Hire a Developer — Contact Details
          </CardTitle>
          <CardDescription>
            WhatsApp and Telegram contact info shown to users after they submit a hire request. Users will be linked directly to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <span className="text-emerald-400 text-xs">📱</span> WhatsApp Number
              </Label>
              <Input
                className="bg-background font-mono text-sm"
                value={form.hire_whatsapp}
                onChange={set("hire_whatsapp")}
                placeholder="+1234567890"
              />
              <p className="text-xs text-muted-foreground">Full international number including country code</p>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <span className="text-blue-400 text-xs">✈️</span> Telegram Username
              </Label>
              <Input
                className="bg-background font-mono text-sm"
                value={form.hire_telegram}
                onChange={set("hire_telegram")}
                placeholder="@yourusername"
              />
              <p className="text-xs text-muted-foreground">Telegram handle with or without @</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={updateSettings.isPending} className="min-w-[160px] gap-2">
        {updateSettings.isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
        ) : (
          <><CheckCircle2 className="w-4 h-4" /> Save All Settings</>
        )}
      </Button>
    </div>
  );
}
