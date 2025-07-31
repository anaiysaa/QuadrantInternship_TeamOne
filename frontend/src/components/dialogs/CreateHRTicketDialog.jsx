
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export function CreateHRTicketDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    title: '',
    employee: '',
    category: '',
    priority: '',
    description: '',
    anonymous: false
  });
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Creating HR ticket:', formData);
    toast({
      title: "Ticket Created",
      description: `HR ticket "${formData.title}" has been created successfully.`,
    });
    onOpenChange(false);
    setFormData({
      title: '',
      employee: '',
      category: '',
      priority: '',
      description: '',
      anonymous: false
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create HR Ticket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee">Employee</Label>
              <Input
                id="employee"
                value={formData.employee}
                onChange={(e) => setFormData({...formData, employee: e.target.value})}
                placeholder="Employee name or 'Anonymous'"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detailed description of the issue or request"
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Ticket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
