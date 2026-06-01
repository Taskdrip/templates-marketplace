import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useListConversations, useGetMessages } from "@workspace/api-client-react";
import { useSendMessage } from "@/hooks/useMutations";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Search, MessageSquarePlus } from "lucide-react";

export default function AdminMessages() {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: convosData, refetch: refetchConvos } = useListConversations({
    query: { refetchInterval: 5000 }
  });
  const { data: messagesData, refetch: refetchMessages } = useGetMessages(activeId as number, {
    query: { enabled: !!activeId, refetchInterval: 3000 }
  });

  const sendMessage = useSendMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesData]);

  const handleSend = () => {
    if (!message.trim() || !activeId) return;

    sendMessage.mutate({
      data: { content: message, conversationId: activeId }
    }, {
      onSuccess: () => {
        setMessage("");
        refetchMessages();
        refetchConvos();
      }
    });
  };

  const conversations = (convosData as any)?.conversations ?? [];
  const messages = (messagesData as any)?.messages ?? [];

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Conversations List */}
      <Card className="w-80 flex flex-col bg-card/50 border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-semibold text-lg mb-4">Support Chat</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input className="pl-9 bg-background" placeholder="Search conversations..." />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                  activeId === conv.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50 border border-transparent'
                }`}
              >
                <Avatar className="w-10 h-10 border border-border/50">
                  <AvatarImage src={conv.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary">{conv.username?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm truncate">{conv.username || 'User'}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${conv.unreadCount ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                    {conv.subject || conv.lastMessage || 'Empty conversation'}
                  </p>
                </div>
                {!!conv.unreadCount && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                    {conv.unreadCount}
                  </div>
                )}
              </button>
            ))}

            {conversations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No active support chats
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col bg-card/50 border-border/50 overflow-hidden">
        {activeId ? (
          <>
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-background/50">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/20 text-primary">U</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">
                    {conversations.find((c: any) => c.id === activeId)?.username || `User #${activeId}`}
                  </h3>
                  <p className="text-xs text-emerald-500">Active chat</p>
                </div>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((msg: any) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={msg.senderAvatar || undefined} />
                      <AvatarFallback className="text-[10px]">{msg.senderName?.substring(0,2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-secondary rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-border/50 bg-background/50">
              <form
                className="flex gap-2"
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              >
                <Input
                  className="flex-1 bg-background"
                  placeholder="Type your message as Support..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button type="submit" size="icon" disabled={!message.trim() || sendMessage.isPending}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <MessageSquarePlus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">Select a Conversation</h3>
            <p className="max-w-md text-center">Choose a user from the sidebar to respond to their support queries.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
