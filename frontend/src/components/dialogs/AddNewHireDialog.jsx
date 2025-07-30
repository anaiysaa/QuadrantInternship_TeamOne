import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function AddNewHireDialog({ open, onOpenChange, fetchCandidates }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    startDate: "",
    managerName: "",
    managerId: null,
  });

  const { toast } = useToast();

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Fetch Manager ID when manager name changes
  const fetchManagerId = async (name) => {
    if (!name.trim()) {
      setFormData((prev) => ({ ...prev, managerId: null }));
      return;
    }
    try {
      const res = await fetch("/onboarding/managerid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerName: name }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, managerId: data.managerId }));
      }
    } catch (err) {
      console.error("❌ Manager fetch error:", err);
    }
  };

  // ✅ Submit new hire without department/checklist
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/onboarding/newhires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.position,
          dateJoined: formData.startDate,
          managerId: formData.managerId,
          onboardingStatus: "Not Started",
          checklistAssigned: false, // No checklist assigned yet
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to add new hire.");

      toast({
        title: "✅ Success",
        description: `${formData.name} has been added.`,
      });

      // ✅ Reset form after success
      setFormData({
        name: "",
        email: "",
        position: "",
        startDate: "",
        managerName: "",
        managerId: null,
      });

      fetchCandidates && fetchCandidates();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "❌ Error", description: error.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Hire</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Position + Start Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Position</Label>
              <Input
                value={formData.position}
                onChange={(e) => updateField("position", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Manager Name */}
          <div>
            <Label>Manager</Label>
            <Input
              value={formData.managerName}
              onChange={(e) => {
                updateField("managerName", e.target.value);
                fetchManagerId(e.target.value);
              }}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add New Hire</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
