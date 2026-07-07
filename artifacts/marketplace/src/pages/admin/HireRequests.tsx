import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminHireRequests, useUpdateHireRequest,
  useAdminHireMilestones, useCreateMilestone, useReleaseMilestone,
  useActivateMilestone, useDeleteMilestone,
} from "@/hooks/useHireRequests";
import {
  Clock, CheckCircle2, XCircle, AlertCircle, Wrench, Phone, Send,
  ChevronDown, ChevronUp, Plus, Trash2, PlayCircle, Unlock,
  Server, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:     { label: "Pending",     color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: <Clock className="w-3 h-3" /> },
  reviewing:   { label: "Reviewing",   color: "bg-blue-500/10 text-blue-400 border-blue-500/30",    icon: <AlertCircle className="w-3 h-3" /> },
  in_progress: { label: "In Progress", color: "bg-violet-500/10 text-violet-400 border-violet-500/30", icon: <Wrench className="w-3 h-3" /> },
  completed:   { label: "Completed",   color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelled:   { label: "Cancelled",   color: "bg-red-500/10 text-red-400 border-red-500/30",      icon: <XCircle className="w-3 h-3" /> },
};

const TYPE_LABELS: Record<string, string> = {
  "web-app": "Web App", "mobile-app": "Mobile App", "defi": "DeFi/Blockchain",
  "bot": "Bot/Automation", "script-api": "Script/API", "pi-tool": "Pi Tool", "other": "Other",
};

const MILESTONE_COLORS: Record<string, string> = {
  locked:   "bg-muted/50 text-muted-foreground border-border/50",
  active:   "bg-blue-500/10 text-blue-400 border-blue-500/30",
  released: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

function MilestonePanel({ requestId }: { requestId: number }) {
  const { data: milestones, isLoading } = useAdminHireMilestones(requestId);
  const create = useCreateMilestone();
  const release = useReleaseMilestone();
  const activate = useActivateMilestone();
  const del = useDeleteMilestone();
  const { toast } = useToast();

  const [form, setForm] = useState({ title: "", description: "", amountPi: "" });

  const handleCreate = () => {
    if (!form.title || !form.amountPi) return;
    create.mutate(
      { requestId, title: form.title, description: form.description, amountPi: Number(form.amountPi), orderIndex: (milestones?.length ?? 0) },
      {
        onSuccess: () => { toast({ title: "Milestone added" }); setForm({ title: "", description: "", amountPi: "" }); },
        onError: () => toast({ title: "Failed to add milestone", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment Milestones</p>
        {milestones?.length ? (
          <span className="text-xs text-muted-foreground">
            Total: <span className="text-yellow-400 font-semibold font-serif">π</span>
            {milestones.reduce((s, m) => s + Number(m.amountPi), 0).toFixed(2)} Pi
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="h-12 bg-muted animate-pulse rounded-lg" />
      ) : milestones?.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No milestones yet. Add payment milestones below.</p>
      ) : (
        <div className="space-y-2">
          {milestones!.map((m, i) => (
            <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border ${MILESTONE_COLORS[m.status]}`}>
              <div className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{m.title}</p>
                {m.description && <p className="text-[10px] text-muted-foreground truncate">{m.description}</p>}
                {m.releasedAt && <p className="text-[10px] text-emerald-400">Released {new Date(m.releasedAt).toLocaleDateString()}</p>}
              </div>
              <span className="text-xs font-bold shrink-0">
                <span className="font-serif">π</span>{Number(m.amountPi).toFixed(2)}
              </span>
              <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${MILESTONE_COLORS[m.status]}`}>
                {m.status}
              </Badge>
              <div className="flex gap-1 shrink-0">
                {m.status === "locked" && (
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-400 hover:text-blue-300"
                    title="Activate"
                    onClick={() => activate.mutate({ id: m.id, requestId }, {
                      onSuccess: () => toast({ title: "Milestone activated" }),
                    })}>
                    <PlayCircle className="w-3.5 h-3.5" />
                  </Button>
                )}
                {m.status === "active" && (
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-400 hover:text-emerald-300"
                    title="Release funds"
                    onClick={() => release.mutate({ id: m.id, requestId }, {
                      onSuccess: () => toast({ title: "Funds released!" }),
                    })}>
                    <Unlock className="w-3.5 h-3.5" />
                  </Button>
                )}
                {m.status !== "released" && (
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400 hover:text-red-300"
                    title="Delete"
                    onClick={() => del.mutate({ id: m.id, requestId }, {
                      onSuccess: () => toast({ title: "Milestone deleted" }),
                    })}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add milestone form */}
      <div className="p-3 bg-background/50 border border-border/40 rounded-xl space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Add Milestone</p>
        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="Title (e.g. Design Phase)"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="col-span-2 h-8 text-xs bg-background/60"
          />
          <Input
            placeholder="π Amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amountPi}
            onChange={e => setForm(f => ({ ...f, amountPi: e.target.value }))}
            className="h-8 text-xs bg-background/60"
          />
        </div>
        <Input
          placeholder="Description (optional)"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="h-8 text-xs bg-background/60"
        />
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1 border-violet-500/30 text-violet-400"
          onClick={handleCreate}
          disabled={create.isPending || !form.title || !form.amountPi}
        >
          <Plus className="w-3 h-3" /> Add Milestone
        </Button>
      </div>
    </div>
  );
}

function RequestCard({ req }: { req: any }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(req.status);
  const [notes, setNotes] = useState(req.adminNotes || "");
  const update = useUpdateHireRequest();
  const { toast } = useToast();

  const statusInfo = STATUS_MAP[req.status] ?? STATUS_MAP.pending;
  const waMsg = encodeURIComponent(`Hi! This is Breedskoolpi.store regarding your project request #${req.id}: "${req.title}".`);
  const tgMsg = encodeURIComponent(`Hi! This is Breedskoolpi.store regarding your project request #${req.id}: "${req.title}".`);

  const handleUpdate = () => {
    update.mutate({ id: req.id, status, adminNotes: notes }, {
      onSuccess: () => toast({ title: "Updated", description: `Request #${req.id} updated.` }),
      onError: () => toast({ title: "Update failed", variant: "destructive" }),
    });
  };

  return (
    <Card className={cn("bg-card/50 border-border/50 transition-all", expanded && "border-violet-500/20")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs text-muted-foreground font-mono">#{req.id}</span>
              <h3 className="font-semibold text-sm truncate">{req.title}</h3>
            </div>
            <p className={cn("text-xs text-muted-foreground", !expanded && "line-clamp-2")}>{req.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={`${statusInfo.color} flex items-center gap-1 text-xs`}>
              {statusInfo.icon} {statusInfo.label}
            </Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {req.appType && <Badge variant="outline" className="text-[10px]">{TYPE_LABELS[req.appType] || req.appType}</Badge>}
          {req.blockchainType && <Badge variant="outline" className="text-[10px] text-yellow-400 border-yellow-500/20">{req.blockchainType === "pi" ? "π Pi Network" : req.blockchainType}</Badge>}
          {(req.budgetMin || req.budgetMax) && (
            <Badge variant="outline" className="text-[10px]">
              <span className="text-yellow-400 font-black" style={{ fontFamily: "serif" }}>π</span>
              {req.budgetMin}–{req.budgetMax} Pi
            </Badge>
          )}
          {req.timeline && <Badge variant="outline" className="text-[10px]">{req.timeline}</Badge>}
          {req.includesHosting && (
            <Badge variant="outline" className="text-[10px] text-violet-400 border-violet-500/20 flex items-center gap-1">
              <Server className="w-2.5 h-2.5" /> Hosting
              {req.hostingMonths ? ` (${req.hostingMonths}mo)` : ""}
            </Badge>
          )}
          {req.includesDomain && (
            <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/20 flex items-center gap-1">
              <Globe className="w-2.5 h-2.5" /> Domain
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto">{new Date(req.createdAt).toLocaleDateString()} · User #{req.userId}</span>
        </div>

        {/* Contact buttons */}
        <div className="flex gap-2 flex-wrap mb-3">
          {req.contactWhatsapp && (
            <a href={`https://wa.me/${req.contactWhatsapp.replace(/\D/g, "")}?text=${waMsg}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                <Phone className="w-3 h-3" /> {req.contactWhatsapp}
              </Button>
            </a>
          )}
          {req.contactTelegram && (
            <a href={`https://t.me/${req.contactTelegram.replace("@", "")}?text=${tgMsg}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                <Send className="w-3 h-3" /> {req.contactTelegram}
              </Button>
            </a>
          )}
        </div>

        {expanded && (
          <div className="space-y-5 border-t border-border/40 pt-4 mt-2">
            {req.features && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Features Requested:</p>
                <p className="text-xs text-foreground/80 bg-background/50 rounded-lg p-3 border border-border/30 leading-relaxed">{req.features}</p>
              </div>
            )}

            {/* Milestone section */}
            <MilestonePanel requestId={req.id} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Update Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9 text-sm bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_MAP).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Admin Notes (visible to user)</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add a note for the client about status, pricing, next steps..."
                rows={3}
                className="text-sm bg-background/50 resize-none"
              />
            </div>

            <Button
              size="sm"
              className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-sm"
              onClick={handleUpdate}
              disabled={update.isPending}
            >
              {update.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminHireRequests() {
  const { data: requests, isLoading } = useAdminHireRequests();
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = statusFilter === "all"
    ? (requests ?? [])
    : (requests ?? []).filter(r => r.status === statusFilter);

  const counts = (requests ?? []).reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hire Requests</h1>
          <p className="text-muted-foreground mt-1">Manage custom development requests — set milestones and release funds per phase</p>
        </div>
        <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-base px-3 py-1">
          {requests?.length ?? 0} total
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(STATUS_MAP).map(([k, v]) => (
          <Card key={k} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{counts[k] || 0}</div>
              <div className="text-xs text-muted-foreground">{v.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...Object.keys(STATUS_MAP)].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              statusFilter === s
                ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                : "bg-card/50 border-border/50 text-muted-foreground hover:border-violet-500/20"
            )}
          >
            {s === "all" ? "All" : STATUS_MAP[s]?.label} {s === "all" ? `(${requests?.length ?? 0})` : counts[s] ? `(${counts[s]})` : ""}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : !filtered.length ? (
        <Card className="bg-card/50 border-border/50 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-sm">No {statusFilter === "all" ? "" : statusFilter} requests yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => <RequestCard key={req.id} req={req} />)}
        </div>
      )}
    </div>
  );
}
