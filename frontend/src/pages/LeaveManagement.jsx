import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect } from 'react';
import LeaveRequestDialog from '@/components/dialogs/LeaveRequestDialog';
import LeaveDetailsDialog from '@/components/dialogs/LeaveDetailsDialog';
import { Archive, EyeOff, CalendarDays, Clock, Shield, User } from 'lucide-react';

// Using fetch instead of axios for API calls
import { useAuth } from '@/contexts/AuthContext';
const API_URL = 'http://localhost:8000/api/leave-requests';

// Helper function to determine if a leave request should be considered archived
function isArchivedLeaveRequest(request) {
  // Check if explicitly archived
  if (request.archived || request.archived === true) {
    return true;
  }
  
  const archivedStatuses = ['archived'];
  const status = (request.Status || request.status || '').toLowerCase();
  
  // Also consider requests older than 6 months as archived
  const requestDate = new Date(request.StartDate || request.startDate);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  return archivedStatuses.includes(status) || requestDate < sixMonthsAgo;
}

export default function LeaveManagement() {
  const { user } = useAuth();
  const employeeId = user ? user.employeeId : null;
  const [date, setDate] = useState(new Date());
  const [leaveRequestOpen, setLeaveRequestOpen] = useState(false);
  const [leaveDetailsOpen, setLeaveDetailsOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [showArchived, setShowArchived] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState({
    'Sick Leave': { used: 0, total: 10, paidUsed: 0 },
    'Personal Leave': { used: 0, total: 5, paidUsed: 0 },
    'Annual Leave': { used: 0, total: 20, paidUsed: 0 },
  });

  const USER_ID = user ? user.employeeId : null;

  useEffect(() => {
    if (!USER_ID) {
      alert("No employee ID found. Please log in again.");
      window.location.href = '/api/login';
      return;
    }

    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(r => String(r.Employee) === String(USER_ID));
        setLeaveRequests(filtered);
        
        console.log('Leave requests data:', filtered);
        
        // Calculate leave balances including paid/unpaid breakdown
        let bal = {
          'Sick Leave': { used: 0, total: 10, paidUsed: 0 },
          'Personal Leave': { used: 0, total: 5, paidUsed: 0 },
          'Annual Leave': { used: 0, total: 20, paidUsed: 0 },
        };
        
        filtered.forEach(r => {
          if ((r.Status === 'Approved' || r.Status === 'approved') && bal[r.Type]) {
            const days = Number(r.Days) || 0;
            bal[r.Type].used += days;
            
            // Track paid leave usage separately
            if (r.paid === true || r.paid === 1) {
              bal[r.Type].paidUsed += days;
            }
          }
        });
        
        setLeaveBalance(bal);
      })
      .catch(err => {
        console.error('Error fetching leave requests:', err);
        setLeaveRequests([]);
      });
  }, [refresh, USER_ID]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      case 'completed': return 'bg-blue-600 text-white';
      case 'cancelled': return 'bg-gray-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleQuickAction = (leaveType) => {
    setSelectedLeaveType(leaveType === 'annual'
      ? 'Annual Leave'
      : leaveType === 'sick'
      ? 'Sick Leave'
      : leaveType === 'personal'
      ? 'Personal Leave'
      : leaveType === 'wfh');
    setLeaveRequestOpen(true);
  };

  const handleViewDetails = (request) => {
    setSelectedLeave(request);
    setLeaveDetailsOpen(true);
  };

  const handleLeaveSubmit = async (req) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Employee: USER_ID,
          Type: req.type,
          StartDate: req.startDate,
          EndDate: req.endDate,
          Reason: req.reason,
          Urgent: req.urgent,
          Status: 'Pending',
          paid: req.paidLeave,  // Include paid status
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit request');
      }
      
      console.log('Leave request submitted:', result);
      setLeaveRequestOpen(false);
      setRefresh(r => r + 1);
    } catch (err) {
      console.error('Failed to submit leave request:', err);
      alert('Failed to submit leave request: ' + err.message);
    }
  };

  // Filter leave requests based on archived status
  const filteredLeaveRequests = leaveRequests.filter(request => {
    if (showArchived) {
      return isArchivedLeaveRequest(request);
    } else {
      return !isArchivedLeaveRequest(request);
    }
  });

  const archivedCount = leaveRequests.filter(isArchivedLeaveRequest).length;
  const activeCount = leaveRequests.filter(request => !isArchivedLeaveRequest(request)).length;

  // Get upcoming leave requests for calendar view
  const upcomingLeave = leaveRequests.filter(request => {
    const startDate = new Date(request.StartDate || request.startDate);
    const today = new Date();
    const status = (request.Status || request.status || '').toLowerCase();
    return startDate >= today && (status === 'approved' || status === 'pending');
  }).slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <Button onClick={() => setLeaveRequestOpen(true)}>Request Leave</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Leave Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Sick Leave', 'Personal Leave', 'Annual Leave'].map(type => {
                const balance = leaveBalance[type];
                const remaining = balance?.total - balance?.used;
                const paidRemaining = Math.max(0, balance?.total - balance?.paidUsed);
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{type}</span>
                      <span className="text-sm">
                        {remaining}/{balance?.total} days
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={
                          type === 'Annual Leave'
                            ? 'bg-primary h-2 rounded-full'
                            : type === 'Sick Leave'
                            ? 'bg-warning h-2 rounded-full'
                            : 'bg-accent h-2 rounded-full'
                        }
                        style={{
                          width: `${Math.max(0, Math.min(100, (remaining / balance?.total) * 100))}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Paid available: {paidRemaining}</span>
                      <span>Used: {balance?.used} ({balance?.paidUsed} paid)</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="h-full">
  <CardHeader>
    <CardTitle>Calendar</CardTitle>
  </CardHeader>
  <CardContent className="flex-grow flex items-center justify-center">
    <div className="space-x-2 space-y-2">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="border rounded-md"
      />
    </div>
  </CardContent>
</Card>


<Card>
  <CardHeader>
    <CardTitle>Quick Actions</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <Button className="w-full flex items-center space-x-2" variant="outline" onClick={() => handleQuickAction('annual')}>
      <CalendarDays className="w-4 h-4" />
      <span>Annual Leave</span>
    </Button>
    <Button className="w-full flex items-center space-x-2" variant="outline" onClick={() => handleQuickAction('sick')}>
      <Shield className="w-4 h-4" />
      <span>Sick Leave</span>
    </Button>
    <Button className="w-full flex items-center space-x-2" variant="outline" onClick={() => handleQuickAction('personal')}>
      <User className="w-4 h-4" />
      <span>Personal Leave</span>
    </Button>
  </CardContent>
</Card>

        </div>

        {/* Upcoming Leave Section - Only show when not viewing archived */}
        {!showArchived && upcomingLeave.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarDays className="h-5 w-5" />
                <span>Upcoming Leave</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {upcomingLeave.map((request) => (
                  <div key={request.RequestID || request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{request.Type || request.type}</p>
                          {(request.paid === true || request.paid === 1) && (
                            <Badge variant="secondary" className="text-xs">Paid</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.StartDate || request.startDate).toLocaleDateString()} - {new Date(request.EndDate || request.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.Status || request.status)}>
                      {(request.Status || request.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle>
                {showArchived ? 'Archived Leave Requests' : 'Active Leave Requests'}
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Active: {activeCount}</span>
                <span>•</span>
                <span>Archived: {archivedCount}</span>
              </div>
            </div>
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
            {filteredLeaveRequests.length === 0 && (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-muted flex items-center justify-center">
                  {showArchived ? (
                    <Archive className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-medium mb-1">
                  {showArchived ? 'No Archived Leave Requests' : 'No Active Leave Requests'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {showArchived 
                    ? 'No leave requests have been archived yet.' 
                    : 'No active leave requests found. Submit your first leave request to get started.'}
                </p>
              </div>
            )}
            {filteredLeaveRequests.length > 0 && (
              <div className="space-y-4">
                {filteredLeaveRequests.map((request) => (
                  <div key={request.RequestID || request.id} className={`flex items-center justify-between p-4 border rounded-lg ${isArchivedLeaveRequest(request) ? 'opacity-75 bg-muted/20' : ''}`}>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{request.Type || request.type}</span>
                        <Badge className={getStatusColor(request.Status || request.status)}>
                          {(request.Status || request.status)}
                        </Badge>
                        {(request.paid === true || request.paid === 1) && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            Paid
                          </Badge>
                        )}
                        {(!request.paid || request.paid === false || request.paid === 0) && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                            Unpaid
                          </Badge>
                        )}
                        {request.Urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(request.StartDate || request.startDate)} - {(request.EndDate || request.endDate)} ({request.Days || request.days} days)
                      </p>
                      <p className="text-sm">{request.Reason || request.reason}</p>
                      {isArchivedLeaveRequest(request) && (
                        <div className="flex items-center space-x-1 mt-2">
                          <Archive className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Archived</span>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(request)}>
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <LeaveRequestDialog
          open={leaveRequestOpen}
          onOpenChange={setLeaveRequestOpen}
          defaultType={selectedLeaveType}
          onSubmit={handleLeaveSubmit}
        />

        <LeaveDetailsDialog
          open={leaveDetailsOpen}
          onOpenChange={setLeaveDetailsOpen}
          leaveRequest={selectedLeave}
        />
      </div>
    </DashboardLayout>
  );
}