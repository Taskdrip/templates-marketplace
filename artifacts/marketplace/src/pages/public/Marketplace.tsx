import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, Cpu, Star, SlidersHorizontal, X, TrendingUp, Flame,
  Code2, Globe, Facebook, Instagram, Layers, ExternalLink, Package,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "source-code-apps": <Code2 className="w-4 h-4" />,
  "templates": <Layers className="w-4 h-4" />,
  "social-media-accounts": <Instagram className="w-4 h-4" />,
  "facebook-accounts": <Facebook className="w-4 h-4" />,
  "websites-domains": <Globe className="w-4 h-4" />,
  "landing-pages": <ExternalLink className="w-4 h-4" />,
  "crypto-defi-tools": <TrendingUp className="w-4 h-4" />,
  "saas-apps": <Package className="w-4 h-4" />,
};

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);

  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("cat") || "all");
  const [sort, setSort] = useState("newest");
  const [priceRange, setPriceRange] = useState<"all" | "under50" | "50to200" | "over200">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [inputValue, setInputValue] = useState(search);

  const { data: categoriesData } = useListCategories();

  const { data: productsData, isLoading } = useListProducts({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    sort,
  });

  useEffect(() => {
    const catParam = params.get("cat");
    const searchParam = params.get("search");
    if (catParam) setCategory(catParam);
    if (searchParam) { setSearch(searchParam); setInputValue(searchParam); }
  }, [searchStr]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(inputValue.trim());
  };

  const clearFilters = () => {
    setSearch(""); setInputValue(""); setCategory("all"); setSort("newest"); setPriceRange("all");
  };

  const hasFilters = search || category !== "all" || sort !== "newest" || priceRange !== "all";

  const filterByPrice = (products: any[]) => {
    if (priceRange === "all") return products;
    return products.filter(p => {
      const price = Number(p.price);
      if (priceRange === "under50") return price < 50;
      if (priceRange === "50to200") return price >= 50 && price <= 200;
      if (priceRange === "over200") return price > 200;
      return true;
    });
  };

  const filteredProducts = filterByPrice(productsData?.products || []);

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0b1e] via-[#13103a] to-[#0b0d2a]" />
        <div className="absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(130,80,255,0.35) 0%, transparent 70%)" }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(150,100,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(150,100,255,1) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        {/* Floating orbs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="relative container max-w-screen-xl mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1 text-xs font-medium text-yellow-400 mb-4">
              <span className="font-black" style={{ fontFamily: "serif" }}>π</span> Pi Network Marketplace
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              Buy & Sell{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-300 to-yellow-400">
                Digital Products
              </span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg">
              Apps, scripts, templates, social accounts, websites & more — all powered by <span className="text-yellow-400 font-semibold">Pi (π)</span> on Breedskoolpi.store
            </p>
            <div className="flex flex-wrap gap-3 mt-5 justify-center md:justify-start">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Cpu className="w-3.5 h-3.5 text-violet-400" /> <span>{productsData?.products.length ?? "100"}+ Products</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Star className="w-3.5 h-3.5 text-yellow-400" /> <span>Verified Sellers</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> <span>Escrow Protected</span>
              </div>
            </div>
          </div>
          {/* Category pills */}
          <div className="hidden md:grid grid-cols-2 gap-2 shrink-0 max-w-xs w-full">
            {Object.entries(CATEGORY_ICONS).slice(0, 6).map(([slug, icon]) => (
              <button
                key={slug}
                onClick={() => setCategory(slug)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${category === slug ? "bg-primary/20 border-primary/40 text-primary" : "bg-card/50 border-border/30 text-muted-foreground hover:border-violet-500/30 hover:text-foreground"}`}
              >
                {icon}
                <span className="truncate">{slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Header bar */}
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-16 z-30">
        <div className="container max-w-screen-xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products, templates, accounts..."
              className="pl-9 h-9 bg-background/60 border-border/40 text-sm rounded-full"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
            {inputValue && (
              <button type="button" onClick={() => { setInputValue(""); setSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 text-xs bg-background/60 border-border/40 rounded-full w-auto min-w-[140px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesData?.map(c => (
                  <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-9 text-xs bg-background/60 border-border/40 rounded-full w-auto min-w-[120px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price_asc">Price: Low → High</SelectItem>
                <SelectItem value="price_desc">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className={`h-9 rounded-full text-xs gap-1.5 ${showFilters ? "bg-primary/10 border-primary/30 text-primary" : "border-border/40"}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </Button>

            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-9 rounded-full text-xs text-muted-foreground" onClick={clearFilters}>
                <X className="w-3.5 h-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Expanded filter row */}
        {showFilters && (
          <div className="container max-w-screen-xl mx-auto px-4 pb-3 flex items-center gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Price:</span>
            {(["all", "under50", "50to200", "over200"] as const).map(r => (
              <Badge
                key={r}
                variant={priceRange === r ? "default" : "outline"}
                className="cursor-pointer text-xs py-1 px-3 rounded-full"
                onClick={() => setPriceRange(r)}
              >
                {r === "all" ? "Any price" : r === "under50" ? "Under $50" : r === "50to200" ? "$50 – $200" : "Over $200"}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        {/* Category quick filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          <button
            onClick={() => setCategory("all")}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${category === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"}`}
          >
            <Flame className="w-3.5 h-3.5" /> All
          </button>
          {categoriesData?.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.slug)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${category === cat.slug ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"}`}
            >
              {CATEGORY_ICONS[cat.slug] || <Package className="w-3.5 h-3.5" />}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border/50 overflow-hidden animate-pulse">
                <div className="h-44 bg-muted/40" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 rounded-2xl bg-card/30 border border-border/40">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
              Try adjusting your search terms or remove some filters to see more results.
            </p>
            <Button variant="outline" className="mt-5 rounded-full" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} onClick={() => setLocation(`/marketplace/${product.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onClick }: { product: any; onClick: () => void }) {
  const isNew = Date.now() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  const isHot = product.salesCount > 200;
  const hasSale = product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const discount = hasSale ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100) : 0;

  return (
    <div
      className="group rounded-2xl bg-card border border-border/40 overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={onClick}
    >
      <div className="relative h-44 overflow-hidden bg-muted/20">
        <img
          src={product.previewImages?.[0] || "/default-product.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.currentTarget.src = "/default-product.svg"; }}
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1">
          {isHot && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
              <Flame className="w-2.5 h-2.5" /> HOT
            </span>
          )}
          {isNew && !isHot && (
            <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">NEW</span>
          )}
          {hasSale && (
            <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
        </div>

        {/* Price */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
          {hasSale && (
            <span className="text-[10px] line-through text-white/60 bg-black/40 px-1.5 py-0.5 rounded">
              π{Number(product.originalPrice).toFixed(2)}
            </span>
          )}
          <span className="text-xs font-bold bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg">
            π{Number(product.price).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{product.categoryName}</span>
        </div>
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1 mb-3">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.shortDescription || product.description}</p>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30">
          <div className="flex items-center gap-1 text-xs">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="font-medium">4.8</span>
            <span className="text-muted-foreground ml-0.5">({product.salesCount})</span>
          </div>
          <span className="text-[10px] text-yellow-400 font-black" style={{ fontFamily: "serif" }}>π Pi</span>
        </div>
      </div>
    </div>
  );
}
