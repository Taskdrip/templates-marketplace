import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck, KeyRound, Mail, Lock, Loader2, Eye, EyeOff,
  AlertTriangle, ArrowRight, LogIn,
} from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login: setAuth, user, isAdmin } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 2FA state
  const [requires2fa, setRequires2fa] = useState(false);
  const [pendingToken, setPendingToken] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [is2faLoading, setIs2faLoading] = useState(false);

  // If already logged in as admin, redirect
  if (user && isAdmin) {
    setLocation("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await customFetch<any>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.requires2fa) {
        setPendingToken(res.pendingToken);
        setRequires2fa(true);
        return;
      }

      if (res.user?.role !== "admin") {
        setError("Access denied. This portal is for administrators only.");
        return;
      }

      setAuth(res.token, res.user);
      toast({ title: "Welcome, Admin", description: "You are now signed in to the control panel." });
      setLocation("/admin");
    } catch (err: any) {
      setError(err?.data?.error || err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const on2faSubmit = async () => {
    if (totpCode.length !== 6) return;
    setIs2faLoading(true);
    try {
      const res = await customFetch<any>("/api/auth/2fa/verify", {
        method: "POST",
        body: JSON.stringify({ pendingToken, totpCode }),
      });
      if (res.user?.role !== "admin") {
        setError("Access denied. This portal is for administrators only.");
        setRequires2fa(false);
        return;
      }
      setAuth(res.token, res.user);
      toast({ title: "Welcome, Admin", description: "2FA verified. You are now signed in." });
      setLocation("/admin");
    } catch (err: any) {
      toast({ title: "Verification failed", description: err?.data?.error || "Invalid code.", variant: "destructive" });
      setTotpCode("");
    } finally {
      setIs2faLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#060312] relative overflow-hidden">
      {/* Background grid + glow */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-purple-700/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[420px] mx-auto px-4 py-10">
        {/* Logo / Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 flex items-center justify-center shadow-2xl shadow-violet-500/40 border border-violet-500/30 relative">
            <ShieldCheck className="w-7 h-7 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#060312] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Control Panel</h1>
            <p className="text-sm text-purple-300/60 mt-1">Breedskoolpi — Restricted Access</p>
          </div>
        </div>

        {/* Security notice */}
        <div className="flex items-center gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-200/80">This area is restricted to authorized administrators only. Unauthorized access attempts are logged.</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

          <div className="p-7">
            {!requires2fa ? (
              <>
                <div className="mb-5">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <LogIn className="w-4 h-4 text-violet-400" /> Administrator Sign In
                  </h2>
                  <p className="text-xs text-purple-300/50 mt-0.5">Enter your admin credentials to continue</p>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl px-3.5 py-3 mb-5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-purple-200/70 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Admin Email
                    </Label>
                    <Input
                      type="email"
                      placeholder="admin@example.com"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      className="h-11 bg-white/[0.04] border-white/[0.1] focus:border-violet-500/60 text-white placeholder:text-white/20 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-purple-200/70 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter admin password"
                        autoComplete="current-password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(""); }}
                        className="h-11 bg-white/[0.04] border-white/[0.1] focus:border-violet-500/60 text-white placeholder:text-white/20 rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 mt-2 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/20 gap-2 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating…</>
                    ) : (
                      <><ShieldCheck className="w-4 h-4" /> Sign In to Admin Panel <ArrowRight className="w-4 h-4" /></>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              /* 2FA step */
              <div className="space-y-5">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-700 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
                    <KeyRound className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Two-Factor Authentication</h2>
                  <p className="text-xs text-purple-300/60 mt-1">Enter the 6-digit code from your authenticator app</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-purple-200/70 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> Authenticator Code
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    value={totpCode}
                    onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={e => e.key === "Enter" && on2faSubmit()}
                    className="h-14 bg-white/[0.04] border-white/[0.1] focus:border-violet-500/60 text-white text-center text-2xl tracking-[0.5em] font-mono rounded-xl placeholder:tracking-normal placeholder:text-base"
                  />
                </div>

                <Button
                  className="w-full h-11 bg-gradient-to-r from-violet-600 to-blue-700 hover:from-violet-500 hover:to-blue-600 text-white font-semibold rounded-xl gap-2"
                  onClick={on2faSubmit}
                  disabled={is2faLoading || totpCode.length !== 6}
                >
                  {is2faLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : <><ShieldCheck className="w-4 h-4" /> Verify & Enter</>}
                </Button>

                <button
                  type="button"
                  className="w-full text-xs text-purple-300/50 hover:text-purple-300/80 text-center transition-colors"
                  onClick={() => { setRequires2fa(false); setPendingToken(""); setTotpCode(""); }}
                >
                  ← Back to login
                </button>
              </div>
            )}
          </div>

          {/* Bottom accent */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-purple-700/50 to-transparent" />
        </div>

        {/* Footer links */}
        <div className="mt-6 text-center space-y-2">
          <Link href="/" className="text-xs text-purple-300/40 hover:text-purple-300/70 transition-colors">
            ← Back to Breedskoolpi
          </Link>
          <p className="text-[10px] text-purple-300/25">
            Not an admin?{" "}
            <Link href="/login" className="underline hover:text-purple-300/50 transition-colors">
              Regular sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
