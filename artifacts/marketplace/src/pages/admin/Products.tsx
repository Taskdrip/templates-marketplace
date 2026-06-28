import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUpdateProduct, useDeleteProduct } from "@/hooks/useMutations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Search, Eye, Trash2, Clock, Package, User, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "pending" | "active" | "rejected";

type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  originalPrice: number | null;
  categoryId: number;
  categoryName: string | null;
  tags: string[];
  previewImages: string[];
  status: string;
  isFeatured: boolean;
  salesCount: number;
  sellerId: number | null;
  sellerEmail: string | null;
  sellerName: string | null;
  createdAt: string;
};

const TOKEN = () => localStorage.getItem("cm_token");

async function fetchAdminProducts(status: StatusFilter): Promise<AdminProduct[]> {
  const params = status !== "all" ? `?status=${status}` : "";
  const res = await fetch(`/api/admin/products${params}`, {
    headers: { Authorization: `Bearer ${TOKEN()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

async function approveProduct(id: number): Promise<void> {
  const res = await fetch(`/api/admin/products/${id}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${TOKEN()}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to approve product");
}

async function rejectProduct(id: number, reason?: string): Promise<void> {
  const res = await fetch(`/api/admin/products/${id}/reject`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${TOKEN()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error("Failed to reject product");
}

const statusStyle: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-none",
  pending: "bg-yellow-500/10 text-yellow-400 border-none",
  rejected: "bg-red-500/10 text-red-400 border-none",
};

export default function AdminProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [viewProduct, setViewProduct] = useState<AdminProduct | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const deleteProduct = useDeleteProduct();

  const { data: products = [], isLoading, refetch } = useQuery<AdminProduct[]>({
    queryKey: ["admin-products", statusFilter],
    queryFn: () => fetchAdminProducts(statusFilter),
  });

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sellerEmail ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    all: products.length,
    pending: products.filter(p => p.status === "pending").length,
    active: products.filter(p => p.status === "active").length,
    rejected: products.filter(p => p.status === "rejected").length,
  };

  const handleApprove = async (product: AdminProduct) => {
    try {
      await approveProduct(product.id);
      toast({ title: "Product Approved ✓", description: `"${product.name}" is now live on the marketplace. Seller notified.` });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch {
      toast({ title: "Error", description: "Failed to approve product.", variant: "destructive" });
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    const product = products.find(p => p.id === rejectId);
    try {
      await rejectProduct(rejectId, rejectReason || undefined);
      toast({ title: "Product Rejected", description: `"${product?.name}" has been rejected. Seller notified.` });
      setRejectId(null);
      setRejectReason("");
      refetch();
    } catch {
      toast({ title: "Error", description: "Failed to reject product.", variant: "destructive" });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProduct.mutate({ id: deleteId }, {
      onSuccess: () => {
        toast({ title: "Product deleted" });
        setDeleteId(null);
        refetch();
      },
      onError: () => toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }),
    });
  };

  const pendingCount = products.filter(p => p.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Review, approve and manage all marketplace listings.</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-400 font-medium">{pendingCount} pending review</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Tabs value={statusFilter} onValueChange={v => { setStatusFilter(v as StatusFilter); setSearch(""); }}>
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="all">All <span className="ml-1.5 text-xs opacity-60">({counts.all})</span></TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
              Pending {counts.pending > 0 && <span className="ml-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{counts.pending}</span>}
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Active ({counts.active})</TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">Rejected ({counts.rejected})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9 bg-background" placeholder="Search product or seller..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price (π Pi)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted/50 rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="w-8 h-8 opacity-30" />
                    <p>{statusFilter === "pending" ? "No products awaiting review." : "No products found."}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow key={product.id} className={cn(
                  "hover:bg-muted/20 transition-colors",
                  product.status === "pending" && "border-l-2 border-l-yellow-500/50"
                )}>
                  <TableCell className="max-w-[200px]">
                    <div className="flex items-center gap-3">
                      {product.previewImages?.[0] ? (
                        <img src={product.previewImages[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-border/40" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate text-sm">{product.name}</p>
                        {product.shortDescription && (
                          <p className="text-xs text-muted-foreground truncate">{product.shortDescription}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {(product.sellerName || product.sellerEmail || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{product.sellerName || "—"}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{product.sellerEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.categoryName ?? "—"}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-sm flex items-center gap-0.5">
                      <span style={{ fontFamily: "serif" }}>π</span>{product.price.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize text-xs", statusStyle[product.status] ?? "")}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {product.status === "pending" && (
                        <>
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            onClick={() => handleApprove(product)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => { setRejectId(product.id); setRejectReason(""); }}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </>
                      )}
                      {product.status === "active" && (
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => { setRejectId(product.id); setRejectReason(""); }}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Delist
                        </Button>
                      )}
                      {product.status === "rejected" && (
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          onClick={() => handleApprove(product)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Re-approve
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewProduct(product)}>
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteId(product.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectId !== null} onOpenChange={open => !open && setRejectId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              The seller will be notified with the reason below. Leave blank for a generic rejection message.
            </p>
            <Input
              placeholder="Reason (optional) e.g. Missing description, invalid download URL..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Reject & Notify Seller</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Preview Dialog */}
      <Dialog open={viewProduct !== null} onOpenChange={open => !open && setViewProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {viewProduct.name}
                  <Badge variant="outline" className={cn("ml-2 capitalize text-xs", statusStyle[viewProduct.status])}>
                    {viewProduct.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {viewProduct.previewImages?.[0] && (
                  <img src={viewProduct.previewImages[0]} alt="" className="w-full h-48 object-cover rounded-lg" />
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Seller</p>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span className="font-medium">{viewProduct.sellerName || "—"}</span>
                      <span className="text-muted-foreground text-xs">({viewProduct.sellerEmail})</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-bold text-lg"><span style={{ fontFamily: "serif" }}>π</span>{viewProduct.price.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Category</p>
                    <p>{viewProduct.categoryName ?? "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Submitted</p>
                    <p>{new Date(viewProduct.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {viewProduct.shortDescription && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Summary</p>
                    <p className="text-sm">{viewProduct.shortDescription}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Full Description</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border border-border/40 max-h-40 overflow-y-auto">{viewProduct.description}</p>
                </div>
                {viewProduct.demoUrl && (
                  <div className="flex items-center gap-2">
                    <a href={viewProduct.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> View Demo
                    </a>
                  </div>
                )}
                {viewProduct.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {viewProduct.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                {viewProduct.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                      onClick={() => { setViewProduct(null); setRejectId(viewProduct.id); }}
                    >
                      <XCircle className="w-4 h-4 mr-1.5" /> Reject
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-500"
                      onClick={() => { handleApprove(viewProduct); setViewProduct(null); }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
                    </Button>
                  </>
                )}
                {viewProduct.status !== "pending" && (
                  <Button variant="outline" onClick={() => setViewProduct(null)}>Close</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the product from the marketplace. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {deleteProduct.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
