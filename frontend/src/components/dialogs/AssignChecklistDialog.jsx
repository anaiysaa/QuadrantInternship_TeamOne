import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function AssignChecklistDialog({ open, onOpenChange, hireId, onAssigned }) {
  const [departments, setDepartments] = useState([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState("");
  const [tasksPreview, setTasksPreview] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const { toast } = useToast();

  // ✅ Fetch available checklists (departments)
  useEffect(() => {
    if (!open) return;
    fetch("/onboarding/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data || []))
      .catch(() =>
        toast({ title: "Error", description: "Failed to fetch checklists" })
      );
  }, [open]);

  // ✅ Fetch tasks for selected checklist
  useEffect(() => {
    if (!selectedChecklistId) {
      setTasksPreview([]);
      return;
    }
    setLoadingTasks(true);
    fetch(`/onboarding/checklists/${selectedChecklistId}`) // ✅ FIXED PATH
      .then((res) => res.json())
      .then((data) => setTasksPreview(data.tasks || []))
      .catch(() => setTasksPreview([]))
      .finally(() => setLoadingTasks(false));
  }, [selectedChecklistId]);

  const handleAssign = async () => {
    if (!hireId || !selectedChecklistId) {
      toast({
        title: "Validation Error",
        description: "Please select a checklist.",
      });
      return;
    }

    try {
      const res = await fetch(
        `/onboarding/newhires/${hireId}/assign_checklist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checklistId: Number(selectedChecklistId) }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to assign checklist");

      toast({
        title: "Success",
        description: `Assigned ${result.tasksAssigned} tasks!`,
      });

      onAssigned && onAssigned();
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Error", description: err.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Checklist</DialogTitle>
        </DialogHeader>

        {/* Checklist Dropdown */}
        <div className="space-y-2">
          <Label>Select Checklist</Label>
          <select
            className="w-full border rounded px-2 py-2"
            value={selectedChecklistId}
            onChange={(e) => setSelectedChecklistId(e.target.value)}
          >
            <option value="">Select...</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tasks Preview */}
        {selectedChecklistId && (
          <div className="mt-3 p-2 bg-muted rounded">
            {loadingTasks ? (
              <p>Loading tasks...</p>
            ) : tasksPreview.length > 0 ? (
              <ul className="list-disc ml-6">
                {tasksPreview.map((task) => (
                  <li key={task.itemId}>
                    {task.taskDesc}{" "}
                    {task.isMandatory && (
                      <span className="text-xs text-red-500">(mandatory)</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                No tasks found for this checklist.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedChecklistId}>
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
