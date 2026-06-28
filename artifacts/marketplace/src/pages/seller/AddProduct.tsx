import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSellerSubmitProduct } from "@/hooks/useMutations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Info } from "lucide-react";
import { Link } from "wouter";

function token() { return localStorage.getItem("cm_token"); }

async function fetchCategories() {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json();
}

const tips = [
  "Provide a detailed, honest description. Buyers review carefully.",
  "Include version number and any framework/language requirements.",
  "A demo URL or screenshots greatly increase conversion rates.",
  "Set a realistic price — check competitor listings first.",
  "Your product will be reviewed by admin within 24 hours.",
];

export default function SellerAddProduct() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const submit = useSellerSubmitProduct();

  const { data: catData } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const categories = catData?.categories ?? catData ?? [];

  const [form, setForm] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    version: "",
    demoUrl: "",
    downloadUrl: "",
    documentation: "",
    tags: "",
    previewImages: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price || !form.categoryId) {
      toast({ title: "Missing fields", description: "Name, description, price and category are required.", variant: "destructive" });
      return;
    }
    submit.mutate({
      data: {
        name: form.name,
        description: form.description,
        shortDescription: form.shortDescription || undefined,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        categoryId: parseInt(form.categoryId, 10),
        version: form.version || undefined,
        demoUrl: form.demoUrl || undefined,
        downloadUrl: form.downloadUrl || undefined,
        documentation: form.documentation || undefined,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        previewImages: form.previewImages ? form.previewImages.split("\n").map(u => u.trim()).filter(Boolean) : [],
      },
    }, {
      onSuccess: () => {
        toast({ title: "Product submitted!", description: "Your product is now under admin review." });
        queryClient.invalidateQueries({ queryKey: ["seller-products"] });
        setLocation("/products");
      },
      onError: (err: any) => {
        toast({ title: "Submission failed", description: err.message, variant: "destructive" });
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/seller/products"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">List New Product</h1>
          <p className="text-muted-foreground mt-1">Fill in the details below. Admin will review and approve within 24h.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" value={form.name} onChange={set("name")} placeholder="e.g. Flash Loan Arbitrage Bot" className="bg-background/50" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (π Pi) *</Label>
                  <Input id="price" type="number" min="1" step="0.01" value={form.price} onChange={set("price")} placeholder="99.00" className="bg-background/50" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (optional)</Label>
                  <Input id="originalPrice" type="number" min="1" step="0.01" value={form.originalPrice} onChange={set("originalPrice")} placeholder="149.00" className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDesc">Short Description</Label>
                <Input id="shortDesc" value={form.shortDescription} onChange={set("shortDescription")} placeholder="One-line product summary (shown in cards)" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Full Description *</Label>
                <Textarea id="desc" value={form.description} onChange={set("description")} rows={8} placeholder="Describe your product in detail. Include features, requirements, and what buyers will receive." className="bg-background/50 resize-none" required />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input id="version" value={form.version} onChange={set("version")} placeholder="1.0.0" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" value={form.tags} onChange={set("tags")} placeholder="defi, ethereum, bot" className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="demoUrl">Demo URL (optional)</Label>
                <Input id="demoUrl" type="url" value={form.demoUrl} onChange={set("demoUrl")} placeholder="https://youtube.com/watch?v=..." className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downloadUrl">Download URL *</Label>
                <Input id="downloadUrl" type="url" value={form.downloadUrl} onChange={set("downloadUrl")} placeholder="https://drive.google.com/... or direct link" className="bg-background/50" />
                <p className="text-xs text-muted-foreground">This will only be shared with buyers after admin confirms payment.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="previewImages">Preview Image URLs (one per line)</Label>
                <Textarea id="previewImages" value={form.previewImages} onChange={set("previewImages")} rows={3} placeholder={"https://i.imgur.com/example.png\nhttps://i.imgur.com/example2.png"} className="bg-background/50 resize-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="docs">Documentation / Setup Guide</Label>
                <Textarea id="docs" value={form.documentation} onChange={set("documentation")} rows={5} placeholder="Step-by-step setup instructions. Supports Markdown." className="bg-background/50 resize-none" />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={submit.isPending}>
            <Upload className="w-4 h-4 mr-2" />
            {submit.isPending ? "Submitting..." : "Submit for Review"}
          </Button>
        </form>

        <div className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="w-4 h-4 text-primary" />
                Listing Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Revenue Split</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your earnings</span>
                <span className="font-semibold text-emerald-400">90%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform fee</span>
                <span className="font-semibold">10%</span>
              </div>
              <div className="h-px bg-border/50" />
              <p className="text-xs text-muted-foreground">Funds are held in escrow until the buyer confirms receipt, then released to your Pi wallet.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
