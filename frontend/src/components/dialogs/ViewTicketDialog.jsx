import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Bot, Sparkles } from "lucide-react";

export function ViewTicketDialog({ open, onOpenChange, ticket }) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "IT Support",
      message: "Investigating the issue...",
      timestamp: "2024-02-12T10:00:00",
    },
  ]);
  const { toast } = useToast();

  if (!ticket) return null;

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "Critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "High":
        return (
          <Badge
            variant="outline"
            className="text-destructive border-destructive"
          >
            High
          </Badge>
        );
      case "Medium":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            Medium
          </Badge>
        );
      case "Low":
        return (
          <Badge variant="outline" className="text-success border-success">
            Low
          </Badge>
        );
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return (
          <Badge variant="outline" className="text-primary border-primary">
            Open
          </Badge>
        );
      case "In Progress":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            In Progress
          </Badge>
        );
      case "Assigned":
        return (
          <Badge variant="outline" className="text-accent border-accent">
            Assigned
          </Badge>
        );
      case "Resolved":
        return (
          <Badge
            variant="default"
            className="bg-success text-success-foreground"
          >
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const generateAISummary = (ticket) => {
    // Use severity instead of priority for urgency level determination
    const urgencyLevel =
      ticket.severity === "Critical" || ticket.severity === "High"
        ? "urgent"
        : "standard";
    const categoryContext = {
      Hardware: "hardware-related issues and equipment problems",
      Software: "software installation, licensing, and application issues",
      Network: "network connectivity and infrastructure problems",
      Infrastructure: "server and system infrastructure concerns",
      Email: "email system and communication platform issues",
      Access: "account access and permission management",
    };

    // Use severity instead of priority in the summary text
    const summary = `This ${urgencyLevel} ${ticket.category.toLowerCase()} ticket requires IT attention regarding ${
      categoryContext[ticket.category] || "general IT support matters"
    }. The issue reported by ${ticket.employee || "the user"} from ${
      ticket.department
    } has been ${ticket.status.toLowerCase()}. Based on the ${ticket.severity.toLowerCase()} severity level, this ${ticket.category.toLowerCase()} issue should be addressed ${
      urgencyLevel === "urgent"
        ? "immediately to minimize business impact"
        : "within standard support timeframes"
    }.`;

    return summary;
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        author: "Employee",
        message: newComment,
        timestamp: new Date().toISOString(),
      };
      setComments([...comments, comment]);
      setNewComment("");
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the ticket.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ticket Details - {ticket.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{ticket.title}</h3>
            <p className="text-muted-foreground">{ticket.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Employee
              </h4>
              <p className="text-sm">{ticket.employee || "Current User"}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Department
              </h4>
              <p className="text-sm">{ticket.department || "IT"}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Category
              </h4>
              <Badge variant="outline">{ticket.category}</Badge>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Severity
              </h4>
              {getSeverityBadge(ticket.severity || ticket.priority)}
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Status
              </h4>
              {getStatusBadge(ticket.status)}
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Submitted Date
              </h4>
              <p className="text-sm">
                {new Date(
                  ticket.createdDate || ticket.submittedDate
                ).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* AI Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Bot className="h-4 w-4 text-primary" />
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-foreground/90 leading-relaxed">
                {generateAISummary(ticket)}
              </p>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3">
              Comments & Updates
            </h4>
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      {comment.author}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.message}</p>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment or update..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddComment} size="sm">
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
