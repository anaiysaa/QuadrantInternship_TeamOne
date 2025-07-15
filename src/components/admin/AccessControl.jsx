import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lock, Shield, Eye, EyeOff, Plus } from 'lucide-react';
import { AddPermissionRuleDialog } from '@/components/dialogs/AddPermissionRuleDialog';
import { RoleTemplatesDialog } from '@/components/dialogs/RoleTemplatesDialog';

export function AccessControl() {
  const [permissions, setPermissions] = useState([
    { id: '1', role: 'admin', feature: 'User Management', access: 'full', visible: true },
    { id: '2', role: 'admin', feature: 'Portal Settings', access: 'full', visible: true },
    { id: '3', role: 'hr', feature: 'Employee Directory', access: 'read-write', visible: true },
    { id: '4', role: 'hr', feature: 'Leave Requests', access: 'read-write', visible: true },
    { id: '5', role: 'it', feature: 'Asset Management', access: 'read-write', visible: true },
    { id: '6', role: 'employee', feature: 'Profile', access: 'read-write', visible: true },
    { id: '7', role: 'employee', feature: 'Timesheet', access: 'read-write', visible: true },
  ]);

  const [showAddRuleDialog, setShowAddRuleDialog] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);

  const toggleVisibility = (id) => {
    setPermissions(permissions.map(perm => 
      perm.id === id ? { ...perm, visible: !perm.visible } : perm
    ));
  };

  const changeAccess = (id, newAccess) => {
    setPermissions(permissions.map(perm => 
      perm.id === id ? { ...perm, access: newAccess } : perm
    ));
  };

  const addPermissionRule = (newRule) => {
    setPermissions([...permissions, newRule]);
  };

  const applyRoleTemplate = (template) => {
    const newPermissions = template.permissions.map(perm => ({
      id: Date.now().toString() + Math.random(),
      role: template.id.replace('-template', ''),
      feature: perm.feature,
      access: perm.access,
      visible: true
    }));
    setPermissions([...permissions, ...newPermissions]);
  };

  const getAccessBadge = (access) => {
    switch (access) {
      case 'full': return <Badge className="bg-red-100 text-red-800">Full Access</Badge>;
      case 'read-write': return <Badge className="bg-blue-100 text-blue-800">Read/Write</Badge>;
      case 'read-only': return <Badge className="bg-yellow-100 text-yellow-800">Read Only</Badge>;
      default: return <Badge variant="secondary">No Access</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case 'hr': return <Badge className="bg-blue-100 text-blue-800">HR</Badge>;
      case 'it': return <Badge className="bg-green-100 text-green-800">IT</Badge>;
      default: return <Badge className="bg-purple-100 text-purple-800">Employee</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Access Control
          </CardTitle>
          <CardDescription>
            Manage role-based permissions and feature visibility across portals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <Button onClick={() => setShowAddRuleDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Permission Rule
            </Button>
            <Button variant="outline" onClick={() => setShowTemplatesDialog(true)}>
              <Shield className="h-4 w-4 mr-2" />
              Role Templates
            </Button>
          </div>

          {/* Permissions Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Feature</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>
                    {getRoleBadge(permission.role)}
                  </TableCell>
                  <TableCell className="font-medium">{permission.feature}</TableCell>
                  <TableCell>
                    {getAccessBadge(permission.access)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility(permission.id)}
                      className="p-1"
                    >
                      {permission.visible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant={permission.access === 'full' ? 'default' : 'outline'}
                        onClick={() => changeAccess(permission.id, 'full')}
                      >
                        Full
                      </Button>
                      <Button 
                        size="sm" 
                        variant={permission.access === 'read-write' ? 'default' : 'outline'}
                        onClick={() => changeAccess(permission.id, 'read-write')}
                      >
                        R/W
                      </Button>
                      <Button 
                        size="sm" 
                        variant={permission.access === 'read-only' ? 'default' : 'outline'}
                        onClick={() => changeAccess(permission.id, 'read-only')}
                      >
                        Read
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Permission Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-sm text-muted-foreground">Admin Roles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2</div>
              <div className="text-sm text-muted-foreground">HR Permissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1</div>
              <div className="text-sm text-muted-foreground">IT Permissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2</div>
              <div className="text-sm text-muted-foreground">Employee Access</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddPermissionRuleDialog
        open={showAddRuleDialog}
        onOpenChange={setShowAddRuleDialog}
        onAdd={addPermissionRule}
      />
      <RoleTemplatesDialog
        open={showTemplatesDialog}
        onOpenChange={setShowTemplatesDialog}
        onApplyTemplate={applyRoleTemplate}
      />
    </>
  );
}
