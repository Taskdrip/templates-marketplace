import { useListNotifications } from "@workspace/api-client-react";
import { useMarkAllNotificationsRead, useMarkNotificationRead } from "@/hooks/useMutations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, ExternalLink, Package, ShoppingBag, Wallet } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListNotificationsQueryKey } from "@workspace/api-client-react";

export default function Notifications() {
  const { data: notificationsData, isLoading } = useListNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      }
    });
  };

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      }
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-5 h-5 text-blue-500" />;
      case 'payment': return <Wallet className="w-5 h-5 text-emerald-500" />;
      case 'system': return <Bell className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated on your account activity.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markAllRead.isPending}>
          <Check className="w-4 h-4 mr-2" /> Mark all read
        </Button>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : notificationsData?.notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-medium">All caught up!</h3>
              <p className="text-muted-foreground mt-2">You don't have any new notifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notificationsData?.notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 sm:p-6 flex gap-4 transition-colors ${!notification.isRead ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                >
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notification.isRead ? 'bg-background shadow-sm border border-primary/20' : 'bg-muted/50'}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className={`text-base ${!notification.isRead ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      {notification.link && (
                        <Button variant="link" className="p-0 h-auto text-xs" asChild>
                          <a href={notification.link}>View Details <ExternalLink className="w-3 h-3 ml-1" /></a>
                        </Button>
                      )}
                      
                      {!notification.isRead && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto py-0 text-xs text-muted-foreground"
                          onClick={() => handleMarkRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
