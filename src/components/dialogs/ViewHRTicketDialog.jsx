
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export function ViewHRTicketDialog({ open, onOpenChange, ticket }) {
  if (!ticket) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return <Badge variant="outline" className="text-destructive border-destructive">Open</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="text-warning border-warning">In Progress</Badge>;
      case 'Resolved':
        return <Badge variant="default" className="bg-success text-success-foreground">Resolved</Badge>;
      case 'Closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'High':
        return <Badge variant="outline" className="text-destructive border-destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="text-warning border-warning">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ticket Details - {ticket.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">{ticket.title}</h3>
            <p className="text-muted-foreground">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Employee</h4>
              <p className="text-sm">{ticket.employee}</p>
              {ticket.employeeId !== 'N/A' && (
                <p className="text-xs text-muted-foreground">{ticket.employeeId}</p>
              )}
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Category</h4>
              <p className="text-sm">{ticket.category}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Priority</h4>
              {getPriorityBadge(ticket.priority)}
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
              {getStatusBadge(ticket.status)}
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Assigned To</h4>
              <p className="text-sm">{ticket.assignedTo}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Created Date</h4>
              <p className="text-sm">{new Date(ticket.createdDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Activity Timeline</h4>
            <div className="space-y-2">
              <div className="text-sm p-2 bg-muted rounded">
                <span className="font-medium">Created</span> - {new Date(ticket.createdDate).toLocaleDateString()}
              </div>
              <div className="text-sm p-2 bg-muted rounded">
                <span className="font-medium">Last Updated</span> - {new Date(ticket.lastUpdate).toLocaleDateString()}
              </div>
              <div className="text-sm p-2 bg-muted rounded">
                <span className="font-medium">Assigned to</span> {ticket.assignedTo}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
