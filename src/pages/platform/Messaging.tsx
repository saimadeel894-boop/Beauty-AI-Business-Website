import { useState, useEffect, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { TranslateButton } from "@/components/TranslateButton";
import {
  MessageSquare, Search, Send, Paperclip, Circle, FileText, ImageIcon, Download, Plus, X, Loader2,
} from "lucide-react";
import {
  Conversation, Message,
  subscribeToConversations, subscribeToMessages,
  sendMessage, markConversationRead, createConversation,
} from "@/services/firestore/messaging";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function Messaging() {
  const { user, profile } = useFirebaseAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewConv, setShowNewConv] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string; role: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to conversations
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToConversations(user.uid, setConversations);
    return () => unsub();
  }, [user]);

  // Subscribe to active conversation messages
  useEffect(() => {
    if (!activeConv) { setMessages([]); return; }
    const unsub = subscribeToMessages(activeConv.id, setMessages);
    // Mark as read
    if (user) markConversationRead(activeConv.id, user.uid);
    return () => unsub();
  }, [activeConv, user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getUserDisplayName = useCallback(() => {
    if (!profile) return "User";
    return profile.email?.split("@")[0] || "User";
  }, [profile]);

  const handleSend = async () => {
    if ((!input.trim()) || !activeConv || !user) return;
    setSending(true);
    const otherParticipants = activeConv.participants.filter(p => p !== user.uid);
    await sendMessage({
      conversationId: activeConv.id,
      senderId: user.uid,
      senderName: getUserDisplayName(),
      text: input.trim(),
      otherParticipants,
    });
    setInput("");
    setSending(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv || !user) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Max file size is 10MB", variant: "destructive" });
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) {
      toast({ title: "Invalid file", description: "Only images and PDFs are allowed", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `chat-attachments/${user.uid}/${crypto.randomUUID()}.${ext}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);

      const otherParticipants = activeConv.participants.filter(p => p !== user.uid);
      await sendMessage({
        conversationId: activeConv.id,
        senderId: user.uid,
        senderName: getUserDisplayName(),
        text: "",
        fileUrl: url,
        fileName: file.name,
        fileType: isImage ? "image" : "pdf",
        otherParticipants,
      });
    } catch (err) {
      toast({ title: "Upload failed", description: "Could not upload file", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Load users for new conversation dialog
  const loadAvailableUsers = async () => {
    if (!user) return;
    const users: { id: string; name: string; role: string }[] = [];
    try {
      // Load manufacturers
      const mfgSnap = await getDocs(collection(db, "manufacturerProfiles"));
      mfgSnap.forEach(d => {
        if (d.id !== user.uid) {
          users.push({ id: d.id, name: d.data().companyName || d.id, role: "Manufacturer" });
        }
      });
      // Load brands
      const brandSnap = await getDocs(collection(db, "brandProfiles"));
      brandSnap.forEach(d => {
        if (d.id !== user.uid) {
          users.push({ id: d.id, name: d.data().brandName || d.id, role: "Brand" });
        }
      });
      // Load influencers
      const infSnap = await getDocs(collection(db, "influencerProfiles"));
      infSnap.forEach(d => {
        if (d.id !== user.uid) {
          users.push({ id: d.id, name: d.data().name || d.id, role: "Influencer" });
        }
      });
    } catch (err) {
      console.error("Error loading users:", err);
    }
    setAvailableUsers(users);
  };

  const handleNewConversation = async () => {
    if (!selectedUser || !user) return;
    const target = availableUsers.find(u => u.id === selectedUser);
    if (!target) return;

    const { id, error } = await createConversation({
      participants: [user.uid, target.id],
      participantNames: { [user.uid]: getUserDisplayName(), [target.id]: target.name },
      participantRoles: { [user.uid]: profile?.role || "user", [target.id]: target.role.toLowerCase() },
    });

    if (!error) {
      setShowNewConv(false);
      setSelectedUser("");
      // Find and select the new conversation
      const conv = conversations.find(c => c.id === id);
      if (conv) setActiveConv(conv);
    }
  };

  const getOtherName = (conv: Conversation) => {
    if (!user) return "Unknown";
    const otherId = conv.participants.find(p => p !== user.uid);
    return otherId ? (conv.participantNames[otherId] || "Unknown") : "Unknown";
  };

  const getOtherRole = (conv: Conversation) => {
    if (!user) return "";
    const otherId = conv.participants.find(p => p !== user.uid);
    return otherId ? (conv.participantRoles[otherId] || "") : "";
  };

  const getUnread = (conv: Conversation) => {
    if (!user) return 0;
    return conv.unreadCounts[user.uid] || 0;
  };

  const formatTime = (date?: Date) => {
    if (!date) return "";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const formatMessageTime = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const filteredConvs = conversations.filter(c => {
    if (!searchTerm) return true;
    const name = getOtherName(c).toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <Button className="gap-2" onClick={() => { setShowNewConv(true); loadAvailableUsers(); }}>
            <Plus className="h-4 w-4" />
            New Message
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="flex h-[calc(100vh-220px)] min-h-[500px]">
            {/* Conversation List */}
            <div className="w-80 border-r border-border flex flex-col">
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredConvs.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No conversations yet
                  </div>
                )}
                {filteredConvs.map(conv => {
                  const unread = getUnread(conv);
                  const isActive = activeConv?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      className={`flex items-center gap-3 p-4 hover:bg-secondary/50 cursor-pointer border-b border-border ${isActive ? "bg-accent/50" : ""}`}
                      onClick={() => setActiveConv(conv)}
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {getOtherName(conv).charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground text-sm truncate">{getOtherName(conv)}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(conv.lastMessageAt)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-muted-foreground truncate">{conv.lastMessage || "No messages yet"}</p>
                          {unread > 0 && (
                            <Badge className="h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]">{unread}</Badge>
                          )}
                        </div>
                        {conv.referenceTitle && (
                          <p className="text-[10px] text-primary/70 mt-0.5 truncate">
                            {conv.referenceType}: {conv.referenceTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            {activeConv ? (
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {getOtherName(activeConv).charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{getOtherName(activeConv)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{getOtherRole(activeConv)}</p>
                    </div>
                  </div>
                  {activeConv.referenceTitle && (
                    <Badge variant="outline" className="text-xs">
                      {activeConv.referenceType}: {activeConv.referenceTitle}
                    </Badge>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                          {!isMe && <p className="text-[10px] font-medium mb-1 opacity-70">{msg.senderName}</p>}
                          {msg.text && (
                            <div>
                              <p className="text-sm">{msg.text}</p>
                              <TranslateButton text={msg.text} context="message" size="icon" />
                            </div>
                          )}
                          {msg.fileUrl && msg.fileType === "image" && (
                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                              <img src={msg.fileUrl} alt={msg.fileName} className="mt-2 rounded-lg max-w-[280px] max-h-[200px] object-cover" />
                            </a>
                          )}
                          {msg.fileUrl && msg.fileType === "pdf" && (
                            <a
                              href={msg.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`mt-2 flex items-center gap-2 p-2 rounded-lg ${isMe ? "bg-primary-foreground/10" : "bg-background"}`}
                            >
                              <FileText className="h-4 w-4" />
                              <span className="text-xs truncate flex-1">{msg.fileName}</span>
                              <Download className="h-3 w-3" />
                            </a>
                          )}
                          <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {formatMessageTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      className="flex-1"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                      disabled={sending}
                    />
                    <Button size="icon" onClick={handleSend} disabled={sending || !input.trim()}>
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Select a conversation</p>
                  <p className="text-sm mt-1">or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* New Conversation Dialog */}
        <Dialog open={showNewConv} onOpenChange={setShowNewConv}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Conversation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user to message" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewConv(false)}>Cancel</Button>
              <Button onClick={handleNewConversation} disabled={!selectedUser}>Start Conversation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
