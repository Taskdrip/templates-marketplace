import { useState } from "react";
import {
  useListProducts,
  useListCategories,
  Product,
} from "@workspace/api-client-react";
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useMutations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListProductsQueryKey } from "@workspace/api-client-react";
import { Plus, Pencil, Trash2, Star, Search } from "lucide-react";

const EMPTY_FORM = {
  name: "",
  description: "",
  shortDescription: "",
  price: "",
  originalPrice: "",
  categoryId: "",
  tags: "",
  previewImages: "",
  demoUrl: "",
  downloadUrl: "",
  version: "",
  documentation: "",
  isFeatured: false,
  status: "active" as "active" | "pending" | "rejected",
};

type FormState = typeof EMPTY_FORM;

export default function AdminProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data: productsData, isLoading } = useListProducts({ page: String(page), limit: "20", search: search || undefined });
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription ?? "",
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      categoryId: String(product.categoryId),
      tags: (product.tags ?? []).join(", "),
      previewImages: (product.previewImages ?? []).join("\n"),
      demoUrl: product.demoUrl ?? "",
      downloadUrl: product.downloadUrl ?? "",
      version: product.version ?? "",
      documentation: product.documentation ?? "",
      isFeatured: product.isFeatured,
      status: product.status as "active" | "pending" | "rejected",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.description || !form.price || !form.categoryId) {
      toast({ title: "Missing fields", description: "Name, description, price and category are required.", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      shortDescription: form.shortDescription || undefined,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
      categoryId: parseInt(form.categoryId, 10),
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      previewImages: form.previewImages ? form.previewImages.split("\n").map(u => u.trim()).filter(Boolean) : [],
      demoUrl: form.demoUrl || undefined,
      downloadUrl: form.downloadUrl || undefined,
      version: form.version || undefined,
      documentation: form.documentation || undefined,
    };

    if (editProduct) {
      updateProduct.mutate({ id: editProduct.id, data: { ...payload, isFeatured: form.isFeatured, status: form.status } as any }, {
        onSuccess: () => {
          toast({ title: "Product updated", description: `"${form.name}" has been updated.` });
          setDialogOpen(false);
          invalidate();
        },
        onError: () => toast({ title: "Error", description: "Failed to update product.", variant: "destructive" }),
      });
    } else {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Product created", description: `"${form.name}" is now live.` });
          setDialogOpen(false);
          invalidate();
        },
        onError: () => toast({ title: "Error", description: "Failed to create product.", variant: "destructive" }),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProduct.mutate({ id: deleteId }, {
      onSuccess: () => {
        toast({ title: "Product deleted" });
        setDeleteId(null);
        invalidate();
      },
      onError: () => toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" }),
    });
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage all marketplace listings.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-background"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted/50 rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : productsData?.products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              productsData?.products.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/20">
                  <TableCell className="max-w-xs">
                    <div className="flex items-center gap-3">
                      {product.previewImages?.[0] && (
                        <img src={product.previewImages[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate">{product.name}</div>
                        {product.isFeatured && (
                          <div className="flex items-center gap-1 text-xs text-amber-500 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-500" /> Featured
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.categoryName}</TableCell>
                  <TableCell>
                    <div className="font-medium">${product.price.toFixed(2)}</div>
                    {product.originalPrice && (
                      <div className="text-xs text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{product.salesCount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        product.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-none"
                          : product.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-400 border-none"
                          : "bg-red-500/10 text-red-400 border-none"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                        <Pencil className="w-4 h-4 text-blue-400" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(product.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {productsData && productsData.total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">
            Page {page} of {Math.ceil(productsData.total / 20)}
          </span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(productsData.total / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. BinanceBot Pro" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Short Description</Label>
                <Input value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} placeholder="One-liner summary shown in listing cards" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Full Description *</Label>
                <Textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed product description..." />
              </div>
              <div className="space-y-1.5">
                <Label>Price (USDT) *</Label>
                <Input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="99.00" />
              </div>
              <div className="space-y-1.5">
                <Label>Original Price (optional)</Label>
                <Input type="number" step="0.01" min="0" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} placeholder="199.00 (crossed out)" />
              </div>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Version</Label>
                <Input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="1.0.0" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Tags (comma-separated)</Label>
                <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="trading, binance, bot" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Preview Image URLs (one per line)</Label>
                <Textarea rows={3} value={form.previewImages} onChange={e => setForm(f => ({ ...f, previewImages: e.target.value }))} placeholder="https://images.unsplash.com/..." />
              </div>
              <div className="space-y-1.5">
                <Label>Demo URL</Label>
                <Input value={form.demoUrl} onChange={e => setForm(f => ({ ...f, demoUrl: e.target.value }))} placeholder="https://demo.example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Download URL</Label>
                <Input value={form.downloadUrl} onChange={e => setForm(f => ({ ...f, downloadUrl: e.target.value }))} placeholder="https://files.example.com/product.zip" />
              </div>
              {editProduct && (
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center gap-3 pt-1">
                <Switch checked={form.isFeatured} onCheckedChange={v => setForm(f => ({ ...f, isFeatured: v }))} id="featured" />
                <Label htmlFor="featured" className="cursor-pointer">Mark as Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Saving..." : editProduct ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the product from the marketplace. This action cannot be undone.
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
