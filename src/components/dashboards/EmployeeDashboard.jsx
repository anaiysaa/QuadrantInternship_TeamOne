import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AnnouncementSection } from '@/components/announcements/AnnouncementSection';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAnnouncementsCollapsed, setIsAnnouncementsCollapsed] = useState(false);
  const [isTasksCollapsed, setIsTasksCollapsed] = useState(false);

  const currentTasks = [
    { 
      id: 1, 
      title: 'Complete Q4 Performance Review', 
      description: 'Submit self-assessment and goal planning for next quarter',
      dueDate: '2024-12-15',
      priority: 'High',
      status: 'In Progress',
      category: 'HR'
    },
    { 
      id: 2, 
      title: 'Submit Weekly Timesheet', 
      description: 'Log hours for week ending December 8th',
      dueDate: '2024-12-09',
      priority: 'Medium',
      status: 'Pending',
      category: 'Admin'
    },
    { 
      id: 3, 
      title: 'Complete Cybersecurity Training', 
      description: 'Mandatory annual security awareness training',
      dueDate: '2024-12-20',
      priority: 'Medium',
      status: 'Not Started',
      category: 'Training'
    },
    { 
      id: 4, 
      title: 'Update Emergency Contact Information', 
      description: 'Verify and update contact details in HR system',
      dueDate: '2024-12-31',
      priority: 'Low',
      status: 'Not Started',
      category: 'HR'
    }
  ];

  const quickStats = [
    { title: 'Leave Balance', value: '15 days', subtitle: 'Available this year', color: 'bg-success' },
    { title: 'Hours This Month', value: '168h', subtitle: '40h this week', color: 'bg-primary' },
    { title: 'Open Tickets', value: '2', subtitle: '1 pending response', color: 'bg-warning' },
    { title: 'Pending Tasks', value: `${currentTasks.filter(t => t.status !== 'Completed').length}`, subtitle: '2 due this week', color: 'bg-accent' },
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
    { title: 'View Profile', description: 'Update information', path: '/profile' },
    { title: 'Submit Feedback', description: 'Share your thoughts', path: '/feedback' },
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
      case 'HR':
        navigate('/profile');
        break;
      case 'Admin':
        navigate('/timesheet');
        break;
      case 'Training':
        navigate('/lms');
        break;
      default:
        navigate('/dashboard');
    }
  };

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

      {/* Announcements Section with Collapsible */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center space-x-2">
            <span>Company Announcements</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAnnouncementsCollapsed(!isAnnouncementsCollapsed)}
            className="p-1 h-8 w-8"
          >
            {isAnnouncementsCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        {!isAnnouncementsCollapsed && (
          <CardContent className="pt-0">
            <AnnouncementSection />
          </CardContent>
        )}
      </Card>

      {/* Current Tasks Section with Collapsible */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Current Tasks & To-Do</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{currentTasks.filter(t => t.status !== 'Completed').length} Pending</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTasksCollapsed(!isTasksCollapsed)}
              className="p-1 h-8 w-8"
            >
              {isTasksCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {!isTasksCollapsed && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              {currentTasks.slice(0, 4).map((task) => (
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
        )}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            if (stat.title === 'Leave Balance') navigate('/leave');
            if (stat.title === 'Hours This Month') navigate('/timesheet');
            if (stat.title === 'Open Tickets') navigate('/tickets');
            if (stat.title === 'Pending Tasks') navigate('/dashboard');
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
                onClick={() => navigate(action.path)}
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
          <Button variant="outline" size="sm" onClick={() => navigate('/tickets')}>View All</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg cursor-pointer hover:bg-accent/80" onClick={() => navigate('/tickets')}>
              <div>
                <p className="font-medium">Laptop running slowly</p>
                <p className="text-sm text-muted-foreground">IT Support • Ticket #1234</p>
              </div>
              <Badge variant="outline">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg cursor-pointer hover:bg-accent/80" onClick={() => navigate('/tickets')}>
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
