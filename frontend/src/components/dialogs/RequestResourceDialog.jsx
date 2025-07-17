
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Send, Plus, X } from 'lucide-react';

export function RequestResourceDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    type: '',
    description: '',
    justification: '',
    priority: 'Medium'
  });

  const categories = ['Hardware', 'Software', 'Network', 'Security', 'Mobile', 'Other'];
  const types = ['Manual', 'Guide', 'Troubleshooting', 'Policy', 'Tutorial', 'Reference'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the request to your backend
    console.log('Resource request submitted:', formData);
    
    // Reset form and close dialog
    setFormData({
      title: '',
      category: '',
      type: '',
      description: '',
      justification: '',
      priority: 'Medium'
    });
    onOpenChange(false);
    
    // Show success message (you could use toast here)
    alert('Resource request submitted successfully!');
  };

  const isFormValid = formData.title && formData.category && formData.description;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Request New Resource</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resource Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Resource Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter the title of the requested resource"
              required
            />
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Resource Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select Type</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority Level</Label>
            <div className="flex space-x-2">
              {priorities.map(priority => (
                <Button
                  key={priority}
                  type="button"
                  variant={formData.priority === priority ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('priority', priority)}
                  className="h-8"
                >
                  {priority}
                </Button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Resource Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what the resource should contain and how it will be used"
              rows={4}
              required
            />
          </div>

          {/* Justification */}
          <div className="space-y-2">
            <Label htmlFor="justification">Business Justification</Label>
            <Textarea
              id="justification"
              value={formData.justification}
              onChange={(e) => handleInputChange('justification', e.target.value)}
              placeholder="Explain why this resource is needed and how it will benefit the organization"
              rows={3}
            />
          </div>

          {/* Form Summary */}
          {isFormValid && (
            <div className="bg-accent rounded-lg p-4">
              <h4 className="font-semibold mb-2">Request Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Title:</span>
                  <span>{formData.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Category:</span>
                  <Badge variant="outline">{formData.category}</Badge>
                </div>
                {formData.type && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Type:</span>
                    <Badge variant="secondary">{formData.type}</Badge>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Priority:</span>
                  <Badge variant={formData.priority === 'High' || formData.priority === 'Urgent' ? 'destructive' : 'secondary'}>
                    {formData.priority}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-4 border-t">
            <Button type="submit" disabled={!isFormValid} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
