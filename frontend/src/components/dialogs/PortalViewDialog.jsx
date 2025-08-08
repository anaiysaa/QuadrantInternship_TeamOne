
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, Calendar, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const handleGetEmployeeCount = async () => {
    console.log('Fetching employee count');
    const response = await axios.get(`http://localhost:8000/api/employees/count`)
    console.log('employee count recivied', response.data);

    return response.data;
  }

export function PortalViewDialog({ open, onOpenChange, portal }) {
  if (!portal) return null;

  const [employeeCounts, setEmployeeCounts] = useState({
      all: 100,
      HR: 0,
      IT: 0
    });
  
    useEffect(() => {
    const fetchEmployeeCount = async () => {
      const countData = await handleGetEmployeeCount();
      setEmployeeCounts({
        all: countData['All'],
        HR: countData['HR'],
        IT: countData['IT']
      });
    };
    
    fetchEmployeeCount();
  }, []);

  const getPortalDetails = (portalName) => {
    switch (portalName) {
      case 'Employee Portal':
        return {
          features: ['Dashboard',
    'Profile',
    'Leave Management',
    'Timesheet',
    'Performance Hub',
    'Career Portal',
    'Feedback',
    'Support Tickets',
    'Resources',
    'Learning (LMS)',
    'Live Chat'],
          stats: { activeUsers: employeeCounts.all, dailyLogins: 89},
          recentActivity: [
            'John Doe submitted leave request',
            'Sarah Wilson updated profile',
            'Mike Johnson completed training'
          ]
        };
      case 'HR Portal':
        return {
          features: ['HR Dashboard',
    'Leave Requests',
    'Timesheets',
    'Employee Directory',
    'Onboarding',
    'HR Tickets',
    'Feedback Center',
    'Career Portal',
    'Payroll',
    'Org Chart',
    'Live Chat',
    'Content Management'],
          stats: { activeUsers: employeeCounts.HR, dailyLogins: 8},
          recentActivity: [
            'HR approved 3 leave requests',
            'New employee onboarding started',
            'Payroll processing completed'
          ]
        };
      case 'IT Portal':
        return {
          features: [    'IT Dashboard',
    'Support Queue',
    'Asset Management',
    'Inventory',
    'Live Chat',
    'Knowledge Base',
    'Software Center'],
          stats: { activeUsers: employeeCounts.IT, dailyLogins: 6},
          recentActivity: [
            'Resolved 5 support tickets',
            'Updated asset inventory',
            'Software license renewed'
          ]
        };
      default:
        return {
          features: [],
          stats: { activeUsers: 0, dailyLogins: 0},
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
