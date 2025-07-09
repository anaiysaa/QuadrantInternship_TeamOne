import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export function HRDashboard() {
  const { user } = useAuth();

  const hrStats = [
    { title: 'Pending Leave Requests', value: '12', subtitle: '3 urgent', color: 'bg-warning' },
    { title: 'New Employees', value: '8', subtitle: 'This month', color: 'bg-success' },
    { title: 'Open HR Tickets', value: '25', subtitle: '5 high priority', color: 'bg-destructive' },
    { title: 'Total Employees', value: '247', subtitle: 'Active headcount', color: 'bg-primary' },
  ];

  const pendingApprovals = [
    { type: 'Leave Request', employee: 'John Doe', details: 'Vacation - 3 days', urgent: true },
    { type: 'Leave Request', employee: 'Sarah Smith', details: 'Sick leave - 2 days', urgent: false },
    { type: 'Job Application', employee: 'Mike Wilson', details: 'Senior Developer', urgent: false },
    { type: 'Payroll Query', employee: 'Lisa Johnson', details: 'Overtime calculation', urgent: true },
  ];

  const recentActivities = [
    { action: 'Employee onboarding completed', employee: 'Alex Brown', time: '2 hours ago' },
    { action: 'Leave request approved', employee: 'Emma Davis', time: '4 hours ago' },
    { action: 'HR ticket resolved', employee: 'Tom Wilson', time: '6 hours ago' },
    { action: 'New job posting created', details: 'Frontend Developer', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-success text-success-foreground rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">HR Dashboard</h1>
        <p className="text-success-foreground/80 mb-4">
          Welcome back, {user?.name} • Human Resources
        </p>
        <div className="flex items-center space-x-4 text-sm">
          <span>Employee ID: {user?.employeeId}</span>
          <span>•</span>
          <span>Department: {user?.department}</span>
        </div>
      </div>

      {/* HR Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hrStats.map((stat, index) => (
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
        {/* Pending Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Approvals</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingApprovals.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-sm">{item.type}</p>
                    {item.urgent && <Badge variant="destructive" className="text-xs">Urgent</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.employee && `${item.employee} • `}{item.details}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent HR Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.employee && `${activity.employee} • `}
                    {activity.details && `${activity.details} • `}
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access HR Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">Employee Analytics</h3>
            <p className="text-sm text-muted-foreground">View workforce insights</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold mb-1">Onboarding Center</h3>
            <p className="text-sm text-muted-foreground">Manage new hires</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold mb-1">Payroll Management</h3>
            <p className="text-sm text-muted-foreground">Process payroll data</p>
          </CardContent>
        </Card>
      </div>

      {/* Anonymous Feedback Alert */}
      <Card className="border-warning bg-warning/5">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="text-warning text-xl">💬</div>
            <div className="flex-1">
              <p className="font-medium">New Anonymous Feedback</p>
              <p className="text-sm text-muted-foreground">3 new anonymous feedback submissions require review</p>
            </div>
            <Button variant="outline" size="sm">Review</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}