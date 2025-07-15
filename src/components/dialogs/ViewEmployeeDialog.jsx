
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function ViewEmployeeDialog({ open, onOpenChange, employee }) {
  if (!employee) return null;

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'Engineering': return 'bg-primary text-primary-foreground';
      case 'HR': return 'bg-success text-success-foreground';
      case 'Marketing': return 'bg-warning text-warning-foreground';
      case 'Sales': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{employee.name}</h3>
              <p className="text-muted-foreground">{employee.id}</p>
              <Badge className={getDepartmentColor(employee.department)}>
                {employee.department}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Position</h4>
              <p className="text-sm">{employee.position}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Manager</h4>
              <p className="text-sm">{employee.manager}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Email</h4>
              <p className="text-sm">{employee.email}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Phone</h4>
              <p className="text-sm">{employee.phone}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Join Date</h4>
              <p className="text-sm">{new Date(employee.joinDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
              <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
                {employee.status}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
