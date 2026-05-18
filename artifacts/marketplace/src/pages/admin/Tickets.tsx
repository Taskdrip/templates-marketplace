import { useListTickets, useUpdateTicket } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListTicketsQueryKey } from "@workspace/api-client-react";

export default function AdminTickets() {
  const { data: ticketsData, isLoading } = useListTickets();
  const updateTicket = useUpdateTicket();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [activeTicket, setActiveTicket] = useState<number | null>(null);
  const [reply, setReply] = useState("");

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !reply) return;

    updateTicket.mutate({
      id: activeTicket,
      data: { adminReply: reply, status: 'resolved' }
    }, {
      onSuccess: () => {
        toast({ title: "Reply sent", description: "The ticket has been updated and marked as resolved." });
        setReply("");
        setActiveTicket(null);
        queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-yellow-500/20 text-yellow-500 border-none';
      case 'in_progress': return 'bg-blue-500/20 text-blue-500 border-none';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-500 border-none';
      case 'closed': return 'bg-secondary text-secondary-foreground border-none';
      default: return 'bg-secondary text-secondary-foreground border-none';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground mt-1">Manage user support requests.</p>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card/50 border-border/50 animate-pulse h-24"></Card>
          ))
        ) : ticketsData?.tickets.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            No support tickets.
          </div>
        ) : (
          ticketsData?.tickets.map((ticket) => (
            <Card key={ticket.id} className="bg-card/50 border-border/50">
              <CardContent className="p-6 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(ticket.status)}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">#{ticket.id}</span>
                    <span className="text-xs font-medium">{ticket.username || `User ${ticket.userId}`}</span>
                  </div>
                  <h3 className="font-semibold">{ticket.subject}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                </div>
                
                <div className="flex flex-col justify-between items-end shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  
                  <Dialog open={activeTicket === ticket.id} onOpenChange={(open) => {
                    if (open) {
                      setActiveTicket(ticket.id);
                      setReply(ticket.adminReply || "");
                    } else {
                      setActiveTicket(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Respond</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border/50">
                      <DialogHeader>
                        <DialogTitle>Reply to Ticket #{ticket.id}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="bg-muted/30 p-4 rounded-lg text-sm border border-border/50">
                          <p className="font-semibold mb-1">User's Issue:</p>
                          <p className="text-muted-foreground">{ticket.description}</p>
                        </div>
                        
                        <form onSubmit={handleReply} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Your Reply</label>
                            <Textarea 
                              value={reply} 
                              onChange={(e) => setReply(e.target.value)}
                              className="min-h-[150px] bg-background"
                              placeholder="Type your response here..."
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button type="submit" disabled={updateTicket.isPending || !reply.trim()}>
                              {updateTicket.isPending ? "Sending..." : "Send Reply & Resolve"}
                            </Button>
                          </div>
                        </form>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
