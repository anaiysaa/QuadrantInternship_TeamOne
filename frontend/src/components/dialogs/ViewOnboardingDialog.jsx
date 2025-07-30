import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ViewOnboardingDialog({ open, onOpenChange, candidate, refreshCandidates }) {
  const { toast } = useToast();
  const [newTask, setNewTask] = useState("");

  if (!candidate) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Not Started":
        return (
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground">
            Not Started
          </Badge>
        );
      case "Pending":
        return <Badge variant="outline" className="text-warning border-warning">Pending</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="text-primary border-primary">In Progress</Badge>;
      case "Completed":
        return (
          <Badge variant="default" className="bg-success text-success-foreground">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  const completedTasksCount = candidate.checklistTasksStatus
    ? candidate.checklistTasksStatus.filter((t) => t.completed).length
    : 0;

  const totalTasksCount = candidate.checklistTasksStatus
    ? candidate.checklistTasksStatus.length
    : 0;

  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    try {
      const res = await fetch(`/onboarding/newhires/${candidate.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: Date.now(),
          taskDesc: newTask,
          isMandatory: false,
        }),
      });

      if (!res.ok) throw new Error("Failed to add task");
      toast({ title: "Success", description: "Task added successfully!" });
      setNewTask("");
      if (refreshCandidates) await refreshCandidates();
    } catch (err) {
      toast({ title: "Error", description: err.message });
    }
  };

  const handleToggleTask = async (index) => {
    const updatedTasks = [...candidate.checklistTasksStatus];
    updatedTasks[index].completed = !updatedTasks[index].completed;

    try {
      const res = await fetch(`/onboarding/newhires/${candidate.id}/checkliststatus`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklistStatus: candidate.onboardingStatus,
          tasks: updatedTasks,
        }),
      });

      if (!res.ok) throw new Error("Failed to update task status");
      if (refreshCandidates) await refreshCandidates();
    } catch (err) {
      toast({ title: "Error", description: err.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Onboarding Details - {candidate.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4">
            <div><h4 className="font-medium text-sm text-muted-foreground">Position</h4><p className="text-sm">{candidate.role || "-"}</p></div>
            <div><h4 className="font-medium text-sm text-muted-foreground">Department</h4><p className="text-sm">{candidate.department || "-"}</p></div>
            <div><h4 className="font-medium text-sm text-muted-foreground">Start Date</h4><p className="text-sm">{candidate.dateJoined ? new Date(candidate.dateJoined).toLocaleDateString() : "-"}</p></div>
            <div><h4 className="font-medium text-sm text-muted-foreground">Manager</h4><p className="text-sm">{candidate.managerName || "-"}</p></div>
            <div><h4 className="font-medium text-sm text-muted-foreground">Email</h4><p className="text-sm">{candidate.email || "-"}</p></div>
            <div><h4 className="font-medium text-sm text-muted-foreground">Status</h4>{getStatusBadge(candidate.onboardingStatus)}</div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-muted-foreground">Progress</h4>
              <span className="text-sm font-medium">
                {totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}%
              </span>
            </div>
            <Progress value={totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasksCount} of {totalTasksCount} tasks completed
            </p>
          </div>

          {/* Tasks */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Tasks</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {candidate.checklistTasksStatus?.map((t, i) => (
                <div key={t.itemId} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => handleToggleTask(i)}
                  />
                  <span className={t.completed ? "line-through text-muted-foreground" : ""}>
                    {t.taskDesc || "Untitled Task"}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Task */}
            <div className="flex gap-2 mt-3">
              <Input placeholder="Enter new task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} />
              <Button onClick={handleAddTask}>Add Task</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
