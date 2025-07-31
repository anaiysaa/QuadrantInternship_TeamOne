import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function exportTimesheetsToCSV(timesheets) {
  if (!timesheets.length) return;
  const header = [
    "Timesheet ID",
    "Employee",
    "Week Period",
    "Total Hours",
    "Status",
    "Submitted",
    "Approved By"
  ];
  const rows = timesheets.map(ts => [
    ts.id,
    ts.employeeName,
    ts.week,
    ts.totalHours,
    ts.status,
    ts.submittedDate ? new Date(ts.submittedDate).toLocaleDateString() : '',
    ts.approvedBy || ''
  ]);
  const csv = [header, ...rows].map(row =>
    row.map(field => `"${(field ?? '').toString().replace(/"/g, '""')}"`).join(",")
  ).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "all_timesheets.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function HRTimesheets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [timesheets, setTimesheets] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

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
      setShowAnalytics(false);
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

  const filteredTimesheets = timesheets.filter(ts =>
    (ts.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ts.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ts.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleApprove = async (id) => {
    try {
      await fetch(`/api/timesheets/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: user.name }),
      });
      toast({ title: "Timesheet Approved", description: `Timesheet ${id} approved.` });
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
      toast({ title: "Timesheet Rejected", description: `Timesheet ${id} rejected.` });
      fetchTimesheets();
    } catch {
      toast({ title: "Error", description: "Failed to reject timesheet." });
    }
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
            <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </Button>
            {/* Bulk/Export can go here */}
          </div>
        </div>

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
            </div>
          </CardContent>
        </Card>

        {/* Timesheets Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Timesheets ({filteredTimesheets.length})</CardTitle>
            <Button variant="outline" onClick={() => exportTimesheetsToCSV(filteredTimesheets)}>
              Export as CSV
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timesheet ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Week Period</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimesheets.map((ts) => (
                  <TableRow key={ts.id}>
                    <TableCell>{ts.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ts.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{ts.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{ts.week}</TableCell>
                    <TableCell>{ts.totalHours}h</TableCell>
                    <TableCell>{getStatusBadge(ts.status)}</TableCell>
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
                            <Button size="sm" variant="default" onClick={() => handleApprove(ts.id)}>Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(ts.id)}>Reject</Button>
                          </>
                        )}
                        {/* View Details can go here */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTimesheets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No timesheets found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
