import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { CreateTicketDialog } from '@/components/dialogs/CreateTicketDialog';
import { ViewTicketDialog } from '@/components/dialogs/ViewTicketDialog';
import { AssignTicketDialog } from '@/components/dialogs/AssignTicketDialog';
import { CreateITTicketDialog } from '@/components/dialogs/CreateITTicketDialog';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartBar, Eye, EyeOff, RefreshCw, Archive, ArchiveX } from 'lucide-react';
import axios from 'axios';

// API Functions
const getITTickets = async (includeArchived = false) => {
  try {
    console.log('Fetching IT tickets', includeArchived ? 'including archived' : 'active only');
    const response = await axios.get(`http://localhost:8000/api/tickets/it?include_archived=${includeArchived}`);
    console.log('IT tickets fetched:', response.data);
    
    // Ensure response.data is an array
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching IT tickets:', error);
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

const updateITTicketStatus = async (ticketId, newStatus, assignedTo = null) => {
  try {
    console.log(`Updating IT Ticket ${ticketId} status to ${newStatus}`);
    const payload = { status: newStatus };
    if (assignedTo) {
      payload.assigned_to = assignedTo;
    }
    
    const response = await axios.put(`http://localhost:8000/api/tickets/it/${ticketId}/status`, payload);
    console.log('IT Ticket status updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating IT ticket status:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to update IT ticket status');
  }
};

const archiveITTicket = async (ticketId) => {
  try {
    console.log(`Archiving IT Ticket ${ticketId}`);
    const response = await axios.put(`http://localhost:8000/api/tickets/it/${ticketId}/archive`);
    console.log('IT Ticket archived:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error archiving IT ticket:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to archive IT ticket');
  }
};

const unarchiveITTicket = async (ticketId) => {
  try {
    console.log(`Unarchiving IT Ticket ${ticketId}`);
    const response = await axios.put(`http://localhost:8000/api/tickets/it/${ticketId}/unarchive`);
    console.log('IT Ticket unarchived:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error unarchiving IT ticket:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to unarchive IT ticket');
  }
};

export default function ITSupportQueue() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('severity');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [showCreateTicketDialog, setShowCreateTicketDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  const [itTickets, setItTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [showArchivedOnly]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ticketsData, employeesData] = await Promise.all([
        getITTickets(showArchivedOnly),
        getEmployees()
      ]);
      setItTickets(ticketsData);
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

  // Transform API data to match the expected format - FIXED with safe fallbacks
  const transformedTickets = itTickets.map(ticket => ({
    id: ticket.TicketID,
    title: ticket.Title || '',
    employee: employeeMap[ticket.EmployeeID] || `Employee ${ticket.EmployeeID}`,
    employeeId: ticket.EmployeeID,
    department: ticket.Department || '',
    severity: ticket.Severity || 'Low',
    status: ticket.Status || 'Open',
    priority: getSeverityPriority(ticket.Severity),
    submittedDate: ticket.SubmittedDate ? new Date(ticket.SubmittedDate).toISOString() : '',
    description: ticket.Description || '',
    assignedTo: ticket.AssignedTo || 'Unassigned',
    expectedResolution: ticket.ExpectedResolution || '',
    category: ticket.Category || 'General',
    isArchived: ticket.Status === 'Archived'
  }));

  // Helper function to convert severity to priority number
  function getSeverityPriority(severity) {
    switch (severity) {
      case 'Critical': return 1;
      case 'High': return 2;
      case 'Medium': return 3;
      case 'Low': return 4;
      default: return 5;
    }
  }

  // Helper function to get day of week from date
  const getDayOfWeek = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  // Helper function to get department distribution
  const getDepartmentData = (tickets) => {
    const departmentCounts = {};
    tickets.forEach(ticket => {
      const dept = ticket.department || 'Unknown';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });
    
    return Object.entries(departmentCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 departments
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'High':
        return <Badge variant="outline" className="text-destructive border-destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="text-warning border-warning">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline" className="text-success border-success">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return <Badge variant="outline" className="text-primary border-primary">Open</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="text-warning border-warning">In Progress</Badge>;
      case 'Assigned':
        return <Badge variant="outline" className="text-accent border-accent">Assigned</Badge>;
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

  // Filter tickets based on view mode and search term
  const filteredTickets = transformedTickets
    .filter(ticket => {
      const matchesSearch = (filterSeverity === 'all' || ticket.severity === filterSeverity) &&
        ((ticket.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
         (ticket.employee || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
         (ticket.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
         ticket.id.toString().toLowerCase().includes(searchTerm.toLowerCase()));

      if (showArchivedOnly) {
        return matchesSearch && ticket.isArchived;
      } else {
        return matchesSearch && !ticket.isArchived;
      }
    })
    .sort((a, b) => {
      if (sortBy === 'severity') {
        return a.priority - b.priority;
      } else if (sortBy === 'newest') {
        return new Date(b.submittedDate || 0) - new Date(a.submittedDate || 0);
      } else if (sortBy === 'oldest') {
        return new Date(a.submittedDate || 0) - new Date(b.submittedDate || 0);
      }
      return 0;
    });

  // Only count active (non-archived) tickets for stats
  const activeTickets = transformedTickets.filter(t => !t.isArchived);
  const archivedTickets = transformedTickets.filter(t => t.isArchived);

  const stats = [
    { title: 'Active Tickets', value: activeTickets.length, color: 'bg-primary' },
    { title: 'Open', value: activeTickets.filter(t => t.status === 'Open').length, color: 'bg-destructive' },
    { title: 'Critical/High', value: activeTickets.filter(t => [1,2].includes(t.severity)).length, color: 'bg-destructive' },
    { title: 'Archived', value: archivedTickets.length, color: 'bg-secondary' },
  ];

  // REAL DATA: Severity Distribution based on actual tickets
  const severityData = [
    { name: 'Critical', value: activeTickets.filter(t => t.severity === 1).length, color: '#ef4444' },
    { name: 'High', value: activeTickets.filter(t => t.severity === 2).length, color: '#f97316' },
    { name: 'Medium', value: activeTickets.filter(t => t.severity === 3,4).length, color: '#eab308' },
    { name: 'Low', value: activeTickets.filter(t => t.severity === 5).length, color: '#22c55e' },
  ].filter(item => item.value > 0);

  // REAL DATA: Status Distribution based on actual tickets
  const statusData = [
    { name: 'Open', value: activeTickets.filter(t => t.status === 'Open').length, color: '#ef4444' },
    { name: 'In Progress', value: activeTickets.filter(t => t.status === 'In Progress').length, color: '#f97316' },
    { name: 'Assigned', value: activeTickets.filter(t => t.status === 'Assigned').length,color: '#eab308' },
    { name: 'Resolved', value: activeTickets.filter(t => t.status === 'Resolved').length , color:'#22c55e'},
    { name: 'Archived', value: activeTickets.filter(t => t.status === 'Archived').length, color:'#135596ff' },
  ].filter(item => item.value > 0);

  // REAL DATA: Weekly trend based on actual ticket submission dates
  const getWeeklyTrendData = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = Array(7).fill(0);
    
    // Get tickets from the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    activeTickets.forEach(ticket => {
      if (ticket.submittedDate) {
        const ticketDate = new Date(ticket.submittedDate);
        if (ticketDate >= oneWeekAgo) {
          const dayIndex = ticketDate.getDay();
          dayCounts[dayIndex]++;
        }
      }
    });

    return dayNames.map((day, index) => ({
      day: day.substring(0, 3), // Mon, Tue, etc.
      tickets: dayCounts[index]
    }));
  };

  const weeklyTrendData = getWeeklyTrendData();

  // REAL DATA: Department Distribution based on actual tickets
  const departmentData = getDepartmentData(activeTickets);

  // FIXED: Added safe ticket handling for ViewTicketDialog
  const handleViewTicket = (ticketId) => {
    const ticket = transformedTickets.find(t => t.id === ticketId);
    console.log('Viewing ticket:', ticket);
    
    // Ensure all ticket properties are defined to prevent undefined errors
    const safeTicket = ticket ? {
      ...ticket,
      title: ticket.title || '',
      description: ticket.description || '',
      employee: ticket.employee || '',
      department: ticket.department || '',
      severity: ticket.severity || '',
      status: ticket.status || '',
      assignedTo: ticket.assignedTo || 'Unassigned',
      submittedDate: ticket.submittedDate || '',
      expectedResolution: ticket.expectedResolution || ''
    } : null;
    
    setSelectedTicket(safeTicket);
    setViewDialogOpen(true);
  };

  // FIXED: Added safe ticket handling for AssignTicketDialog
  const handleAssignTicket = (ticketId) => {
    const ticket = transformedTickets.find(t => t.id === ticketId);
    console.log('Opening assign dialog for ticket:', ticket);
    
    // Ensure all ticket properties are defined to prevent undefined errors
    const safeTicket = ticket ? {
      ...ticket,
      title: ticket.title || '',
      description: ticket.description || '',
      employee: ticket.employee || '',
      department: ticket.department || '',
      severity: ticket.severity || '',
      status: ticket.status || '',
      assignedTo: ticket.assignedTo || 'Unassigned',
      submittedDate: ticket.submittedDate || '',
      expectedResolution: ticket.expectedResolution || ''
    } : null;
    
    setSelectedTicket(safeTicket);
    setAssignDialogOpen(true);
  };

  // Add this handler to properly close the assign dialog and refresh data
  const handleAssignTicketComplete = async (ticketId, assignedTo) => {
    try {
      // Update the ticket status and assignment
      await updateITTicketStatus(ticketId, 'Assigned', assignedTo);
      
      // Refresh the data
      await fetchData();
      
      // Close the dialog
      setAssignDialogOpen(false);
      setSelectedTicket(null);
      
      toast({
        title: "Ticket Assigned",
        description: `Ticket ${ticketId} has been assigned to ${assignedTo}`,
      });
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      // Call the API to update the status
      await updateITTicketStatus(ticketId, newStatus);

      // Update local state
      setItTickets(prevTickets =>
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
      // Call the API to archive the ticket
      await archiveITTicket(ticketId);

      // Update local state by changing the status to 'Archived'
      setItTickets(prevTickets =>
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
      // Call the API to unarchive the ticket (sets status back to Resolved)
      await unarchiveITTicket(ticketId);

      // Update local state by changing the status back to 'Resolved'
      setItTickets(prevTickets =>
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

  const handleToggleArchivedView = () => {
    setShowArchivedOnly(!showArchivedOnly);
    setSearchTerm(''); // Clear search when switching views
  };

  const handleRefresh = () => {
    fetchData();
    toast({
      title: "Data Refreshed",
      description: "Ticket data has been refreshed from the server.",
    });
  };

  const handleCreateTicket = () => {
    setShowCreateTicketDialog(true);
  };

  const handleTicketCreated = () => {
    // Refresh the data after a ticket is created
    fetchData();
  };

  const handleExportReport = () => {
    if (!transformedTickets || transformedTickets.length === 0) {
      toast({
        title: 'No Tickets Found',
        description: 'There are no tickets to export.',
        variant: 'destructive',
      });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('IT TICKETS REPORT', 14, 20);

    doc.setFontSize(12);
    doc.text(`Total Tickets: ${transformedTickets.length}`, 14, 30);

    // Prepare table rows
    const tableData = transformedTickets.map(ticket => [
      ticket.id,
      ticket.title,
      ticket.employee,
      ticket.category,
      ticket.severity,
      ticket.status,
      ticket.submittedDate ? new Date(ticket.submittedDate).toLocaleDateString() : 'N/A',
      ticket.assignedTo,
      ticket.department
    ]);

    autoTable(doc, {
      startY: 40,
      head: [[
        "ID", "Title", "Employee", "Category", "Severity",
        "Status", "Submitted", "Assigned To", "Department"
      ]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save('it_tickets_report.pdf');

    toast({
      title: 'IT Tickets Report Downloaded',
      description: 'Your IT tickets have been downloaded as a PDF.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">IT Support Queue</h1>
            <p className="text-muted-foreground">
              {showArchivedOnly ? 'Viewing archived IT support tickets' : 'Manage active IT support tickets from employees'}
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
            <Button variant="outline" onClick={handleExportReport}>Export Report</Button>
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

        {/* Analytics Section - Only show for active tickets with REAL DATA */}
        {showAnalytics && !showArchivedOnly && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChartBar className="w-5 h-5" />
                  <span>IT Support Analytics (Active Only)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weekly Ticket Trend - REAL DATA */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Weekly Ticket Trend (Last 7 Days)</h4>
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

                  {/* Severity Distribution - REAL DATA */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Severity Distribution</h4>
                    {severityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={severityData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {severityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        No severity data available
                      </div>
                    )}
                  </div>

                  {/* Status Distribution - REAL DATA */}
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
                      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        No status data available
                      </div>
                    )}
                  </div>

                  {/* Department Distribution - REAL DATA */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Top Departments (Active Tickets)</h4>
                    {departmentData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={departmentData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        No department data available
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>
              Filter {showArchivedOnly ? 'Archived' : 'Active'} IT Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search tickets, employees, or departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="severity">Sort by Severity</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              {!showArchivedOnly && (
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {showArchivedOnly ? 'Archived' : 'Active'} IT Support Tickets ({filteredTickets.length})
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
                <p>No {showArchivedOnly ? 'archived' : 'active'} IT support tickets found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.title || 'No title'}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description || 'No description'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.employee}</p>
                          <p className="text-sm text-muted-foreground">ID: {ticket.employeeId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{ticket.department || 'N/A'}</TableCell>
                      <TableCell>{getSeverityBadge(ticket.severity)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-sm">
                        {ticket.submittedDate ? new Date(ticket.submittedDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {ticket.assignedTo}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewTicket(ticket.id)}>
                            View
                          </Button>

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
                              {ticket.status === 'Open' && (
                                <Button size="sm" variant="default" onClick={() => handleUpdateStatus(ticket.id, 'In Progress')}>
                                  Start
                                </Button>
                              )}
                              
                              {ticket.status === 'In Progress' && (
                                <Button size="sm" variant="default" onClick={() => handleAssignTicket(ticket.id)}>
                                  Assign
                                </Button>
                              )}
                              
                              {(ticket.status === 'Assigned' || ticket.status === 'In Progress') && (
                                <Button size="sm" variant="default" onClick={() => handleUpdateStatus(ticket.id, 'Resolved')}>
                                  Resolve
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

        {/* Dialogs with error handling - FIXED: Only render when selectedTicket exists */}
        {selectedTicket && (
          <>
            <ViewTicketDialog 
              open={viewDialogOpen} 
              onOpenChange={setViewDialogOpen} 
              ticket={selectedTicket} 
              context="it" 
            />
            <AssignTicketDialog
              open={assignDialogOpen}
              onOpenChange={setAssignDialogOpen}
              ticket={selectedTicket}
              employees={employees}
              onAssign={handleAssignTicketComplete}
            />
          </>
        )}

        {/* Create IT Ticket Dialog */}
        <CreateITTicketDialog 
          open={showCreateTicketDialog} 
          onOpenChange={setShowCreateTicketDialog}
          onTicketCreated={handleTicketCreated}
        />
      </div>
    </DashboardLayout>
  );
}