import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ReviewApplicationDialog({ application, open, onOpenChange, onStatusUpdate }) {
  const { toast } = useToast();
  const [status, setStatus] = useState(application?.Status || '');

  useEffect(() => {
    if (application) {
      setStatus(application.Status || '');
    }
  }, [application]);

  const handleSave = async () => {
    try {
      const response = await fetch('/api/update-application-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: application.ApplicationID, status })
      });

      if (response.ok) {
        onStatusUpdate({ ...application, Status: status });
        toast({
          title: 'Application Updated',
          description: `${application.Name}'s status updated to ${status}.`
        });
        onOpenChange(false);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update application status.'
        });
      }
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Application - {application.Name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{application.Name}</h3>
                <p className="text-muted-foreground">{application.Email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Applied for: {application.JobTitle}
                </p>
                <p className="text-sm text-muted-foreground">
                  Applied: {new Date(application.ApplicationDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Current Status:</span>
                  <Badge variant="outline">{application.Status}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">Update Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="Offer Extended">Offer Extended</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="ml-2" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
