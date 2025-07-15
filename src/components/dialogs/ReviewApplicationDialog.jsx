
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Star, Download, Mail, Phone } from 'lucide-react';

export function ReviewApplicationDialog({ application, open, onOpenChange, onStatusUpdate }) {
  const { toast } = useToast();
  const [status, setStatus] = useState(application?.status || '');
  const [stage, setStage] = useState(application?.stage || '');
  const [rating, setRating] = useState(application?.rating || 0);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    const updatedApplication = {
      ...application,
      status,
      stage,
      rating,
      notes
    };
    
    onStatusUpdate(updatedApplication);
    toast({
      title: "Application Updated",
      description: `${application.candidateName}'s application has been updated.`,
    });
    onOpenChange(false);
  };

  const handleApprove = () => {
    setStatus('Interview Scheduled');
    setStage('Initial Interview');
    handleSave();
  };

  const handleReject = () => {
    setStatus('Rejected');
    setStage('Application Rejected');
    handleSave();
  };

  const handleDownloadResume = () => {
    toast({
      title: "Download Started",
      description: `Downloading ${application.candidateName}'s resume...`,
    });
  };

  const handleContactCandidate = (method) => {
    toast({
      title: `Contact ${application.candidateName}`,
      description: `Opening ${method} to contact the candidate...`,
    });
  };

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Application - {application.candidateName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Candidate Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{application.candidateName}</h3>
                <p className="text-muted-foreground">{application.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Applied for: {application.jobTitle}
                </p>
                <p className="text-sm text-muted-foreground">
                  Applied: {new Date(application.appliedDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Current Status:</span>
                  <Badge variant="outline">{application.status}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Current Stage:</span>
                  <span className="text-sm">{application.stage}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Rating:</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= application.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={handleDownloadResume}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Resume</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleContactCandidate('email')}
              className="flex items-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>Send Email</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleContactCandidate('phone')}
              className="flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Candidate</span>
            </Button>
          </div>

          {/* Review Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Update Status</Label>
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
              <div>
                <Label htmlFor="stage">Update Stage</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Application Review">Application Review</SelectItem>
                    <SelectItem value="Initial Interview">Initial Interview</SelectItem>
                    <SelectItem value="Technical Interview">Technical Interview</SelectItem>
                    <SelectItem value="Final Interview">Final Interview</SelectItem>
                    <SelectItem value="Final Decision">Final Decision</SelectItem>
                    <SelectItem value="Application Rejected">Application Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Rating</Label>
              <div className="flex items-center space-x-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 cursor-pointer ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Review Notes</Label>
              <Textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your review notes here..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex space-x-2">
              <Button variant="destructive" onClick={handleReject}>
                Reject Application
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={handleSave}>
                Save Changes
              </Button>
              <Button onClick={handleApprove}>
                Approve & Schedule Interview
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
