import { useListFavorites } from "@workspace/api-client-react";
import { useRemoveFavorite } from "@/hooks/useMutations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Heart, Trash2, Cpu, ShoppingCart } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListFavoritesQueryKey } from "@workspace/api-client-react";

export default function Wishlist() {
  const { data: favorites, isLoading } = useListFavorites();
  const removeFavorite = useRemoveFavorite();
  const queryClient = useQueryClient();

  const handleRemove = (productId: number) => {
    removeFavorite.mutate({ productId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-muted-foreground mt-1">Products you've saved for later.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card/50 border-border/50 animate-pulse">
              <div className="h-48 bg-muted"></div>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))
        ) : !favorites?.length ? (
          <div className="col-span-full py-24 text-center bg-card/30 border border-border/50 rounded-2xl">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-medium">Your wishlist is empty</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto mb-6">
              Browse the marketplace and save products you're interested in purchasing later.
            </p>
            <Button asChild>
              <Link href="/marketplace">Explore Marketplace</Link>
            </Button>
          </div>
        ) : (
          favorites.map((product: any) => (
            <Card key={product.id} className="bg-card/50 border-border/50 overflow-hidden flex flex-col group">
              <div className="h-48 overflow-hidden relative">
                <img
                  src={product.previewImages?.[0] || "/default-product.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.src = "/default-product.svg"; }}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.preventDefault(); handleRemove(product.id); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-semibold border border-border/50">
                  ${product.price.toFixed(2)}
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <div className="text-xs text-primary font-medium mb-1">{product.categoryName}</div>
                <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 mt-auto flex gap-2">
                <Button className="w-full text-xs" asChild>
                  <Link href={`/marketplace/${product.id}`}>
                    <ShoppingCart className="w-4 h-4 mr-2" /> Buy
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
