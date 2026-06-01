import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@workspace/api-client-react";
import { Store, User, CheckCircle2, ArrowRight } from "lucide-react";

const schema = z.object({
  displayName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  telegramHandle: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  sellerBio: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { toast } = useToast();
  const [accountType, setAccountType] = useState<"buyer" | "seller">("buyer");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", username: "", email: "", phone: "", telegramHandle: "", password: "", confirmPassword: "", sellerBio: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const telegramClean = values.telegramHandle?.replace(/^@/, "") || undefined;
      const res = await customFetch<any>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
          displayName: values.displayName,
          phone: values.phone || undefined,
          telegramHandle: telegramClean,
          isSeller: accountType === "seller",
          sellerBio: accountType === "seller" ? values.sellerBio : undefined,
        }),
      });
      setAuth(res.token, res.user);
      toast({ title: "Welcome to Vaultrade.store 🎉", description: "Your account has been created successfully." });
      setLocation(accountType === "seller" ? "/dashboard" : "/marketplace");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Could not create account.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
          <p className="text-muted-foreground mt-2 text-sm">Join thousands of buyers and sellers on Vaultrade.store</p>
        </div>

        {/* Account type toggle */}
        <div className="flex rounded-xl overflow-hidden border border-border/50 bg-card/50 p-1 gap-1">
          <button
            type="button"
            onClick={() => setAccountType("buyer")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${accountType === "buyer" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <User className="w-4 h-4" /> Buyer Account
          </button>
          <button
            type="button"
            onClick={() => setAccountType("seller")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${accountType === "seller" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Store className="w-4 h-4" /> Seller Account
          </button>
        </div>

        {accountType === "seller" && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Seller Benefits</p>
              <p className="text-muted-foreground mt-0.5">List unlimited products, receive USDT payments, and access seller analytics. 10% platform fee.</p>
            </div>
          </div>
        )}

        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="displayName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} className="bg-background/50" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl><Input placeholder="john_doe" {...field} className="bg-background/50" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="john@example.com" {...field} className="bg-background/50" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl><Input placeholder="+1 234 567 8900" {...field} className="bg-background/50" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="telegramHandle" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl><Input placeholder="@username" {...field} className="bg-background/50" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {accountType === "seller" && (
                <FormField control={form.control} name="sellerBio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seller Bio <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl><Textarea placeholder="Briefly describe what you sell..." {...field} className="bg-background/50 resize-none h-20" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="Min. 6 characters" {...field} className="bg-background/50" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl><Input type="password" placeholder="Repeat password" {...field} className="bg-background/50" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full h-11 font-semibold shadow-lg shadow-primary/20 rounded-xl mt-2" disabled={isLoading}>
                {isLoading ? "Creating account..." : (<>Create {accountType === "seller" ? "Seller" : ""} Account <ArrowRight className="ml-2 w-4 h-4" /></>)}
              </Button>
            </form>
          </Form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
