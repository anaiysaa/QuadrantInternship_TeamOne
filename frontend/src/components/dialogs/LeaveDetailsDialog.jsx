// LeaveDetailsDialog.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, User, DollarSign } from 'lucide-react';

function getStatusColor(status) {
  switch (String(status).toLowerCase()) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getPaidStatusColor(isPaid) {
  return isPaid 
    ? 'bg-blue-100 text-blue-800' 
    : 'bg-orange-100 text-orange-800';
}

export default function LeaveDetailsDialog({ open, onOpenChange, leaveRequest }) {
  if (!leaveRequest) return null;

  const leaveType = leaveRequest.Type || leaveRequest.type;
  // Properly check for paid status - handle both boolean and integer values
  const isPaid = leaveRequest.paid === true || leaveRequest.paid === 1 || leaveRequest.paid === '1';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{leaveType}</h3>
            <div className="flex items-center space-x-2">
              <Badge className={getPaidStatusColor(isPaid)}>
                {isPaid ? 'Paid Leave' : 'Unpaid Leave'}
              </Badge>
              <Badge className={getStatusColor(leaveRequest.Status || leaveRequest.status)}>
                {(leaveRequest.Status || leaveRequest.status || '').charAt(0).toUpperCase() +
                  (leaveRequest.Status || leaveRequest.status || '').slice(1)}
              </Badge>
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Duration</span>
              </div>
              <p className="font-medium">{leaveRequest.Days || leaveRequest.days} day(s)</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Payment Status</span>
              </div>
              <p className="font-medium">{isPaid ? 'Paid' : 'Unpaid'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Reason</span>
            </div>
            <p className="font-medium">{leaveRequest.Reason || leaveRequest.reason || 'No reason provided'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Submitted On</span>
              </div>
              <p className="font-medium">{leaveRequest.SubmittedDate || leaveRequest.submittedDate}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Request ID</span>
              </div>
              <p className="font-medium">{leaveRequest.RequestID || leaveRequest.id || 'N/A'}</p>
            </div>
          </div>

          {leaveRequest.Urgent && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">⚠️ Urgent Request</p>
            </div>
          )}

          {/* Payment Information Panel */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Payment Information</span>
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium">{isPaid ? 'Paid Leave' : 'Unpaid Leave'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Days:</span>
                <p className="font-medium">{leaveRequest.Days || leaveRequest.days} days</p>
              </div>
            </div>
            {isPaid && (
              <p className="text-xs text-muted-foreground mt-2">
                This leave will be deducted from your paid leave balance.
              </p>
            )}
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