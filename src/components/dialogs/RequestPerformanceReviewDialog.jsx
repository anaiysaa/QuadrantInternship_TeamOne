
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, FileText, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function RequestPerformanceReviewDialog({ children }) {
  const [open, setOpen] = useState(false);
  const [reviewType, setReviewType] = useState('');
  const [urgency, setUrgency] = useState('');
  const [reason, setReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviewTypes = [
    { value: 'annual', label: 'Annual Review', description: 'Comprehensive yearly performance evaluation' },
    { value: 'quarterly', label: 'Quarterly Review', description: 'Regular quarterly check-in and goal assessment' },
    { value: 'mid-year', label: 'Mid-Year Review', description: 'Mid-year performance and goal progress review' },
    { value: 'promotion', label: 'Promotion Review', description: 'Performance review for promotion consideration' },
    { value: 'project', label: 'Project Review', description: 'Review focused on specific project performance' },
    { value: 'improvement', label: 'Performance Improvement', description: 'Review to address performance concerns' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', color: 'bg-muted' },
    { value: 'normal', label: 'Normal Priority', color: 'bg-primary' },
    { value: 'high', label: 'High Priority', color: 'bg-warning' },
    { value: 'urgent', label: 'Urgent', color: 'bg-destructive' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewType || !urgency || !reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting performance review request:', {
      reviewType,
      urgency,
      reason,
      additionalNotes,
      submittedAt: new Date().toISOString()
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Review Request Submitted",
      description: "Your performance review request has been sent to HR and your manager.",
    });

    // Reset form
    setReviewType('');
    setUrgency('');
    setReason('');
    setAdditionalNotes('');
    setIsSubmitting(false);
    setOpen(false);
  };

  const selectedReviewType = reviewTypes.find(type => type.value === reviewType);
  const selectedUrgency = urgencyLevels.find(level => level.value === urgency);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Request Performance Review</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Review Type Selection */}
          <div className="space-y-3">
            <Label htmlFor="review-type">Review Type *</Label>
            <Select value={reviewType} onValueChange={setReviewType}>
              <SelectTrigger>
                <SelectValue placeholder="Select review type" />
              </SelectTrigger>
              <SelectContent>
                {reviewTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedReviewType && (
              <Card className="mt-2">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedReviewType.description}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Urgency Level */}
          <div className="space-y-3">
            <Label htmlFor="urgency">Priority Level *</Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${level.color}`}></div>
                      <span>{level.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason for Request */}
          <div className="space-y-3">
            <Label htmlFor="reason">Reason for Review Request *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you're requesting this performance review..."
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-3">
            <Label htmlFor="additional-notes">Additional Notes (Optional)</Label>
            <Textarea
              id="additional-notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any additional information or specific areas you'd like to focus on..."
              className="min-h-[80px]"
            />
          </div>

          {/* Request Summary */}
          {(reviewType || urgency) && (
            <Card className="bg-accent/50">
              <CardHeader>
                <CardTitle className="text-sm">Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedReviewType && (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Type: {selectedReviewType.label}</span>
                  </div>
                )}
                {selectedUrgency && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Priority: {selectedUrgency.label}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">This request will be sent to your manager and HR</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !reviewType || !urgency || !reason}
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
