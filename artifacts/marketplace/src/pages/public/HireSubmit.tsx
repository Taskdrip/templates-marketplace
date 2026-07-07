import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSubmitHireRequest, HireRequest } from "@/hooks/useHireRequests";
import { useSettings } from "@/hooks/useSettings";
import { usePiPrice } from "@/hooks/usePiPrice";
import {
  ArrowLeft, ArrowRight, CheckCircle2, MessageSquare, Send,
  Globe, Phone, Loader2, ExternalLink, Lightbulb, Info,
  Code2, Smartphone, Bot, Database, TrendingUp, Zap,
  DollarSign, Clock, User, ChevronRight, Sparkles, Shield,
  AlertCircle, Check, HelpCircle, X, Server, Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Project Type", subtitle: "What are you building?" },
  { id: 2, title: "Project Details", subtitle: "Tell us more" },
  { id: 3, title: "Budget & Timeline", subtitle: "Scope it out" },
  { id: 4, title: "Contact", subtitle: "How to reach you" },
];

const APP_TYPES = [
  { id: "web-app", label: "Web App / SaaS", icon: Globe, color: "violet", desc: "Dashboards, marketplaces, portals, e-commerce" },
  { id: "mobile-app", label: "Mobile App", icon: Smartphone, color: "blue", desc: "iOS & Android apps with Pi payments" },
  { id: "defi", label: "DeFi / Blockchain", icon: Zap, color: "yellow", desc: "Smart contracts, dApps, Pi SDK integrations" },
  { id: "bot", label: "Bot / Automation", icon: Bot, color: "emerald", desc: "Telegram bots, trading bots, scrapers" },
  { id: "script-api", label: "Script / API", icon: Database, color: "cyan", desc: "Backend services, REST APIs, data tools" },
  { id: "pi-tool", label: "Pi Network Tool", icon: TrendingUp, color: "orange", desc: "Mining dashboards, referral systems, analytics" },
  { id: "other", label: "Other", icon: Code2, color: "gray", desc: "Something unique? Tell us below" },
];

const BLOCKCHAIN_TYPES = [
  { id: "pi", label: "Pi Network", hint: "Most popular — full Pi SDK support" },
  { id: "ethereum", label: "Ethereum / EVM", hint: "Solidity smart contracts" },
  { id: "solana", label: "Solana", hint: "Fast & low-fee transactions" },
  { id: "tron", label: "TRON", hint: "USDT TRC20 integrations" },
  { id: "multi", label: "Multi-chain", hint: "Cross-chain compatibility" },
  { id: "none", label: "No Blockchain", hint: "Standard web/mobile app" },
];

const TIMELINES = [
  { id: "1-week", label: "1 Week", note: "Small feature or fix" },
  { id: "2-weeks", label: "2 Weeks", note: "Simple app or MVP" },
  { id: "1-month", label: "1 Month", note: "Full-featured app" },
  { id: "2-3-months", label: "2–3 Months", note: "Complex platform" },
  { id: "flexible", label: "Flexible", note: "No rush" },
];

const BUDGET_PRESETS = [
  { label: "Small", min: 100, max: 500, desc: "Script / fix" },
  { label: "Mid", min: 500, max: 2000, desc: "Simple app" },
  { label: "Large", min: 2000, max: 8000, desc: "Full platform" },
  { label: "Custom", min: null, max: null, desc: "I'll specify" },
];

const TYPE_TIPS: Record<string, string[]> = {
  "web-app": ["Include any design inspiration (Figma, existing sites)", "Specify if you need user auth, payments, admin panel", "Mention if it needs Pi payment integration"],
  "mobile-app": ["Specify iOS only, Android only, or both", "Mention if you need Pi Network SDK", "Include any UI reference apps"],
  "defi": ["Describe the tokenomics if applicable", "Specify if you need a frontend dApp or just contracts", "Mention the Pi SDK features you need"],
  "bot": ["Which platform — Telegram, Discord, custom?", "Does the bot need Pi payment handling?", "Describe triggers and automation logic"],
  "script-api": ["Describe input/output data formats", "Mention rate limits or data sources", "Specify if you need scheduled runs"],
  "pi-tool": ["Describe the Pi data you want to track", "Mention referral or mining pool details", "Include any Pi API endpoints you've found"],
  "other": ["Be as specific as possible", "Share any reference links or screenshots", "Describe the problem you're solving"],
};

const EXAMPLE_TITLES: Record<string, string> = {
  "web-app": "Pi Network Referral Tracking Dashboard",
  "mobile-app": "Pi Wallet Tracker App for iOS & Android",
  "defi": "Pi Network DApp with Token Staking",
  "bot": "Telegram Pi Mining Alert Bot",
  "script-api": "Pi Transaction Data Scraper API",
  "pi-tool": "Pi Pioneer Analytics & Leaderboard",
  "other": "Custom Pi Network Solution",
};

interface TipBoxProps { tips: string[]; title?: string }
function TipBox({ tips, title = "💡 Pro Tips" }: TipBoxProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-violet-300 hover:bg-violet-500/10 transition-colors"
      >
        <span className="flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" />{title}</span>
        {open ? <X className="w-3.5 h-3.5 opacity-50" /> : <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
      </button>
      {open && (
        <ul className="px-4 pb-3 space-y-1.5">
          {tips.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-violet-300/70">
              <Check className="w-3 h-3 mt-0.5 shrink-0 text-violet-400" />{t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface InfoPillProps { text: string }
function InfoPill({ text }: InfoPillProps) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 rounded-full px-2 py-0.5">
      <Info className="w-3 h-3" />{text}
    </span>
  );
}

function ChipButton({ selected, onClick, children, className }: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-150 text-left",
        selected
          ? "bg-violet-500/20 border-violet-500/60 text-violet-200 shadow-sm shadow-violet-500/20"
          : "bg-card/40 border-border/40 text-muted-foreground hover:border-violet-500/30 hover:text-foreground hover:bg-card/70",
        className
      )}
    >
      {selected && <Check className="absolute top-2 right-2 w-3 h-3 text-violet-400" />}
      {children}
    </button>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 rounded-full transition-all duration-300",
            i + 1 < current ? "bg-violet-500 w-8" :
            i + 1 === current ? "bg-violet-400 w-12" :
            "bg-muted/50 w-4"
          )}
        />
      ))}
    </div>
  );
}

function SuccessScreen({ request, settings }: { request: HireRequest; settings: any }) {
  const whatsappNumber = settings?.hire_whatsapp?.replace(/\D/g, "") || "";
  const telegramHandle = settings?.hire_telegram?.replace("@", "") || "";
  const message = encodeURIComponent(`Hi! I submitted a hire request on Breedskoolpi (Request #${request.id}): "${request.title}". Ready to discuss!`);

  return (
    <div className="max-w-lg mx-auto text-center space-y-8 py-12">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold">You're all set!</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Your project brief was submitted. We review every request<br />and respond with a quote within <span className="text-foreground font-semibold">24 hours</span>.
          </p>
        </div>
        <Badge className="bg-violet-500/10 border-violet-500/20 text-violet-300 text-xs px-3 py-1">
          Request #{request.id} · {request.title}
        </Badge>
      </div>

      <div className="space-y-3 text-left">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-4">What happens next?</p>

        {[
          { step: "01", title: "We review your brief", desc: "Our Pi developer reads your requirements carefully", icon: AlertCircle, color: "text-blue-400" },
          { step: "02", title: "You get a quote", desc: "Detailed breakdown of timeline and Pi pricing", icon: DollarSign, color: "text-yellow-400" },
          { step: "03", title: "Escrow & build", desc: "Deposit Pi to escrow, we build, you get code", icon: Shield, color: "text-emerald-400" },
        ].map(item => (
          <div key={item.step} className="flex items-start gap-3 p-3 rounded-xl bg-card/30 border border-border/30">
            <span className="text-xs font-black text-muted-foreground/50 w-5 shrink-0 mt-0.5">{item.step}</span>
            <item.icon className={cn("w-4 h-4 shrink-0 mt-0.5", item.color)} />
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Connect with us now</p>
        {whatsappNumber && (
          <a href={`https://wa.me/${whatsappNumber}?text=${message}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-emerald-400 text-sm">Chat on WhatsApp</p>
              <p className="text-xs text-muted-foreground">Get a faster response</p>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-400/60" />
          </a>
        )}
        {telegramHandle && (
          <a href={`https://t.me/${telegramHandle}?text=${message}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 w-full p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-blue-400 text-sm">Message on Telegram</p>
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
            <div className="flex-1 text-left">
              <p className="font-semibold text-violet-400 text-sm">In-App Messages</p>
              <p className="text-xs text-muted-foreground">Chat directly in Breedskoolpi</p>
            </div>
            <ArrowRight className="w-4 h-4 text-violet-400/60" />
          </div>
        </Link>
        <Link href="/dashboard/hire-requests">
          <div className="flex items-center gap-3 w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all cursor-pointer">
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground text-sm">Track Your Request</p>
              <p className="text-xs text-muted-foreground">View status updates in your dashboard</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      </div>
    </div>
  );
}

const COLOR_MAP: Record<string, string> = {
  violet: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  blue: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  yellow: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  cyan: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  orange: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  gray: "border-border/40 bg-card/40 text-muted-foreground",
};

export default function HireSubmit() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const submitRequest = useSubmitHireRequest();
  const { data: settings } = useSettings();
  const { price: piPrice, toUsd } = usePiPrice();

  const [submitted, setSubmitted] = useState<HireRequest | null>(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [budgetPreset, setBudgetPreset] = useState<string | null>(null);

  const MIN_BUDGET_USD = 50;
  const minPiRequired = piPrice ? Math.ceil(MIN_BUDGET_USD / piPrice) : null;

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
    includesHosting: false,
    includesDomain: false,
    hostingMonths: "3",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const setField = (key: keyof typeof form, value: string | boolean) =>
    setForm(p => ({ ...p, [key]: value }));

  useEffect(() => {
    setErrors({});
  }, [step]);

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1 && !form.appType) errs.appType = "Please select what you're building";
    if (s === 2) {
      if (!form.title.trim()) errs.title = "Give your project a name";
      if (form.title.trim().length > 0 && form.title.trim().length < 5) errs.title = "Title should be at least 5 characters";
      if (!form.description.trim()) errs.description = "Describe your project";
      if (form.description.trim().length > 0 && form.description.trim().length < 30) errs.description = "Add more detail (at least 30 characters)";
    }
    if (s === 3 && minPiRequired) {
      const minVal = Number(form.budgetMin);
      if (form.budgetMin && minVal < minPiRequired) {
        errs.budgetMin = `Minimum budget is π${minPiRequired.toLocaleString()} Pi (~$${MIN_BUDGET_USD} USD) at current Pi price`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep(s => Math.min(s + 1, STEPS.length));
  };

  const back = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = () => {
    if (!validateStep(step)) return;
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
        includesHosting: form.includesHosting,
        includesDomain: form.includesDomain,
        hostingMonths: form.includesHosting ? Number(form.hostingMonths) : undefined,
        depositPiAmount: minPiRequired ?? undefined,
      },
      {
        onSuccess: (data) => setSubmitted(data),
        onError: (err: any) => toast({ title: "Submission failed", description: err.message, variant: "destructive" }),
      }
    );
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center p-6 pt-10">
        <SuccessScreen request={submitted} settings={settings} />
      </div>
    );
  }

  const selectedType = APP_TYPES.find(t => t.id === form.appType);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-2xl mx-auto py-10 px-4 pb-20">

        {/* Header */}
        <div className="mb-8">
          <Link href="/hire" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Hire a Developer
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <span className="text-xl font-black text-white" style={{ fontFamily: "serif" }}>π</span>
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">Project Brief</h1>
                <p className="text-xs text-muted-foreground">Step {step} of {STEPS.length} — {STEPS[step - 1].subtitle}</p>
              </div>
            </div>
            <StepIndicator current={step} total={STEPS.length} />
          </div>
        </div>

        {/* Step 1 — Project Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">What are you building?</h2>
              <p className="text-sm text-muted-foreground">Choose the type that best matches your project. This helps us assign the right developer.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {APP_TYPES.map(type => {
                const Icon = type.icon;
                const colorClass = COLOR_MAP[type.color];
                const isSelected = form.appType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setField("appType", type.id)}
                    className={cn(
                      "relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-150",
                      isSelected
                        ? "border-violet-500/60 bg-violet-500/10 shadow-sm shadow-violet-500/20"
                        : "border-border/40 bg-card/30 hover:border-violet-500/30 hover:bg-card/60"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
                        <Check className="w-3 h-3 text-violet-400" />
                      </div>
                    )}
                    <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center shrink-0", colorClass)}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1 pr-6">
                      <p className={cn("font-semibold text-sm", isSelected ? "text-foreground" : "text-foreground/80")}>{type.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{type.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {errors.appType && (
              <p className="flex items-center gap-1.5 text-sm text-red-400"><AlertCircle className="w-4 h-4" />{errors.appType}</p>
            )}

            {form.appType && (
              <TipBox tips={TYPE_TIPS[form.appType] ?? []} title={`💡 Tips for ${selectedType?.label}`} />
            )}

            <div className="flex items-center gap-2 p-3 rounded-xl bg-card/30 border border-border/30">
              <Shield className="w-4 h-4 text-violet-400 shrink-0" />
              <p className="text-xs text-muted-foreground">Your project details are private and only shared with our developer.</p>
            </div>
          </div>
        )}

        {/* Step 2 — Project Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Tell us about your project</h2>
              <p className="text-sm text-muted-foreground">The more detail you provide, the more accurate your quote will be.</p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Project Title <span className="text-red-400">*</span>
                <InfoPill text="Short, clear name" />
              </label>
              <Input
                placeholder={form.appType ? EXAMPLE_TITLES[form.appType] : "e.g. Pi Network Referral Dashboard"}
                value={form.title}
                onChange={set("title")}
                className={cn("bg-background/50 border-border/50 focus:border-violet-500/60", errors.title && "border-red-500/60")}
              />
              {errors.title && <p className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="w-3.5 h-3.5" />{errors.title}</p>}
              {form.title.trim().length > 0 && !errors.title && (
                <p className="text-xs text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Looks good</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Project Description <span className="text-red-400">*</span>
              </label>
              <Textarea
                placeholder={`Describe your ${selectedType?.label ?? "project"} in detail:\n• What does it do?\n• Who is it for?\n• Key features you need\n• Any technical requirements or preferences`}
                rows={6}
                value={form.description}
                onChange={set("description")}
                className={cn("bg-background/50 border-border/50 focus:border-violet-500/60 resize-none", errors.description && "border-red-500/60")}
              />
              <div className="flex items-center justify-between">
                {errors.description
                  ? <p className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="w-3.5 h-3.5" />{errors.description}</p>
                  : <span className="text-xs text-muted-foreground">Min. 30 characters</span>
                }
                <span className={cn("text-xs", form.description.length < 30 ? "text-muted-foreground" : "text-emerald-400")}>
                  {form.description.length} chars
                </span>
              </div>
            </div>

            {/* Blockchain */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Blockchain / Network</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BLOCKCHAIN_TYPES.map(b => (
                  <ChipButton key={b.id} selected={form.blockchainType === b.id} onClick={() => setField("blockchainType", b.id)}>
                    <span className="block text-sm pr-4">{b.label}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5 pr-4 leading-snug">{b.hint}</span>
                  </ChipButton>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Key Features <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                placeholder="List the specific features you need:&#10;• User authentication & profiles&#10;• Pi payment checkout&#10;• Admin dashboard&#10;• Real-time notifications&#10;• Mobile responsive"
                rows={4}
                value={form.features}
                onChange={set("features")}
                className="bg-background/50 border-border/50 focus:border-violet-500/60 resize-none"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> Feature lists help us scope the project accurately
              </p>
            </div>

            {form.appType && (
              <TipBox tips={TYPE_TIPS[form.appType] ?? []} title="💡 What to include" />
            )}
          </div>
        )}

        {/* Step 3 — Budget & Timeline */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Budget & Timeline</h2>
              <p className="text-sm text-muted-foreground">All payments are in Pi. We'll confirm the final quote before any payment is made.</p>
            </div>

            {/* Budget Presets */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <span className="text-yellow-400 font-black" style={{ fontFamily: "serif" }}>π</span> Budget Range (Pi)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BUDGET_PRESETS.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setBudgetPreset(p.label);
                      if (p.min !== null) setForm(f => ({ ...f, budgetMin: String(p.min), budgetMax: String(p.max) }));
                      else setForm(f => ({ ...f, budgetMin: "", budgetMax: "" }));
                    }}
                    className={cn(
                      "p-3 rounded-xl border text-center transition-all",
                      budgetPreset === p.label
                        ? "border-violet-500/60 bg-violet-500/10"
                        : "border-border/40 bg-card/30 hover:border-violet-500/30"
                    )}
                  >
                    <p className="font-semibold text-sm">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                    {p.min !== null && (
                      <p className="text-xs text-violet-300 mt-0.5">π{p.min}–{p.max}</p>
                    )}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Min (Pi)</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={form.budgetMin}
                    onChange={e => { setBudgetPreset("Custom"); set("budgetMin")(e); }}
                    className="bg-background/50 border-border/50"
                    min="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Max (Pi)</label>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={form.budgetMax}
                    onChange={e => { setBudgetPreset("Custom"); set("budgetMax")(e); }}
                    className="bg-background/50 border-border/50"
                    min="0"
                  />
                </div>
              </div>
              {form.budgetMin && form.budgetMax && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  Budget set to π{form.budgetMin}–{form.budgetMax}. Final price confirmed before payment.
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Timeline
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TIMELINES.map(t => (
                  <ChipButton key={t.id} selected={form.timeline === t.id} onClick={() => setField("timeline", t.id)}>
                    <span className="block font-semibold text-sm pr-4">{t.label}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5 pr-4">{t.note}</span>
                  </ChipButton>
                ))}
              </div>
            </div>

            {/* $50 minimum notice */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-200/80">
              <AlertCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
              <span>
                Minimum budget is <strong className="text-yellow-400">$50 USD</strong>
                {minPiRequired ? ` (~π${minPiRequired.toLocaleString()} Pi at current rate)` : ""}.
                {" "}A refundable deposit secures your project slot.
              </span>
            </div>
            {errors.budgetMin && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.budgetMin}
              </p>
            )}

            {/* Add-ons: Hosting & Domain */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-violet-400" /> Optional Add-ons
              </label>

              {/* Hosting */}
              <div
                onClick={() => setField("includesHosting", !form.includesHosting)}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                  form.includesHosting
                    ? "border-violet-500/50 bg-violet-500/10"
                    : "border-border/40 bg-card/30 hover:border-violet-500/30"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                  form.includesHosting ? "bg-violet-500 border-violet-500" : "border-border/60"
                )}>
                  {form.includesHosting && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Server className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-sm font-semibold">Include Hosting</span>
                    <Badge variant="outline" className="text-[10px] text-violet-300 border-violet-500/30">+$10/mo</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Cloud hosting on a reliable server. We deploy, monitor, and maintain your app.</p>
                  {form.includesHosting && (
                    <div className="mt-2 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <label className="text-xs text-muted-foreground shrink-0">Months:</label>
                      <div className="flex gap-1.5">
                        {["1", "3", "6", "12"].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setField("hostingMonths", m)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs border transition-all",
                              form.hostingMonths === m
                                ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                                : "border-border/40 text-muted-foreground hover:border-violet-500/30"
                            )}
                          >{m}mo</button>
                        ))}
                      </div>
                      <span className="text-xs text-violet-300 font-semibold ml-1">
                        = ${ (10 * Number(form.hostingMonths)).toFixed(0) }
                        {piPrice ? ` (~π${Math.ceil(10 * Number(form.hostingMonths) / piPrice).toLocaleString()})` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Domain */}
              <div
                onClick={() => setField("includesDomain", !form.includesDomain)}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                  form.includesDomain
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-border/40 bg-card/30 hover:border-blue-500/30"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                  form.includesDomain ? "bg-blue-500 border-blue-500" : "border-border/60"
                )}>
                  {form.includesDomain && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link2 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-sm font-semibold">Include Domain Name</span>
                    <Badge variant="outline" className="text-[10px] text-blue-300 border-blue-500/30">+$15/yr</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">We purchase and connect a .com or .io domain name for your app (1 year registration).</p>
                </div>
              </div>
            </div>

            <TipBox
              title="💡 About Pi Pricing"
              tips={[
                "All quotes are in Pi Network (π) — the native currency",
                "Funds go into escrow until you approve the delivery",
                "You only pay after reviewing and approving the work",
                "Post-launch support is included for 30 days",
              ]}
            />
          </div>
        )}

        {/* Step 4 — Contact */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">How should we reach you?</h2>
              <p className="text-sm text-muted-foreground">Optional — we can also message you inside Breedskoolpi. Providing these speeds up the process.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  WhatsApp Number <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </label>
                <Input
                  placeholder="+1 234 567 8900"
                  value={form.contactWhatsapp}
                  onChange={set("contactWhatsapp")}
                  className="bg-background/50 border-border/50 focus:border-emerald-500/40"
                />
                <p className="text-xs text-muted-foreground">Include country code. We'll send you a WhatsApp message with the quote.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  Telegram Handle <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </label>
                <Input
                  placeholder="@yourhandle"
                  value={form.contactTelegram}
                  onChange={set("contactTelegram")}
                  className="bg-background/50 border-border/50 focus:border-blue-500/40"
                />
                <p className="text-xs text-muted-foreground">We'll reach out on Telegram if WhatsApp isn't available.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  In-App Messages (always available)
                </label>
                <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 text-xs text-violet-300/80 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  You'll also receive all updates in your Breedskoolpi messages inbox — no extra setup needed.
                </div>
              </div>
            </div>

            {/* Summary preview */}
            <div className="rounded-xl border border-border/40 bg-card/30 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/30 bg-card/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Your brief summary
                </p>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { label: "Type", value: selectedType?.label },
                  { label: "Title", value: form.title || "—" },
                  { label: "Network", value: BLOCKCHAIN_TYPES.find(b => b.id === form.blockchainType)?.label },
                  { label: "Budget", value: form.budgetMin && form.budgetMax ? `π${form.budgetMin}–${form.budgetMax}` : form.budgetMin ? `From π${form.budgetMin}` : "Not specified" },
                  { label: "Timeline", value: TIMELINES.find(t => t.id === form.timeline)?.label || "Flexible" },
                  { label: "Hosting", value: form.includesHosting ? `Yes — ${form.hostingMonths} month${Number(form.hostingMonths) > 1 ? "s" : ""} (+$${10 * Number(form.hostingMonths)})` : "Not included" },
                  { label: "Domain", value: form.includesDomain ? "Yes — 1 year registration (+$15)" : "Not included" },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className={`text-xs font-semibold text-right truncate max-w-[60%] ${
                      row.label === "Hosting" && form.includesHosting ? "text-violet-400" :
                      row.label === "Domain" && form.includesDomain ? "text-blue-400" : ""
                    }`}>{row.value ?? "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-card/30 border border-border/30">
              <Shield className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                By submitting, you agree your brief is private, visible only to our developer.
                No payment until you approve a quote. 30-day post-launch support included.
              </p>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex items-center gap-3 mt-8">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={back}
              className="flex-1 border-border/50 bg-card/30 hover:bg-card/60"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
          )}
          {step < STEPS.length ? (
            <Button
              type="button"
              onClick={next}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-bold gap-2 rounded-xl shadow-lg shadow-violet-500/25"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitRequest.isPending}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-bold gap-2 rounded-xl shadow-lg shadow-violet-500/25 py-6"
            >
              {submitRequest.isPending
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</>
                : <><Sparkles className="w-5 h-5" /> Submit Project Brief</>
              }
            </Button>
          )}
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {STEPS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => { if (s.id < step) setStep(s.id); }}
              disabled={s.id > step}
              className={cn(
                "transition-all rounded-full",
                s.id === step ? "w-6 h-2 bg-violet-400" :
                s.id < step ? "w-2 h-2 bg-violet-500/60 cursor-pointer hover:bg-violet-500" :
                "w-2 h-2 bg-muted/40 cursor-not-allowed"
              )}
              title={s.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
