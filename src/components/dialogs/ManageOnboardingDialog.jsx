
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export function ManageOnboardingDialog({ open, onOpenChange, candidate }) {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Complete HR documentation', completed: true },
    { id: 2, name: 'IT setup and account creation', completed: true },
    { id: 3, name: 'Office tour and introductions', completed: false },
    { id: 4, name: 'Department-specific training', completed: false },
    { id: 5, name: 'Meet with direct manager', completed: false },
  ]);
  const [status, setStatus] = useState(candidate?.status || 'In Progress');
  const { toast } = useToast();

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleSave = () => {
    console.log('Updating onboarding for:', candidate?.id, { tasks, status });
    toast({
      title: "Onboarding Updated",
      description: `${candidate?.name}'s onboarding has been updated.`,
    });
    onOpenChange(false);
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
            <Select value={status} onValueChange={setStatus}>
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
            <div className="space-y-3 mt-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <Label
                    htmlFor={`task-${task.id}`}
                    className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {task.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
