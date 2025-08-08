import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateHRTicketDialog } from '@/components/dialogs/CreateHRTicketDialog';
import { ViewTicketDialog } from '@/components/dialogs/ViewTicketDialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, EyeOff, RefreshCw, Archive, ArchiveX } from 'lucide-react';

const getHRTickets = async (includeArchived = false) => {
  try {
    console.log('Fetching HR tickets', includeArchived ? 'including archived' : 'active only');
    const response = await axios.get(`http://localhost:8000/api/tickets/hr?include_archived=${includeArchived}`);
    console.log('HR tickets fetched:', response.data);
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching HR tickets:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return [];
  }
};

const getEmployees = async () => {
  try {
    console.log('Fetching employees for name mapping');
    const response = await axios.get('http://localhost:8000/api/employees');
    console.log('Employees fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
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

const updateHRTicketStatus = async (ticketId, newStatus, assignedTo = null) => {
  try {
    console.log(`Updating HR Ticket ${ticketId} status to ${newStatus}`);
    const payload = { status: newStatus };
    if (assignedTo) {
      payload.assigned_to = assignedTo;
    }
    
    const response = await axios.put(`http://localhost:8000/api/tickets/hr/${ticketId}/status`, payload);
    console.log('HR Ticket status updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating HR ticket status:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to update HR ticket status');
  }
};

const archiveHRTicket = async (ticketId) => {
  try {
    console.log(`Archiving HR Ticket ${ticketId}`);
    const response = await axios.put(`http://localhost:8000/api/tickets/hr/${ticketId}/archive`);
    console.log('HR Ticket archived:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error archiving HR ticket:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to archive HR ticket');
  }
};

const unarchiveHRTicket = async (ticketId) => {
  try {
    console.log(`Unarchiving HR Ticket ${ticketId}`);
    const response = await axios.put(`http://localhost:8000/api/tickets/hr/${ticketId}/unarchive`);
    console.log('HR Ticket unarchived:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error unarchiving HR ticket:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to unarchive HR ticket');
  }
};


export default function HRTickets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateTicketDialog, setShowCreateTicketDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  const [hrTickets, setHrTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [showArchivedOnly]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ticketsData, employeesData] = await Promise.all([
        getHRTickets(showArchivedOnly),
        getEmployees()
      ]);
      setHrTickets(ticketsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Create a mapping of employee IDs to employee names
  const employeeMap = employees.reduce((acc, emp) => {
    acc[emp.id] = emp.name;
    return acc;
  }, {});

  // Transform API data to match the expected format for ViewTicketDialog
  const transformedTickets = hrTickets.map(ticket => ({
    id: ticket.TicketID,
    title: ticket.Title,
    employee: employeeMap[ticket.EmployeeID] || `Employee ${ticket.EmployeeID}`,
    employeeId: ticket.EmployeeID,
    category: getCategoryFromTitle(ticket.Title),
    priority: ticket.Severity,
    severity: ticket.Severity,
    status: ticket.Status,
    createdDate: ticket.SubmittedDate ? new Date(ticket.SubmittedDate).toISOString().split('T')[0] : '',
    submittedDate: ticket.SubmittedDate,
    lastUpdate: ticket.SubmittedDate ? new Date(ticket.SubmittedDate).toISOString().split('T')[0] : '',
    assignedTo: ticket.AssignedTo || 'Unassigned',
    description: ticket.Description,
    department: ticket.Department,
    isArchived: ticket.Status === 'Archived'
  }));

  // Helper function to derive category from title
  function getCategoryFromTitle(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('salary') || titleLower.includes('compensation') || titleLower.includes('pay')) {
      return 'Compensation';
    } else if (titleLower.includes('policy') || titleLower.includes('procedure')) {
      return 'Policy';
    } else if (titleLower.includes('harassment') || titleLower.includes('complaint') || titleLower.includes('discrimination')) {
      return 'Complaint';
    } else if (titleLower.includes('benefits') || titleLower.includes('insurance') || titleLower.includes('health')) {
      return 'Benefits';
    } else if (titleLower.includes('performance') || titleLower.includes('review') || titleLower.includes('evaluation')) {
      return 'Performance';
    } else {
      return 'General';
    }
  }

  // Filter tickets based on view mode and search term
  const filteredTickets = transformedTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toString().toLowerCase().includes(searchTerm.toLowerCase());
    
    if (showArchivedOnly) {
      return matchesSearch && ticket.isArchived;
    } else {
      return matchesSearch && !ticket.isArchived;
    }
  });

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
      case 'Archived':
        return <Badge variant="outline" className="text-muted-foreground border-muted-foreground">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    console.log('Rendering priority badge for:', priority);
    switch (priority) {
      case 1:
        return <Badge variant="destructive">1</Badge>;
      case 2:
        return <Badge variant= "outline" className = "text-yellow-600 border-yellow-600">2</Badge>;
      case 3:
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">3</Badge>;
      case 4:
        return <Badge variant="outline" className="text-green-600 border-green-600">4</Badge>;
      case 5:
        return <Badge variant="outline" className="text-green-600 border-green-600">5</Badge>;
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
      case 'General': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  // Only count active (non-archived) tickets for stats
  const activeTickets = transformedTickets.filter(t => !t.isArchived);
  const archivedTickets = transformedTickets.filter(t => t.isArchived);

  const stats = [
    { title: 'Active Tickets', value: activeTickets.length, color: 'bg-primary' },
    { title: 'Critical', value: activeTickets.filter(t => t.severity === 1).length, color: 'bg-green-600' },
    { title: 'In Progress', value: activeTickets.filter(t => t.status === 'In Progress').length, color: 'bg-warning' },
    { title: 'Archived', value: archivedTickets.length, color: 'bg-secondary' },
  ];

  // REAL ANALYTICS DATA - Based on actual ticket data
  const categoryData = [
    { name: 'Compensation', value: activeTickets.filter(t => t.category === 'Compensation').length },
    { name: 'Policy', value: activeTickets.filter(t => t.category === 'Policy').length },
    { name: 'Complaint', value: activeTickets.filter(t => t.category === 'Complaint').length },
    { name: 'Benefits', value: activeTickets.filter(t => t.category === 'Benefits').length },
    { name: 'Performance', value: activeTickets.filter(t => t.category === 'Performance').length },
    { name: 'General', value: activeTickets.filter(t => t.category === 'General').length },
  ].filter(item => item.value > 0);

  const priorityData = [
    { name: 'Critical', value: activeTickets.filter(t => t.priority === 1).length, color: '#ef4444' },
    { name: 'High', value: activeTickets.filter(t => t.priority === 2).length, color: '#f97316' },
    { name: 'Medium', value: activeTickets.filter(t => t.priority === 3,4).length, color: '#eab308' },
    { name: 'Low', value: activeTickets.filter(t => t.priority === 5).length, color: '#22c55e' },
  ].filter(item => item.value > 0);

  const statusData = [
    { name: 'Open', value: activeTickets.filter(t => t.status === 'Open').length },
    { name: 'In Progress', value: activeTickets.filter(t => t.status === 'In Progress').length },
    { name: 'Resolved', value: activeTickets.filter(t => t.status === 'Resolved').length },
    { name: 'Closed', value: activeTickets.filter(t => t.status === 'Closed').length },
    { name: 'Archived', value: activeTickets.filter(t => t.status === 'Archived').length },
  ].filter(item => item.value > 0);

  // Generate weekly trend data based on actual ticket submission dates
  const generateWeeklyTrendData = () => {
    const now = new Date();
    const weekData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Get the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];
      
      // Count tickets submitted on this day
      const ticketsOnDay = activeTickets.filter(ticket => {
        if (!ticket.submittedDate) return false;
        const ticketDate = new Date(ticket.submittedDate);
        return ticketDate.toDateString() === date.toDateString();
      }).length;
      
      weekData.push({
        day: dayName,
        tickets: ticketsOnDay
      });
    }
    
    return weekData;
  };

  const weeklyTrendData = generateWeeklyTrendData();

  // Generate department distribution data
  const departmentData = () => {
    const deptCounts = {};
    activeTickets.forEach(ticket => {
      const dept = ticket.department || 'Unknown';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });
    
    return Object.entries(deptCounts).map(([name, value]) => ({
      name,
      value
    })).filter(item => item.value > 0);
  };

  const handleCreateTicket = () => {
    setShowCreateTicketDialog(true);
  };

  const handleView = (ticketId) => {
    const ticket = transformedTickets.find(t => t.id === ticketId);
    setSelectedTicket(ticket);
    setShowViewDialog(true);
  };

  const handleUpdate = async (ticketId) => {
    const ticket = transformedTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    try {
      let newStatus;
      if (ticket.status === 'Open') {
        newStatus = 'In Progress';
      } else if (ticket.status === 'In Progress') {
        newStatus = 'Resolved';
      } else {
        toast({
          title: "Cannot Update",
          description: `Ticket ${ticketId} is already ${ticket.status}`,
        });
        return;
      }

      await updateHRTicketStatus(ticketId, newStatus);

      setHrTickets(prevTickets =>
        prevTickets.map(t =>
          t.TicketID === ticketId
            ? { ...t, Status: newStatus }
            : t
        )
      );

      toast({
        title: "Ticket Updated",
        description: `Ticket ${ticketId} status updated to ${newStatus}`,
      });

    } catch (error) {
      console.error('Failed to update ticket status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update ticket status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (ticketId) => {
    if (!window.confirm(`Are you sure you want to archive ticket ${ticketId}? You can unarchive it later if needed.`)) {
      return;
    }

    try {
      await archiveHRTicket(ticketId);

      setHrTickets(prevTickets =>
        prevTickets.map(t =>
          t.TicketID === ticketId
            ? { ...t, Status: 'Archived' }
            : t
        )
      );

      toast({
        title: "Ticket Archived",
        description: `Ticket ${ticketId} has been archived`,
      });

    } catch (error) {
      console.error('Failed to archive ticket:', error);
      toast({
        title: "Archive Failed",
        description: "Failed to archive ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnarchive = async (ticketId) => {
    if (!window.confirm(`Are you sure you want to unarchive ticket ${ticketId}? It will be moved back to active tickets.`)) {
      return;
    }

    try {
      await unarchiveHRTicket(ticketId);

      setHrTickets(prevTickets =>
        prevTickets.map(t =>
          t.TicketID === ticketId
            ? { ...t, Status: 'Resolved' }
            : t
        )
      );

      toast({
        title: "Ticket Unarchived",
        description: `Ticket ${ticketId} has been unarchived and moved back to active tickets`,
      });

    } catch (error) {
      console.error('Failed to unarchive ticket:', error);
      toast({
        title: "Unarchive Failed",
        description: "Failed to unarchive ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportReport = () => {
  if (!transformedTickets || transformedTickets.length === 0) {
    toast({
      title: "No Data to Export",
      description: "There are no tickets to include in the report.",
      variant: "destructive",
    });
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Tickets Report", 14, 20);

  doc.setFontSize(12);
  doc.text(`Total Tickets: ${transformedTickets.length}`, 14, 30);

  // Prepare table rows
  const tableData = transformedTickets.map(ticket => [
    ticket.id,
    ticket.title,
    ticket.employee,
    ticket.category,
    ticket.priority,
    ticket.status,
    ticket.createdDate,
    ticket.assignedTo,
    ticket.department
  ]);

  autoTable(doc, {
    startY: 40,
    head: [[
      "ID", "Title", "Employee", "Category", "Priority",
      "Status", "Submitted", "Assigned To", "Department"
    ]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  doc.save("tickets_report.pdf");

  toast({
    title: "Report Downloaded",
    description: "The ticket report has been downloaded as a PDF.",
  });
};

  const handleToggleArchivedView = () => {
    setShowArchivedOnly(!showArchivedOnly);
    setSearchTerm('');
  };

  const handleFilter = () => {
    toast({
      title: "Filter Applied",
      description: "Advanced filters have been applied to the tickets.",
    });
  };

  const handleRefresh = () => {
    fetchData();
    toast({
      title: "Data Refreshed",
      description: "Ticket data has been refreshed from the server.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">HR Tickets</h1>
            <p className="text-muted-foreground">
              {showArchivedOnly ? 'Viewing archived HR tickets' : 'Manage active HR support tickets'}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex items-center space-x-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleToggleArchivedView}
              className="flex items-center space-x-2"
            >
              {showArchivedOnly ? <ArchiveX className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              <span>{showArchivedOnly ? 'Show Active' : 'Show Archived'}</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-2"
            >
              {showAnalytics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAnalytics ? 'Hide' : 'Show'} Analytics</span>
            </Button>
            <Button variant="outline" onClick={handleExportReport}>
              Export Report
            </Button>

            {!showArchivedOnly && (
              <Button variant="outline" onClick={handleCreateTicket}>Create Ticket</Button>
            )}
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
                  onClick={fetchData}
                  className="ml-auto"
                  disabled={loading}
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards - Real Data */}
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

        {/* Analytics Section - Real Data */}
        {showAnalytics && !showArchivedOnly && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>HR Tickets Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weekly Ticket Trend - Real Data */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Weekly Ticket Submissions (Last 7 Days)</h4>
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

                  

                  {/* Priority Distribution - Real Data */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Severity Distribution</h4>
                    {priorityData.length > 0 ? (
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
                    ) : (
                      <div className="h-48 flex items-center justify-center text-muted-foreground">
                        No priority data available
                      </div>
                    )}
                  </div>

                  {/* Status Distribution - Real Data */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Status Distribution</h4>
                    {statusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={statusData} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <YAxis type="number" />
                          <XAxis type="category" dataKey="name" width={80} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#22c55e" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-48 flex items-center justify-center text-muted-foreground">
                        No status data available
                      </div>
                    )}
                  </div>

                  {/* Department Distribution - Real Data */}
                  <div className="lg:col-span-2">
                    <h4 className="text-sm font-medium mb-3">Tickets by Department</h4>
                    {departmentData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={departmentData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-48 flex items-center justify-center text-muted-foreground">
                        No department data available
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>
              Search {showArchivedOnly ? 'Archived' : 'Active'} HR Tickets
            </CardTitle>
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
            <CardTitle>
              {showArchivedOnly ? 'Archived' : 'Active'} HR Tickets ({filteredTickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p>Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No {showArchivedOnly ? 'archived' : 'active'} HR tickets found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
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
                          <p className="text-sm text-muted-foreground">ID: {ticket.employeeId}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleView(ticket.id)}>View</Button>
                          
                          {/* Actions for archived tickets */}
                          {showArchivedOnly ? (
                            <Button 
                              size="sm" 
                              variant="default" 
                              onClick={() => handleUnarchive(ticket.id)}
                              className="flex items-center space-x-1"
                            >
                              <ArchiveX className="w-3 h-3" />
                              <span>Unarchive</span>
                            </Button>
                          ) : (
                            /* Actions for active tickets */
                            <>
                              {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                                <Button size="sm" variant="default" onClick={() => handleUpdate(ticket.id)}>
                                  {ticket.status === 'Open' ? 'Start' : 'Resolve'}
                                </Button>
                              )}
                              {ticket.status === 'Resolved' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleArchive(ticket.id)}
                                  className="flex items-center space-x-1"
                                >
                                  <Archive className="w-3 h-3" />
                                  <span>Archive</span>
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <CreateHRTicketDialog open={showCreateTicketDialog} onOpenChange={setShowCreateTicketDialog} />
      <ViewTicketDialog 
        open={showViewDialog} 
        onOpenChange={setShowViewDialog} 
        ticket={selectedTicket} 
        context="hr" 
      />
    </DashboardLayout>
  );
}