
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function LiveChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'it-support',
      message: 'Hello! Welcome to IT Support. How can I help you today?',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        sender: 'user',
        message: newMessage,
        timestamp: new Date(),
        type: 'user'
      };
      setMessages([...messages, userMessage]);
      setNewMessage('');

      // Simulate IT response
      setTimeout(() => {
        const responses = [
          "I understand your issue. Let me check that for you.",
          "Can you provide more details about when this started?",
          "Let me walk you through the solution step by step.",
          "I'll need to remote into your system to fix this. Is that okay?",
          "This looks like a common issue. Here's how to resolve it:"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const itResponse = {
          id: messages.length + 2,
          sender: 'it-support',
          message: randomResponse,
          timestamp: new Date(),
          type: 'support'
        };
        setMessages(prev => [...prev, itResponse]);
      }, 1500);
    }
  };

  const quickQuestions = [
    "My computer won't start",
    "Internet connection problems",
    "Password reset needed",
    "Software installation help",
    "Printer not working",
    "Email configuration"
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Live Chat with IT Support</h1>
            <p className="text-muted-foreground">Get real-time help from our IT team</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-success' : 'bg-destructive'}`}></div>
            <span className="text-sm">{isOnline ? 'IT Support Online' : 'IT Support Offline'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>IT Support Chat</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 bg-background">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : message.type === 'system'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!isOnline}>
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto whitespace-normal"
                    onClick={() => setNewMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-accent rounded-lg">
                <h4 className="font-medium mb-2">Support Hours</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 2:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Emergency Contact</h4>
                <p className="text-sm text-muted-foreground">
                  For urgent issues after hours, call: <br />
                  <strong>+1 (555) 123-4567</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
