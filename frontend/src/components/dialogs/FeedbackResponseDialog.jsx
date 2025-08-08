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

    try {
      const res = await fetch('/api/feedback/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: feedback.id,
          response,
          responder: 'HR Admin' // Optional: replace with actual user if needed
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send response');
      }

      toast({
        title: 'Response Sent',
        description: `Response to feedback ${feedback.id} has been sent successfully.`,
      });

      setResponse('');
      onOpenChange(false); // This will trigger refresh in parent
    } catch (err) {
      console.error('❌ Failed to respond:', err);
      toast({
        title: 'Error',
        description: err.message || 'Could not send response.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
