import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetProduct, useListRelatedProducts, useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, Check, ShieldCheck, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CryptoCheckoutModal from "@/components/checkout/CryptoCheckoutModal";
import PaymentThankYouModal from "@/components/checkout/PaymentThankYouModal";
import { usePiPrice } from "@/hooks/usePiPrice";

export default function ProductDetail() {
  const [, params] = useRoute("/marketplace/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { toUsd, price: piPrice } = usePiPrice();
  
  const id = Number(params?.id);
  
  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: !isNaN(id) }
  });
  
  const { data: relatedProducts } = useListRelatedProducts(id, {
    query: { enabled: !isNaN(id) }
  });
  
  const createOrder = useCreateOrder();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);

  const handlePurchase = () => {
    if (!user) {
      const current = window.location.pathname;
      setLocation(`/login?redirect=${encodeURIComponent(current)}`);
      return;
    }
    createOrder.mutate({ data: { productId: id } }, {
      onSuccess: (order) => {
        setActiveOrderId(order.id);
        setCheckoutOpen(true);
      },
      onError: () => {
        toast({ title: "Error", description: "Could not create order. Please try again.", variant: "destructive" });
      }
    });
  };

  const handlePaymentSuccess = (orderId: number) => {
    setCheckoutOpen(false);
    setActiveOrderId(orderId);
    setThankYouOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
            <Skeleton className="h-[100px] w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-24">Product not found</div>;
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image */}
          <div className="rounded-2xl overflow-hidden border border-border/50 bg-card aspect-video relative">
            <img
              src={product.previewImages?.[0] || "/default-product.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = "/default-product.svg"; }}
            />
          </div>
          
          {product.previewImages && product.previewImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.previewImages.map((img, i) => (
                <div key={i} className="w-24 h-24 rounded-lg overflow-hidden border border-border/50 shrink-0 cursor-pointer bg-[#0a0416]">
                  <img src={img} alt={`${product.name} preview ${i+1}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/default-product.svg"; }} />
                </div>
              ))}
            </div>
          )}
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {product.categoryName}
              </Badge>
              {product.isFeatured && (
                <Badge className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border-none">Featured</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          </div>
          
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-secondary/50">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm sticky top-24">
            <CardContent className="p-6">
              <div className="mb-6">
                <div className="flex items-end gap-2">
                  <span className="text-yellow-400 text-4xl font-black mb-1" style={{ fontFamily: "serif" }}>π</span>
                  <span className="text-4xl font-bold text-foreground">{product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through mb-1">{product.originalPrice.toFixed(2)}</span>
                  )}
                  <span className="text-muted-foreground mb-1 text-sm">Pi</span>
                </div>
                {piPrice && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-base font-semibold text-emerald-400">{toUsd(product.price)} USD</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">{toUsd(product.originalPrice)}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded">1π = ${piPrice.toFixed(4)}</span>
                  </div>
                )}
              </div>
              
              <Button 
                size="lg" 
                className="w-full h-14 text-lg bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-purple-900 shadow-[0_0_20px_rgba(234,179,8,0.35)] mb-4 gap-2 font-bold"
                onClick={handlePurchase}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? (
                  <><div className="w-5 h-5 border-2 border-purple-900/30 border-t-purple-900 rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><span className="text-xl font-black" style={{ fontFamily: "serif" }}>π</span> Buy with Pi</>
                )}
              </Button>
              
              <div className="space-y-3 pt-4 border-t border-border/50 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Check className="w-4 h-4 mr-3 text-emerald-500" /> Instant download after payment
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Check className="w-4 h-4 mr-3 text-emerald-500" /> Future updates included
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Check className="w-4 h-4 mr-3 text-emerald-500" /> Quality verified
                </div>
                <div className="flex items-center text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 mr-3 text-emerald-500" /> Escrow-protected payment
                </div>
              </div>

              {/* Payment method */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2 text-center">Payment powered by</p>
                <div className="flex justify-center">
                  <span className="flex items-center gap-2 text-sm bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-xl text-yellow-400 font-semibold">
                    <span className="text-xl font-black" style={{ fontFamily: "serif" }}>π</span>
                    Pi Network
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-sm space-y-3 bg-secondary/20 p-4 rounded-xl border border-border/50">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">{product.version || "1.0.0"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sales</span>
              <span className="font-medium">{product.salesCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {activeOrderId && (
        <>
          <CryptoCheckoutModal
            open={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            onSuccess={handlePaymentSuccess}
            orderId={activeOrderId}
            amount={product.price}
            productName={product.name}
          />
          <PaymentThankYouModal
            open={thankYouOpen}
            onClose={() => setThankYouOpen(false)}
            orderId={activeOrderId}
          />
        </>
      )}
    </div>
  );
}
