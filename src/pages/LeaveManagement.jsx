import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

export default function LeaveManagement() {
  const [date, setDate] = useState(new Date());

  const leaveRequests = [
    {
      id: 1,
      type: 'Annual Leave',
      startDate: '2024-03-15',
      endDate: '2024-03-20',
      days: 5,
      status: 'approved',
      reason: 'Family vacation'
    },
    {
      id: 2,
      type: 'Sick Leave',
      startDate: '2024-02-28',
      endDate: '2024-03-01',
      days: 2,
      status: 'approved',
      reason: 'Medical appointment'
    },
    {
      id: 3,
      type: 'Personal Leave',
      startDate: '2024-04-10',
      endDate: '2024-04-10',
      days: 1,
      status: 'pending',
      reason: 'Personal matters'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <Button>Request Leave</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Leave Balance */}
          <Card>
            <CardHeader>
              <CardTitle>Leave Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Annual Leave</span>
                  <span className="text-sm font-medium">18/25 days</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Sick Leave</span>
                  <span className="text-sm font-medium">3/10 days</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Personal Leave</span>
                  <span className="text-sm font-medium">1/5 days</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                📅 Annual Leave
              </Button>
              <Button className="w-full" variant="outline">
                🏥 Sick Leave
              </Button>
              <Button className="w-full" variant="outline">
                👤 Personal Leave
              </Button>
              <Button className="w-full" variant="outline">
                🏠 Work from Home
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Leave History */}
        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{request.type}</span>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.startDate} - {request.endDate} ({request.days} days)
                    </p>
                    <p className="text-sm">{request.reason}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}