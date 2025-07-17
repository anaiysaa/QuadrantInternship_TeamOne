
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, EyeOff, Eye } from 'lucide-react';
import { LeaveDetailsDialog } from '@/components/dialogs/LeaveDetailsDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function HRLeaveRequests() {
  const { currentPortal } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [leaveDetailsOpen, setLeaveDetailsOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-refresh when portal changes
  useEffect(() => {
    const handlePortalChange = () => {
      console.log('Portal changed - refreshing HR Leave Requests page');
      setRefreshKey(prev => prev + 1);
      setSearchTerm('');
      setShowAnalytics(false);
    };

    window.addEventListener('portalChanged', handlePortalChange);
    return () => window.removeEventListener('portalChanged', handlePortalChange);
  }, []);

  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 'LR001',
      employee: 'John Doe',
      employeeId: 'EMP001',
      type: 'Vacation',
      startDate: '2024-02-15',
      endDate: '2024-02-18',
      days: 4,
      status: 'Pending',
      reason: 'Family vacation',
      submittedDate: '2024-01-15',
      urgent: false
    },
    {
      id: 'LR002',
      employee: 'Sarah Johnson',
      employeeId: 'EMP002',
      type: 'Sick Leave',
      startDate: '2024-02-10',
      endDate: '2024-02-12',
      days: 3,
      status: 'Pending',
      reason: 'Medical appointment',
      submittedDate: '2024-02-08',
      urgent: true
    },
    {
      id: 'LR003',
      employee: 'Mike Wilson',
      employeeId: 'EMP003',
      type: 'Personal',
      startDate: '2024-02-20',
      endDate: '2024-02-20',
      days: 1,
      status: 'Approved',
      reason: 'Personal matters',
      submittedDate: '2024-01-25',
      urgent: false
    },
    {
      id: 'LR004',
      employee: 'Emma Davis',
      employeeId: 'EMP004',
      type: 'Maternity',
      startDate: '2024-03-01',
      endDate: '2024-05-30',
      days: 90,
      status: 'Approved',
      reason: 'Maternity leave',
      submittedDate: '2024-01-10',
      urgent: false
    },
    {
      id: 'LR005',
      employee: 'Alex Brown',
      employeeId: 'EMP005',
      type: 'Vacation',
      startDate: '2024-02-25',
      endDate: '2024-03-01',
      days: 5,
      status: 'Rejected',
      reason: 'Holiday trip',
      submittedDate: '2024-02-01',
      urgent: false
    }
  ]);

  const filteredRequests = leaveRequests.filter(request =>
    request.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Analytics data
  const leaveTypeData = [
    { name: 'Vacation', value: leaveRequests.filter(r => r.type === 'Vacation').length, color: '#3b82f6' },
    { name: 'Sick Leave', value: leaveRequests.filter(r => r.type === 'Sick Leave').length, color: '#ef4444' },
    { name: 'Personal', value: leaveRequests.filter(r => r.type === 'Personal').length, color: '#f59e0b' },
    { name: 'Maternity', value: leaveRequests.filter(r => r.type === 'Maternity').length, color: '#22c55e' },
  ];

  const statusData = [
    { name: 'Pending', value: leaveRequests.filter(r => r.status === 'Pending').length },
    { name: 'Approved', value: leaveRequests.filter(r => r.status === 'Approved').length },
    { name: 'Rejected', value: leaveRequests.filter(r => r.status === 'Rejected').length },
  ];

  const monthlyTrend = [
    { month: 'Jan', requests: 8, approved: 6, rejected: 2 },
    { month: 'Feb', requests: 12, approved: 9, rejected: 3 },
    { month: 'Mar', requests: 15, approved: 12, rejected: 3 },
    { month: 'Apr', requests: 10, approved: 8, rejected: 2 },
    { month: 'May', requests: 14, approved: 11, rejected: 3 },
    { month: 'Jun', requests: 16, approved: 13, rejected: 3 },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="text-warning border-warning">Pending</Badge>;
      case 'Approved':
        return <Badge variant="default" className="bg-success text-success-foreground">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      'Vacation': 'bg-primary text-primary-foreground',
      'Sick Leave': 'bg-destructive text-destructive-foreground',
      'Personal': 'bg-warning text-warning-foreground',
      'Maternity': 'bg-success text-success-foreground'
    };
    
    return <Badge className={colors[type] || 'bg-secondary text-secondary-foreground'}>{type}</Badge>;
  };

  const stats = [
    { title: 'Total Requests', value: leaveRequests.length, color: 'bg-primary' },
    { title: 'Pending', value: leaveRequests.filter(r => r.status === 'Pending').length, color: 'bg-warning' },
    { title: 'Approved', value: leaveRequests.filter(r => r.status === 'Approved').length, color: 'bg-success' },
    { title: 'Urgent', value: leaveRequests.filter(r => r.urgent).length, color: 'bg-destructive' },
  ];

  const handleApprove = (requestId) => {
    setLeaveRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { ...request, status: 'Approved' }
        : request
    ));
    
    toast({
      title: "Leave Request Approved",
      description: `Request ${requestId} has been approved successfully.`,
    });
  };

  const handleReject = (requestId) => {
    setLeaveRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { ...request, status: 'Rejected' }
        : request
    ));
    
    toast({
      title: "Leave Request Rejected",
      description: `Request ${requestId} has been rejected.`,
    });
  };

  const handleView = (request) => {
    setSelectedLeave(request);
    setLeaveDetailsOpen(true);
  };

  const handleExportReport = () => {
    toast({
      title: "Report Export",
      description: "Leave requests report is being exported...",
    });
  };

  const handleFilter = () => {
    toast({
      title: "Filter Applied",
      description: "Advanced filters have been applied to the list.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" key={`hr-leave-requests-${refreshKey}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Leave Requests</h1>
            <p className="text-muted-foreground">Manage employee leave requests</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-2"
            >
              {showAnalytics ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showAnalytics ? 'Hide' : 'Show'} Analytics</span>
            </Button>
            <Button onClick={handleExportReport}>Export Report</Button>
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

        {/* Analytics Section - Only show when toggled */}
        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leave Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Leave Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={leaveTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leaveTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Leave Requests Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#3b82f6" name="Total Requests" />
                    <Bar dataKey="approved" fill="#22c55e" name="Approved" />
                    <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by employee, type, status, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleFilter}>Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Leave Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Leave Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <div>
                        {request.id}
                        {request.urgent && (
                          <Badge variant="destructive" className="ml-2 text-xs">Urgent</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.employee}</p>
                        <p className="text-sm text-muted-foreground">{request.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(request.type)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(request.startDate).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">to {new Date(request.endDate).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>{request.days}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {request.status === 'Pending' && (
                          <>
                            <Button size="sm" variant="default" onClick={() => handleApprove(request.id)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(request.id)}>
                              Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleView(request)}>
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <LeaveDetailsDialog 
          open={leaveDetailsOpen} 
          onOpenChange={setLeaveDetailsOpen}
          leaveRequest={selectedLeave}
        />
      </div>
    </DashboardLayout>
  );
}
