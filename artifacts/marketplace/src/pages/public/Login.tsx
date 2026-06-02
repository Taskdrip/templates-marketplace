import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@workspace/api-client-react";
import { Mail, Phone, Send, Store, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";

type LoginMethod = "email" | "phone" | "telegram";

const emailSchema = z.object({ credential: z.string().email("Enter a valid email"), password: z.string().min(1, "Required") });
const phoneSchema = z.object({ credential: z.string().min(7, "Enter a valid phone number"), password: z.string().min(1, "Required") });
const telegramSchema = z.object({ credential: z.string().min(2, "Enter a Telegram handle"), password: z.string().min(1, "Required") });

const schemas = { email: emailSchema, phone: phoneSchema, telegram: telegramSchema };

const METHODS: { key: LoginMethod; label: string; icon: React.ReactNode; placeholder: string }[] = [
  { key: "email", label: "Email", icon: <Mail className="w-4 h-4" />, placeholder: "john@example.com" },
  { key: "phone", label: "Phone", icon: <Phone className="w-4 h-4" />, placeholder: "+1 234 567 8900" },
  { key: "telegram", label: "Telegram", icon: <Send className="w-4 h-4" />, placeholder: "@username" },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { toast } = useToast();
  const [method, setMethod] = useState<LoginMethod>("email");
  const [isLoading, setIsLoading] = useState(false);

  // 2FA state
  const [requires2fa, setRequires2fa] = useState(false);
  const [pendingToken, setPendingToken] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [is2faLoading, setIs2faLoading] = useState(false);

  const form = useForm({ resolver: zodResolver(schemas[method]), defaultValues: { credential: "", password: "" } });

  const onMethodChange = (m: LoginMethod) => {
    setMethod(m);
    form.reset();
  };

  const onSubmit = async (values: { credential: string; password: string }) => {
    setIsLoading(true);
    try {
      const body: Record<string, string> = { password: values.password };
      if (method === "email") body.email = values.credential;
      else if (method === "phone") body.phone = values.credential;
      else body.telegram = values.credential.replace(/^@/, "");

      const res = await customFetch<any>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (res.requires2fa) {
        setPendingToken(res.pendingToken);
        setRequires2fa(true);
        return;
      }

      setAuth(res.token, res.user);
      toast({ title: "Welcome back! 👋", description: "You've been signed in successfully." });
      setLocation(res.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err?.data?.error || err.message || "Invalid credentials.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const on2faSubmit = async () => {
    if (!totpCode.trim()) {
      toast({ title: "Required", description: "Enter your 6-digit authenticator code.", variant: "destructive" });
      return;
    }
    setIs2faLoading(true);
    try {
      const res = await customFetch<any>("/api/auth/2fa/verify", {
        method: "POST",
        body: JSON.stringify({ pendingToken, totpCode: totpCode.trim() }),
      });
      setAuth(res.token, res.user);
      toast({ title: "Welcome, Admin! 🔐", description: "Two-factor authentication verified." });
      setLocation("/admin");
    } catch (err: any) {
      toast({ title: "Verification failed", description: err?.data?.error || "Invalid code.", variant: "destructive" });
      setTotpCode("");
    } finally {
      setIs2faLoading(false);
    }
  };

  const currentMethod = METHODS.find(m => m.key === method)!;

  if (requires2fa) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center mb-5 shadow-lg shadow-violet-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Two-Factor Authentication</h2>
            <p className="text-muted-foreground mt-2 text-sm">Enter the 6-digit code from your authenticator app</p>
          </div>

          <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-violet-400" />
                Authenticator Code
              </label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="000000"
                maxLength={6}
                value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="bg-background/50 text-center text-2xl tracking-[0.5em] font-mono h-14"
                autoFocus
                onKeyDown={e => e.key === "Enter" && on2faSubmit()}
              />
            </div>

            <Button
              className="w-full h-11 font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-lg"
              onClick={on2faSubmit}
              disabled={is2faLoading || totpCode.length !== 6}
            >
              {is2faLoading ? "Verifying…" : (<><ShieldCheck className="w-4 h-4 mr-2" /> Verify & Sign In</>)}
            </Button>

            <button
              type="button"
              className="w-full text-xs text-muted-foreground hover:text-foreground text-center pt-1"
              onClick={() => { setRequires2fa(false); setPendingToken(""); setTotpCode(""); form.reset(); }}
            >
              ← Back to login
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Open your authenticator app (Google Authenticator, Authy, etc.) to get the code
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to your Vaultrade.store account</p>
        </div>

        <div className="flex rounded-xl overflow-hidden border border-border/50 bg-card/50 p-1 gap-1">
          {METHODS.map(m => (
            <button
              key={m.key}
              type="button"
              onClick={() => onMethodChange(m.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${method === m.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
              <FormField
                control={form.control as any}
                name="credential"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">{currentMethod.icon} {currentMethod.label}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={currentMethod.placeholder}
                        autoComplete={method === "email" ? "email" : "off"}
                        {...field}
                        className="bg-background/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" autoComplete="current-password" {...field} className="bg-background/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-11 font-semibold shadow-lg shadow-primary/20 rounded-xl" disabled={isLoading}>
                {isLoading ? "Signing in..." : (<>Sign In <ArrowRight className="ml-2 w-4 h-4" /></>)}
              </Button>
            </form>
          </Form>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">Create one free</Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Want to sell?{" "}
            <Link href="/seller-register" className="font-semibold text-primary hover:underline">Become a seller</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
