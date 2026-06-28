import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSellerUpdateProduct } from "@/hooks/useMutations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Link } from "wouter";
import ProductImageUploader from "@/components/product/ProductImageUploader";

function token() { return localStorage.getItem("cm_token"); }

async function fetchProduct(id: string) {
  const res = await fetch(`/api/seller/products`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error("Failed to load products");
  const products = await res.json();
  const product = products.find((p: any) => String(p.id) === id);
  if (!product) throw new Error("Product not found");
  return product;
}

async function fetchCategories() {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json();
}

export default function SellerEditProduct() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const update = useSellerUpdateProduct();

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["seller-product", id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  });

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
  });
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? "",
        description: product.description ?? "",
        shortDescription: product.shortDescription ?? "",
        price: String(product.price ?? ""),
        originalPrice: product.originalPrice ? String(product.originalPrice) : "",
        categoryId: String(product.categoryId ?? ""),
        version: product.version ?? "",
        demoUrl: product.demoUrl ?? "",
        downloadUrl: product.downloadUrl ?? "",
        documentation: product.documentation ?? "",
        tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
      });
      setPreviewImages(Array.isArray(product.previewImages) ? product.previewImages : []);
    }
  }, [product]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price || !form.categoryId) {
      toast({ title: "Missing fields", description: "Name, description, price and category are required.", variant: "destructive" });
      return;
    }
    update.mutate({
      id: Number(id),
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
        previewImages,
      },
    }, {
      onSuccess: () => {
        toast({ title: "Product updated!", description: "Your product has been resubmitted for review." });
        queryClient.invalidateQueries({ queryKey: ["seller-products"] });
        setLocation("/seller/products");
      },
      onError: (err: any) => {
        toast({ title: "Update failed", description: err.message, variant: "destructive" });
      },
    });
  };

  if (productLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/seller/products"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground mt-1">Update your listing. Changes will require admin re-approval.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" value={form.name} onChange={set("name")} className="bg-background/50" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (π Pi) *</Label>
                <Input id="price" type="number" min="1" step="0.01" value={form.price} onChange={set("price")} className="bg-background/50" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (optional)</Label>
                <Input id="originalPrice" type="number" min="1" step="0.01" value={form.originalPrice} onChange={set("originalPrice")} className="bg-background/50" />
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
              <Input id="shortDesc" value={form.shortDescription} onChange={set("shortDescription")} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Full Description *</Label>
              <Textarea id="desc" value={form.description} onChange={set("description")} rows={8} className="bg-background/50 resize-none" required />
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
              <Label htmlFor="downloadUrl">Download URL</Label>
              <Input id="downloadUrl" type="url" value={form.downloadUrl} onChange={set("downloadUrl")} placeholder="https://drive.google.com/..." className="bg-background/50" />
              <p className="text-xs text-muted-foreground">Shared with buyers only after admin confirms payment.</p>
            </div>
            <ProductImageUploader images={previewImages} onChange={setPreviewImages} />
            <div className="space-y-2">
              <Label htmlFor="docs">Documentation / Setup Guide</Label>
              <Textarea id="docs" value={form.documentation} onChange={set("documentation")} rows={5} className="bg-background/50 resize-none" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" size="lg" disabled={update.isPending} className="flex-1">
            {update.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {update.isPending ? "Saving…" : "Save & Resubmit for Review"}
          </Button>
          <Button type="button" variant="outline" size="lg" asChild>
            <Link href="/seller/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
