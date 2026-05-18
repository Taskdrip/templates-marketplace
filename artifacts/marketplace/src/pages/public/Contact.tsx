import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent",
      description: "We've received your message and will get back to you shortly.",
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12 md:py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Get in Touch</h1>
        <p className="text-xl text-muted-foreground">
          Have a question or need assistance? Our team is here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h3 className="text-xl font-bold mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Email</h4>
                  <p className="text-muted-foreground">support@cryptomarket.io</p>
                  <p className="text-muted-foreground">partners@cryptomarket.io</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Live Chat</h4>
                  <p className="text-muted-foreground">Available 24/7 for Enterprise customers in the dashboard.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Headquarters</h4>
                  <p className="text-muted-foreground">Crypto Valley<br />Zug, Switzerland</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>Fill out the form below and we'll respond within 24 hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" placeholder="John" required className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" placeholder="Doe" required className="bg-background/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Provide as much detail as possible..." 
                    className="min-h-[150px] bg-background/50"
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full md:w-auto px-8">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
