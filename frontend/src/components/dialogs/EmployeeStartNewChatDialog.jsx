import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquarePlus } from "lucide-react";

export function EmployeeStartNewChatDialog({ onChatCreated, children }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    issue: "",
    priority: "",
    description: "",
  });

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];
  const issueTypes = [
    "Login Problems", "Software Installation", "Network Issues", "Printer Problems", "Email Issues",
    "Hardware Malfunction", "Password Reset", "VPN Connection", "Security Issue", "Other",
  ];

  const handleInputChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.issue || !form.priority) {
      toast({
        title: "Missing Information",
        description: "Please select issue type and priority.",
        variant: "destructive",
      });
      return;
    }
    // IT's employeeId. If you want, you can fetch this from backend, or use a constant.
    const IT_EMPLOYEE_ID = 10002; // or whatever is IT in your DB

    const res = await fetch("/api/livechats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: user.employeeId || user.id,
        to: IT_EMPLOYEE_ID, // Always IT
        issue: form.issue,
        priority: form.priority,
        description: form.description,
        department: "IT",
      }),
    });
    if (res.ok) {
      toast({ title: "Chat Started", description: "New chat created." });
      setIsOpen(false);
      setForm({ issue: "", priority: "", description: "" });
      onChatCreated && onChatCreated();
    } else {
      const err = await res.json();
      toast({ title: "Error", description: err.error || "Failed to start chat.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquarePlus className="h-5 w-5" />
            <span>Start New IT Chat</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue">Issue Type *</Label>
              <select
                id="issue"
                value={form.issue}
                onChange={e => handleInputChange("issue", e.target.value)}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Select issue type</option>
                {issueTypes.map((issue) => (
                  <option key={issue} value={issue.toLowerCase()}>{issue}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <select
                id="priority"
                value={form.priority}
                onChange={e => handleInputChange("priority", e.target.value)}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Select priority</option>
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Provide additional details about the issue..."
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Start Chat</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
