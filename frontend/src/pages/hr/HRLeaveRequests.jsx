import { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import LeaveDetailsDialog from '@/components/dialogs/LeaveDetailsDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const API_URL = 'http://localhost:8000/api/leave-requests';
const EMP_API_URL = 'http://localhost:8000/api/employees';

export default function HRLeaveRequests() {
  const { currentPortal } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const [leaveDetailsOpen, setLeaveDetailsOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Fetch all leave requests
  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => setLeaveRequests(res.data))
      .catch(() => {
        setLeaveRequests([]);
        toast({ title: 'Error', description: 'Failed to load leave requests.' });
      });
  }, [refreshKey, toast]);

  // Fetch employee directory for name lookup
  useEffect(() => {
    axios
      .get(EMP_API_URL)
      .then(res => setEmployees(res.data))
      .catch(() => setEmployees([]));
  }, []);

  // Find employee name by ID
  const getEmployeeDisplay = (empId) => {
    const emp = employees.find((e) => String(e.id) === String(empId));
    return emp ? `${emp.name} (${emp.id})` : empId;
  };

  // Filter leave requests by search term
  const filteredRequests = leaveRequests
    .filter((request) => {
      const term = searchTerm.toLowerCase();
      return (
        getEmployeeDisplay(request.Employee).toLowerCase().includes(term) ||
        (request.Type || '').toLowerCase().includes(term) ||
        (request.Status || '').toLowerCase().includes(term) ||
        (request.RequestID || '').toLowerCase().includes(term)
      );
    })
    // Sort so the oldest is at the top, newest at the bottom (by SubmittedDate)
    .sort((a, b) => {
      const da = new Date(a.SubmittedDate || a.submittedDate || a.StartDate || 0);
      const db = new Date(b.SubmittedDate || b.submittedDate || b.StartDate || 0);
      return da - db;
    });

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
      Vacation: 'bg-primary text-primary-foreground',
      'Sick Leave': 'bg-destructive text-destructive-foreground',
      Personal: 'bg-warning text-warning-foreground',
      Maternity: 'bg-success text-success-foreground',
    };
    return <Badge className={colors[type] || 'bg-secondary text-secondary-foreground'}>{type}</Badge>;
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.post(`${API_URL}/${requestId}/approve`);
      toast({ title: 'Approved', description: `Request ${requestId} approved.` });
      setRefreshKey((k) => k + 1);
    } catch {
      toast({ title: 'Error', description: 'Failed to approve request.' });
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.post(`${API_URL}/${requestId}/reject`);
      toast({ title: 'Rejected', description: `Request ${requestId} rejected.` });
      setRefreshKey((k) => k + 1);
    } catch {
      toast({ title: 'Error', description: 'Failed to reject request.' });
    }
  };

  const handleViewDetails = (request) => {
    setSelectedLeave(request);
    setLeaveDetailsOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" key={`hr-leave-requests-${refreshKey}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Leave Requests</h1>
            <p className="text-muted-foreground">Manage employee leave requests</p>
          </div>
        </div>

        {/* Search */}
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
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.RequestID}>
                    <TableCell className="font-medium">
                      <div>
                        {request.RequestID}
                        {request.Urgent ? (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Urgent
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getEmployeeDisplay(request.Employee)}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(request.Type)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(request.StartDate).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">
                          to {new Date(request.EndDate).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{request.Days}</TableCell>
                    <TableCell>{getStatusBadge(request.Status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {request.Status === 'Pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(request.RequestID)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(request.RequestID)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(request)}
                      >
                        View
                      </Button>
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
