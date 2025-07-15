
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
      admin: "Welcome! I can assist with system administration, user management, analytics, and platform-wide queries. How may I help you today?"
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

  const simulateAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userRole = user?.role || 'employee';
    const userName = user?.name || 'there';
    
    // Simple response logic based on message content and user role
    let response = '';
    const messageText = userMessage.toLowerCase();
    
    if (messageText.includes('leave') || messageText.includes('vacation')) {
      if (userRole === 'hr') {
        response = "I can help you manage leave requests. You can view pending requests in the HR Portal, approve/deny applications, and check team leave calendars. Would you like me to guide you to a specific section?";
      } else {
        response = `Hi ${userName}! For leave requests, you can apply through the Leave Management page. Your current leave balance shows 15 days remaining. Would you like me to help you submit a new request?`;
      }
    } else if (messageText.includes('ticket') || messageText.includes('support') || messageText.includes('it')) {
      if (userRole === 'it') {
        response = "I can help you manage IT support tickets. You currently have 12 open tickets in the queue. You can assign tickets, update statuses, or access the knowledge base. What would you like to do?";
      } else {
        response = `You have 2 open support tickets. Ticket #1234 (laptop running slowly) is in progress, and Ticket #1235 (software license request) is pending. Would you like me to help you create a new ticket?`;
      }
    } else if (messageText.includes('timesheet') || messageText.includes('hours')) {
      response = `Your timesheet shows 168 hours this month (40 hours this week). Don't forget to submit your weekly timesheet by Friday. Would you like me to take you to the timesheet page?`;
    } else if (messageText.includes('payroll') || messageText.includes('salary')) {
      if (userRole === 'hr' || userRole === 'admin') {
        response = "I can help with payroll management. You can process payroll, view salary reports, and manage employee compensation through the HR Portal. What specific payroll task do you need help with?";
      } else {
        response = "For payroll inquiries, please contact HR directly or submit a ticket. I can help you find the right contact information or assist with other employee services.";
      }
    } else if (messageText.includes('hello') || messageText.includes('hi') || messageText.includes('help')) {
      response = `Hello ${userName}! I'm here to help with HR, IT, and general employee questions. I can assist with leave requests, timesheet submissions, support tickets, and much more. What would you like to know?`;
    } else {
      response = `I understand you're asking about "${userMessage}". While I'm still learning, I can help with leave management, IT support, timesheets, and HR policies. Could you rephrase your question or ask about one of these specific areas?`;
    }
    
    setIsTyping(false);
    return response;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await simulateAIResponse(inputValue);
      
      const aiMessage = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMinimize}
              className="h-6 w-6"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
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
