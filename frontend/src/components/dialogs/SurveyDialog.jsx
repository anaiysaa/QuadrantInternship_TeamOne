
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export function SurveyDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    type: '',
    questions: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Survey Created",
        description: "Employee feedback survey has been created and sent successfully.",
      });
      setFormData({
        title: '',
        description: '',
        department: '',
        type: '',
        questions: ''
      });
      setLoading(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Employee Survey</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Survey Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Q1 Employee Satisfaction Survey"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Survey Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select survey type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="satisfaction">Employee Satisfaction</SelectItem>
                  <SelectItem value="engagement">Employee Engagement</SelectItem>
                  <SelectItem value="pulse">Pulse Survey</SelectItem>
                  <SelectItem value="exit">Exit Interview</SelectItem>
                  <SelectItem value="360">360 Feedback</SelectItem>
                  <SelectItem value="custom">Custom Survey</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the survey purpose..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Target Department</Label>
            <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="design">Design</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="questions">Survey Questions</Label>
            <Textarea
              id="questions"
              value={formData.questions}
              onChange={(e) => setFormData(prev => ({ ...prev, questions: e.target.value }))}
              placeholder="Enter survey questions (one per line)..."
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create & Send Survey'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
