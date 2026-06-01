import { useListTickets } from "@workspace/api-client-react";
import { useCreateTicket } from "@/hooks/useMutations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Ticket as TicketIcon, Plus, MessageSquare } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListTicketsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.string().default("medium"),
});

export default function Tickets() {
  const { data: tickets, isLoading } = useListTickets();
  const createTicket = useCreateTicket();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: "medium",
    },
  });

  const onSubmit = (values: z.infer<typeof ticketSchema>) => {
    createTicket.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Ticket created", description: "Support will review your ticket shortly." });
        setOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30';
      case 'closed': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch(priority) {
      case 'high': return 'text-destructive';
      case 'low': return 'text-muted-foreground';
      default: return 'text-primary';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Get help with your purchases or account.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief summary of the issue" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide details about your issue..."
                          className="min-h-[150px] bg-background/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createTicket.isPending}>
                    {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-card/50 border-border/50 animate-pulse h-32"></Card>
          ))
        ) : !tickets?.length ? (
          <div className="py-24 text-center bg-card/30 border border-border/50 rounded-2xl">
            <TicketIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-medium">No support tickets</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              You haven't submitted any support tickets yet. Need help? Create a new ticket.
            </p>
          </div>
        ) : (
          tickets.map((ticket: any) => (
            <Card key={ticket.id} className="bg-card/50 border-border/50 hover:bg-muted/20 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className={`${getStatusColor(ticket.status)} border-none capitalize`}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">#{ticket.id}</span>
                      <span className={`text-xs font-medium uppercase ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority} priority
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{ticket.description}</p>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    <Button variant="outline" size="sm" className="mt-4 sm:mt-0">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      View Thread
                    </Button>
                  </div>
                </div>

                {ticket.adminReply && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs font-semibold text-primary mb-1">Latest Reply from Support:</p>
                    <p className="text-sm text-muted-foreground">{ticket.adminReply}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
