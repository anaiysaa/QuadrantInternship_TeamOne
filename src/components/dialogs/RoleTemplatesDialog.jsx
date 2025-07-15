
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Users, HardDrive, User } from 'lucide-react';

export function RoleTemplatesDialog({ open, onOpenChange, onApplyTemplate }) {
  const { logAdminAction } = useAuth();

  const roleTemplates = [
    {
      id: 'admin-template',
      name: 'Admin Template',
      description: 'Full access to all system features and portals',
      icon: Shield,
      color: 'bg-red-100 text-red-800',
      permissions: [
        { feature: 'User Management', access: 'full' },
        { feature: 'Portal Settings', access: 'full' },
        { feature: 'Access Control', access: 'full' },
        { feature: 'System Analytics', access: 'full' },
        { feature: 'Activity Logs', access: 'full' }
      ]
    },
    {
      id: 'hr-template',
      name: 'HR Template',
      description: 'Access to employee management and HR functions',
      icon: Users,
      color: 'bg-blue-100 text-blue-800',
      permissions: [
        { feature: 'Employee Directory', access: 'read-write' },
        { feature: 'Leave Requests', access: 'read-write' },
        { feature: 'Timesheets', access: 'read-write' },
        { feature: 'Onboarding', access: 'read-write' },
        { feature: 'Payroll', access: 'read-write' }
      ]
    },
    {
      id: 'it-template',
      name: 'IT Template',
      description: 'Access to technical systems and asset management',
      icon: HardDrive,
      color: 'bg-green-100 text-green-800',
      permissions: [
        { feature: 'Asset Management', access: 'read-write' },
        { feature: 'Support Queue', access: 'read-write' },
        { feature: 'Inventory', access: 'read-write' },
        { feature: 'Knowledge Base', access: 'read-write' },
        { feature: 'Software Center', access: 'read-write' }
      ]
    },
    {
      id: 'employee-template',
      name: 'Employee Template',
      description: 'Standard employee access to personal features',
      icon: User,
      color: 'bg-purple-100 text-purple-800',
      permissions: [
        { feature: 'Profile', access: 'read-write' },
        { feature: 'Timesheet', access: 'read-write' },
        { feature: 'Leave Management', access: 'read-write' },
        { feature: 'Support Tickets', access: 'read-write' },
        { feature: 'Learning (LMS)', access: 'read-only' }
      ]
    }
  ];

  const handleApplyTemplate = (template) => {
    onApplyTemplate(template);
    logAdminAction('Role Template Applied', { template: template.name });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Role Templates</DialogTitle>
          <DialogDescription>
            Choose from predefined role templates to quickly set up permissions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roleTemplates.map((template) => (
            <Card key={template.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${template.color}`}>
                    <template.icon className="h-5 w-5" />
                  </div>
                  {template.name}
                </CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Included Permissions:</h4>
                  <div className="space-y-1">
                    {template.permissions.map((perm, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{perm.feature}</span>
                        <Badge variant="outline" className="text-xs">
                          {perm.access === 'read-write' ? 'R/W' : 
                           perm.access === 'read-only' ? 'Read' : 'Full'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={() => handleApplyTemplate(template)}
                  className="w-full"
                  size="sm"
                >
                  Apply Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
