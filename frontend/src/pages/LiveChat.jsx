import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { EmployeeStartNewChatDialog } from "@/components/dialogs/EmployeeStartNewChatDialog";

export default function LiveChat() {
  const { user, currentPortal } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const CURRENT_USER_ID = user?.employeeId || user?.id;

  // Fetch chat sessions
  const fetchChats = async () => {
    let url = "";
    if (currentPortal === "IT Portal") {
      url = "/api/livechats?scope=all";
    } else {
      url = `/api/livechats?user_id=${CURRENT_USER_ID}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setChats(data || []);
    // Auto-select most recent
    if (data.length && !selectedChatId) {
      setSelectedChatId(data[0].ChatID);
    }
  };

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line
  }, [user, currentPortal]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }
    fetch(`/api/livechats/${selectedChatId}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data || []));
  }, [selectedChatId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Highlight chat if new message not sent by me
  const isUnread = (chat) =>
    chat.LastSenderID && Number(chat.LastSenderID) !== Number(CURRENT_USER_ID);

  // Send message
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
    // Reload messages (and chats for recency)
    fetch(`/api/livechats/${selectedChatId}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data || []));
    fetchChats();
  };

  const getChatTitle = (chat) => {
    if (chat.Department && chat.Department.toLowerCase() === "it") {
      return "IT Support";
    }
    return chat.Issue || `Chat ${chat.ChatID}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {currentPortal === "IT Portal" ? "All Live Chats" : "My IT Chats"}
            </h1>
            <p className="text-muted-foreground">
              {currentPortal === "IT Portal"
                ? "View all conversations in the system."
                : "View all your conversations with IT support."}
            </p>
          </div>
          {/* Start New Chat button (only for employees) */}
          {currentPortal !== "IT Portal" && (
            <EmployeeStartNewChatDialog onChatCreated={fetchChats}>
              <Button>Start New IT Chat</Button>
            </EmployeeStartNewChatDialog>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Chat sessions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Past Chats</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {chats.length === 0 && (
                  <p className="p-3 text-sm text-muted-foreground">
                    No chats found.
                  </p>
                )}
                {chats.map((chat) => (
                  <div
                    key={chat.ChatID}
                    className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                      selectedChatId === chat.ChatID
                        ? "bg-accent"
                        : isUnread(chat)
                        ? "font-bold bg-yellow-50"
                        : ""
                    }`}
                    onClick={() => setSelectedChatId(chat.ChatID)}
                  >
                    <div className={`font-medium text-sm ${isUnread(chat) ? "font-bold" : ""}`}>
                      {getChatTitle(chat)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {chat.LastMessage ? chat.LastMessage.slice(0, 40) : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {chat.LastMessageTimestamp &&
                        new Date(chat.LastMessageTimestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Chat window */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>
                {selectedChatId
                  ? "Conversation"
                  : "Select a chat to view the conversation"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 bg-background">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      No messages yet in this chat.
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.MessageID}
                      className={`flex ${msg.SenderID === CURRENT_USER_ID ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.SenderID === CURRENT_USER_ID
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1">
                          {msg.SenderID === CURRENT_USER_ID ? "You" : `User ${msg.SenderID}`}
                        </p>
                        <p className="text-sm">{msg.Content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.Timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              {/* Message Input */}
              {selectedChatId && (
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
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
