import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSellerDeleteProduct, useUpdateProduct, useSellerUpdateProduct } from "@/hooks/useMutations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Package, Edit2, Trash2, Clock, CheckCircle2, XCircle, Eye } from "lucide-react";

function token() { return localStorage.getItem("cm_token"); }

async function fetchSellerProducts() {
  const res = await fetch("/api/seller/products", {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending:  { label: "Pending Review", color: "bg-amber-500/10 text-amber-400 border-amber-500/30", icon: Clock },
  active:   { label: "Live",           color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  rejected: { label: "Rejected",       color: "bg-red-500/10 text-red-400 border-red-500/30", icon: XCircle },
};

export default function SellerProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["seller-products"],
    queryFn: fetchSellerProducts,
  });

  const deleteProduct = useSellerDeleteProduct();
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(id);
    deleteProduct.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Product deleted" });
        queryClient.invalidateQueries({ queryKey: ["seller-products"] });
        setDeleting(null);
      },
      onError: (e: any) => {
        toast({ title: "Error", description: e.message, variant: "destructive" });
        setDeleting(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
          <p className="text-muted-foreground mt-1">Manage your listed digital products.</p>
        </div>
        <Button asChild>
          <Link href="/seller/products/new">
            <Plus className="w-4 h-4 mr-2" /> List New Product
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse bg-card/50 border-border/50">
              <CardContent className="p-6 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products listed yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Submit your first digital product for review. Once approved by admin it will go live on the marketplace.
            </p>
            <Button asChild>
              <Link href="/seller/products/new">
                <Plus className="w-4 h-4 mr-2" /> List Your First Product
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => {
            const cfg = statusConfig[product.status] ?? statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <Card key={product.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base leading-tight line-clamp-2">{product.name}</CardTitle>
                    <Badge variant="outline" className={`${cfg.color} shrink-0 text-xs flex items-center gap-1`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">{product.categoryName || "Uncategorized"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.shortDescription || product.description}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <div>
                      <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{product.salesCount} sales</p>
                    </div>
                    <div className="flex gap-1.5">
                      {product.status === "pending" && (
                        <Button size="sm" variant="outline" asChild className="h-8 px-2.5">
                          <Link href={`/seller/products/${product.id}/edit`}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      {product.status === "active" && (
                        <Button size="sm" variant="outline" asChild className="h-8 px-2.5">
                          <a href={`/products/${product.id}`} target="_blank" rel="noreferrer">
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {product.status === "pending" && (
                    <p className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5">
                      ⏳ Under review — admin will approve or request changes within 24h.
                    </p>
                  )}
                  {product.status === "rejected" && (
                    <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg p-2.5">
                      ❌ Rejected — edit and resubmit or contact support.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
