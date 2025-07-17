
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export function AddPermissionRuleDialog({ open, onOpenChange, onAdd }) {
  const { logAdminAction } = useAuth();
  const [formData, setFormData] = useState({
    role: '',
    feature: '',
    access: '',
    visible: true
  });

  const roles = ['admin', 'hr', 'it', 'employee'];
  const features = [
    'User Management', 'Portal Settings', 'Employee Directory', 'Leave Requests',
    'Asset Management', 'Profile', 'Timesheet', 'Support Tickets', 'Reports'
  ];
  const accessLevels = ['full', 'read-write', 'read-only', 'no-access'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.role && formData.feature && formData.access) {
      const newRule = {
        id: Date.now().toString(),
        ...formData
      };
      onAdd(newRule);
      logAdminAction('Permission Rule Added', { rule: newRule });
      setFormData({ role: '', feature: '', access: '', visible: true });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Permission Rule</DialogTitle>
          <DialogDescription>
            Create a new permission rule for a specific role and feature.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feature">Feature</Label>
            <Select value={formData.feature} onValueChange={(value) => setFormData({ ...formData, feature: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a feature" />
              </SelectTrigger>
              <SelectContent>
                {features.map((feature) => (
                  <SelectItem key={feature} value={feature}>
                    {feature}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access">Access Level</Label>
            <Select value={formData.access} onValueChange={(value) => setFormData({ ...formData, access: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                {accessLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level === 'read-write' ? 'Read/Write' : 
                     level === 'read-only' ? 'Read Only' :
                     level === 'no-access' ? 'No Access' : 'Full Access'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Rule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
