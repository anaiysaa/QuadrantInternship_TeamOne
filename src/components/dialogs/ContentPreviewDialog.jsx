
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, HelpCircle, FileText } from 'lucide-react';

export function ContentPreviewDialog({ content, open, onOpenChange }) {
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

  const getStatusBadge = (status) => {
    return status === 'published' 
      ? <Badge className="bg-green-100 text-green-800">Published</Badge>
      : <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ContentIcon className="h-5 w-5" />
            Content Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {content.title}
                </CardTitle>
                {getStatusBadge(content.status)}
              </div>
              <div className="text-sm text-muted-foreground">
                Portal: {content.portal} • Last modified: {content.lastModified}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Content Preview:</h4>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    {content.type === 'announcements' && (
                      <div>
                        <h3 className="font-semibold mb-2">{content.title}</h3>
                        <p className="text-sm">
                          This is a preview of how the announcement will appear to users. 
                          The actual content would be displayed here with proper formatting.
                        </p>
                      </div>
                    )}
                    {content.type === 'faqs' && (
                      <div>
                        <h3 className="font-semibold mb-2">Q: {content.title}</h3>
                        <p className="text-sm">
                          <strong>A:</strong> This is a preview of the FAQ answer. 
                          The detailed response would be shown here.
                        </p>
                      </div>
                    )}
                    {content.type === 'widgets' && (
                      <div className="border-2 border-dashed border-muted-foreground/30 p-4 rounded">
                        <h3 className="font-semibold mb-2">{content.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Widget preview - This would show how the widget appears in the portal
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {content.type}
                  </div>
                  <div>
                    <span className="font-medium">Target Portal:</span> {content.portal}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {content.status}
                  </div>
                  <div>
                    <span className="font-medium">Last Modified:</span> {content.lastModified}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
