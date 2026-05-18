import { useListPendingProducts, useApproveProduct, useDeleteProduct } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListPendingProductsQueryKey } from "@workspace/api-client-react";

export default function AdminProducts() {
  const { data: pendingProducts, isLoading } = useListPendingProducts();
  const approveProduct = useApproveProduct();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleApprove = (id: number) => {
    approveProduct.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Product approved", description: "The product is now live on the marketplace." });
        queryClient.invalidateQueries({ queryKey: getListPendingProductsQueryKey() });
      }
    });
  };

  const handleReject = (id: number) => {
    deleteProduct.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Product rejected", description: "The product has been removed." });
        queryClient.invalidateQueries({ queryKey: getListPendingProductsQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
        <p className="text-muted-foreground mt-1">Review and approve vendor submissions.</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell><div className="h-4 bg-muted rounded w-32"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-24"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-16"></div></TableCell>
                  <TableCell><div className="h-6 bg-muted rounded w-24"></div></TableCell>
                  <TableCell><div className="h-8 bg-muted rounded w-24 ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : pendingProducts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No pending products to review.
                </TableCell>
              </TableRow>
            ) : (
              pendingProducts?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.categoryName}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-none">
                      Pending Review
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View details">
                        <Eye className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleApprove(product.id)} disabled={approveProduct.isPending}>
                        <Check className="w-4 h-4 text-emerald-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleReject(product.id)} disabled={deleteProduct.isPending}>
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
