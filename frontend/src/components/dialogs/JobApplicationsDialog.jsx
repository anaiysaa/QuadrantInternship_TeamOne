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
import { ReviewApplicationDialog } from '@/components/dialogs/ReviewApplicationDialog';
import { ScheduleInterviewDialog } from '@/components/dialogs/ScheduleInterviewDialog';

export function JobApplicationsDialog({ job, open, onOpenChange }) {
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  useEffect(() => {
    if (job && open) {
      // Extract numeric part from job.id like "JP001" => 1
      const jobIdMatch = job.id.toString().match(/\d+/);
      const jobIdNumeric = jobIdMatch ? parseInt(jobIdMatch[0]) : null;
  
      if (!jobIdNumeric) {
        console.error("Invalid job ID format:", job.id);
        return;
      }
  
      fetch(`/api/job-applications?jobId=${jobIdNumeric}`)
        .then(res => res.json())
        .then(data => {
          console.log("Fetched applications for job ID", jobIdNumeric, data); // debug
          setApplications(data);
        })
        .catch(err => console.error("Failed to fetch job applications:", err));
    }
  }, [job, open]);
  
  

  if (!job) return null;

  const getApplicationStatusBadge = (status) => {
    switch (status) {
      case 'Under Review':
        return <Badge variant="outline" className="text-primary border-primary">Under Review</Badge>;
      case 'Interview Scheduled':
        return <Badge variant="outline" className="text-warning border-warning">Interview Scheduled</Badge>;
      case 'Offer Extended':
        return <Badge variant="default" className="bg-success text-success-foreground">Offer Extended</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleReview = (app) => {
    setSelectedApplication(app);
    setShowReviewDialog(true);
  };

  const handleSchedule = (app) => {
    setSelectedApplication(app);
    setShowScheduleDialog(true);
  };

  const handleStatusUpdate = (updatedApp) => {
    setApplications(prev =>
      prev.map(app => app.ApplicationID === updatedApp.ApplicationID ? updatedApp : app)
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applications for {job.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div><span className="font-medium">Job ID:</span> {job.id}</div>
                <div><span className="font-medium">Department:</span> {job.department}</div>
                <div><span className="font-medium">Total Applications:</span> {applications.length}</div>
                <div><span className="font-medium">Status:</span> {job.status}</div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.ApplicationID}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.Name}</p>
                        <p className="text-sm text-muted-foreground">{app.Email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(app.ApplicationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getApplicationStatusBadge(app.Status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleReview(app)}>
                          Review
                        </Button>
                        <Button size="sm" variant="default" onClick={() => handleSchedule(app)}>
                          Schedule
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <ReviewApplicationDialog
        application={selectedApplication}
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Schedule Dialog */}
      <ScheduleInterviewDialog
        application={selectedApplication}
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        onSchedule={handleStatusUpdate}
      />
    </>
  );
}
