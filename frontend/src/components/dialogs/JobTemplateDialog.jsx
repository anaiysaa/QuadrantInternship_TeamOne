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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function JobTemplateDialog({ open, onOpenChange }) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customTemplate, setCustomTemplate] = useState({
    name: '',
    department: '',
    level: '',
    description: '',
    requirements: ''
  });
  const { toast } = useToast();

  const templates = [
    { id: 'frontend-dev', name: 'Frontend Developer', department: 'Engineering', level: 'Mid-level' },
    { id: 'backend-dev', name: 'Backend Developer', department: 'Engineering', level: 'Senior' },
    { id: 'product-manager', name: 'Product Manager', department: 'Product', level: 'Mid-level' },
    { id: 'designer', name: 'UX/UI Designer', department: 'Design', level: 'Mid-level' },
    { id: 'sales-rep', name: 'Sales Representative', department: 'Sales', level: 'Entry-level' }
  ];

  const handleUseTemplate = (template) => {
    toast({
      title: "Template Selected",
      description: `${template.name} template has been loaded for job creation.`,
    });
    onOpenChange(false);
  };

  const handleCreateTemplate = (e) => {
    e.preventDefault();
    toast({
      title: "Template Created",
      description: `New job template "${customTemplate.name}" has been saved successfully.`,
    });
    setCustomTemplate({ name: '', department: '', level: '', description: '', requirements: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Templates</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Existing Templates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Templates</h3>
            <div className="space-y-3">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge variant="outline">{template.level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{template.department}</p>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleUseTemplate(template)}>
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create New Template */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Create New Template</h3>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={customTemplate.name}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-dept">Department</Label>
                  <Select value={customTemplate.department} onValueChange={(value) => setCustomTemplate(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-level">Level</Label>
                  <Select value={customTemplate.level} onValueChange={(value) => setCustomTemplate(prev => ({ ...prev, level: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry-level">Entry-level</SelectItem>
                      <SelectItem value="mid-level">Mid-level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-desc">Job Description Template</Label>
                <Textarea
                  id="template-desc"
                  value={customTemplate.description}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Standard job description template..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-req">Requirements Template</Label>
                <Textarea
                  id="template-req"
                  value={customTemplate.requirements}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="Standard requirements (one per line)..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full">
                Create Template
              </Button>
            </form>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
