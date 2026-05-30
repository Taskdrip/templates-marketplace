import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Calendar, ArrowRight, Rss } from "lucide-react";

async function fetchPosts() {
  const res = await fetch("/api/blog");
  if (!res.ok) return [];
  return res.json();
}

function PostCard({ post }: { post: any }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="bg-card/50 border-border/50 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all cursor-pointer group overflow-hidden">
        {post.coverImage && (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs bg-violet-500/10 text-violet-400 border-none">Blog</Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
          <h2 className="font-bold text-lg leading-snug mb-2 group-hover:text-violet-400 transition-colors line-clamp-2">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
          )}
          <span className="text-xs font-semibold text-violet-400 flex items-center gap-1 group-hover:gap-2 transition-all">
            Read article <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function BlogPage() {
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["blog-posts-public"], queryFn: fetchPosts });

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12 md:py-20">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-14">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-6">
          <Rss className="w-7 h-7 text-violet-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Vaultrade{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-blue-400">Blog</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Insights on Web3 commerce, crypto payments, digital asset trading, and building in the decentralized economy.
        </p>
      </div>

      {/* Posts grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto">
            <FileText className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <p className="text-xl font-medium text-muted-foreground">No articles yet</p>
          <p className="text-muted-foreground">
            Our team is working on the first articles. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-20 text-center py-12 border-t border-border/30">
        <p className="text-muted-foreground mb-4">Want to write for Vaultrade?</p>
        <Link href="/contact" className="text-violet-400 hover:text-violet-300 font-semibold text-sm flex items-center justify-center gap-1">
          Get in touch <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
