import { useState } from "react";
import { useLocation } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Cpu } from "lucide-react";

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<string>("newest");

  const { data: categoriesData } = useListCategories();
  
  const { data: productsData, isLoading } = useListProducts({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    sort,
  });

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground mt-1">Discover premium digital assets and scripts.</p>
        </div>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9 bg-card border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[160px] bg-card border-border/50">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoriesData?.map(c => (
                <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-[160px] bg-card border-border/50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i} className="bg-card border-border/50 overflow-hidden animate-pulse">
              <div className="h-48 bg-muted"></div>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardFooter>
                <div className="h-10 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : productsData?.products.length === 0 ? (
        <div className="text-center py-24 bg-card/30 rounded-2xl border border-border/50">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium">No products found</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            We couldn't find any products matching your current filters. Try adjusting your search or category selection.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => { setSearch(""); setCategory("all"); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productsData?.products.map((product) => (
            <Card key={product.id} className="bg-card/50 border-border/50 overflow-hidden hover:border-primary/50 transition-all duration-300 group cursor-pointer" onClick={() => setLocation(`/marketplace/${product.id}`)}>
              <div className="h-48 overflow-hidden relative">
                {product.previewImages?.[0] ? (
                  <img src={product.previewImages[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <Cpu className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-semibold border border-border/50 shadow-sm text-white">
                  ${product.price.toFixed(2)}
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <div className="text-xs text-primary font-medium mb-1">{product.categoryName}</div>
                <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">{product.shortDescription || product.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
