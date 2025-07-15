
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
import { Card, CardContent } from '@/components/ui/card';

export function FeedbackDetailsDialog({ feedback, open, onOpenChange }) {
  if (!feedback) return null;

  const getSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case 'Positive':
        return <Badge variant="default" className="bg-success text-success-foreground">Positive</Badge>;
      case 'Neutral':
        return <Badge variant="outline" className="text-warning border-warning">Neutral</Badge>;
      case 'Negative':
        return <Badge variant="destructive">Negative</Badge>;
      default:
        return <Badge variant="secondary">{sentiment}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return <Badge variant="outline" className="text-primary border-primary">New</Badge>;
      case 'Under Review':
        return <Badge variant="outline" className="text-warning border-warning">Under Review</Badge>;
      case 'Addressed':
        return <Badge variant="default" className="bg-success text-success-foreground">Addressed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Feedback Details - {feedback.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <p className="text-sm">{feedback.type}</p>
              {feedback.employee && (
                <p className="text-sm text-muted-foreground">{feedback.employee}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <p className="text-sm">{feedback.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Department</label>
              <p className="text-sm">{feedback.department}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Submitted Date</label>
              <p className="text-sm">{new Date(feedback.submittedDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sentiment</label>
              <div className="mt-1">{getSentimentBadge(feedback.sentiment)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">{getStatusBadge(feedback.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Rating</label>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-lg">{getRatingStars(feedback.rating)}</span>
                <span className="text-sm text-muted-foreground">({feedback.rating}/5)</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tags</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {feedback.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Feedback Summary</label>
            <Card className="mt-2">
              <CardContent className="p-4">
                <p className="text-sm">{feedback.summary}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
