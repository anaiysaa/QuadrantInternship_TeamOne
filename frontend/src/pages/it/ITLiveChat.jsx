import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StartNewChatDialog } from "@/components/dialogs/StartNewChatDialog";

// --- Placeholder for demo. Replace with real logged-in user info! ---
const CURRENT_USER_ID = 1;
const CURRENT_USER_DEPARTMENT = "IT";

export default function ITLiveChat() {
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Fetch all live chats for this user (modify query/filter as needed)
  const fetchActiveChats = async () => {
    const res = await fetch(`/api/livechats?user_id=${CURRENT_USER_ID}`);
    const data = await res.json();
    setActiveChats(data);
    // Auto-select first chat if none selected
    if (!selectedChat && data.length > 0) setSelectedChat(data[0].ChatID);
  };

  // Fetch messages for selected chat
  const fetchMessages = async (chatId) => {
    if (!chatId) return setMessages([]);
    const res = await fetch(`/api/messages?chat_id=${chatId}`);
    const data = await res.json();
    setMessages(data);
  };

  // Initial load and refresh after starting a chat
  useEffect(() => {
    fetchActiveChats();
    // eslint-disable-next-line
  }, []);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) fetchMessages(selectedChat);
    // eslint-disable-next-line
  }, [selectedChat]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: selectedChat,
        sender_id: CURRENT_USER_ID,
        message: newMessage,
      }),
    });
    setNewMessage("");
    fetchMessages(selectedChat); // Reload messages
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

  const currentChat = activeChats.find((c) => c.ChatID === selectedChat);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Live Chat Support</h1>
            <p className="text-muted-foreground">Real-time assistance for employees</p>
          </div>
          <div className="flex space-x-2">
            {/* Add ChatHistoryDialog etc. if needed */}
            <StartNewChatDialog onChatCreated={fetchActiveChats}>
              <Button>Start New Chat</Button>
            </StartNewChatDialog>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Active Chats */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Active Chats</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {activeChats.length === 0 && (
                  <p className="p-3 text-sm text-muted-foreground">No active chats.</p>
                )}
                {activeChats.map((chat) => (
                  <div
                    key={chat.ChatID}
                    className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                      selectedChat === chat.ChatID ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedChat(chat.ChatID)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{chat.ToName || chat.FromName || "?"}</p>
                        <p className="text-xs text-muted-foreground">
                          {chat.Department || ""} Dept
                        </p>
                      </div>
                      {getStatusBadge(chat.Status)}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">
                        {chat.Issue}
                      </p>
                      {getPriorityBadge(chat.Priority)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {chat.Timestamp && new Date(chat.Timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Chat Interface */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {currentChat
                      ? `Chat with ${currentChat.ToName || currentChat.FromName || "Employee"} (${currentChat.Department || "?"})`
                      : "Select a Chat"}
                  </CardTitle>
                  {currentChat && (
                    <p className="text-sm text-muted-foreground">
                      {currentChat.Issue}
                    </p>
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
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      No messages in this chat yet.
                    </div>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.MessageID}
                      className={`flex ${
                        message.SenderID === CURRENT_USER_ID
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.SenderID === CURRENT_USER_ID
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.Content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.Timestamp &&
                            new Date(message.Timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              {/* Message Input */}
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
          {/* Quick Troubleshooting Sidebar (optional) */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Quick Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Login Issues</h4>
                  <ul className="space-y-1">
                    <li className="text-xs text-muted-foreground">Verify username and password</li>
                    <li className="text-xs text-muted-foreground">Clear browser cache</li>
                    <li className="text-xs text-muted-foreground">Reset password if needed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Network Problems</h4>
                  <ul className="space-y-1">
                    <li className="text-xs text-muted-foreground">Check ethernet cable connection</li>
                    <li className="text-xs text-muted-foreground">Restart network adapter</li>
                    <li className="text-xs text-muted-foreground">Contact network team if persists</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Software Issues</h4>
                  <ul className="space-y-1">
                    <li className="text-xs text-muted-foreground">Close and restart application</li>
                    <li className="text-xs text-muted-foreground">Check for software updates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
