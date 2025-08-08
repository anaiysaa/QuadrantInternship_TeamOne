import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function FeedbackResponseDialog({
  feedback,         // expects { id, category, sentiment, summary, employee, department }
  open,
  onOpenChange,
  onResponded,      // optional: parent can pass a refetch callback
}) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!feedback) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!response.trim()) return;

    const id = feedback?.id;
    if (!id) {
      toast({ title: 'No feedback selected', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const url = `/api/feedback/respond/${encodeURIComponent(id)}?t=${Date.now()}`;
      const res = await fetch(url, {
        method: 'PUT',                    // ✅ matches your backend
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: response.trim(),
          respondedBy: null,             // set employee/HR user if you track it
          status: 'Responded',           // backend sets Status = 'Responded' anyway
        }),
      });

      let data = null;
      try { data = await res.json(); } catch (_) {}

      if (!res.ok || (data && data.success === false)) {
        const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      toast({
        title: 'Response sent',
        description: `Response to feedback ${id} was saved.`,
      });

      setResponse('');
      onOpenChange(false);
      onResponded?.(); // parent can refetch list
    } catch (err) {
      console.error('❌ Failed to respond:', err);
      toast({
        title: 'Failed to send response',
        description: String(err?.message || err),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const category = feedback?.category ?? '—';
  const sentiment = feedback?.sentiment ?? '—';
  const summary = feedback?.summary ?? '';
  const employee = feedback?.employee ?? (feedback?.anonymous ? 'Anonymous' : '—');
  const department = feedback?.department ?? '—';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby="feedback-response-desc">
        <DialogHeader>
          <DialogTitle>Respond to Feedback #{feedback?.id}</DialogTitle>
          <DialogDescription id="feedback-response-desc">
            Your reply will be visible to the submitter and saved with this feedback item.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{category}</h4>
              {sentiment !== '—' ? <Badge variant="outline">{sentiment}</Badge> : null}
            </div>
            {summary ? (
              <p className="text-sm text-muted-foreground mb-2">{summary}</p>
            ) : null}
            <div className="text-xs text-muted-foreground">
              From: {employee} | Department: {department}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="response">Your Response</Label>
            <Textarea
              id="response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Write your response to this feedback…"
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !response.trim()}>
              {loading ? 'Sending…' : 'Send Response'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
