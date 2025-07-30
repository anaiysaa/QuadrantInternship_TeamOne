import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageSquarePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function StartNewChatDialog({ children, onChatCreated }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    employeeId: "",
    issue: "",
    priority: "",
    description: "",
  });
  const { toast } = useToast();

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

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/employees")
      .then(async (res) => {
        const text = await res.text();
        try { return text ? JSON.parse(text) : []; } catch (e) { throw new Error("Invalid JSON: " + text); }
      })
      .then(data => {
        setAllEmployees(data);
        setFilteredEmployees(data);
      })
      .catch(err => console.error("Failed to load employees", err));
  }, [isOpen]);

  useEffect(() => {
    if (!search) {
      setFilteredEmployees(allEmployees);
    } else {
      setFilteredEmployees(
        allEmployees.filter(emp =>
          `${emp.name} (${emp.department})`.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, allEmployees]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev, [field]: value,
    }));
  };

  const handleEmployeeSelect = (id) => {
    setFormData((prev) => ({ ...prev, employeeId: id }));
    setSearch("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.issue || !formData.priority) {
      toast({
        title: "Missing Information",
        description: "Please select an employee, issue type, and priority.",
        variant: "destructive",
      });
      return;
    }    
    try {
      const res = await fetch("/api/livechats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: user.employeeId || user.id,
          to: formData.employeeId,
          issue: formData.issue,
          priority: formData.priority,
          description: formData.description,
          department: user.department,
        }),
      });
      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
      if (res.ok) {
        toast({ title: "Chat Started", description: "New chat created." });
        setIsOpen(false);
        setFormData({ employeeId: "", issue: "", priority: "", description: "" });
        setSearch("");
        if (onChatCreated) onChatCreated();
      } else {
        throw new Error(data.error || "Failed to start chat.");
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquarePlus className="h-5 w-5" />
            <span>Start New Chat</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="employee">Send To *</Label>
            <div className="relative">
              <Input
                placeholder="Type name or department…"
                value={
                  formData.employeeId
                    ? `${allEmployees.find((e) => e.id === formData.employeeId)?.name || ""} (${allEmployees.find((e) => e.id === formData.employeeId)?.department || ""})`
                    : search
                }
                onChange={(e) => {
                  setSearch(e.target.value);
                  setFormData((prev) => ({ ...prev, employeeId: "" }));
                }}
                onFocus={() => setFormData((prev) => ({ ...prev, employeeId: "" }))}
                readOnly={!!formData.employeeId}
                className="pr-8"
              />
              {!formData.employeeId && (
                <div className="absolute z-10 w-full bg-background border rounded mt-1 max-h-48 overflow-auto shadow">
                  {filteredEmployees.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground">No employees found</div>
                  )}
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => handleEmployeeSelect(emp.id)}
                      className="cursor-pointer px-3 py-2 hover:bg-accent text-sm"
                    >
                      {emp.name} <span className="text-muted-foreground">({emp.department})</span>
                    </div>
                  ))}
                </div>
              )}
              {formData.employeeId && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 right-1"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, employeeId: "" }));
                  }}
                >
                  ✕
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue">Issue Type *</Label>
              <select
                id="issue"
                value={formData.issue}
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
                value={formData.priority}
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
              value={formData.description}
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
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
