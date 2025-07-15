
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export function ViewTicketDialog({ open, onOpenChange, ticket }) {
  const [newComment, setNewComment] = useState('');
  const [comments] = useState([
    {
      id: 1,
      author: 'IT Support',
      message: 'Investigating the issue...',
      timestamp: '2024-02-12T10:00:00'
    }
  ]);

  if (!ticket) return null;

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'High':
        return <Badge variant="outline" className="text-destructive border-destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="text-warning border-warning">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline" className="text-success border-success">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return <Badge variant="outline" className="text-primary border-primary">Open</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="text-warning border-warning">In Progress</Badge>;
      case 'Assigned':
        return <Badge variant="outline" className="text-accent border-accent">Assigned</Badge>;
      case 'Resolved':
        return <Badge variant="default" className="bg-success text-success-foreground">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ticket Details - {ticket.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{ticket.title}</h3>
            <p className="text-muted-foreground">{ticket.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Employee</h4>
              <p className="text-sm">{ticket.employee}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Department</h4>
              <p className="text-sm">{ticket.department}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Category</h4>
              <Badge variant="outline">{ticket.category}</Badge>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Severity</h4>
              {getSeverityBadge(ticket.severity)}
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
              {getStatusBadge(ticket.status)}
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Submitted Date</h4>
              <p className="text-sm">{new Date(ticket.submittedDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3">Comments & Updates</h4>
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.message}</p>
                </div>
              ))}
            </div>
            
            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment or update..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddComment} size="sm">
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
