
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Clock, Users, FileText, MessageSquare } from 'lucide-react';

export function ApplicationDetailsDialog({ application, open, onOpenChange }) {
  if (!application) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Interview Scheduled':
        return <Badge variant="outline" className="text-warning border-warning">Interview Scheduled</Badge>;
      case 'Under Review':
        return <Badge variant="outline" className="text-primary border-primary">Under Review</Badge>;
      case 'Offer Extended':
        return <Badge variant="default" className="bg-success text-success-foreground">Offer Extended</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'Interview Scheduled':
        return 'Your application has been reviewed and we would like to schedule an interview with you.';
      case 'Under Review':
        return 'Our team is currently reviewing your application and will get back to you soon.';
      case 'Offer Extended':
        return 'Congratulations! We are pleased to extend you an offer for this position.';
      case 'Rejected':
        return 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.';
      default:
        return 'Your application is being processed.';
    }
  };

  const mockJobDetails = {
    'JP001': {
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      level: 'Senior',
      hiringManager: 'Sarah Johnson',
      description: 'Join our engineering team to build cutting-edge web applications using React and TypeScript.',
    },
    'JP002': {
      department: 'Product',
      location: 'New York, NY',
      type: 'Full-time',
      level: 'Mid-level',
      hiringManager: 'Mike Wilson',
      description: 'Drive product strategy and work with cross-functional teams to deliver exceptional user experiences.',
    }
  };

  const jobDetails = mockJobDetails[application.jobId] || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle className="text-xl">{application.jobTitle}</DialogTitle>
            <div className="flex items-center space-x-2">
              {getStatusBadge(application.status)}
              <span className="text-sm text-muted-foreground">Application ID: {application.id}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Information */}
          <div className="bg-muted/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Current Status</h3>
            <p className="text-sm text-muted-foreground mb-3">{getStatusDescription(application.status)}</p>
            <div className="text-sm">
              <strong>Current Stage:</strong> {application.stage}
            </div>
          </div>

          {/* Job Information */}
          <div>
            <h3 className="font-semibold mb-3">Position Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-sm text-muted-foreground">{jobDetails.department}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{jobDetails.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Employment Type</p>
                  <p className="text-sm text-muted-foreground">{jobDetails.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Experience Level</p>
                  <p className="text-sm text-muted-foreground">{jobDetails.level}</p>
                </div>
              </div>
            </div>
            {jobDetails.description && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-1">Job Description</p>
                <p className="text-sm text-muted-foreground">{jobDetails.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Application Timeline */}
          <div>
            <h3 className="font-semibold mb-3">Application Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Application Submitted</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(application.appliedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              {application.status !== 'Under Review' && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Status Updated</p>
                    <p className="text-xs text-muted-foreground">
                      Moved to: {application.status}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {jobDetails.hiringManager && (
            <div>
              <h3 className="font-semibold mb-2">Hiring Manager</h3>
              <p className="text-sm text-muted-foreground">{jobDetails.hiringManager}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <div className="flex space-x-2">
              {application.status === 'Interview Scheduled' && (
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact HR
                </Button>
              )}
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                View Original Job
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
