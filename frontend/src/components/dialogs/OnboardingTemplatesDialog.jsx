
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function OnboardingTemplatesDialog({ open, onOpenChange }) {
  const [templates, setTemplates] = useState([
    {
      id: 'T001',
      name: 'Engineering Onboarding',
      description: 'Complete onboarding checklist for engineering roles',
      department: 'Engineering',
      tasks: 12,
      status: 'Active',
      lastModified: '2024-01-15'
    },
    {
      id: 'T002',
      name: 'Sales Onboarding',
      description: 'Sales team specific onboarding process',
      department: 'Sales',
      tasks: 10,
      status: 'Active',
      lastModified: '2024-01-12'
    },
    {
      id: 'T003',
      name: 'Marketing Onboarding',
      description: 'Marketing department onboarding template',
      department: 'Marketing',
      tasks: 8,
      status: 'Draft',
      lastModified: '2024-01-10'
    }
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    tasks: []
  });
  const { toast } = useToast();

  const handleCreate = () => {
    setFormData({ name: '', description: '', department: '', tasks: [] });
    setEditingTemplate(null);
    setShowCreateForm(true);
  };

  const handleEdit = (template) => {
    setFormData({
      name: template.name,
      description: template.description,
      department: template.department,
      tasks: []
    });
    setEditingTemplate(template);
    setShowCreateForm(true);
  };

  const handleDelete = (templateId) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toast({
      title: "Template Deleted",
      description: "Onboarding template has been removed.",
    });
  };

  const handleDuplicate = (template) => {
    const newTemplate = {
      ...template,
      id: `T${String(templates.length + 1).padStart(3, '0')}`,
      name: `${template.name} (Copy)`,
      status: 'Draft'
    };
    setTemplates([...templates, newTemplate]);
    toast({
      title: "Template Duplicated",
      description: "Template has been copied successfully.",
    });
  };

  const handleSave = () => {
    if (editingTemplate) {
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, ...formData, lastModified: new Date().toISOString().split('T')[0] }
          : t
      ));
      toast({
        title: "Template Updated",
        description: "Onboarding template has been updated.",
      });
    } else {
      const newTemplate = {
        id: `T${String(templates.length + 1).padStart(3, '0')}`,
        ...formData,
        tasks: 5,
        status: 'Draft',
        lastModified: new Date().toISOString().split('T')[0]
      };
      setTemplates([...templates, newTemplate]);
      toast({
        title: "Template Created",
        description: "New onboarding template has been created.",
      });
    }
    setShowCreateForm(false);
  };

  if (showCreateForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Engineering Onboarding"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the onboarding process..."
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
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Onboarding Templates
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{template.department}</TableCell>
                  <TableCell>{template.tasks}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      template.status === 'Active' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {template.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{template.lastModified}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDuplicate(template)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
