
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function HRLiveChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'it-support',
      message: 'Hello! This is IT Support. How can I help you with your technical issues today?',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  
  // State for toggling analytics visibility
  const [showSupportAnalytics, setShowSupportAnalytics] = useState(false);
  const [showResponseAnalytics, setShowResponseAnalytics] = useState(false);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        sender: 'hr-user',
        message: newMessage,
        timestamp: new Date(),
        type: 'user'
      };
      setMessages([...messages, userMessage]);
      setNewMessage('');

      // Simulate IT response
      setTimeout(() => {
        const responses = [
          "I'll help you resolve this IT issue right away.",
          "Let me check the system logs for your department.",
          "Can you tell me which employees are affected?",
          "I'll escalate this to our senior technician.",
          "This should be resolved within the next 30 minutes."
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

  const hrQuickQuestions = [
    "HRIS system not responding",
    "Employee portal access issues",
    "Payroll system problems",
    "Database backup needed",
    "New employee account setup",
    "Security access for HR team"
  ];

  // Analytics data for HR IT support
  const ticketData = [
    { category: 'HRIS Issues', count: 12, resolved: 10 },
    { category: 'Access Problems', count: 8, resolved: 6 },
    { category: 'Payroll System', count: 15, resolved: 13 },
    { category: 'Database', count: 5, resolved: 4 },
    { category: 'Security', count: 7, resolved: 7 },
  ];

  const responseTimeData = [
    { day: 'Mon', avgTime: 8, target: 15 },
    { day: 'Tue', avgTime: 12, target: 15 },
    { day: 'Wed', avgTime: 6, target: 15 },
    { day: 'Thu', avgTime: 9, target: 15 },
    { day: 'Fri', avgTime: 11, target: 15 },
    { day: 'Sat', avgTime: 5, target: 15 },
    { day: 'Sun', avgTime: 3, target: 15 },
  ];

  const supportStats = [
    { title: 'Active Tickets', value: '23', subtitle: 'HR department', color: 'bg-warning' },
    { title: 'Avg Response Time', value: '8 min', subtitle: 'Last 7 days', color: 'bg-success' },
    { title: 'Resolution Rate', value: '94%', subtitle: 'This month', color: 'bg-primary' },
    { title: 'Critical Issues', value: '2', subtitle: 'Escalated', color: 'bg-destructive' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">HR Live Chat with IT Support</h1>
            <p className="text-muted-foreground">Get technical support for HR systems</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-success' : 'bg-destructive'}`}></div>
            <span className="text-sm">{isOnline ? 'IT Support Online' : 'IT Support Offline'}</span>
          </div>
        </div>

        {/* Support Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {supportStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                </div>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
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
                      className={`flex ${message.sender === 'hr-user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender === 'hr-user'
                            ? 'bg-success text-success-foreground'
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
                  placeholder="Describe your IT issue..."
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
              <CardTitle>Common HR IT Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hrQuickQuestions.map((question, index) => (
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
                <h4 className="font-medium mb-2">Priority Support</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>HR systems have priority support</p>
                  <p>Average response time: 5 minutes</p>
                  <p>Critical issues: Immediate response</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Escalation</h4>
                <p className="text-sm text-muted-foreground">
                  For urgent HR system issues: <br />
                  <strong>IT Manager: ext. 2001</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Toggle Buttons */}
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setShowSupportAnalytics(!showSupportAnalytics)}
          >
            {showSupportAnalytics ? 'Hide Support Analytics' : 'Show Support Analytics'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowResponseAnalytics(!showResponseAnalytics)}
          >
            {showResponseAnalytics ? 'Hide Response Analytics' : 'Show Response Analytics'}
          </Button>
        </div>

        {/* Analytics Section - Only show when toggled */}
        {(showSupportAnalytics || showResponseAnalytics) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket Categories */}
            {showSupportAnalytics && (
              <Card>
                <CardHeader>
                  <CardTitle>HR IT Support Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={ticketData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" name="Total Tickets" />
                      <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Response Time Trend */}
            {showResponseAnalytics && (
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgTime" stroke="#3b82f6" name="Avg Response (min)" />
                      <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" name="Target (15 min)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
