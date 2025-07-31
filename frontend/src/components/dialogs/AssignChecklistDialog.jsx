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
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [checklist, setChecklist] = useState(null);
  const [tasksPreview, setTasksPreview] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const { toast } = useToast();

  // ✅ Fetch departments when dialog opens
  useEffect(() => {
    if (!open) return;
    fetch("/onboarding/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data || []))
      .catch(() =>
        toast({ title: "Error", description: "Failed to fetch departments" })
      );
  }, [open]);

  // ✅ Fetch checklist for selected department
  useEffect(() => {
    if (!selectedDepartment) {
      setChecklist(null);
      setTasksPreview([]);
      return;
    }
    setLoadingTasks(true);
    fetch(`/onboarding/checklists/${selectedDepartment}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.checklistId) {
          setChecklist({
            id: Number(data.checklistId), // Ensure it's a number
            name: data.checklistName,
          });
        } else {
          setChecklist(null);
        }
        setTasksPreview(data.tasks || []);
      })
      .catch(() => {
        setChecklist(null);
        setTasksPreview([]);
      })
      .finally(() => setLoadingTasks(false));
  }, [selectedDepartment]);

  const handleAssign = async () => {
    if (!hireId || !checklist?.id) {
      toast({
        title: "Validation Error",
        description: "Please select a department with a valid checklist.",
      });
      return;
    }

    try {
      const res = await fetch(`/onboarding/newhires/${hireId}/assign_checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklistId: Number(checklist.id) }), // ✅ Convert to number
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to assign checklist");

      toast({
        title: "Success",
        description: `Assigned ${result.tasksAssigned} tasks from "${checklist.name}"!`,
      });

      if (onAssigned) onAssigned();
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

        {/* Department Dropdown */}
        <div className="space-y-2">
          <Label>Select Department</Label>
          <select
            className="w-full border rounded px-2 py-2"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">Select...</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Checklist Info */}
        {checklist && (
          <div className="mt-3 p-2 bg-muted rounded">
            <p className="text-sm">
              <strong>Checklist:</strong> {checklist.name}
            </p>
          </div>
        )}

        {/* Tasks Preview */}
        {selectedDepartment && (
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
                No tasks found for this department.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!checklist?.id}>
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}