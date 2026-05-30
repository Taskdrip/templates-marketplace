import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Globe, FileText, Eye } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";

const API_BASE = "/api";

function getToken() { return localStorage.getItem("cm_token"); }
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

async function fetchAllPosts() {
  const res = await fetch(`${API_BASE}/blog/all`, { headers: authHeader() });
  return res.json();
}

async function createPost(data: any) {
  const res = await fetch(`${API_BASE}/blog`, {
    method: "POST", headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function updatePost(id: number, data: any) {
  const res = await fetch(`${API_BASE}/blog/${id}`, {
    method: "PATCH", headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function deletePost(id: number) {
  await fetch(`${API_BASE}/blog/${id}`, { method: "DELETE", headers: authHeader() });
}

const emptyForm = { title: "", slug: "", excerpt: "", content: "", coverImage: "", status: "draft" };

export default function AdminBlog() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: posts = [], isLoading } = useQuery({ queryKey: ["admin-blog"], queryFn: fetchAllPosts });

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-blog"] }); toast({ title: "Post created" }); closeDialog(); },
    onError: () => toast({ title: "Failed to create post", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updatePost(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-blog"] }); toast({ title: "Post updated" }); closeDialog(); },
    onError: () => toast({ title: "Failed to update post", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-blog"] }); toast({ title: "Post deleted" }); },
  });

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (post: any) => { setEditing(post); setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt ?? "", content: post.content, coverImage: post.coverImage ?? "", status: post.status }); setOpen(true); };
  const closeDialog = () => { setOpen(false); setEditing(null); };

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const handleSave = () => {
    if (!form.title || !form.slug || !form.content) { toast({ title: "Title, slug, content required", variant: "destructive" }); return; }
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><FileText className="w-7 h-7 text-primary" /> Blog</h1>
          <p className="text-muted-foreground mt-1">Create and manage blog posts for your marketplace.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> New Post</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted/30 animate-pulse rounded-xl" />)}</div>
      ) : posts.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No blog posts yet</p>
            <p className="text-sm mt-1">Create your first post to engage with your audience.</p>
            <Button className="mt-4 gap-2" onClick={openNew}><Plus className="w-4 h-4" /> Create Post</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post: any) => (
            <Card key={post.id} className="bg-card/50 border-border/50 hover:border-border transition-colors">
              <CardContent className="flex items-center gap-4 p-4">
                {post.coverImage && (
                  <img src={post.coverImage} alt={post.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{post.title}</h3>
                    <Badge variant={post.status === "published" ? "default" : "secondary"} className="shrink-0">
                      {post.status === "published" ? <><Globe className="w-3 h-3 mr-1" /> Published</> : <><FileText className="w-3 h-3 mr-1" /> Draft</>}
                    </Badge>
                  </div>
                  {post.excerpt && <p className="text-sm text-muted-foreground truncate">{post.excerpt}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(post.createdAt).toLocaleDateString()} · /blog/{post.slug}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(post)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(post.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={open} onOpenChange={v => !v && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "New Blog Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: editing ? p.slug : autoSlug(e.target.value) }))} placeholder="Your blog post title" />
              </div>
              <div className="space-y-1.5">
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="your-post-slug" className="font-mono text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Cover Image URL</Label>
              <Input value={form.coverImage} onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))} placeholder="https://images.unsplash.com/..." />
            </div>
            <div className="space-y-1.5">
              <Label>Excerpt</Label>
              <Input value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="Short description shown in listings..." />
            </div>
            <div className="space-y-1.5">
              <Label>Content * (Markdown supported)</Label>
              <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write your post content here..." className="min-h-[200px] font-mono text-sm resize-none" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editing ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
