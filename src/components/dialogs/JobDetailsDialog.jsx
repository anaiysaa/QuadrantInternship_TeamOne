
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, Users, Calendar, Bookmark, ExternalLink } from 'lucide-react';

export function JobDetailsDialog({ job, open, onOpenChange }) {
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  if (!job) return null;

  const handleApply = () => {
    toast({
      title: "Application Submitted",
      description: `Your application for ${job.title} has been submitted successfully.`,
    });
    onOpenChange(false);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Job Unsaved" : "Job Saved",
      description: isSaved 
        ? `${job.title} has been removed from your saved jobs.`
        : `${job.title} has been saved to your favorites.`,
    });
  };

  const handleLearnMore = () => {
    toast({
      title: "Learn More",
      description: `Opening detailed information about ${job.title} and our company.`,
    });
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'Engineering': return 'bg-primary';
      case 'Product': return 'bg-success';
      case 'Design': return 'bg-warning';
      case 'Sales': return 'bg-destructive';
      case 'Marketing': return 'bg-accent';
      default: return 'bg-secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl">{job.title}</DialogTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getDepartmentColor(job.department)}`}></div>
                  <span>{job.department}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <Badge variant="outline">{job.type}</Badge>
                <Badge variant="secondary">{job.level}</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className={isSaved ? "bg-primary/10 border-primary" : ""}
              >
                <Bookmark className={`w-4 h-4 mr-1 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save Job"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Posted Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(job.postedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Employment Type</p>
                <p className="text-sm text-muted-foreground">{job.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Experience Level</p>
                <p className="text-sm text-muted-foreground">{job.level}</p>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Job Description</h3>
            <p className="text-muted-foreground leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-muted-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">What We Offer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li>• Competitive salary and equity</li>
                <li>• Comprehensive health benefits</li>
                <li>• Flexible work arrangements</li>
                <li>• Professional development opportunities</li>
              </ul>
              <ul className="space-y-2">
                <li>• 401(k) with company matching</li>
                <li>• Unlimited PTO policy</li>
                <li>• Modern office equipment</li>
                <li>• Team building activities</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="outline" onClick={handleLearnMore}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Learn More
            </Button>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={handleApply} className="px-8">
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
