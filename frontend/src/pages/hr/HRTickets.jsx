import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateHRTicketDialog } from '@/components/dialogs/CreateHRTicketDialog';
import { BulkActionsDialog } from '@/components/dialogs/BulkActionsDialog';
import { ViewHRTicketDialog } from '@/components/dialogs/ViewHRTicketDialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, EyeOff } from 'lucide-react';

export default function HRTickets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateTicketDialog, setShowCreateTicketDialog] = useState(false);
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [hrTickets, setHrTickets] = useState([
    {
      id: 'HR001',
      title: 'Salary adjustment request',
      employee: 'John Doe',
      employeeId: 'EMP001',
      category: 'Compensation',
      priority: 'High',
      status: 'Open',
      createdDate: '2024-02-10',
      lastUpdate: '2024-02-12',
      assignedTo: 'Emma Davis',
      description: 'Request for salary review based on performance'
    },
    {
      id: 'HR002',
      title: 'Policy clarification needed',
      employee: 'Sarah Johnson',
      employeeId: 'EMP002',
      category: 'Policy',
      priority: 'Medium',
      status: 'In Progress',
      createdDate: '2024-02-08',
      lastUpdate: '2024-02-11',
      assignedTo: 'Lisa Brown',
      description: 'Questions about remote work policy'
    },
    {
      id: 'HR003',
      title: 'Workplace harassment complaint',
      employee: 'Anonymous',
      employeeId: 'N/A',
      category: 'Complaint',
      priority: 'Critical',
      status: 'Open',
      createdDate: '2024-02-12',
      lastUpdate: '2024-02-12',
      assignedTo: 'Emma Davis',
      description: 'Anonymous complaint requiring immediate attention'
    },
    {
      id: 'HR004',
      title: 'Benefits enrollment issue',
      employee: 'Mike Wilson',
      employeeId: 'EMP003',
      category: 'Benefits',
      priority: 'Medium',
      status: 'Resolved',
      createdDate: '2024-02-05',
      lastUpdate: '2024-02-09',
      assignedTo: 'Lisa Brown',
      description: 'Unable to enroll in health insurance plan'
    },
    {
      id: 'HR005',
      title: 'Performance review dispute',
      employee: 'Alex Brown',
      employeeId: 'EMP005',
      category: 'Performance',
      priority: 'High',
      status: 'In Progress',
      createdDate: '2024-02-07',
      lastUpdate: '2024-02-10',
      assignedTo: 'Emma Davis',
      description: 'Disagreement with performance evaluation ratings'
    }
  ]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredTickets = hrTickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return <Badge variant="outline" className="text-destructive border-destructive">Open</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="text-warning border-warning">In Progress</Badge>;
      case 'Resolved':
        return <Badge variant="default" className="bg-success text-success-foreground">Resolved</Badge>;
      case 'Closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'High':
        return <Badge variant="outline" className="text-destructive border-destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="text-warning border-warning">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Compensation': return 'bg-primary';
      case 'Policy': return 'bg-success';
      case 'Complaint': return 'bg-destructive';
      case 'Benefits': return 'bg-warning';
      case 'Performance': return 'bg-accent';
      default: return 'bg-secondary';
    }
  };

  const stats = [
    { title: 'Total Tickets', value: hrTickets.length, color: 'bg-primary' },
    { title: 'Open', value: hrTickets.filter(t => t.status === 'Open').length, color: 'bg-destructive' },
    { title: 'In Progress', value: hrTickets.filter(t => t.status === 'In Progress').length, color: 'bg-warning' },
    { title: 'Critical', value: hrTickets.filter(t => t.priority === 'Critical').length, color: 'bg-destructive' },
  ];

  const categoryData = [
    { name: 'Compensation', value: hrTickets.filter(t => t.category === 'Compensation').length },
    { name: 'Policy', value: hrTickets.filter(t => t.category === 'Policy').length },
    { name: 'Complaint', value: hrTickets.filter(t => t.category === 'Complaint').length },
    { name: 'Benefits', value: hrTickets.filter(t => t.category === 'Benefits').length },
    { name: 'Performance', value: hrTickets.filter(t => t.category === 'Performance').length },
  ].filter(item => item.value > 0);

  const priorityData = [
    { name: 'Critical', value: hrTickets.filter(t => t.priority === 'Critical').length, color: '#ef4444' },
    { name: 'High', value: hrTickets.filter(t => t.priority === 'High').length, color: '#f97316' },
    { name: 'Medium', value: hrTickets.filter(t => t.priority === 'Medium').length, color: '#eab308' },
    { name: 'Low', value: hrTickets.filter(t => t.priority === 'Low').length, color: '#22c55e' },
  ].filter(item => item.value > 0);

  const statusData = [
    { name: 'Open', value: hrTickets.filter(t => t.status === 'Open').length },
    { name: 'In Progress', value: hrTickets.filter(t => t.status === 'In Progress').length },
    { name: 'Resolved', value: hrTickets.filter(t => t.status === 'Resolved').length },
    { name: 'Closed', value: hrTickets.filter(t => t.status === 'Closed').length },
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

  const handleCreateTicket = () => {
    setShowCreateTicketDialog(true);
  };

  const handleBulkActions = () => {
    setShowBulkActionsDialog(true);
  };

  const handleView = (ticketId) => {
    const ticket = hrTickets.find(t => t.id === ticketId);
    setSelectedTicket(ticket);
    setShowViewDialog(true);
  };

  const handleUpdate = (ticketId) => {
    const ticket = hrTickets.find(t => t.id === ticketId);
    if (ticket) {
      // Update ticket status to In Progress if it's Open
      if (ticket.status === 'Open') {
        setHrTickets(prevTickets =>
          prevTickets.map(t =>
            t.id === ticketId
              ? { ...t, status: 'In Progress', lastUpdate: new Date().toISOString().split('T')[0] }
              : t
          )
        );
        toast({
          title: "Ticket Updated",
          description: `Ticket ${ticketId} status updated to In Progress`,
        });
      } else if (ticket.status === 'In Progress') {
        setHrTickets(prevTickets =>
          prevTickets.map(t =>
            t.id === ticketId
              ? { ...t, status: 'Resolved', lastUpdate: new Date().toISOString().split('T')[0] }
              : t
          )
        );
        toast({
          title: "Ticket Updated",
          description: `Ticket ${ticketId} has been resolved`,
        });
      } else {
        toast({
          title: "Update Ticket",
          description: `Opening update form for ticket ${ticketId}`,
        });
      }
    }
  };

  const handleFilter = () => {
    toast({
      title: "Filter Applied",
      description: "Advanced filters have been applied to the tickets.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">HR Tickets</h1>
            <p className="text-muted-foreground">Manage HR support tickets</p>
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
            <Button variant="outline" onClick={handleCreateTicket}>Create Ticket</Button>
            <Button onClick={handleBulkActions}>Bulk Actions</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                </div>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>HR Tickets Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weekly Ticket Trend */}
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

                  {/* Tickets by Category */}
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

                  {/* Priority Distribution */}
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

                  {/* Status Distribution */}
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

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search HR Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by title, employee, category, status, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleFilter}>Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>All HR Tickets ({filteredTickets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{ticket.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.employee}</p>
                        {ticket.employeeId !== 'N/A' && (
                          <p className="text-sm text-muted-foreground">{ticket.employeeId}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(ticket.category)}`}></div>
                        <span>{ticket.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-sm">{ticket.assignedTo}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(ticket.id)}>View</Button>
                        {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                          <Button size="sm" variant="default" onClick={() => handleUpdate(ticket.id)}>Update</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <CreateHRTicketDialog open={showCreateTicketDialog} onOpenChange={setShowCreateTicketDialog} />
      <BulkActionsDialog open={showBulkActionsDialog} onOpenChange={setShowBulkActionsDialog} />
      <ViewHRTicketDialog open={showViewDialog} onOpenChange={setShowViewDialog} ticket={selectedTicket} />
    </DashboardLayout>
  );
}
