
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, EyeOff } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function HRTimesheets() {
  const { currentPortal } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [timesheets, setTimesheets] = useState([
    {
      id: 'TS001',
      employee: 'John Doe',
      employeeId: 'EMP001',
      week: '2024-02-05 to 2024-02-11',
      totalHours: 42,
      regularHours: 40,
      overtimeHours: 2,
      status: 'Submitted',
      submittedDate: '2024-02-11',
      approvedBy: null
    },
    {
      id: 'TS002',
      employee: 'Sarah Johnson',
      employeeId: 'EMP002',
      week: '2024-02-05 to 2024-02-11',
      totalHours: 38,
      regularHours: 38,
      overtimeHours: 0,
      status: 'Approved',
      submittedDate: '2024-02-10',
      approvedBy: 'Emma Davis'
    },
    {
      id: 'TS003',
      employee: 'Mike Wilson',
      employeeId: 'EMP003',
      week: '2024-02-05 to 2024-02-11',
      totalHours: 45,
      regularHours: 40,
      overtimeHours: 5,
      status: 'Pending Review',
      submittedDate: '2024-02-12',
      approvedBy: null
    },
    {
      id: 'TS004',
      employee: 'Alex Brown',
      employeeId: 'EMP005',
      week: '2024-02-05 to 2024-02-11',
      totalHours: 40,
      regularHours: 40,
      overtimeHours: 0,
      status: 'Approved',
      submittedDate: '2024-02-09',
      approvedBy: 'Emma Davis'
    },
    {
      id: 'TS005',
      employee: 'Lisa Johnson',
      employeeId: 'EMP006',
      week: '2024-02-05 to 2024-02-11',
      totalHours: 35,
      regularHours: 35,
      overtimeHours: 0,
      status: 'Rejected',
      submittedDate: '2024-02-13',
      approvedBy: 'Emma Davis'
    }
  ]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-refresh when portal changes
  useEffect(() => {
    const handlePortalChange = () => {
      console.log('Portal changed - refreshing HR Timesheets page');
      setRefreshKey(prev => prev + 1);
      // Reset any filters or state that should be refreshed
      setSearchTerm('');
      setShowAnalytics(false);
    };

    window.addEventListener('portalChanged', handlePortalChange);
    return () => window.removeEventListener('portalChanged', handlePortalChange);
  }, []);

  const filteredTimesheets = timesheets.filter(timesheet =>
    timesheet.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    timesheet.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    timesheet.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Analytics data
  const hoursData = [
    { employee: 'John Doe', regular: 40, overtime: 2 },
    { employee: 'Sarah Johnson', regular: 38, overtime: 0 },
    { employee: 'Mike Wilson', regular: 40, overtime: 5 },
    { employee: 'Alex Brown', regular: 40, overtime: 0 },
    { employee: 'Lisa Johnson', regular: 35, overtime: 0 },
  ];

  const statusDistribution = [
    { name: 'Approved', value: timesheets.filter(t => t.status === 'Approved').length, color: '#22c55e' },
    { name: 'Pending Review', value: timesheets.filter(t => t.status === 'Pending Review' || t.status === 'Submitted').length, color: '#f59e0b' },
    { name: 'Rejected', value: timesheets.filter(t => t.status === 'Rejected').length, color: '#ef4444' },
  ];

  const weeklyTrend = [
    { week: 'Week 1', submitted: 45, approved: 40, overtime: 8 },
    { week: 'Week 2', submitted: 48, approved: 43, overtime: 12 },
    { week: 'Week 3', submitted: 50, approved: 47, overtime: 15 },
    { week: 'Week 4', submitted: 52, approved: 50, overtime: 10 },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return <Badge variant="outline" className="text-primary border-primary">Submitted</Badge>;
      case 'Pending Review':
        return <Badge variant="outline" className="text-warning border-warning">Pending Review</Badge>;
      case 'Approved':
        return <Badge variant="default" className="bg-success text-success-foreground">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = [
    { title: 'Total Timesheets', value: timesheets.length, color: 'bg-primary' },
    { title: 'Pending Review', value: timesheets.filter(t => t.status === 'Pending Review' || t.status === 'Submitted').length, color: 'bg-warning' },
    { title: 'Approved', value: timesheets.filter(t => t.status === 'Approved').length, color: 'bg-success' },
    { title: 'Total Overtime', value: timesheets.reduce((acc, t) => acc + t.overtimeHours, 0), color: 'bg-accent' },
  ];

  const handleApprove = (timesheetId) => {
    setTimesheets(prevTimesheets =>
      prevTimesheets.map(timesheet =>
        timesheet.id === timesheetId
          ? { ...timesheet, status: 'Approved', approvedBy: 'Emma Davis' }
          : timesheet
      )
    );
    toast({
      title: "Timesheet Approved",
      description: `Timesheet ${timesheetId} has been approved successfully.`,
    });
  };

  const handleReject = (timesheetId) => {
    setTimesheets(prevTimesheets =>
      prevTimesheets.map(timesheet =>
        timesheet.id === timesheetId
          ? { ...timesheet, status: 'Rejected', approvedBy: 'Emma Davis' }
          : timesheet
      )
    );
    toast({
      title: "Timesheet Rejected",
      description: `Timesheet ${timesheetId} has been rejected.`,
    });
  };

  const handleView = (timesheetId) => {
    toast({
      title: "View Timesheet",
      description: `Opening detailed view for timesheet ${timesheetId}`,
    });
  };

  const handleBulkApprove = () => {
    toast({
      title: "Bulk Approve",
      description: "Processing bulk approval for selected timesheets...",
    });
  };

  const handleExportReport = () => {
    toast({
      title: "Report Export",
      description: "Timesheets report is being exported...",
    });
  };

  const handleFilterByWeek = () => {
    toast({
      title: "Week Filter",
      description: "Filtering timesheets by week period...",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" key={`hr-timesheets-${refreshKey}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Timesheets</h1>
            <p className="text-muted-foreground">Review employee timesheets</p>
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
            <Button variant="outline" onClick={handleBulkApprove}>Bulk Approve</Button>
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
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hours Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Hours Overview by Employee</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hoursData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="employee" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="regular" stackId="a" fill="#3b82f6" name="Regular Hours" />
                      <Bar dataKey="overtime" stackId="a" fill="#f59e0b" name="Overtime Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Timesheet Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="submitted" stroke="#3b82f6" name="Submitted" />
                    <Line type="monotone" dataKey="approved" stroke="#22c55e" name="Approved" />
                    <Line type="monotone" dataKey="overtime" stroke="#f59e0b" name="Overtime Hours" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Timesheets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by employee, status, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleFilterByWeek}>Filter by Week</Button>
            </div>
          </CardContent>
        </Card>

        {/* Timesheets Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Timesheets ({filteredTimesheets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timesheet ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Week Period</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimesheets.map((timesheet) => (
                  <TableRow key={timesheet.id}>
                    <TableCell className="font-medium">{timesheet.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{timesheet.employee}</p>
                        <p className="text-sm text-muted-foreground">{timesheet.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{timesheet.week}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{timesheet.totalHours}h total</p>
                        <p className="text-muted-foreground">
                          {timesheet.regularHours}h regular
                          {timesheet.overtimeHours > 0 && `, ${timesheet.overtimeHours}h OT`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p>{new Date(timesheet.submittedDate).toLocaleDateString()}</p>
                        {timesheet.approvedBy && (
                          <p className="text-muted-foreground">by {timesheet.approvedBy}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {(timesheet.status === 'Submitted' || timesheet.status === 'Pending Review') && (
                          <>
                            <Button size="sm" variant="default" onClick={() => handleApprove(timesheet.id)}>Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(timesheet.id)}>Reject</Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleView(timesheet.id)}>View</Button>
                      </div>
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
