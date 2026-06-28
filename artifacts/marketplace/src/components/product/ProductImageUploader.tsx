import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Link2, X, Plus, Loader2, ImageIcon, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_PLACEHOLDER = "/placeholder-product.png";

interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

function UploadedImage({ src, onRemove, index }: { src: string; onRemove: () => void; index: number }) {
  const [errored, setErrored] = useState(false);
  return (
    <div className="relative group rounded-xl overflow-hidden border border-border/40 bg-muted/30 aspect-video flex-shrink-0 w-36">
      {!errored ? (
        <img
          src={src}
          alt={`Preview ${index + 1}`}
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground/40">
          <ImageIcon className="w-5 h-5" />
          <span className="text-[9px]">Invalid URL</span>
        </div>
      )}
      {index === 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1">
          <span className="text-[9px] font-semibold text-white/80 uppercase tracking-wider">Cover</span>
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 hover:bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

function DefaultImagePreview() {
  return (
    <div className="w-full h-40 rounded-xl border-2 border-dashed border-violet-500/20 bg-gradient-to-br from-violet-950/60 via-purple-900/40 to-indigo-950/60 flex flex-col items-center justify-center gap-3">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-800/20 border border-violet-500/20 flex items-center justify-center">
        <span className="text-4xl font-black text-violet-300/60" style={{ fontFamily: "serif" }}>π</span>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-violet-300/50">Default placeholder image</p>
        <p className="text-[10px] text-muted-foreground/40 mt-0.5">Add images below to replace this</p>
      </div>
    </div>
  );
}

export default function ProductImageUploader({ images, onChange, maxImages = 6 }: ProductImageUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (images.includes(url)) {
      toast({ description: "This URL is already added.", variant: "destructive" });
      return;
    }
    if (images.length >= maxImages) {
      toast({ description: `Maximum ${maxImages} images allowed.`, variant: "destructive" });
      return;
    }
    onChange([...images, url]);
    setUrlInput("");
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    if (images.length >= maxImages) {
      toast({ description: `Maximum ${maxImages} images allowed.`, variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const token = localStorage.getItem("cm_token");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange([...images, data.url]);
      toast({ description: "Image uploaded successfully." });
    } catch {
      toast({ title: "Upload failed", description: "Could not upload the image. Try a URL instead.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach(uploadFile);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(uploadFile);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
        Product Images
        <span className="text-muted-foreground font-normal text-xs">({images.length}/{maxImages})</span>
      </Label>

      {/* Preview strip or default */}
      {images.length === 0 ? (
        <DefaultImagePreview />
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <UploadedImage key={img + i} src={img} onRemove={() => removeImage(i)} index={i} />
          ))}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-36 aspect-video flex-shrink-0 rounded-xl border-2 border-dashed border-border/40 hover:border-violet-500/40 hover:bg-violet-500/5 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-violet-400 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px]">Add more</span>
            </button>
          )}
        </div>
      )}

      {/* Upload zone */}
      {images.length < maxImages && (
        <div
          className={cn(
            "rounded-xl border-2 border-dashed transition-all p-4",
            isDragging
              ? "border-violet-500/60 bg-violet-500/8 scale-[1.01]"
              : "border-border/30 hover:border-border/60 bg-muted/10"
          )}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {/* File upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 text-violet-300 text-sm font-medium transition-all disabled:opacity-50 flex-shrink-0"
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
              ) : (
                <><Upload className="w-4 h-4" /> Upload Image</>
              )}
            </button>

            <div className="flex items-center text-xs text-muted-foreground/50 sm:flex-col sm:justify-center">
              <div className="flex-1 h-px sm:h-auto sm:w-px bg-border/30" />
              <span className="px-2 py-1">or</span>
              <div className="flex-1 h-px sm:h-auto sm:w-px bg-border/30" />
            </div>

            {/* URL input */}
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                <Input
                  type="url"
                  placeholder="https://i.imgur.com/example.png"
                  className="pl-8 bg-background/50 border-border/40 text-sm h-10"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addUrl())}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 px-3 border-border/40 shrink-0"
                onClick={addUrl}
                disabled={!urlInput.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground/40 mt-2 text-center">
            Drag & drop images here · JPEG, PNG, WebP, GIF · max 10 MB each · first image is the cover
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
