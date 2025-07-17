
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquarePlus, User, Building, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function StartNewChatDialog({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeEmail: '',
    department: '',
    issue: '',
    priority: '',
    description: ''
  });
  const { toast } = useToast();

  const departments = [
    'Engineering',
    'Sales',
    'Marketing',
    'Design',
    'Finance',
    'HR',
    'Operations',
    'Support'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-success border-success' },
    { value: 'medium', label: 'Medium', color: 'text-warning border-warning' },
    { value: 'high', label: 'High', color: 'text-destructive border-destructive' },
    { value: 'critical', label: 'Critical', color: 'bg-destructive text-destructive-foreground' }
  ];

  const issueTypes = [
    'Login Problems',
    'Software Installation',
    'Network Issues',
    'Printer Problems',
    'Email Issues',
    'Hardware Malfunction',
    'Password Reset',
    'VPN Connection',
    'Security Issue',
    'Other'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.employeeName || !formData.employeeEmail || !formData.issue || !formData.priority) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically send the data to your backend
    console.log('Starting new chat with:', formData);
    
    toast({
      title: "Chat Started",
      description: `New chat initiated with ${formData.employeeName}`,
    });

    // Reset form and close dialog
    setFormData({
      employeeName: '',
      employeeEmail: '',
      department: '',
      issue: '',
      priority: '',
      description: ''
    });
    setIsOpen(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquarePlus className="h-5 w-5" />
            <span>Start New Chat</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-4 w-4" />
              <h3 className="font-medium">Employee Information</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeName">Employee Name *</Label>
                <Input
                  id="employeeName"
                  value={formData.employeeName}
                  onChange={(e) => handleInputChange('employeeName', e.target.value)}
                  placeholder="Enter employee name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employeeEmail">Email *</Label>
                <Input
                  id="employeeEmail"
                  type="email"
                  value={formData.employeeEmail}
                  onChange={(e) => handleInputChange('employeeEmail', e.target.value)}
                  placeholder="employee@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept.toLowerCase()}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Issue Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="h-4 w-4" />
              <h3 className="font-medium">Issue Details</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issue">Issue Type *</Label>
                <Select value={formData.issue} onValueChange={(value) => handleInputChange('issue', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypes.map((issue) => (
                      <SelectItem key={issue} value={issue.toLowerCase()}>
                        {issue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={priority.color}>
                            {priority.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide additional details about the issue..."
                rows={3}
              />
            </div>
          </div>

          {/* Chat Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="h-4 w-4" />
              <h3 className="font-medium">Chat Options</h3>
            </div>

            <div className="p-4 bg-accent rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Estimated Response Time</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.priority === 'critical' ? '< 5 minutes' :
                     formData.priority === 'high' ? '< 15 minutes' :
                     formData.priority === 'medium' ? '< 30 minutes' :
                     formData.priority === 'low' ? '< 2 hours' : 'Select priority'}
                  </p>
                </div>
                <Badge variant="outline" className="text-success border-success">
                  IT Support Online
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Start Chat
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
