
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function ViewOnboardingDialog({ open, onOpenChange, candidate }) {
  if (!candidate) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Not Started':
        return <Badge variant="outline" className="text-muted-foreground border-muted-foreground">Not Started</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="text-warning border-warning">Pending</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="text-primary border-primary">In Progress</Badge>;
      case 'Completed':
        return <Badge variant="default" className="bg-success text-success-foreground">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Onboarding Details - {candidate.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Position</h4>
              <p className="text-sm">{candidate.position}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Department</h4>
              <p className="text-sm">{candidate.department}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Start Date</h4>
              <p className="text-sm">{new Date(candidate.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Manager</h4>
              <p className="text-sm">{candidate.manager}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Email</h4>
              <p className="text-sm">{candidate.email}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
              {getStatusBadge(candidate.status)}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-muted-foreground">Progress</h4>
              <span className="text-sm font-medium">{candidate.progress}%</span>
            </div>
            <Progress value={candidate.progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {candidate.tasks.completed} of {candidate.tasks.total} tasks completed
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Recent Activity</h4>
            <div className="space-y-2">
              <div className="text-sm p-2 bg-muted rounded">
                ✅ Completed IT setup and account creation
              </div>
              <div className="text-sm p-2 bg-muted rounded">
                ✅ Attended HR orientation session
              </div>
              <div className="text-sm p-2 bg-muted rounded">
                🔄 In progress: Department-specific training
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
