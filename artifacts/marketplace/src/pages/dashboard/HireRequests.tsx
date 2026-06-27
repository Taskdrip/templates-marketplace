import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHireRequests } from "@/hooks/useHireRequests";
import { useSettings } from "@/hooks/useSettings";
import { ArrowRight, Plus, Clock, CheckCircle2, XCircle, AlertCircle, Wrench, MessageSquare, Phone, Send, ExternalLink } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:     { label: "Pending Review", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: <Clock className="w-3 h-3" /> },
  reviewing:   { label: "Under Review",   color: "bg-blue-500/10 text-blue-400 border-blue-500/30",    icon: <AlertCircle className="w-3 h-3" /> },
  in_progress: { label: "In Progress",    color: "bg-violet-500/10 text-violet-400 border-violet-500/30", icon: <Wrench className="w-3 h-3" /> },
  completed:   { label: "Completed",      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelled:   { label: "Cancelled",      color: "bg-red-500/10 text-red-400 border-red-500/30",      icon: <XCircle className="w-3 h-3" /> },
};

const TYPE_LABELS: Record<string, string> = {
  "web-app": "Web App / SaaS", "mobile-app": "Mobile App", "defi": "DeFi / Blockchain",
  "bot": "Bot / Automation", "script-api": "Script / API", "pi-tool": "Pi Network Tool", "other": "Other",
};

export default function HireRequestsDashboard() {
  const { data: requests, isLoading } = useHireRequests();
  const { data: settings } = useSettings();

  const whatsappNumber = settings?.hire_whatsapp?.replace(/\D/g, "") || "";
  const telegramHandle = settings?.hire_telegram?.replace("@", "") || "";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hire Requests</h1>
          <p className="text-muted-foreground mt-1">Track your custom development project requests</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 gap-2">
          <Link href="/hire/submit">
            <Plus className="w-4 h-4" /> New Request
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : !requests?.length ? (
        <Card className="bg-card/50 border-border/50 border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
              <span className="text-3xl font-black text-violet-400" style={{ fontFamily: "serif" }}>π</span>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">No requests yet</h3>
              <p className="text-sm text-muted-foreground">Submit your first project brief and our developer will get back to you within 24 hours.</p>
            </div>
            <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-700 gap-2">
              <Link href="/hire/submit"><Plus className="w-4 h-4" /> Submit a Project</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const status = STATUS_MAP[req.status] ?? STATUS_MAP.pending;
            const message = encodeURIComponent(`Hi! Regarding my hire request #${req.id}: "${req.title}". I'd like to follow up.`);
            return (
              <Card key={req.id} className="bg-card/50 border-border/50 hover:border-violet-500/20 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-base truncate">{req.title}</h3>
                        <Badge className={`${status.color} flex items-center gap-1 text-xs shrink-0`}>
                          {status.icon} {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{req.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">#{req.id}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {req.appType && <Badge variant="outline" className="text-[10px] border-border/50">{TYPE_LABELS[req.appType] || req.appType}</Badge>}
                    {req.blockchainType && <Badge variant="outline" className="text-[10px] border-border/50 text-yellow-400 border-yellow-500/20">{req.blockchainType === "pi" ? "π Pi Network" : req.blockchainType}</Badge>}
                    {(req.budgetMin || req.budgetMax) && (
                      <Badge variant="outline" className="text-[10px] border-border/50">
                        <span className="text-yellow-400 font-black" style={{ fontFamily: "serif" }}>π</span>
                        {req.budgetMin && req.budgetMax ? `${req.budgetMin}–${req.budgetMax}` : req.budgetMin || req.budgetMax}
                      </Badge>
                    )}
                    {req.timeline && <Badge variant="outline" className="text-[10px] border-border/50">{req.timeline}</Badge>}
                  </div>

                  {req.adminNotes && (
                    <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-3 mb-3">
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Admin Note:</p>
                      <p className="text-xs text-violet-200">{req.adminNotes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-border/30 mt-2 flex-wrap">
                    <span className="text-[10px] text-muted-foreground mr-auto">{new Date(req.createdAt).toLocaleDateString()}</span>
                    {whatsappNumber && (
                      <a href={`https://wa.me/${whatsappNumber}?text=${message}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-1">
                          <Phone className="w-3 h-3" /> WhatsApp
                        </Button>
                      </a>
                    )}
                    {telegramHandle && (
                      <a href={`https://t.me/${telegramHandle}?text=${message}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="h-7 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10 gap-1">
                          <Send className="w-3 h-3" /> Telegram
                        </Button>
                      </a>
                    )}
                    <Link href="/dashboard/messages">
                      <Button size="sm" variant="outline" className="h-7 text-xs border-violet-500/30 text-violet-400 hover:bg-violet-500/10 gap-1">
                        <MessageSquare className="w-3 h-3" /> In-App Chat
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
