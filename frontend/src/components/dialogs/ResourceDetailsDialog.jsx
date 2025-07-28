import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Calendar, Users } from 'lucide-react';

export function ResourceDetailsDialog({ resource, open, onOpenChange }) {
  if (!resource) return null;

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Hardware': return 'bg-primary';
      case 'Software': return 'bg-success';
      case 'Network': return 'bg-warning';
      case 'Security': return 'bg-destructive';
      case 'Mobile': return 'bg-accent';
      default: return 'bg-secondary';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Manual': return 'bg-blue-100 text-blue-800';
      case 'Guide': return 'bg-green-100 text-green-800';
      case 'Troubleshooting': return 'bg-yellow-100 text-yellow-800';
      case 'Policy': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Eye className="h-5 w-5" />
            {resource.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category and Tags */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getCategoryColor(resource.category)}`} />
              <span className="text-sm font-medium">{resource.category}</span>
            </div>
            {resource.tags?.split(',').map((tag, i) => (
  <Badge key={i} variant="outline">{tag.trim()}</Badge>
))}

            <Badge variant="outline" className={getTypeColor(resource.type)}>
              {resource.type}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-muted-foreground">{resource.description}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>File Size:</strong> {resource.size || 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Downloads:</strong> {resource.downloads ?? 0}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Last Updated:</strong> {formatDate(resource.lastUpdated)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4 border-t">
            <a
              href={`http://localhost:8000/api/resources/download/${resource.file_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Resource
              </Button>
            </a>
            <Button variant="outline" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
