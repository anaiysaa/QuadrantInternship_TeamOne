import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StartNewChatDialog } from "@/components/dialogs/StartNewChatDialog";
import { useAuth } from "@/contexts/AuthContext";

export default function ITLiveChat() {
  const { user, currentPortal } = useAuth();
  const CURRENT_USER_ID = user?.employeeId || user?.id;

  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // 1️⃣ Fetch chats based on portal
  const fetchChats = async () => {
    if (!user) return;
    let url = "";
    if (currentPortal === "IT Portal") {
      url = "/api/livechats?scope=all";
    } else {
      url = `/api/livechats?user_id=${CURRENT_USER_ID}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setChats(data || []);
    if (!selectedChatId && data.length > 0) {
      setSelectedChatId(data[0].ChatID || data[0].chatId);
    }
  };

  // 2️⃣ Fetch messages for selected chat
  const fetchMessages = async (chatId) => {
    if (!chatId) return setMessages([]);
    const res = await fetch(`/api/livechats/${chatId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    } else {
      setMessages([]);
    }
  };

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line
  }, [CURRENT_USER_ID, currentPortal]);

  useEffect(() => {
    if (selectedChatId) fetchMessages(selectedChatId);
  }, [selectedChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3️⃣ Send a message to the correct POST endpoint
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId) return;
    await fetch(`/api/livechats/${selectedChatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: CURRENT_USER_ID,
        message: newMessage,
      }),
    });
    setNewMessage("");
    fetchMessages(selectedChatId);
  };

  // Utility badges
  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="text-warning border-warning">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="text-success border-success">Low</Badge>;
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case "waiting":
        return <Badge variant="outline" className="text-warning border-warning">Waiting</Badge>;
      case "resolved":
        return <Badge variant="secondary">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const currentChat = chats.find((c) => (c.ChatID || c.chatId) === selectedChatId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {currentPortal === "IT Portal" ? "Live Chat Support (All)" : "Live Chat Support"}
            </h1>
            <p className="text-muted-foreground">Real-time assistance for employees</p>
          </div>
          <StartNewChatDialog onChatCreated={fetchChats}>
            <Button>Start New Chat</Button>
          </StartNewChatDialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Active Chats */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Active Chats</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {chats.length === 0 && (
                <p className="p-3 text-sm text-muted-foreground">No active chats.</p>
              )}
              {chats.map((chat) => (
                <div
                  key={chat.ChatID || chat.chatId}
                  className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                    selectedChatId === (chat.ChatID || chat.chatId) ? "bg-accent" : ""
                  }`}
                  onClick={() => setSelectedChatId(chat.ChatID || chat.chatId)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">
                        {chat.FromID === CURRENT_USER_ID
                          ? chat.ToName || `To: ${chat.ToID}`
                          : chat.FromName || `From: ${chat.FromID}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {chat.Department} Dept
                      </p>
                    </div>
                    {getStatusBadge(chat.Status)}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{chat.Issue}</p>
                    {getPriorityBadge(chat.Priority)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(chat.Timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {currentChat ? `Chat #${currentChat.ChatID || currentChat.chatId}` : "Select a Chat"}
                  </CardTitle>
                  {currentChat && (
                    <p className="text-sm text-muted-foreground">{currentChat.Issue}</p>
                  )}
                </div>
                {currentChat && (
                  <div className="flex space-x-2">
                    {getPriorityBadge(currentChat.Priority)}
                    {getStatusBadge(currentChat.Status)}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 bg-background">
                {messages.length === 0 && (
                  <div className="text-sm text-muted-foreground">No messages in this chat yet.</div>
                )}
                {messages.map((msg) => (
                  <div key={msg.MessageID || msg.messageId} className={`flex ${msg.SenderID === CURRENT_USER_ID ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${msg.SenderID === CURRENT_USER_ID ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p className="text-xs font-semibold mb-1">
                        {msg.SenderID === CURRENT_USER_ID ? "You" : `User ${msg.SenderID}`}
                      </p>
                      <p className="text-sm">{msg.Content}</p>
                      <p className="text-xs opacity-70 mt-1">{new Date(msg.Timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Box */}
              {currentChat && (
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>Send</Button>
                </div>
              )}
            </CardContent>
          </Card>

          
        </div>
      </div>
    </DashboardLayout>
  );
}
