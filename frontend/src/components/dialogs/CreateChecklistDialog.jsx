
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

export function CreateChecklistDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    tasks: ['']
  });
  const { toast } = useToast();

  const addTask = () => {
    setFormData({...formData, tasks: [...formData.tasks, '']});
  };

  const removeTask = (index) => {
    const newTasks = formData.tasks.filter((_, i) => i !== index);
    setFormData({...formData, tasks: newTasks});
  };

  const updateTask = (index, value) => {
    const newTasks = [...formData.tasks];
    newTasks[index] = value;
    setFormData({...formData, tasks: newTasks});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Creating checklist:', formData);
    toast({
      title: "Checklist Created",
      description: `${formData.name} checklist has been created.`,
    });
    onOpenChange(false);
    setFormData({
      name: '',
      description: '',
      department: '',
      tasks: ['']
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Onboarding Checklist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Checklist Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Engineering Onboarding"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Comprehensive onboarding checklist for new engineering hires"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Tasks</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTask}>
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </div>
            <div className="space-y-2">
              {formData.tasks.map((task, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={task}
                    onChange={(e) => updateTask(index, e.target.value)}
                    placeholder={`Task ${index + 1}`}
                    required
                  />
                  {formData.tasks.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeTask(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Checklist</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
