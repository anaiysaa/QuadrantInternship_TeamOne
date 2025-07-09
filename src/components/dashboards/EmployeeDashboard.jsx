import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export function EmployeeDashboard() {
  const { user } = useAuth();

  const quickStats = [
    { title: 'Leave Balance', value: '15 days', subtitle: 'Available this year', color: 'bg-success' },
    { title: 'Hours This Month', value: '168h', subtitle: '40h this week', color: 'bg-primary' },
    { title: 'Open Tickets', value: '2', subtitle: '1 pending response', color: 'bg-warning' },
    { title: 'Applications', value: '1', subtitle: 'In review', color: 'bg-accent' },
  ];

  const recentActivities = [
    { action: 'Leave request approved', date: '2 hours ago', type: 'success' },
    { action: 'Timesheet submitted', date: '1 day ago', type: 'info' },
    { action: 'IT ticket created', date: '3 days ago', type: 'warning' },
    { action: 'Profile updated', date: '1 week ago', type: 'info' },
  ];

  const quickActions = [
    { title: 'Apply for Leave', description: 'Request time off', path: '/leave' },
    { title: 'Log Hours', description: 'Submit timesheet', path: '/timesheet' },
    { title: 'View Payslips', description: 'Download pay stubs', path: '/payroll' },
    { title: 'Submit Feedback', description: 'Share your thoughts', path: '/feedback' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary text-primary-foreground rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-primary-foreground/80 mb-4">
          {user?.department} • Employee ID: {user?.employeeId}
        </p>
        <div className="flex items-center space-x-4 text-sm">
          <span>Manager: {user?.manager || 'Not assigned'}</span>
          <span>•</span>
          <span>Joined: {new Date(user?.joinDate || '').toLocaleDateString()}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2"
              >
                <span className="font-medium text-sm">{action.title}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-success' :
                    activity.type === 'warning' ? 'bg-warning' : 'bg-primary'
                  }`}></div>
                  <span className="text-sm">{activity.action}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* My Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Support Tickets</CardTitle>
          <Button variant="outline" size="sm">View All</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <div>
                <p className="font-medium">Laptop running slowly</p>
                <p className="text-sm text-muted-foreground">IT Support • Ticket #1234</p>
              </div>
              <Badge variant="outline">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <div>
                <p className="font-medium">Request new software license</p>
                <p className="text-sm text-muted-foreground">IT Support • Ticket #1235</p>
              </div>
              <Badge>Pending</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}