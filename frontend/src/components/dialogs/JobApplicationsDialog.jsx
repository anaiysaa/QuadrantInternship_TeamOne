
import { useState } from 'react';
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

  if (!job) return null;

  const applications = [
    {
      id: 'APP001',
      candidateName: 'Jennifer Smith',
      email: 'jennifer.smith@email.com',
      status: 'Interview Scheduled',
      appliedDate: '2024-02-08',
      stage: 'Technical Interview',
      rating: 4,
      resume: 'resume_jennifer_smith.pdf'
    },
    {
      id: 'APP002',
      candidateName: 'David Chen',
      email: 'david.chen@email.com',
      status: 'Under Review',
      appliedDate: '2024-02-10',
      stage: 'Application Review',
      rating: 3,
      resume: 'resume_david_chen.pdf'
    },
    {
      id: 'APP003',
      candidateName: 'Maria Rodriguez',
      email: 'maria.rodriguez@email.com',
      status: 'Offer Extended',
      appliedDate: '2024-02-03',
      stage: 'Final Decision',
      rating: 5,
      resume: 'resume_maria_rodriguez.pdf'
    }
  ];

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
              <div>
                <span className="font-medium">Job ID:</span> {job.id}
              </div>
              <div>
                <span className="font-medium">Department:</span> {job.department}
              </div>
              <div>
                <span className="font-medium">Total Applications:</span> {applications.length}
              </div>
              <div>
                <span className="font-medium">Status:</span> {job.status}
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.candidateName}</p>
                      <p className="text-sm text-muted-foreground">{app.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(app.appliedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">{app.stage}</TableCell>
                  <TableCell>{getApplicationStatusBadge(app.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="text-lg">{'★'.repeat(app.rating)}{'☆'.repeat(5 - app.rating)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleReview(app.id)}>
                        Review
                      </Button>
                      <Button size="sm" variant="default" onClick={() => handleSchedule(app.id)}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
