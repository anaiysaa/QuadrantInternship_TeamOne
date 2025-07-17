import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Plus, Trash2, Eye, FileText, MessageSquare, HelpCircle } from 'lucide-react';
import { ContentPreviewDialog } from '@/components/dialogs/ContentPreviewDialog';
import { ContentEditDialog } from '@/components/dialogs/ContentEditDialog';
import { useToast } from '@/hooks/use-toast';

export function ContentManagement() {
  const [selectedContentType, setSelectedContentType] = useState('announcements');
  const [contentData, setContentData] = useState({
    announcements: [
      { id: '1', title: 'Holiday Schedule Update', status: 'published', lastModified: '2024-01-15', portal: 'all', type: 'announcements' },
      { id: '2', title: 'New IT Security Policy', status: 'draft', lastModified: '2024-01-14', portal: 'employee', type: 'announcements' },
      { id: '3', title: 'HR Benefits Enrollment', status: 'published', lastModified: '2024-01-13', portal: 'employee', type: 'announcements' },
    ],
    faqs: [
      { id: '1', title: 'How to reset password?', status: 'published', lastModified: '2024-01-12', portal: 'all', type: 'faqs' },
      { id: '2', title: 'Leave request process', status: 'published', lastModified: '2024-01-11', portal: 'employee', type: 'faqs' },
      { id: '3', title: 'IT support hours', status: 'draft', lastModified: '2024-01-10', portal: 'it', type: 'faqs' },
    ],
    widgets: [
      { id: '1', title: 'Welcome Message Widget', status: 'published', lastModified: '2024-01-15', portal: 'employee', type: 'widgets' },
      { id: '2', title: 'Quick Actions Widget', status: 'published', lastModified: '2024-01-14', portal: 'hr', type: 'widgets' },
      { id: '3', title: 'System Status Widget', status: 'draft', lastModified: '2024-01-13', portal: 'it', type: 'widgets' },
    ]
  });

  // Dialog states
  const [previewDialog, setPreviewDialog] = useState({ open: false, content: null });
  const [editDialog, setEditDialog] = useState({ open: false, content: null });
  
  const { toast } = useToast();

  const currentContent = contentData[selectedContentType] || [];

  const handlePreview = (item) => {
    setPreviewDialog({ open: true, content: item });
  };

  const handleEdit = (item) => {
    setEditDialog({ open: true, content: item });
  };

  const handleSave = (updatedContent) => {
    setContentData(prev => ({
      ...prev,
      [selectedContentType]: prev[selectedContentType].map(item =>
        item.id === updatedContent.id ? updatedContent : item
      )
    }));
  };

  const handleDelete = (item) => {
    setContentData(prev => ({
      ...prev,
      [selectedContentType]: prev[selectedContentType].filter(content => content.id !== item.id)
    }));
    
    toast({
      title: "Content Deleted",
      description: `"${item.title}" has been successfully deleted.`,
      variant: "destructive",
    });
  };

  const getStatusBadge = (status) => {
    return status === 'published' 
      ? <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Published</span>
      : <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Draft</span>;
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'announcements': return MessageSquare;
      case 'faqs': return HelpCircle;
      case 'widgets': return FileText;
      default: return FileText;
    }
  };

  const ContentIcon = getContentIcon(selectedContentType);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Content Management
          </CardTitle>
          <CardDescription>
            Manage announcements, FAQs, widgets, and other portal content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content Type Selection */}
          <div className="flex gap-4 items-center">
            <Select value={selectedContentType} onValueChange={setSelectedContentType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="announcements">Announcements</SelectItem>
                <SelectItem value="faqs">FAQs</SelectItem>
                <SelectItem value="widgets">Widgets</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {selectedContentType.slice(0, -1)}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New {selectedContentType.slice(0, -1)}</DialogTitle>
                  <DialogDescription>
                    Add new content that will be displayed across the portals.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Title" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Target Portal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Portals</SelectItem>
                      <SelectItem value="employee">Employee Portal</SelectItem>
                      <SelectItem value="hr">HR Portal</SelectItem>
                      <SelectItem value="it">IT Portal</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="h-32 border rounded p-3 text-sm text-muted-foreground">
                    Content editor would go here...
                  </div>
                  <div className="flex gap-2">
                    <Button>Save as Draft</Button>
                    <Button variant="outline">Publish</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Content List */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <ContentIcon className="h-4 w-4" />
              {selectedContentType.charAt(0).toUpperCase() + selectedContentType.slice(1)}
            </h3>
            
            <div className="space-y-2">
              {currentContent.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{item.title}</h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Last modified: {item.lastModified} • Portal: {item.portal}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePreview(item)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t">
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-muted-foreground">Published Items</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-yellow-600">4</div>
              <div className="text-sm text-muted-foreground">Draft Items</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-muted-foreground">Total Content</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ContentPreviewDialog
        content={previewDialog.content}
        open={previewDialog.open}
        onOpenChange={(open) => setPreviewDialog({ open, content: null })}
      />
      
      <ContentEditDialog
        content={editDialog.content}
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, content: null })}
        onSave={handleSave}
      />
    </>
  );
}
