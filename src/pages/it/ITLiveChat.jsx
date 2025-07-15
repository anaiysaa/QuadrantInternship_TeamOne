import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CreateTicketDialog } from '@/components/dialogs/CreateTicketDialog';
import { RemoteDesktopDialog } from '@/components/dialogs/RemoteDesktopDialog';
import { CallEmployeeDialog } from '@/components/dialogs/CallEmployeeDialog';
import { ChatHistoryDialog } from '@/components/dialogs/ChatHistoryDialog';
import { StartNewChatDialog } from '@/components/dialogs/StartNewChatDialog';

export default function ITLiveChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'system',
      message: 'Welcome to IT Support Chat! How can I help you today?',
      timestamp: new Date('2024-02-12T10:00:00'),
      type: 'welcome'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChats, setActiveChats] = useState([
    {
      id: 'chat-001',
      employee: 'John Doe',
      department: 'Engineering',
      issue: 'Login problems',
      priority: 'High',
      status: 'Active',
      startTime: '2024-02-12T09:30:00',
      lastMessage: 'I cannot access my account'
    },
    {
      id: 'chat-002',
      employee: 'Sarah Johnson',
      department: 'Sales',
      issue: 'Printer not working',
      priority: 'Medium',
      status: 'Waiting',
      startTime: '2024-02-12T09:45:00',
      lastMessage: 'The printer shows error code 42'
    },
    {
      id: 'chat-003',
      employee: 'Lisa Brown',
      department: 'Design',
      issue: 'Software installation',
      priority: 'Low',
      status: 'Resolved',
      startTime: '2024-02-12T08:15:00',
      lastMessage: 'Thank you, it works now!'
    }
  ]);
  const [selectedChat, setSelectedChat] = useState('chat-001');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const commonResponses = [
    "Can you please restart your computer and try again?",
    "I'll create a ticket for this issue and assign it to our technical team.",
    "Please try clearing your browser cache and cookies.",
    "Let me check the system status for you.",
    "Can you provide a screenshot of the error message?",
    "I'll escalate this to our network administrator.",
    "Please update your software to the latest version.",
    "Let me remote into your computer to take a look."
  ];

  const troubleshootingSteps = [
    {
      category: 'Login Issues',
      steps: [
        'Verify username and password',
        'Check caps lock status',
        'Clear browser cache',
        'Try incognito/private mode',
        'Reset password if needed'
      ]
    },
    {
      category: 'Network Problems',
      steps: [
        'Check ethernet cable connection',
        'Restart network adapter',
        'Run network troubleshooter',
        'Check Wi-Fi connection',
        'Contact network team if persists'
      ]
    },
    {
      category: 'Software Issues',
      steps: [
        'Close and restart application',
        'Check for software updates',
        'Run as administrator',
        'Reinstall the application',
        'Check system requirements'
      ]
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        sender: 'it-tech',
        message: newMessage,
        timestamp: new Date(),
        type: 'response'
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');

      // Simulate bot response after 2 seconds
      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          sender: 'system',
          message: "I understand your issue. Let me help you with that. Can you provide more details about when this problem started?",
          timestamp: new Date(),
          type: 'bot'
        };
        setMessages(prev => [...prev, botResponse]);
      }, 2000);
    }
  };

  const handleQuickResponse = (response) => {
    const newMsg = {
      id: messages.length + 1,
      sender: 'it-tech',
      message: response,
      timestamp: new Date(),
      type: 'response'
    };
    setMessages([...messages, newMsg]);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="text-warning border-warning">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline" className="text-success border-success">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case 'Waiting':
        return <Badge variant="outline" className="text-warning border-warning">Waiting</Badge>;
      case 'Resolved':
        return <Badge variant="secondary">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const currentChat = activeChats.find(chat => chat.id === selectedChat);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Live Chat Support</h1>
            <p className="text-muted-foreground">Real-time assistance for employees</p>
          </div>
          <div className="flex space-x-2">
            <ChatHistoryDialog>
              <Button variant="outline">Chat History</Button>
            </ChatHistoryDialog>
            <StartNewChatDialog>
              <Button>Start New Chat</Button>
            </StartNewChatDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Active Chats Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Active Chats</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {activeChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                      selectedChat === chat.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedChat(chat.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{chat.employee}</p>
                      {getStatusBadge(chat.status)}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">{chat.department}</p>
                      {getPriorityBadge(chat.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground">{chat.issue}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(chat.startTime).toLocaleTimeString()}
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
                    {currentChat ? `Chat with ${currentChat.employee}` : 'Select a Chat'}
                  </CardTitle>
                  {currentChat && (
                    <p className="text-sm text-muted-foreground">
                      {currentChat.department} • {currentChat.issue}
                    </p>
                  )}
                </div>
                {currentChat && (
                  <div className="flex space-x-2">
                    {getPriorityBadge(currentChat.priority)}
                    {getStatusBadge(currentChat.status)}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 bg-background">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'it-tech' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender === 'it-tech'
                            ? 'bg-primary text-primary-foreground'
                            : message.type === 'welcome'
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
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Quick Responses */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Quick Responses:</p>
                <div className="grid grid-cols-2 gap-2">
                  {commonResponses.slice(0, 4).map((response, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto whitespace-normal"
                      onClick={() => handleQuickResponse(response)}
                    >
                      {response}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>Send</Button>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting Guide */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Quick Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {troubleshootingSteps.map((guide, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-sm mb-2">{guide.category}</h4>
                    <ul className="space-y-1">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-xs text-muted-foreground flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3 bg-accent rounded-lg">
                <p className="text-sm font-medium mb-2">Escalation Options</p>
                <div className="space-y-2">
                  <CreateTicketDialog>
                    <Button variant="outline" size="sm" className="w-full">
                      Create Ticket
                    </Button>
                  </CreateTicketDialog>
                  
                  <RemoteDesktopDialog employee={currentChat?.employee}>
                    <Button variant="outline" size="sm" className="w-full">
                      Remote Desktop
                    </Button>
                  </RemoteDesktopDialog>
                  
                  <CallEmployeeDialog employee={currentChat?.employee}>
                    <Button variant="outline" size="sm" className="w-full">
                      Call Employee
                    </Button>
                  </CallEmployeeDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
