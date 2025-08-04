import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect } from 'react';
import LeaveRequestDialog from '@/components/dialogs/LeaveRequestDialog';
import LeaveDetailsDialog from '@/components/dialogs/LeaveDetailsDialog';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
const API_URL = 'http://localhost:8000/api/leave-requests';

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
  const [leaveBalance, setLeaveBalance] = useState({
    'Annual Leave': { used: 0, total: 25 },
    'Sick Leave': { used: 0, total: 10 },
    'Personal Leave': { used: 0, total: 5 },
  });

  const USER_ID = user ? user.employeeId : null;

  useEffect(() => {
    if (!USER_ID) {
      alert("No employee ID found. Please log in again.");
      window.location.href = 'api/login';
      return;
    }

    axios.get(API_URL)
      .then(res => {
        const data = res.data.filter(r => String(r.Employee) === String(USER_ID));
        setLeaveRequests(data);

        // Calculate leave balances
        let bal = {
          'Annual Leave': { used: 0, total: 25 },
          'Sick Leave': { used: 0, total: 10 },
          'Personal Leave': { used: 0, total: 5 },
        };
        data.forEach(r => {
          if ((r.Status === 'Approved' || r.Status === 'approved') && bal[r.Type]) {
            bal[r.Type].used += Number(r.Days) || 0;
          }
        });
        setLeaveBalance(bal);
      })
      .catch(() => setLeaveRequests([]));
  }, [refresh, USER_ID]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
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
      : leaveType === 'wfh'
      ? 'Work from Home'
      : '');
    setLeaveRequestOpen(true);
  };

  const handleViewDetails = (request) => {
    setSelectedLeave(request);
    setLeaveDetailsOpen(true);
  };

  const handleLeaveSubmit = async (req) => {
    try {
      await axios.post(API_URL, {
        Employee: USER_ID,
        Type: req.type,
        StartDate: req.startDate,
        EndDate: req.endDate,
        Reason: req.reason,
        Urgent: req.urgent,
        Status: 'Pending',
      });
      setLeaveRequestOpen(false);
      setRefresh(r => r + 1);
    } catch (err) {
      alert('Failed to submit leave request');
    }
  };

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
              {['Annual Leave', 'Sick Leave', 'Personal Leave'].map(type => (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{type}</span>
                    <span className="text-sm font-medium">
                      {leaveBalance[type]?.total - leaveBalance[type]?.used}/{leaveBalance[type]?.total} days
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
                        width: `${Math.round(100 * (leaveBalance[type]?.total - leaveBalance[type]?.used) / leaveBalance[type]?.total)}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" onClick={() => handleQuickAction('annual')}>
                📅 Annual Leave
              </Button>
              <Button className="w-full" variant="outline" onClick={() => handleQuickAction('sick')}>
                🏥 Sick Leave
              </Button>
              <Button className="w-full" variant="outline" onClick={() => handleQuickAction('personal')}>
                👤 Personal Leave
              </Button>
              <Button className="w-full" variant="outline" onClick={() => handleQuickAction('wfh')}>
                🏠 Work from Home
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div key={request.RequestID || request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{request.Type || request.type}</span>
                      <Badge className={getStatusColor(request.Status || request.status)}>
                        {(request.Status || request.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {(request.StartDate || request.startDate)} - {(request.EndDate || request.endDate)} ({request.Days || request.days} days)
                    </p>
                    <p className="text-sm">{request.Reason || request.reason}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(request)}>
                    View Details
                  </Button>
                </div>
              ))}
            </div>
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
