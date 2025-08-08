import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Archive, EyeOff, CheckCircle, XCircle, FileText, Clock, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Helper function to determine if a timesheet should be considered archived
function isArchivedTimesheet(timesheet) {
  return timesheet.archived === true;
}

// Helper function to determine if a timesheet can be archived
function canBeArchived(timesheet) {
  return timesheet.status === 'Approved' || timesheet.status === 'Rejected';
}

// === Helper: Export as CSV ===
function exportTimesheetsToCSV(timesheets) {
  if (!timesheets.length) return;
  const header = [
    "Timesheet ID",
    "Employee",
    "Week Period",
    "Total Hours",
    "Status",
    "Submitted",
    "Approved By",
    "Archived"
  ];
  const rows = timesheets.map(ts => [
    ts.id,
    ts.employeeName,
    ts.week,
    ts.totalHours,
    ts.status,
    ts.submittedDate ? new Date(ts.submittedDate).toLocaleDateString() : '',
    ts.approvedBy || '',
    ts.archived ? 'Yes' : 'No'
  ]);
  const csv = [header, ...rows].map(row =>
    row.map(field => `"${(field ?? '').toString().replace(/"/g, '""')}"`).join(",")
  ).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `timesheets_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// === Analytics Helper ===
function getAnalytics(timesheets) {
  const total = timesheets.length;
  const approved = timesheets.filter(ts => ts.status === 'Approved').length;
  const pending = timesheets.filter(ts => ['Submitted', 'Pending', 'Pending Review'].includes(ts.status)).length;
  const rejected = timesheets.filter(ts => ts.status === 'Rejected').length;
  const totalHours = timesheets.reduce((sum, ts) => sum + (ts.totalHours || 0), 0);
  const avgHours = total > 0 ? (totalHours / total).toFixed(1) : 0;

  // Find top employee(s) by total hours
  const empMap = {};
  timesheets.forEach(ts => {
    if (!ts.employeeName) return;
    empMap[ts.employeeName] = (empMap[ts.employeeName] || 0) + (ts.totalHours || 0);
  });
  const topEmployee = Object.entries(empMap).sort((a, b) => b[1] - a[1])[0] || ["-", 0];

  return {
    total,
    approved,
    pending,
    rejected,
    avgHours,
    topEmployee,
  };
}

export default function HRTimesheets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [timesheets, setTimesheets] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showArchived, setShowArchived] = useState(false);
  const [archivingTimesheetId, setArchivingTimesheetId] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (!['HR', 'Admin'].includes(user.department)) {
      navigate('/dashboard');
      return;
    }
    fetchTimesheets();
    const handlePortalChange = () => {
      setRefreshKey(prev => prev + 1);
      setSearchTerm('');
      setShowAnalytics(true);
      fetchTimesheets();
    };
    window.addEventListener('portalChanged', handlePortalChange);
    return () => window.removeEventListener('portalChanged', handlePortalChange);
    // eslint-disable-next-line
  }, [user, navigate]);

  const fetchTimesheets = () => {
    fetch(`/api/timesheets?department=${user.department}`)
      .then(res => res.json())
      .then(data => {
        setTimesheets(data);
      })
      .catch(() => {
        setTimesheets([]);
        toast({ title: 'Error', description: 'Failed to load timesheets.' });
      });
  };

  // Filter timesheets by search term and archive status
  const filteredTimesheets = timesheets
    .filter((timesheet) => {
      // First filter by archive status
      if (showArchived) {
        if (!isArchivedTimesheet(timesheet)) return false;
      } else {
        if (isArchivedTimesheet(timesheet)) return false;
      }

      // Then filter by search term
      if (!searchTerm) return true;
      
      const term = searchTerm.toLowerCase();
      return (
        (timesheet.employeeName || '').toLowerCase().includes(term) ||
        (timesheet.status || '').toLowerCase().includes(term) ||
        (timesheet.id || '').toLowerCase().includes(term) ||
        (timesheet.week || '').toLowerCase().includes(term)
      );
    })
    // Sort by submitted date, newest first
    .sort((a, b) => {
      const dateA = new Date(a.submittedDate || 0);
      const dateB = new Date(b.submittedDate || 0);
      return dateB - dateA;
    });

  // Calculate counts
  const archivedCount = timesheets.filter(isArchivedTimesheet).length;
  const activeCount = timesheets.filter(timesheet => !isArchivedTimesheet(timesheet)).length;
  const pendingCount = timesheets.filter(timesheet => 
    !isArchivedTimesheet(timesheet) && ['Submitted', 'Pending', 'Pending Review'].includes(timesheet.status)
  ).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return <Badge variant="outline" className="text-primary border-primary">Submitted</Badge>;
      case 'Pending Review':
      case 'Pending':
        return <Badge variant="outline" className="text-warning border-warning">Pending</Badge>;
      case 'Approved':
        return <Badge variant="default" className="bg-success text-success-foreground">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className = "text-white">{status}</Badge>;
    }
  };

  const handleApprove = async (id) => {
    try {
      await fetch(`/api/timesheets/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: user.name }),
      });
      toast({ 
        title: "Timesheet Approved", 
        description: `Timesheet ${id} approved. You can now archive it if needed.` 
      });
      fetchTimesheets();
    } catch {
      toast({ title: "Error", description: "Failed to approve timesheet." });
    }
  };

  const handleReject = async (id) => {
    try {
      await fetch(`/api/timesheets/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: user.name }),
      });
      toast({ 
        title: "Timesheet Rejected", 
        description: `Timesheet ${id} rejected. You can now archive it if needed.` 
      });
      fetchTimesheets();
    } catch {
      toast({ title: "Error", description: "Failed to reject timesheet." });
    }
  };

  const handleArchive = async (id) => {
    setArchivingTimesheetId(id);
    try {
      await fetch(`/api/timesheets/${id}/archive`, {
        method: "POST",
      });
      toast({ 
        title: 'Archived', 
        description: `Timesheet ${id} has been moved to archives.` 
      });
      fetchTimesheets();
    } catch {
      toast({ 
        title: 'Error', 
        description: 'Failed to archive timesheet. Please try again.' 
      });
    } finally {
      setArchivingTimesheetId(null);
    }
  };

  // Get priority timesheets (urgent and pending)
  const urgentTimesheets = timesheets.filter(timesheet => 
    !isArchivedTimesheet(timesheet) && 
    ['Submitted', 'Pending', 'Pending Review'].includes(timesheet.status) &&
    timesheet.urgent
  );

  // --- Analytics Calculations (only for active timesheets when not showing archived)
  const analyticsData = showArchived ? timesheets.filter(isArchivedTimesheet) : timesheets.filter(ts => !isArchivedTimesheet(ts));
  const analytics = getAnalytics(analyticsData);

  return (
    <DashboardLayout>
      <div className="space-y-6" key={`hr-timesheets-${refreshKey}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Timesheets Management</h1>
            <p className="text-muted-foreground">Review and manage employee timesheets</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowAnalytics((a) => !a)}>
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards - Only show when viewing active timesheets */}
        {!showArchived && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Timesheets</p>
                    <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Archive className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Archived</p>
                    <p className="text-2xl font-bold text-gray-600">{archivedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Urgent Timesheets Alert - Only show when not viewing archived */}
        {!showArchived && urgentTimesheets.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Urgent Timesheets Requiring Attention</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {urgentTimesheets.map((timesheet) => (
                  <div key={`urgent-${timesheet.id}`} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">
                        {timesheet.employeeName} - Week {timesheet.week}
                      </p>
                      <p className="text-sm text-red-600">
                        {timesheet.totalHours} hours - Submitted {timesheet.submittedDate ? new Date(timesheet.submittedDate).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(timesheet.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(timesheet.id)}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* === Analytics Section === */}
        {showAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {showArchived ? 'Archived' : 'Total'} Timesheets
                  </h3>
                </div>
                <p className="text-2xl font-bold mt-1">{analytics.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <h3 className="text-sm font-medium text-muted-foreground">Approved</h3>
                </div>
                <p className="text-2xl font-bold mt-1">{analytics.approved}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
                </div>
                <p className="text-2xl font-bold mt-1">{analytics.pending}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <h3 className="text-sm font-medium text-muted-foreground">Rejected</h3>
                </div>
                <p className="text-2xl font-bold mt-1">{analytics.rejected}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                  <h3 className="text-sm font-medium text-muted-foreground">Avg Hours / Sheet</h3>
                </div>
                <p className="text-2xl font-bold mt-1">{analytics.avgHours}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  Top: {analytics.topEmployee[0]} ({analytics.topEmployee[1]}h)
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {showArchived ? 'Search Archived Timesheets' : 'Search Timesheets'}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center space-x-2"
            >
              {showArchived ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Hide Archived</span>
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  <span>Show Archived ({archivedCount})</span>
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by employee, status, week, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Active: {activeCount}</span>
                <span>•</span>
                <span>Archived: {archivedCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timesheets Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {showArchived ? 'Archived Timesheets' : 'Active Timesheets'} ({filteredTimesheets.length})
            </CardTitle>
            <Button variant="outline" onClick={() => exportTimesheetsToCSV(filteredTimesheets)}>
              Export as CSV
            </Button>
          </CardHeader>
          <CardContent>
            {filteredTimesheets.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-muted flex items-center justify-center">
                  {showArchived ? (
                    <Archive className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-medium mb-1">
                  {showArchived ? 'No Archived Timesheets' : 'No Active Timesheets'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {showArchived 
                    ? 'No timesheets have been archived yet.' 
                    : 'No active timesheets found matching your search criteria.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timesheet ID</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Week Period</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Archived</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTimesheets.map((ts) => (
                    <TableRow 
                      key={ts.id}
                      className={isArchivedTimesheet(ts) ? 'opacity-75 bg-muted/20' : ''}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{ts.id}</span>
                          {ts.urgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                          {isArchivedTimesheet(ts) && (
                            <Archive className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ts.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{ts.employeeId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{ts.week}</TableCell>
                      <TableCell>{ts.totalHours}h</TableCell>
                      <TableCell>{getStatusBadge(ts.status)}</TableCell>
                      <TableCell>
                        {isArchivedTimesheet(ts) ? (
                          <Badge variant="secondary" className="bg-gray-500 text-white">
                            <Archive className="h-3 w-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p>{ts.submittedDate ? new Date(ts.submittedDate).toLocaleDateString() : ''}</p>
                          {ts.approvedBy && (
                            <p className="text-muted-foreground">by {ts.approvedBy}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {['Submitted', 'Pending', 'Pending Review'].includes(ts.status) && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(ts.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(ts.id)}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {canBeArchived(ts) && !isArchivedTimesheet(ts) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleArchive(ts.id)}
                              disabled={archivingTimesheetId === ts.id}
                            >
                              <Archive className="h-3 w-3 mr-1" />
                              {archivingTimesheetId === ts.id ? 'Archiving...' : 'Archive'}
                            </Button>
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
    </DashboardLayout>
  );
}