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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Bot, Sparkles } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

export function ViewTicketDialog({ open, onOpenChange, ticket, context }) {
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [comments, setComments] = useState([]);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const employee = user ? user.name : null;

  // Get context-specific configuration
  const getContextConfig = (context) => {
    switch (context) {
      case "hr":
        return {
          author: "HR Support",
          commentAuthor: "HR Support",
          commentPlaceholder: "Add an HR comment or update...",
          department: "HR"
        };
      case "employee":
        return {
          author: employee,
          commentAuthor: employee,
          commentPlaceholder: "Add a comment or additional information...",
          department: "Employee"
        };
      default:
        return {
          author: "IT Support",
          commentAuthor: "IT Support",
          commentPlaceholder: "Add a comment or update...",
          department: "IT"
        };
    }
  };

  const contextConfig = getContextConfig(context);

  // Fetch comments when dialog opens
  useEffect(() => {
    if (open && ticket) {
      fetchComments();
    } else if (!open) {
      // Reset comments when dialog closes
      setComments([]);
      setLoadingComments(true);
    }
  }, [open, ticket]);

  const fetchComments = async () => {
    if (!ticket) return;
    
    setLoadingComments(true);
    
    const apiUrl = `http://localhost:8000/api/ticket-comments?ticket_id=${ticket.id}`;
    console.log("Fetching comments from:", apiUrl);
    console.log("Ticket ID:", ticket.id);
    console.log("Context:", context);
    
    try {
      const response = await axios.get(apiUrl);
      console.log("Comments response:", response.data);
      const ticketComments = response.data
      
      // Sort by comment_id in ascending order
      const sortedComments = ticketComments.sort((a, b) => {
        const aId = parseInt(a.comment_id) || 0;
        const bId = parseInt(b.comment_id) || 0;
        return aId - bId;
      });
      
      console.log("Sorted comments:", sortedComments);
      setComments(sortedComments);
    } catch (error) {
      console.error("Failed to load comments:", error);
      console.error("Error response:", error.response?.data);
      setComments([]);
      
      toast({
        title: "Error",
        description: "Failed to load comments.",
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !ticket) return;

    const commentData = {
      ticket_id: ticket.id,
      author: contextConfig.commentAuthor || "Support",
      content: newComment.trim(),
    };

    // Debug logging
    console.log("Posting comment with data:", commentData);
    console.log("Ticket object:", ticket);
    console.log("Context:", context);
    console.log("Context config:", contextConfig);

    // Validate required fields
    if (!commentData.ticket_id) {
      console.error("Missing ticket_id:", ticket);
      toast({
        title: "Error",
        description: "Missing ticket ID. Cannot post comment.",
        variant: "destructive",
      });
      return;
    }

    if (!commentData.author) {
      console.error("Missing author:", contextConfig);
      toast({
        title: "Error",
        description: "Missing author information. Cannot post comment.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/ticket-comments", commentData);
      console.log("Comment posted successfully:", response.data);

      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });

      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Failed to post comment:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      const errorMessage = error.response?.data?.error || "Failed to post comment.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Check if comment is from the current user (employee view)
  const isFromCurrentUser = (comment) => {
    if (context === "employee") {
      return comment.author === employee || comment.author === contextConfig.commentAuthor;
    }
    return false;
  };

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

  // Context-aware AI Summary generation
  const generateAISummary = (ticket, context) => {
    if (!ticket) return "No ticket data available.";

    // Helper function to convert integer severity to string
    const getSeverityString = (severity) => {
      if (typeof severity === 'number') {
        switch (severity) {
          case 1: return 'Critical';
          case 2: return 'High';
          case 3: return 'Medium';
          case 4: return 'Low';
          default: return 'Low';
        }
      }
      return severity || 'Low';
    };

    // Safe property access with fallbacks and proper severity conversion
    const safeTicket = {
      severity: getSeverityString(ticket?.severity || ticket?.priority),
      category: ticket?.category || 'General',
      employee: ticket?.employee || 'Unknown User',
      department: ticket?.department || 'Unknown Department',
      status: ticket?.status || 'Open',
      title: ticket?.title || 'No title',
      description: ticket?.description || 'No description'
    };

    const urgencyLevel =
      safeTicket.severity === "Critical" || safeTicket.severity === "High"
        ? "urgent"
        : "standard";

    // Context-specific category contexts and summaries
    if (context === "hr") {
      const hrCategoryContext = {
        Compensation: "salary, bonus, or compensation-related concerns",
        Policy: "company policy questions and clarifications",
        Complaint: "workplace complaints and grievance matters",
        Benefits: "employee benefits and insurance inquiries",
        Performance: "performance review and evaluation matters",
        General: "general HR inquiries and support requests",
      };

      const departmentInfo = safeTicket.department ? ` from the ${safeTicket.department} department` : '';
      
      return `This ${urgencyLevel} HR ${safeTicket.category.toLowerCase()} ticket requires attention regarding ${
        hrCategoryContext[safeTicket.category] || "general HR support matters"
      }. The request submitted by ${safeTicket.employee}${departmentInfo} is currently ${safeTicket.status.toLowerCase()}. Based on the ${safeTicket.severity.toLowerCase()} priority level, this ${safeTicket.category.toLowerCase()} matter should be ${
        urgencyLevel === "urgent"
          ? "addressed immediately to ensure employee satisfaction and compliance"
          : "handled within standard HR response timeframes"
      }.`;
    } else if (context === "employee") {
      return `Your ${safeTicket.category.toLowerCase()} ticket has been submitted with ${safeTicket.severity.toLowerCase()} priority. The current status is ${safeTicket.status.toLowerCase()}. ${
        urgencyLevel === "urgent"
          ? "This is marked as urgent and should receive immediate attention."
          : "This will be handled within standard response timeframes."
      } You will be notified of any updates or when the issue is resolved.`;
    } else {
      // IT context (default)
      const itCategoryContext = {
        Hardware: "hardware-related issues and equipment problems",
        Software: "software installation, licensing, and application issues",
        Network: "network connectivity and infrastructure problems",
        Infrastructure: "server and system infrastructure concerns",
        Email: "email system and communication platform issues",
        Access: "account access and permission management",
        Compensation: "HR compensation-related technical systems",
        Policy: "HR policy system access and technical issues",
        Complaint: "HR complaint system technical support",
        Benefits: "HR benefits system technical issues",
        Performance: "HR performance system technical support",
        General: "general technical support matters",
      };

      return `This ${urgencyLevel} ${safeTicket.category.toLowerCase()} ticket requires IT attention regarding ${
        itCategoryContext[safeTicket.category] || "general IT support matters"
      }. The issue reported by ${safeTicket.employee} from ${
        safeTicket.department
      } has been ${safeTicket.status.toLowerCase()}. Based on the ${safeTicket.severity.toLowerCase()} severity level, this ${safeTicket.category.toLowerCase()} issue should be addressed ${
        urgencyLevel === "urgent"
          ? "immediately to minimize business impact"
          : "within standard support timeframes"
      }.`;
    }
  };

  // Context-specific title
  const getDialogTitle = (context) => {
    if (!ticket) return "Ticket Details";
    
    switch (context) {
      case "hr":
        return `HR Ticket Details - ${ticket.id}`;
      case "employee":
        return `My Ticket - ${ticket.id}`;
      default:
        return `Ticket Details - ${ticket.id}`;
    }
  };

  // Early return AFTER all hooks have been called
  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle(context)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{ticket.title || 'No title'}</h3>
            <p className="text-muted-foreground">{ticket.description || 'No description'}</p>
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
              <p className="text-sm">{ticket.department || contextConfig.department}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Category
              </h4>
              <Badge variant="outline">{ticket.category || 'General'}</Badge>
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
                {ticket.createdDate || ticket.submittedDate 
                  ? new Date(ticket.createdDate || ticket.submittedDate).toLocaleDateString()
                  : 'Not specified'
                }
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
                {generateAISummary(ticket, context)}
              </p>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3">
              Comments & Updates
            </h4>
            <div className="space-y-3 mb-4">
              {loadingComments ? (
                <p className="text-sm text-muted-foreground">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              ) : (
                comments.map((comment) => {
                  const fromCurrentUser = isFromCurrentUser(comment);
                  return (
                    <div 
                      key={comment.comment_id || comment.id} 
                      className={`p-3 rounded-lg max-w-[80%] ${
                        fromCurrentUser 
                          ? "bg-primary text-primary-foreground ml-auto" 
                          : "bg-muted mr-auto"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">
                          {comment.author}
                        </span>
                        <span className={`text-xs ${
                          fromCurrentUser 
                            ? "text-primary-foreground/70" 
                            : "text-muted-foreground"
                        }`}>
                          {new Date(comment.created_at || comment.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content || comment.message}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                placeholder={contextConfig.commentPlaceholder}
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