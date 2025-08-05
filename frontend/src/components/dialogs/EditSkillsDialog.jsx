import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { X, Plus } from 'lucide-react';

export function EditSkillsDialog({ open, onOpenChange, employeeId, onUpdated }) {
  const { toast } = useToast();
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (open && employeeId) {
      fetch(`/resume/employees/${employeeId}`)
        .then(res => res.json())
        .then(data => {
          const s = Array.isArray(data.skills)
            ? data.skills
            : typeof data.skills === "string"
            ? data.skills.split(",")
            : [];
          setSkills(s.map(skill => skill.trim()));
        });
    }
  }, [open, employeeId]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`/resume/employees/${employeeId}/update-skills`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills }),
    });

    if (res.ok) {
      toast({ title: 'Skills Updated', description: 'Your skills have been saved.' });
      onOpenChange(false);
      onUpdated?.();
    } else {
      toast({ title: 'Error', description: 'Failed to update skills.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Skills</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newSkill">Add New Skill</Label>
            <div className="flex gap-2">
              <Input
                id="newSkill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="e.g. Python, Communication"
              />
              <Button type="button" onClick={handleAddSkill} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Skills</Label>
            <div className="flex flex-wrap gap-2 min-h-[100px] p-3 border rounded-md">
              {skills.length === 0 ? (
                <p className="text-muted-foreground text-sm">No skills added yet.</p>
              ) : (
                skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Skills</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
