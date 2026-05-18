import { useListDownloads, useGetDownloadLink } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download as DownloadIcon, Package, ExternalLink } from "lucide-react";

export default function Downloads() {
  const { data: downloadsData, isLoading } = useListDownloads();
  const getDownloadLink = useGetDownloadLink();

  const handleDownload = (orderId: number) => {
    getDownloadLink.mutate({ orderId }, {
      onSuccess: (data) => {
        // In a real app, we'd use this URL to trigger a download
        window.open(data.url, '_blank');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Downloads</h1>
        <p className="text-muted-foreground mt-1">Access your purchased digital assets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-card/50 border-border/50 animate-pulse">
              <div className="h-40 bg-muted"></div>
              <CardContent className="p-4">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))
        ) : downloadsData?.downloads.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-card/30 border border-border/50 rounded-2xl">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-medium">No downloads available</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              You haven't purchased any products yet, or your orders are still pending confirmation.
            </p>
          </div>
        ) : (
          downloadsData?.downloads.map((download) => (
            <Card key={download.id} className="bg-card/50 border-border/50 overflow-hidden flex flex-col">
              <div className="h-40 bg-muted relative">
                {download.productImage ? (
                  <img src={download.productImage} alt={download.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-medium border border-border/50">
                  v{download.version || "1.0.0"}
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg line-clamp-1">{download.productName}</CardTitle>
                <CardDescription className="text-xs">
                  Purchased on {new Date(download.downloadedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 mt-auto">
                <Button 
                  className="w-full" 
                  onClick={() => handleDownload(download.orderId)}
                  disabled={getDownloadLink.isPending}
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Download Files
                </Button>
                <Button variant="ghost" className="w-full mt-2 text-muted-foreground" size="sm">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  View Documentation
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
