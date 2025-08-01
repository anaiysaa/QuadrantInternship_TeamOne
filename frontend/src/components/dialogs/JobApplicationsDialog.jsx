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

export function JobApplicationsDialog({ job, open, onOpenChange }) {
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (job) {
      fetch(`/api/job-applications`)
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter(app => app.JobID === job.id);
          setApplications(filtered);
        })
        .catch(err => console.error("Failed to fetch job applications:", err));
    }
  }, [job]);

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

  const handleReview = (appId) => {
    toast({
      title: "Review Application",
      description: `Opening application review for ${appId}`,
    });
  };

  const handleSchedule = (appId) => {
    toast({
      title: "Schedule Interview",
      description: `Opening interview scheduler for ${appId}`,
    });
  };

  return (
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
                      <Button size="sm" variant="outline" onClick={() => handleReview(app.ApplicationID)}>
                        Review
                      </Button>
                      <Button size="sm" variant="default" onClick={() => handleSchedule(app.ApplicationID)}>
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
  );
}
