import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function ViewOnboardingDialog({ open, onOpenChange, candidate }) {
  if (!candidate) return null;

  // ✅ Calculate progress from checklistTasksStatus
  const tasks = Array.isArray(candidate.checklistTasksStatus)
    ? candidate.checklistTasksStatus
    : [];

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Not Started":
        return (
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground">
            Not Started
          </Badge>
        );
      case "Pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="text-blue-600 border-blue-600">In Progress</Badge>;
      case "Completed":
        return <Badge variant="default" className="bg-green-600 text-white">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Onboarding Details - {candidate.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ✅ Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Position</h4>
              <p className="text-sm">{candidate.role}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Department</h4>
              <p className="text-sm">{candidate.department || "-"}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Start Date</h4>
              <p className="text-sm">
                {candidate.dateJoined ? new Date(candidate.dateJoined).toLocaleDateString() : "-"}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Manager ID</h4>
              <p className="text-sm">{candidate.managerId || "-"}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Email</h4>
              <p className="text-sm">{candidate.email}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
              {getStatusBadge(candidate.onboardingStatus)}
            </div>
          </div>

          {/* ✅ Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-muted-foreground">Progress</h4>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>

          {/* ✅ (Optional) Recent Activity - Replace with real logs if available */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Recent Activity</h4>
            <div className="space-y-2">
              {tasks.slice(0, 3).map((task, i) => (
                <div key={i} className="text-sm p-2 bg-muted rounded">
                  {task.completed ? "✅" : "🔄"} {task.taskDesc}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
