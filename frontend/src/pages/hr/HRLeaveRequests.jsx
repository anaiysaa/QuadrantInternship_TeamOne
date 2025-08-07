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
import { Archive, EyeOff, CheckCircle, XCircle, FileText, Clock, Users } from 'lucide-react';
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

// Helper function to determine if a leave request should be considered archived
function isArchivedLeaveRequest(request) {
  return request.archived === true;
}

// Helper function to determine if a request can be archived
function canBeArchived(request) {
  return request.Status === 'Approved' || request.Status === 'Rejected';
}

export default function HRLeaveRequests() {
  const { user, currentPortal } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showArchived, setShowArchived] = useState(false);
  const [archivingRequestId, setArchivingRequestId] = useState(null);
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

  // Filter leave requests by search term and archive status
  const filteredRequests = leaveRequests
    .filter((request) => {
      // First filter by archive status
      if (showArchived) {
        if (!isArchivedLeaveRequest(request)) return false;
      } else {
        if (isArchivedLeaveRequest(request)) return false;
      }

      // Then filter by search term
      if (!searchTerm) return true;
      
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

  // Calculate counts
  const archivedCount = leaveRequests.filter(isArchivedLeaveRequest).length;
  const activeCount = leaveRequests.filter(request => !isArchivedLeaveRequest(request)).length;
  const pendingCount = leaveRequests.filter(request => request.Status === 'Pending').length;

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
      'Annual Leave': 'bg-primary text-primary-foreground',
      'Sick Leave': 'bg-destructive text-destructive-foreground',
      'Personal Leave': 'bg-warning text-warning-foreground',
      'Maternity Leave': 'bg-success text-success-foreground',
      'Work from Home': 'bg-blue-500 text-white',
      Vacation: 'bg-primary text-primary-foreground',
      Personal: 'bg-warning text-warning-foreground',
      Maternity: 'bg-success text-success-foreground',
    };
    return <Badge className={colors[type] || 'bg-secondary text-secondary-foreground'}>{type}</Badge>;
  };

  const handleApprove = async (requestId) => {
  try {
    await axios.post(`${API_URL}/${requestId}/approve`, {
      employee_id: user.employee_id  // <-- must be passed
    });
    toast({ title: 'Approved', description: `Request ${requestId} approved.` });
    setRefreshKey((k) => k + 1);
  } catch (err) {
    toast({ title: 'Error', description: 'Failed to approve request.' });
    console.error(err);
  }
};



  const handleReject = async (requestId) => {
    try {
      await axios.post(`${API_URL}/${requestId}/reject`);
      toast({ 
        title: 'Rejected', 
        description: `Request ${requestId} has been rejected. You can now archive it if needed.` 
      });
      setRefreshKey((k) => k + 1);
    } catch {
      toast({ title: 'Error', description: 'Failed to reject request.' });
    }
  };

  const handleArchive = async (requestId) => {
    setArchivingRequestId(requestId);
    try {
      // Update the request status to "Archived"
      await axios.post(`${API_URL}/${requestId}/archive`);
      toast({ 
        title: 'Archived', 
        description: `Request ${requestId} has been moved to archives.` 
      });
      setRefreshKey((k) => k + 1);
    } catch {
      toast({ 
        title: 'Error', 
        description: 'Failed to archive request. Please try again.' 
      });
    } finally {
      setArchivingRequestId(null);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedLeave(request);
    setLeaveDetailsOpen(true);
  };

  // Get priority requests (urgent and pending)
  const urgentRequests = leaveRequests.filter(request => 
    !isArchivedLeaveRequest(request) && 
    request.Status === 'Pending' && 
    request.Urgent
  );

  return (
    <DashboardLayout>
      <div className="space-y-6" key={`hr-leave-requests-${refreshKey}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Leave Requests Management</h1>
            <p className="text-muted-foreground">Review and manage employee leave requests</p>
          </div>
        </div>

        {/* Quick Stats Cards - Only show when viewing active requests */}
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
                    <p className="text-sm font-medium text-muted-foreground">Active Requests</p>
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

        {/* Urgent Requests Alert - Only show when not viewing archived */}
        {!showArchived && urgentRequests.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Urgent Leave Requests Requiring Attention</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {urgentRequests.map((request) => (
                  <div key={`urgent-${request.RequestID}`} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">
                        {getEmployeeDisplay(request.Employee)} - {request.Type}
                      </p>
                      <p className="text-sm text-red-600">
                        {new Date(request.StartDate).toLocaleDateString()} - {new Date(request.EndDate).toLocaleDateString()} 
                        ({request.Days} days)
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(request.RequestID)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(request.RequestID)}
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

        {/* Search */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {showArchived ? 'Search Archived Requests' : 'Search Leave Requests'}
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
                placeholder="Search by employee, type, status, or ID..."
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

        {/* Leave Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {showArchived ? 'Archived Leave Requests' : 'Active Leave Requests'} ({filteredRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-muted flex items-center justify-center">
                  {showArchived ? (
                    <Archive className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-medium mb-1">
                  {showArchived ? 'No Archived Requests' : 'No Active Requests'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {showArchived 
                    ? 'No leave requests have been archived yet.' 
                    : 'No active leave requests found matching your search criteria.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Archived</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow 
                      key={request.RequestID} 
                      className={isArchivedLeaveRequest(request) ? 'opacity-75 bg-muted/20' : ''}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{request.RequestID}</span>
                          {request.Urgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                          {isArchivedLeaveRequest(request) && (
                            <Archive className="h-3 w-3 text-muted-foreground" />
                          )}
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
                        {isArchivedLeaveRequest(request) ? (
                          <Badge variant="secondary" className="bg-gray-500 text-white">
                            <Archive className="h-3 w-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {request.Status === 'Pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(request.RequestID)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(request.RequestID)}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {canBeArchived(request) && !isArchivedLeaveRequest(request) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleArchive(request.RequestID)}
                              disabled={archivingRequestId === request.RequestID}
                            >
                              <Archive className="h-3 w-3 mr-1" />
                              {archivingRequestId === request.RequestID ? 'Archiving...' : 'Archive'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(request)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
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

        <LeaveDetailsDialog
          open={leaveDetailsOpen}
          onOpenChange={setLeaveDetailsOpen}
          leaveRequest={selectedLeave}
        />
      </div>
    </DashboardLayout>
  );
}