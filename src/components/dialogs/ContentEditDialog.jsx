
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MessageSquare, HelpCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ContentEditDialog({ content, open, onOpenChange, onSave }) {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    portal: content?.portal || 'all',
    status: content?.status || 'draft',
    content: content?.content || '',
  });
  const { toast } = useToast();

  if (!content) return null;

  const getContentIcon = (type) => {
    switch (type) {
      case 'announcements': return MessageSquare;
      case 'faqs': return HelpCircle;
      case 'widgets': return FileText;
      default: return FileText;
    }
  };

  const ContentIcon = getContentIcon(content.type);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const updatedContent = {
      ...content,
      ...formData,
      lastModified: new Date().toISOString().split('T')[0],
    };
    
    onSave?.(updatedContent);
    
    toast({
      title: "Content Updated",
      description: `"${formData.title}" has been successfully updated.`,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ContentIcon className="h-5 w-5" />
            Edit {content.type?.slice(0, -1)} - {content.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Content title"
            />
          </div>

          {/* Portal */}
          <div className="space-y-2">
            <Label htmlFor="portal">Target Portal</Label>
            <Select value={formData.portal} onValueChange={(value) => handleInputChange('portal', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Portals</SelectItem>
                <SelectItem value="employee">Employee Portal</SelectItem>
                <SelectItem value="hr">HR Portal</SelectItem>
                <SelectItem value="it">IT Portal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Enter content here..."
              rows={8}
            />
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-4">
            <span>Type: {content.type}</span>
            <span>ID: {content.id}</span>
            <span>Created: {content.lastModified}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
