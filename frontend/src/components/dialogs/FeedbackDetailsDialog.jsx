import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function FeedbackDetailsDialog({ feedback, open, onOpenChange }) {
  if (!feedback) return null;

  const {
    id,
    anonymous,
    employeeId,
    category,
    submittedDate,
    rating,
    status,
    message,
    response,
    responseDate,
    respondedBy,
    isWomenOnly,
  } = feedback;

  const renderStars = (value) =>
    "★".repeat(value) + "☆".repeat(5 - value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Feedback Details - {id}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Grid Info Section */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-medium">Submitter</p>
              <p>{anonymous ? "Anonymous" : `Employee ID: ${employeeId}`}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Category</p>
              <p>{category}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Submitted Date</p>
              <p>{submittedDate ? new Date(submittedDate).toLocaleDateString() : "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Status</p>
              <Badge variant="outline">{status || "Unknown"}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Rating</p>
              <p>
                {renderStars(rating)} ({rating}/5)
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Recipient Group</p>
              <p>{isWomenOnly ? "Women-Only" : "All"}</p>
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-muted-foreground font-medium mb-1">Message</p>
            <p className="bg-muted p-3 rounded text-sm whitespace-pre-line">
              {message || "No message provided."}
            </p>
          </div>

          {/* Optional Response Section */}
          {response && (
            <div>
              <p className="text-muted-foreground font-medium mb-1">Response</p>
              <p className="bg-muted p-3 rounded text-sm whitespace-pre-line">
                {response}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {respondedBy && `Responded by ${respondedBy}`}{" "}
                {responseDate &&
                  `on ${new Date(responseDate).toLocaleDateString()}`}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
