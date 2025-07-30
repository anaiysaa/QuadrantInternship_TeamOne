import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export function ManageOnboardingDialog({ open, onOpenChange, candidate, refreshCandidates }) {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState(candidate?.onboardingStatus || 'In Progress');
  const { toast } = useToast();

  useEffect(() => {
    if (!candidate || !open) return;
    setStatus(candidate.onboardingStatus || 'In Progress');
  
    // Prefer the candidate's full saved checklist if present
    if (Array.isArray(candidate.checklistTasksStatus) && candidate.checklistTasksStatus.length > 0) {
      setTasks(candidate.checklistTasksStatus.map(task => ({
        id: task.itemId,
        name: task.taskDesc || task.name,
        completed: !!task.completed,
        isMandatory: !!task.isMandatory,
      })));
    } else {
      // fallback: load from department template if nothing assigned yet
      async function fetchTasks() {
        try {
          const res = await fetch(`/checklists/${candidate.department}`);
          if (!res.ok) throw new Error('Failed to fetch checklist tasks');
          const data = await res.json();
          setTasks(data.tasks.map(task => ({
            id: task.itemId,
            name: task.taskDesc,
            completed: false,
            isMandatory: !!task.isMandatory,
          })));
        } catch (error) {
          toast({ title: 'Error', description: error.message });
          setTasks([]);
        }
      }
      fetchTasks();
    }
  }, [candidate, open, toast]);
  
  

  const toggleTask = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleSave = async () => {
    if (!candidate) return;
    try {
      const tasksPayload = tasks.map(task => ({
        itemId: task.id,
        taskDesc: task.name, // match backend field
        completed: !!task.completed,
        isMandatory: !!task.isMandatory,
      }));
      
      const res = await fetch(`/onboarding/newhires/${candidate.id}/checkliststatus`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistStatus: status,
          tasks: tasksPayload,
        }),
      });
  
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update onboarding');
      }
  
      toast({ title: 'Success', description: 'Onboarding updated successfully.' });
      onOpenChange(false);
      refreshCandidates && refreshCandidates();
    } catch (error) {
      toast({ title: 'Error', description: error.message });
    }
  };
  
  
  const handleDelete = async () => {
    if (!candidate) return;
    if (!window.confirm(`Are you sure you want to delete ${candidate.name}?`)) return;

    try {
      const res = await fetch(`/onboarding/newhires/${candidate.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete hire');
      }

      toast({ title: 'Deleted', description: `${candidate.name} has been removed.` });
      onOpenChange(false);
      refreshCandidates && refreshCandidates();
    } catch (error) {
      toast({ title: 'Error', description: error.message });
    }
  };

  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Onboarding - {candidate.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus} id="status">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-medium">Tasks</Label>
            <div className="space-y-3 mt-2 max-h-60 overflow-y-auto">
              {tasks.length === 0 && (
                <div className="text-muted-foreground text-sm">No tasks for this checklist.</div>
              )}
              {tasks.map(task => (
                <div key={task.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={!!task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <Label
                    htmlFor={`task-${task.id}`}
                    className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {task.name}{task.isMandatory ? ' *' : ''}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            Delete Hire
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
