
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { OnboardingProgressDialog } from '@/components/dialogs/OnboardingProgressDialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useState } from 'react';

export function HRDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);
  const [showDepartmentChart, setShowDepartmentChart] = useState(false);
  const [showPerformanceChart, setShowPerformanceChart] = useState(false);
  const [showLeaveChart, setShowLeaveChart] = useState(false);

  const currentTasks = [
    { 
      id: 1, 
      title: 'Review Pending Leave Requests', 
      description: 'Process 8 pending leave applications from various departments',
      dueDate: '2024-12-09',
      priority: 'High',
      status: 'In Progress',
      category: 'Leave Management'
    },
    { 
      id: 2, 
      title: 'Complete New Hire Onboarding', 
      description: 'Finalize paperwork and setup for 3 new employees starting next week',
      dueDate: '2024-12-12',
      priority: 'High',
      status: 'Pending',
      category: 'Onboarding'
    },
    { 
      id: 3, 
      title: 'Quarterly Performance Review Setup', 
      description: 'Prepare Q4 performance review templates and schedule meetings',
      dueDate: '2024-12-15',
      priority: 'Medium',
      status: 'Not Started',
      category: 'Performance'
    },
    { 
      id: 4, 
      title: 'Update Employee Handbook', 
      description: 'Revise policies and procedures section for 2025',
      dueDate: '2024-12-31',
      priority: 'Low',
      status: 'In Progress',
      category: 'Documentation'
    },
    { 
      id: 5, 
      title: 'Process Payroll Adjustments', 
      description: 'Review and approve overtime calculations and bonus payments',
      dueDate: '2024-12-10',
      priority: 'High',
      status: 'Pending',
      category: 'Payroll'
    }
  ];

  const hrStats = [
    { title: 'Pending Leave Requests', value: '12', subtitle: '3 urgent', color: 'bg-warning' },
    { title: 'New Employees', value: '8', subtitle: 'This month', color: 'bg-success' },
    { title: 'Open HR Tickets', value: '25', subtitle: '5 high priority', color: 'bg-destructive' },
    { title: 'Current Tasks', value: `${currentTasks.filter(t => t.status !== 'Completed').length}`, subtitle: '3 due this week', color: 'bg-primary' },
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

  const departmentData = [
    { name: 'Engineering', employees: 25, openPositions: 3 },
    { name: 'Sales', employees: 18, openPositions: 2 },
    { name: 'Marketing', employees: 12, openPositions: 1 },
    { name: 'HR', employees: 8, openPositions: 1 },
    { name: 'Finance', employees: 10, openPositions: 0 },
  ];

  const leaveData = [
    { month: 'Jan', approved: 15, pending: 3, rejected: 2 },
    { month: 'Feb', approved: 18, pending: 5, rejected: 1 },
    { month: 'Mar', approved: 22, pending: 4, rejected: 3 },
    { month: 'Apr', approved: 20, pending: 2, rejected: 1 },
    { month: 'May', approved: 25, pending: 6, rejected: 2 },
    { month: 'Jun', approved: 28, pending: 4, rejected: 1 },
  ];

  const performanceData = [
    { name: 'Excellent', value: 35, color: '#22c55e' },
    { name: 'Good', value: 45, color: '#3b82f6' },
    { name: 'Average', value: 15, color: '#f59e0b' },
    { name: 'Needs Improvement', value: 5, color: '#ef4444' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-destructive text-destructive-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'Low': return 'bg-muted text-muted-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const handleTaskAction = (task) => {
    // Navigate based on task category
    switch (task.category) {
      case 'Leave Management':
        navigate('/hr/leave-requests');
        break;
      case 'Onboarding':
        navigate('/hr/onboarding');
        break;
      case 'Performance':
        navigate('/hr/employees');
        break;
      case 'Documentation':
        navigate('/hr/employees');
        break;
      case 'Payroll':
        navigate('/hr/payroll');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleApprovalAction = (item) => {
    if (item.type === 'Leave Request') {
      navigate('/hr/leave-requests');
    } else if (item.type === 'Job Application') {
      navigate('/hr/career');
    } else if (item.type === 'Payroll Query') {
      navigate('/hr/payroll');
    }
  };

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
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            if (stat.title === 'Pending Leave Requests') navigate('/hr/leave-requests');
            if (stat.title === 'New Employees') navigate('/hr/onboarding');
            if (stat.title === 'Open HR Tickets') navigate('/hr/tickets');
            if (stat.title === 'Current Tasks') navigate('/dashboard');
          }}>
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

      {/* Current HR Tasks Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Current HR Tasks & Priorities</CardTitle>
          <Badge variant="outline">{currentTasks.filter(t => t.status !== 'Completed').length} Active Tasks</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge className={getPriorityColor(task.priority)} size="sm">
                      {task.priority}
                    </Badge>
                    <Badge variant="outline" size="sm">{task.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    <span>Status: {task.status}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {task.status === 'Not Started' && (
                    <Button size="sm" variant="outline" onClick={() => handleTaskAction(task)}>Start</Button>
                  )}
                  {task.status === 'In Progress' && (
                    <Button size="sm" onClick={() => handleTaskAction(task)}>Continue</Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleTaskAction(task)}>View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Approvals</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/leave-requests')}>View All</Button>
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
                  <Button size="sm" variant="outline" onClick={() => handleApprovalAction(item)}>Review</Button>
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

      {/* Analytics Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowDepartmentChart(!showDepartmentChart)}>
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">Department Overview</h3>
            <p className="text-sm text-muted-foreground">View department analytics</p>
            <Button variant="outline" size="sm" className="mt-2">
              {showDepartmentChart ? 'Hide Chart' : 'Show Chart'}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowPerformanceChart(!showPerformanceChart)}>
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-semibold mb-1">Performance Analytics</h3>
            <p className="text-sm text-muted-foreground">View performance distribution</p>
            <Button variant="outline" size="sm" className="mt-2">
              {showPerformanceChart ? 'Hide Chart' : 'Show Chart'}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowLeaveChart(!showLeaveChart)}>
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-2">📅</div>
            <h3 className="font-semibold mb-1">Leave Trends</h3>
            <p className="text-sm text-muted-foreground">View leave request trends</p>
            <Button variant="outline" size="sm" className="mt-2">
              {showLeaveChart ? 'Hide Chart' : 'Show Chart'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Conditional Analytics Sections */}
      {showDepartmentChart && (
        <Card>
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="employees" fill="#3b82f6" name="Employees" />
                <Bar dataKey="openPositions" fill="#22c55e" name="Open Positions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {showPerformanceChart && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {showLeaveChart && (
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={leaveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="approved" stroke="#22c55e" name="Approved" />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pending" />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Onboarding Progress Analytics</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowOnboardingDialog(true)}>
            View Analytics
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-muted-foreground mb-4">Click "View Analytics" to see detailed onboarding progress</p>
            <div className="flex justify-center space-x-8 text-sm">
              <div>
                <p className="font-semibold">87%</p>
                <p className="text-muted-foreground">Completion Rate</p>
              </div>
              <div>
                <p className="font-semibold">4.2 days</p>
                <p className="text-muted-foreground">Avg Time</p>
              </div>
              <div>
                <p className="font-semibold">25</p>
                <p className="text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access HR Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/hr/employees')}>
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">Employee Analytics</h3>
            <p className="text-sm text-muted-foreground">View workforce insights</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/hr/onboarding')}>
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold mb-1">Onboarding Center</h3>
            <p className="text-sm text-muted-foreground">Manage new hires</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/hr/payroll')}>
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
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/feedback')}>Review</Button>
          </div>
        </CardContent>
      </Card>

      <OnboardingProgressDialog 
        open={showOnboardingDialog} 
        onOpenChange={setShowOnboardingDialog} 
      />
    </div>
  );
}
