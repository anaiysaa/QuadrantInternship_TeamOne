// LeaveDetailsDialog.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, User } from 'lucide-react';

function getStatusColor(status) {
  switch (String(status).toLowerCase()) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function LeaveDetailsDialog({ open, onOpenChange, leaveRequest }) {
  if (!leaveRequest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{leaveRequest.Type || leaveRequest.type}</h3>
            <Badge className={getStatusColor(leaveRequest.Status || leaveRequest.status)}>
              {(leaveRequest.Status || leaveRequest.status || '').charAt(0).toUpperCase() +
                (leaveRequest.Status || leaveRequest.status || '').slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Start Date</span>
              </div>
              <p className="font-medium">{leaveRequest.StartDate || leaveRequest.startDate}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>End Date</span>
              </div>
              <p className="font-medium">{leaveRequest.EndDate || leaveRequest.endDate}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Duration</span>
            </div>
            <p className="font-medium">{leaveRequest.Days || leaveRequest.days} day(s)</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Reason</span>
            </div>
            <p className="font-medium">{leaveRequest.Reason || leaveRequest.reason}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Submitted On</span>
            </div>
            <p className="font-medium">{leaveRequest.SubmittedDate || leaveRequest.submittedDate}</p>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
