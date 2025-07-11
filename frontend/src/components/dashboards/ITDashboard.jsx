import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function ITDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentTasks = [
    { 
      id: 1, 
      title: 'Resolve Critical Server Issues', 
      description: 'Address production server downtime affecting multiple departments',
      dueDate: '2024-12-09',
      priority: 'Critical',
      status: 'In Progress',
      category: 'Infrastructure'
    },
    { 
      id: 2, 
      title: 'Deploy Security Updates', 
      description: 'Install critical security patches across all workstations',
      dueDate: '2024-12-10',
      priority: 'High',
      status: 'Pending',
      category: 'Security'
    },
    { 
      id: 3, 
      title: 'Setup New Employee Workstations', 
      description: 'Configure 5 new laptops for incoming team members',
      dueDate: '2024-12-12',
      priority: 'Medium',
      status: 'Not Started',
      category: 'Hardware'
    },
    { 
      id: 4, 
      title: 'Network Performance Optimization', 
      description: 'Analyze and improve network speed for Sales department',
      dueDate: '2024-12-15',
      priority: 'Medium',
      status: 'In Progress',
      category: 'Network'
    },
    { 
      id: 5, 
      title: 'Software License Audit', 
      description: 'Review and update software licensing for compliance',
      dueDate: '2024-12-20',
      priority: 'Low',
      status: 'Not Started',
      category: 'Compliance'
    }
  ];

  const itStats = [
    { title: 'Open Tickets', value: '42', subtitle: '8 critical', color: 'bg-destructive' },
    { title: 'Assets Tracked', value: '324', subtitle: 'Devices & licenses', color: 'bg-primary' },
    { title: 'Current Tasks', value: `${currentTasks.filter(t => t.status !== 'Completed').length}`, subtitle: '3 urgent', color: 'bg-warning' },
    { title: 'System Uptime', value: '99.8%', subtitle: 'Last 30 days', color: 'bg-success' },
  ];

  const criticalTickets = [
    { id: 'IT-001', title: 'Server down - Production', user: 'Engineering Team', priority: 'Critical', time: '15 min ago' },
    { id: 'IT-002', title: 'Network connectivity issues', user: 'Sales Team', priority: 'High', time: '1 hour ago' },
    { id: 'IT-003', title: 'Email server slow', user: 'Marketing', priority: 'High', time: '2 hours ago' },
  ];

  const assetAlerts = [
    { type: 'Low Stock', item: 'Laptops', count: '3 remaining', action: 'Order more' },
    { type: 'Expiring License', item: 'Adobe Creative Suite', count: '5 licenses', action: 'Renew' },
    { type: 'Maintenance Due', item: 'Network Equipment', count: '2 devices', action: 'Schedule' },
  ];

  const quickActions = [
    { title: 'Create Ticket', description: 'New support request', icon: '🎫' },
    { title: 'Asset Check-out', description: 'Assign device', icon: '📱' },
    { title: 'System Status', description: 'Check all systems', icon: '🖥️' },
    { title: 'Live Chat', description: 'Instant support', icon: '💬' },
  ];

  const recentActivities = [
    { action: 'Resolved ticket #IT-045', details: 'Password reset for John Doe', time: '30 min ago' },
    { action: 'Deployed software update', details: 'Antivirus definitions', time: '2 hours ago' },
    { action: 'Asset assigned', details: 'Laptop to new employee', time: '4 hours ago' },
    { action: 'System maintenance', details: 'Email server restart', time: '6 hours ago' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-destructive text-destructive-foreground';
      case 'High': return 'bg-warning text-warning-foreground';
      case 'Medium': return 'bg-primary text-primary-foreground';
      case 'Low': return 'bg-muted text-muted-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const handleTaskAction = (task) => {
    // Navigate based on task category
    switch (task.category) {
      case 'Infrastructure':
        navigate('/it/support');
        break;
      case 'Security':
        navigate('/it/support');
        break;
      case 'Hardware':
        navigate('/it/assets');
        break;
      case 'Network':
        navigate('/it/support');
        break;
      case 'Compliance':
        navigate('/it/software');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleQuickAction = (action) => {
    switch (action.title) {
      case 'Create Ticket':
        navigate('/it/support');
        break;
      case 'Asset Check-out':
        navigate('/it/assets');
        break;
      case 'System Status':
        navigate('/it/support');
        break;
      case 'Live Chat':
        navigate('/it/chat');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-warning text-warning-foreground rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">IT Dashboard</h1>
        <p className="text-warning-foreground/80 mb-4">
          Welcome back, {user?.name} • Information Technology
        </p>
        <div className="flex items-center space-x-4 text-sm">
          <span>Employee ID: {user?.employeeId}</span>
          <span>•</span>
          <span>Department: {user?.department}</span>
        </div>
      </div>

      {/* Current IT Tasks Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Current IT Tasks & Priorities</CardTitle>
          <Badge variant="outline">{currentTasks.filter(t => t.status !== 'Completed').length} Active Tasks</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentTasks.slice(0, 5).map((task) => (
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

      {/* IT Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {itStats.map((stat, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            if (stat.title === 'Open Tickets') navigate('/it/support');
            if (stat.title === 'Assets Tracked') navigate('/it/assets');
            if (stat.title === 'Current Tasks') navigate('/dashboard');
            if (stat.title === 'System Uptime') navigate('/it/support');
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
        {/* Critical Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-destructive">Critical Tickets</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/it/support')}>View Queue</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalTickets.map((ticket, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-sm">{ticket.title}</p>
                    <Badge variant={ticket.priority === 'Critical' ? 'destructive' : 'secondary'}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ticket.id} • {ticket.user} • {ticket.time}
                  </p>
                </div>
                <Button size="sm" onClick={() => navigate('/it/support')}>Respond</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Asset Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assetAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-sm">{alert.type}</p>
                    <Badge variant="outline">{alert.count}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.item}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => {
                  if (alert.type === 'Low Stock' || alert.type === 'Maintenance Due') {
                    navigate('/it/assets');
                  } else {
                    navigate('/it/software');
                  }
                }}>{alert.action}</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleQuickAction(action)}
            >
              <span className="text-2xl">{action.icon}</span>
              <div className="text-center">
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
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
                    {activity.details} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { system: 'Email Server', status: 'Operational', uptime: '99.9%' },
              { system: 'File Server', status: 'Operational', uptime: '99.8%' },
              { system: 'Database', status: 'Operational', uptime: '100%' },
              { system: 'Network', status: 'Minor Issues', uptime: '98.5%' },
            ].map((system, index) => (
              <div key={index} className="flex items-center justify-between cursor-pointer hover:bg-accent/50 p-2 rounded" onClick={() => navigate('/it/support')}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    system.status === 'Operational' ? 'bg-success' : 'bg-warning'
                  }`}></div>
                  <span className="text-sm font-medium">{system.system}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm">{system.status}</p>
                  <p className="text-xs text-muted-foreground">{system.uptime} uptime</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
