import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSubmitHireRequest, HireRequest } from "@/hooks/useHireRequests";
import { useSettings } from "@/hooks/useSettings";
import {
  ArrowLeft, ArrowRight, CheckCircle2, MessageSquare, Send,
  Globe, Phone, Loader2, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const APP_TYPES = [
  { id: "web-app", label: "Web App / SaaS" },
  { id: "mobile-app", label: "Mobile App" },
  { id: "defi", label: "DeFi / Blockchain" },
  { id: "bot", label: "Bot / Automation" },
  { id: "script-api", label: "Script / API" },
  { id: "pi-tool", label: "Pi Network Tool" },
  { id: "other", label: "Other" },
];

const BLOCKCHAIN_TYPES = [
  { id: "pi", label: "Pi Network" },
  { id: "ethereum", label: "Ethereum / EVM" },
  { id: "solana", label: "Solana" },
  { id: "tron", label: "TRON" },
  { id: "multi", label: "Multi-chain" },
  { id: "none", label: "No Blockchain" },
];

const TIMELINES = [
  { id: "1-week", label: "1 Week" },
  { id: "2-weeks", label: "2 Weeks" },
  { id: "1-month", label: "1 Month" },
  { id: "2-3-months", label: "2–3 Months" },
  { id: "flexible", label: "Flexible" },
];

function SelectChip({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
            value === o.id
              ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
              : "bg-card/50 border-border/50 text-muted-foreground hover:border-violet-500/30 hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SuccessScreen({ request, settings }: { request: HireRequest; settings: any }) {
  const whatsappNumber = settings?.hire_whatsapp?.replace(/\D/g, "") || "";
  const telegramHandle = settings?.hire_telegram?.replace("@", "") || "";
  const message = encodeURIComponent(`Hi! I just submitted a hire request on PiMarket (Request #${request.id}): "${request.title}". I'd like to discuss my project.`);

  return (
    <div className="max-w-lg mx-auto text-center space-y-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Request Submitted!</h2>
          <p className="text-muted-foreground mt-1">We'll review your project and respond within 24 hours.</p>
        </div>
        <Badge className="bg-violet-500/10 border-violet-500/20 text-violet-300">Request #{request.id}</Badge>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-foreground mb-1">{request.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{request.description}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Connect with us now</p>
        
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 hover:border-emerald-500/40 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-emerald-400 text-sm">WhatsApp</p>
              <p className="text-xs text-muted-foreground">Chat directly with our developer</p>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-400/60" />
          </a>
        )}

        {telegramHandle && (
          <a
            href={`https://t.me/${telegramHandle}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 hover:border-blue-500/40 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blue-400 text-sm">Telegram</p>
              <p className="text-xs text-muted-foreground">@{telegramHandle}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-400/60" />
          </a>
        )}

        <Link href="/dashboard/messages">
          <div className="flex items-center gap-3 w-full p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/15 hover:border-violet-500/40 transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-violet-400 text-sm">In-App Messages</p>
              <p className="text-xs text-muted-foreground">Chat with admin in PiMarket</p>
            </div>
            <ArrowRight className="w-4 h-4 text-violet-400/60" />
          </div>
        </Link>

        <Link href="/dashboard/hire-requests">
          <div className="flex items-center gap-3 w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all cursor-pointer">
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Track Request Status</p>
              <p className="text-xs text-muted-foreground">View all your hire requests in the dashboard</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function HireSubmit() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const submitRequest = useSubmitHireRequest();
  const { data: settings } = useSettings();

  const [submitted, setSubmitted] = useState<HireRequest | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    appType: "",
    blockchainType: "pi",
    features: "",
    budgetMin: "",
    budgetMax: "",
    timeline: "",
    contactWhatsapp: "",
    contactTelegram: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.appType) {
      toast({ title: "Missing fields", description: "Please fill in title, description, and app type.", variant: "destructive" });
      return;
    }
    submitRequest.mutate(
      {
        title: form.title,
        description: form.description,
        appType: form.appType,
        blockchainType: form.blockchainType,
        features: form.features || undefined,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
        timeline: form.timeline || undefined,
        contactWhatsapp: form.contactWhatsapp || undefined,
        contactTelegram: form.contactTelegram || undefined,
      },
      {
        onSuccess: (data) => setSubmitted(data),
        onError: (err: any) => toast({ title: "Submission failed", description: err.message, variant: "destructive" }),
      }
    );
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <SuccessScreen request={submitted} settings={settings} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/hire" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Hire a Developer
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-xl font-black text-white" style={{ fontFamily: "serif" }}>π</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Project Brief</h1>
            <p className="text-sm text-muted-foreground">Tell us about your Pi Network project</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Basics */}
        <div className="space-y-5 p-5 rounded-2xl bg-card/50 border border-border/50">
          <h2 className="font-semibold text-base flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">1</span>
            Project Basics
          </h2>

          <div className="space-y-2">
            <Label>Project Title <span className="text-red-400">*</span></Label>
            <Input
              placeholder="e.g. Pi Network Referral Tracking Dashboard"
              value={form.title}
              onChange={set("title")}
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Project Description <span className="text-red-400">*</span></Label>
            <Textarea
              placeholder="Describe your project in detail — what it does, who it's for, key features, and any technical requirements..."
              rows={5}
              value={form.description}
              onChange={set("description")}
              className="bg-background/50 border-border/50 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>App Type <span className="text-red-400">*</span></Label>
            <SelectChip options={APP_TYPES} value={form.appType} onChange={v => setForm(p => ({ ...p, appType: v }))} />
          </div>
        </div>

        {/* Technical Details */}
        <div className="space-y-5 p-5 rounded-2xl bg-card/50 border border-border/50">
          <h2 className="font-semibold text-base flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">2</span>
            Technical Details
          </h2>

          <div className="space-y-2">
            <Label>Blockchain / Network</Label>
            <SelectChip options={BLOCKCHAIN_TYPES} value={form.blockchainType} onChange={v => setForm(p => ({ ...p, blockchainType: v }))} />
          </div>

          <div className="space-y-2">
            <Label>Key Features & Requirements</Label>
            <Textarea
              placeholder="List the main features you need: user auth, Pi payments, admin dashboard, real-time updates, etc."
              rows={4}
              value={form.features}
              onChange={set("features")}
              className="bg-background/50 border-border/50 resize-none"
            />
          </div>
        </div>

        {/* Budget & Timeline */}
        <div className="space-y-5 p-5 rounded-2xl bg-card/50 border border-border/50">
          <h2 className="font-semibold text-base flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">3</span>
            Budget & Timeline
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <span className="text-yellow-400 font-black text-sm" style={{ fontFamily: "serif" }}>π</span> Min Budget (Pi)
              </Label>
              <Input
                type="number"
                placeholder="100"
                value={form.budgetMin}
                onChange={set("budgetMin")}
                className="bg-background/50 border-border/50"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <span className="text-yellow-400 font-black text-sm" style={{ fontFamily: "serif" }}>π</span> Max Budget (Pi)
              </Label>
              <Input
                type="number"
                placeholder="500"
                value={form.budgetMax}
                onChange={set("budgetMax")}
                className="bg-background/50 border-border/50"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Timeline</Label>
            <SelectChip options={TIMELINES} value={form.timeline} onChange={v => setForm(p => ({ ...p, timeline: v }))} />
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-5 p-5 rounded-2xl bg-card/50 border border-border/50">
          <h2 className="font-semibold text-base flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">4</span>
            Your Contact Info <span className="text-xs text-muted-foreground font-normal ml-1">(optional)</span>
          </h2>
          <p className="text-xs text-muted-foreground">So we can reach you faster via your preferred channel</p>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Number
              </Label>
              <Input
                placeholder="+1234567890"
                value={form.contactWhatsapp}
                onChange={set("contactWhatsapp")}
                className="bg-background/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-blue-400" /> Telegram Handle
              </Label>
              <Input
                placeholder="@yourusername"
                value={form.contactTelegram}
                onChange={set("contactTelegram")}
                className="bg-background/50 border-border/50"
              />
            </div>
          </div>
        </div>

        <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4 text-xs text-violet-300/70 leading-relaxed">
          🛡️ Your project details are private and only visible to our developer. We'll respond with a quote within 24 hours. All payments are secured by Pi escrow.
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-13 py-3.5 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-bold text-base gap-2 rounded-xl shadow-lg shadow-violet-500/25"
          disabled={submitRequest.isPending}
        >
          {submitRequest.isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</>
          ) : (
            <>Submit Project Brief <ArrowRight className="w-5 h-5" /></>
          )}
        </Button>
      </form>
    </div>
  );
}
