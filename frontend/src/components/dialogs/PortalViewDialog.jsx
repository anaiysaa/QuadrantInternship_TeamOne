
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, Calendar, Settings } from 'lucide-react';

export function PortalViewDialog({ open, onOpenChange, portal }) {
  if (!portal) return null;

  const getPortalDetails = (portalName) => {
    switch (portalName) {
      case 'Employee Portal':
        return {
          features: ['Profile Management', 'Leave Requests', 'Timesheet', 'Performance Hub', 'Learning Center'],
          stats: { activeUsers: 245, dailyLogins: 89, avgSessionTime: '24 min' },
          recentActivity: [
            'John Doe submitted leave request',
            'Sarah Wilson updated profile',
            'Mike Johnson completed training'
          ]
        };
      case 'HR Portal':
        return {
          features: ['Employee Directory', 'Leave Management', 'Onboarding', 'Payroll', 'Reports'],
          stats: { activeUsers: 12, dailyLogins: 8, avgSessionTime: '45 min' },
          recentActivity: [
            'HR approved 3 leave requests',
            'New employee onboarding started',
            'Payroll processing completed'
          ]
        };
      case 'IT Portal':
        return {
          features: ['Asset Management', 'Support Queue', 'Inventory', 'Knowledge Base', 'Software Center'],
          stats: { activeUsers: 8, dailyLogins: 6, avgSessionTime: '38 min' },
          recentActivity: [
            'Resolved 5 support tickets',
            'Updated asset inventory',
            'Software license renewed'
          ]
        };
      default:
        return {
          features: [],
          stats: { activeUsers: 0, dailyLogins: 0, avgSessionTime: '0 min' },
          recentActivity: []
        };
    }
  };

  const details = getPortalDetails(portal.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${portal.color}`}>
              <portal.icon className="h-5 w-5" />
            </div>
            {portal.name} Details
          </DialogTitle>
          <DialogDescription>
            Detailed information and metrics for the {portal.name}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Portal Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Active Users</span>
                </div>
                <div className="text-2xl font-bold">{details.stats.activeUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Daily Logins</span>
                </div>
                <div className="text-2xl font-bold">{details.stats.dailyLogins}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Avg Session</span>
                </div>
                <div className="text-2xl font-bold">{details.stats.avgSessionTime}</div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Available Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {details.features.map((feature, index) => (
                  <Badge key={index} variant="outline">{feature}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {details.recentActivity.map((activity, index) => (
                  <div key={index} className="text-sm p-2 bg-muted rounded">
                    {activity}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
