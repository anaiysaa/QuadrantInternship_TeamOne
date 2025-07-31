import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getContextualGreeting = () => {
    const role = user?.role || 'employee';
    const greetings = {
      employee: "Hi! I'm your AI assistant. I can help you with leave requests, timesheet questions, IT support, and general HR inquiries. What can I help you with today?",
      hr: "Hello! I'm here to assist with HR-related queries, employee management, leave approvals, and policy questions. How can I help?",
      it: "Hi there! I can help with IT support tickets, asset management, software requests, and technical documentation. What do you need assistance with?",
      admin: "Welcome! I can assist you with questions about company policy and the employee handbook. How may I help you today?"
    };
    return greetings[role] || greetings.employee;
  };

  const initializeChat = () => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        text: getContextualGreeting(),
        sender: 'ai',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleToggleChat = () => {
    if (!isOpen) {
      initializeChat();
    }
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

const sendToBackend = async (userMessage, chatHistory) => {
  try {
    const response = await fetch("http://localhost:8000/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: userMessage,
        history: chatHistory  // send full chat history
      })
    });

    const data = await response.json();
    return data.answer || "Sorry, I didn't understand that.";
  } catch (error) {
    console.error("Failed to fetch from backend:", error);
    return "An error occurred while trying to reach the assistant.";
  }
};


 const handleSendMessage = async () => {
  if (!inputValue.trim()) return;

  const userMessage = {
    id: messages.length + 1,
    text: inputValue,
    sender: 'user',
    timestamp: new Date().toISOString()
  };

  const updatedMessages = [...messages, userMessage];
  setMessages(updatedMessages);
  setInputValue('');
  setIsLoading(true);
  setIsTyping(true);

  try {
    const chatHistory = updatedMessages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    const aiReply = await sendToBackend(userMessage.text, chatHistory);

    const aiMessage = {
      id: updatedMessages.length + 1,
      text: aiReply,
      sender: 'ai',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, aiMessage]);
  } catch (error) {
    toast({
      title: "Error",
      description: "Something went wrong. Please try again.",
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
    setIsTyping(false);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleToggleChat}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary-hover shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
      <Card className={`w-80 shadow-xl transition-all duration-200 ${isMinimized ? 'h-16' : 'h-96'}`}>
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
            <CardTitle className="text-sm">AI Assistant</CardTitle>
            <Badge variant="outline" className="text-xs">{user?.role || 'Employee'}</Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={handleMinimize} className="h-6 w-6">
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="p-0 h-64 overflow-y-auto">
              <div className="p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
