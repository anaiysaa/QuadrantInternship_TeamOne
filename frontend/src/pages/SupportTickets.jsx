import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateTicketDialog } from '@/components/dialogs/CreateTicketDialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, EyeOff } from 'lucide-react';

export default function SupportTickets() {
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const tickets = [
    {
      id: 'ST-001',
      title: 'Laptop running slowly',
      category: 'Hardware',
      priority: 'Medium',
      status: 'In Progress',
      createdDate: '2024-02-10',
      lastUpdate: '2024-02-12',
      assignedTo: 'IT Support',
      description: 'My laptop has been running very slowly for the past week.',
      ticketType: 'IT'
    },
    {
      id: 'ST-002',
      title: 'Cannot access email',
      category: 'Software',
      priority: 'High',
      status: 'Open',
      createdDate: '2024-02-11',
      lastUpdate: '2024-02-11',
      assignedTo: 'Unassigned',
      description: 'Unable to login to my email account since this morning.',
      ticketType: 'IT'
    },
    {
      id: 'ST-003',
      title: 'Printer not working',
      category: 'Hardware',
      priority: 'Low',
      status: 'Resolved',
      createdDate: '2024-02-08',
      lastUpdate: '2024-02-09',
      assignedTo: 'IT Support',
      description: 'Office printer shows paper jam error constantly.',
      ticketType: 'IT'
    },
    {
      id: 'ST-004',
      title: 'Salary adjustment request',
      category: 'Compensation',
      priority: 'High',
      status: 'Open',
      createdDate: '2024-02-10',
      lastUpdate: '2024-02-12',
      assignedTo: 'HR Team',
      description: 'Request for salary review based on performance.',
      ticketType: 'HR'
    },
    {
      id: 'ST-005',
      title: 'Policy clarification needed',
      category: 'Policy',
      priority: 'Medium',
      status: 'In Progress',
      createdDate: '2024-02-08',
      lastUpdate: '2024-02-11',
      assignedTo: 'HR Team',
      description: 'Questions about remote work policy.',
      ticketType: 'HR'
    }
  ];

  const handleCreateTicket = () => {
    console.log('Creating ticket:', newTicket);
    // Reset form
    setNewTicket({ title: '', description: '', category: '', priority: '' });
  };

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { sender: 'user', message: chatInput }]);
      setChatInput('');
      
      // Simulate bot response
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          sender: 'bot', 
          message: 'Thanks for your message! I understand you need help with your issue. Let me create a support ticket for you. Can you please provide more details about the problem?' 
        }]);
      }, 1000);
    }
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
      case 'Open':
        return <Badge variant="outline" className="text-primary border-primary">Open</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="text-warning border-warning">In Progress</Badge>;
      case 'Resolved':
        return <Badge variant="default" className="bg-success text-success-foreground">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTicketTypeBadge = (ticketType) => {
    switch (ticketType) {
      case 'IT':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">IT</Badge>;
      case 'HR':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">HR</Badge>;
      default:
        return <Badge variant="secondary">{ticketType}</Badge>;
    }
  };

  // Analytics data
  const categoryData = [
    { name: 'Hardware', value: tickets.filter(t => t.category === 'Hardware').length },
    { name: 'Software', value: tickets.filter(t => t.category === 'Software').length },
    { name: 'Compensation', value: tickets.filter(t => t.category === 'Compensation').length },
    { name: 'Policy', value: tickets.filter(t => t.category === 'Policy').length },
  ].filter(item => item.value > 0);

  const priorityData = [
    { name: 'High', value: tickets.filter(t => t.priority === 'High').length, color: '#ef4444' },
    { name: 'Medium', value: tickets.filter(t => t.priority === 'Medium').length, color: '#eab308' },
    { name: 'Low', value: tickets.filter(t => t.priority === 'Low').length, color: '#22c55e' },
  ].filter(item => item.value > 0);

  const statusData = [
    { name: 'Open', value: tickets.filter(t => t.status === 'Open').length },
    { name: 'In Progress', value: tickets.filter(t => t.status === 'In Progress').length },
    { name: 'Resolved', value: tickets.filter(t => t.status === 'Resolved').length },
  ].filter(item => item.value > 0);

  const weeklyTrendData = [
    { day: 'Mon', tickets: 2 },
    { day: 'Tue', tickets: 1 },
    { day: 'Wed', tickets: 3 },
    { day: 'Thu', tickets: 2 },
    { day: 'Fri', tickets: 1 },
    { day: 'Sat', tickets: 0 },
    { day: 'Sun', tickets: 0 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Support Tickets</h1>
            <p className="text-muted-foreground">Create and track your IT support requests</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-2"
            >
              {showAnalytics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAnalytics ? 'Hide' : 'Show'} Analytics</span>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Chat with Bot</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>IT Support Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-background">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground">
                        <p>👋 Hello! I'm your IT support assistant.</p>
                        <p>How can I help you today?</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {chatMessages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                msg.sender === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                    />
                    <Button onClick={handleChatSubmit}>Send</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <CreateTicketDialog>
              <Button>Create Ticket</Button>
            </CreateTicketDialog>
          </div>
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Support Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Weekly Ticket Trend</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={weeklyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Tickets by Category</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Priority Distribution</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={priorityData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Status Distribution</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={statusData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={80} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#22c55e" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>My Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTicketTypeBadge(ticket.ticketType)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.category}</Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-sm">{ticket.assignedTo}</TableCell>
                    <TableCell className="text-sm">{ticket.createdDate}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
