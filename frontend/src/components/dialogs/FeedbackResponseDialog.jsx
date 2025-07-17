
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function FeedbackResponseDialog({ feedback, open, onOpenChange }) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!feedback) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!response.trim()) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Response Sent",
        description: `Response to feedback ${feedback.id} has been sent successfully.`,
      });
      setResponse('');
      setLoading(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Respond to Feedback - {feedback.id}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{feedback.category}</h4>
              <Badge variant="outline">{feedback.sentiment}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{feedback.summary}</p>
            <div className="text-xs text-muted-foreground">
              From: {feedback.employee || 'Anonymous'} | Department: {feedback.department}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="response">Your Response</Label>
            <Textarea
              id="response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Write your response to this feedback..."
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !response.trim()}>
              {loading ? 'Sending...' : 'Send Response'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
