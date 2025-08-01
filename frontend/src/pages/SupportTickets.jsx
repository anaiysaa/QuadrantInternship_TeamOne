import { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, EyeOff, Plus, Send } from 'lucide-react';
import { ViewTicketDialog } from '@/components/dialogs/ViewTicketDialog';

console.log('opening SupportTickets.jsx');

const getTickets = async (employeeId) => {
  try {
    console.log('Fetching tickets for EmployeeID:', employeeId);
    const response = await axios.get(`http://localhost:8000/api/tickets/personal?EmployeeID=${employeeId}`);
    console.log('Tickets fetched:', response.data);
    
    // Validate that response.data is an object with the expected structure
    if (typeof response.data === 'object' && response.data !== null) {
      return {
        it_tickets: Array.isArray(response.data.it_tickets) ? response.data.it_tickets : [],
        hr_tickets: Array.isArray(response.data.hr_tickets) ? response.data.hr_tickets : []
      };
    } else {
      console.error('Unexpected response format:', response.data);
      return { it_tickets: [], hr_tickets: [] };
    }
  } catch (error) {
    console.error('Error fetching tickets:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return { it_tickets: [], hr_tickets: [] };
  }
};

const postITTicket = async (ticketData) => {
  try {
    console.log('Posting IT Ticket:', ticketData);
    const response = await axios.post('http://localhost:8000/api/tickets/it', {
      EmployeeID: ticketData.employeeId,
      Status: 'Open',
      title: ticketData.title,
      description: ticketData.description,
      summary: ticketData.summary || '',
      department: ticketData.department,
    });
    console.log('IT Ticket created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating IT ticket:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to create IT ticket');
  }
};

const postHRTicket = async (ticketData) => {
  try {
    console.log('Posting HR Ticket:', ticketData);
    const response = await axios.post('http://localhost:8000/api/tickets/hr', {
      EmployeeID: ticketData.employeeId,
      Status: 'Open',
      title: ticketData.title,
      description: ticketData.description,
      summary: ticketData.summary || '',
      department: ticketData.department,
    });
    console.log('HR Ticket created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating HR ticket:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to create HR ticket');
  }
};

export default function SupportTickets() {
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: '',
    ticketType: 'IT',
  });
  const { user } = useAuth();
  const employeeId = user ? user.employeeId : null;
  const department = user ? user.department : '';
  const [tickets, setTickets] = useState({ it_tickets: [], hr_tickets: [] });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for ViewTicketDialog
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    if (employeeId) {
      console.log('EmployeeID set:', employeeId);
      fetchTickets();
    }
  }, [employeeId]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const ticketData = await getTickets(employeeId);
      setTickets(ticketData);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setError('Failed to load tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description || !newTicket.ticketType) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const ticketData = { ...newTicket, employeeId, department };
      console.log('Submitting ticket:', ticketData);
      if (newTicket.ticketType === 'IT') {
        await postITTicket(ticketData);
      } else if (newTicket.ticketType === 'HR') {
        await postHRTicket(ticketData);
      }

      console.log('Ticket successfully created');

      setNewTicket({ 
        title: '', 
        description: '',
        priority: '', 
        ticketType: 'IT' 
      });

      setIsCreateDialogOpen(false);
      await fetchTickets();
      alert('Ticket created successfully!');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    }
  };

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      console.log('User sent chat message:', chatInput);
      setChatMessages([...chatMessages, { sender: 'user', message: chatInput }]);
      setChatInput('');

      setTimeout(() => {
        const botReply = 'Thanks for your message! I understand you need help with your issue. Let me create a support ticket for you. Can you please provide more details about the problem?';
        console.log('Bot replying with:', botReply);
        setChatMessages(prev => [...prev, { sender: 'bot', message: botReply }]);
      }, 1000);
    }
  };

  // Function to handle viewing a ticket
  const handleViewTicket = (ticket, ticketType) => {
    // Transform the ticket data to match the ViewTicketDialog expected format
    const transformedTicket = {
      id: ticket.TicketID,
      title: ticket.Title,
      description: ticket.Description,
      employee: user?.name || user?.email || 'Current User',
      department: ticket.Department || department,
      category: ticket.Category || 'General',
      severity: ticket.Severity,
      priority: ticket.Priority,
      status: ticket.Status,
      createdDate: ticket.SubmittedDate || ticket.CreatedDate,
      submittedDate: ticket.SubmittedDate
    };
    
    setSelectedTicket(transformedTicket);
    setIsViewDialogOpen(true);
  };

  const getPriorityBadge = (priority) => {
    console.log('Rendering priority badge for:', priority);
    switch (priority) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline" className="text-green-600 border-green-600">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    console.log('Rendering status badge for:', status);
    switch (status) {
      case 'Open':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Open</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">In Progress</Badge>;
      case 'Resolved':
        return <Badge variant="default" className="bg-green-600 text-white">Resolved</Badge>;
      case 'Closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTicketTypeBadge = (ticketType) => {
    console.log('Rendering ticket type badge for:', ticketType);
    switch (ticketType) {
      case 'IT':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">IT</Badge>;
      case 'HR':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">HR</Badge>;
      default:
        return <Badge variant="secondary">{ticketType}</Badge>;
    }
  };

  // Safely create allTickets array with proper error handling and type identification
  const allTicketsWithType = [
    ...(Array.isArray(tickets.it_tickets) ? tickets.it_tickets.map(ticket => ({ ...ticket, ticketType: 'IT' })) : []),
    ...(Array.isArray(tickets.hr_tickets) ? tickets.hr_tickets.map(ticket => ({ ...ticket, ticketType: 'HR' })) : [])
  ];

  const priorityData = [
    { name: 'High', value: allTicketsWithType.filter(t => t.Severity === 'High').length, color: '#ef4444' },
    { name: 'Medium', value: allTicketsWithType.filter(t => t.Severity === 'Medium').length, color: '#eab308' },
    { name: 'Low', value: allTicketsWithType.filter(t => t.Severity === 'Low').length, color: '#22c55e' },
  ].filter(item => item.value > 0);

  const statusData = [
    { name: 'Open', value: allTicketsWithType.filter(t => t.Status === 'Open').length },
    { name: 'In Progress', value: allTicketsWithType.filter(t => t.Status === 'In Progress').length },
    { name: 'Resolved', value: allTicketsWithType.filter(t => t.Status === 'Resolved').length },
    { name: 'Closed', value: allTicketsWithType.filter(t => t.Status === 'Closed').length },
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

  console.log('Rendering component with tickets:', allTicketsWithType);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Support Tickets</h1>
            <p className="text-muted-foreground">Create and track your IT and HR support requests</p>
          </div>
          <div className="flex space-x-2">
            {/* Chat Dialog */}
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
                    <Button onClick={handleChatSubmit}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Create Ticket Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Ticket Type *</label>
                    <Select 
                      value={newTicket.ticketType} 
                      onValueChange={(value) => setNewTicket({...newTicket, ticketType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ticket type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT">IT Support</SelectItem>
                        <SelectItem value="HR">HR Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description *</label>
                    <Textarea
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                      placeholder="Detailed description of the issue"
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTicket} className="flex-1">
                      Create Ticket
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="text-red-600">⚠️</div>
                <p className="text-red-700">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchTickets}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="space-y-6">
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
                      <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
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
            {loading ? (
              <div className="text-center py-4">Loading tickets...</div>
            ) : allTicketsWithType.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tickets found. Create your first support ticket above!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTicketsWithType.map((ticket) => (
                    <TableRow key={`${ticket.TicketID}-${ticket.EmployeeID}`}>
                      <TableCell className="font-medium">{ticket.TicketID}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.Title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {ticket.Description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTicketTypeBadge(ticket.ticketType)}
                      </TableCell>
                      <TableCell>{getPriorityBadge(ticket.Severity)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.Status)}</TableCell>
                      <TableCell className="text-sm">
                        {ticket.SubmittedDate ? new Date(ticket.SubmittedDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewTicket(ticket, ticket.ticketType)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ViewTicketDialog Component */}
        <ViewTicketDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          ticket={selectedTicket}
          context="employee" // Since this is the employee view
        />
      </div>
    </DashboardLayout>
  );
}