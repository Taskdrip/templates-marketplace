import { useListCategories } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Folder, Code, Cpu, LayoutTemplate, Box } from "lucide-react";

export default function Categories() {
  const { data: categories, isLoading } = useListCategories();

  const getIcon = (name?: string | null) => {
    switch(name) {
      case "code": return <Code className="w-8 h-8" />;
      case "cpu": return <Cpu className="w-8 h-8" />;
      case "layout": return <LayoutTemplate className="w-8 h-8" />;
      case "box": return <Box className="w-8 h-8" />;
      default: return <Folder className="w-8 h-8" />;
    }
  };

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Browse by Category</h1>
        <p className="text-lg text-muted-foreground">Find the perfect digital asset for your next project from our curated categories.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i} className="bg-card border-border/50 animate-pulse h-40"></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories?.map((category) => (
            <Link key={category.id} href={`/marketplace?category=${category.slug}`}>
              <Card className="bg-card/50 border-border/50 hover:border-primary/50 hover:bg-card transition-all duration-300 cursor-pointer h-full group">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    {getIcon(category.iconName)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.productCount} Products</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
