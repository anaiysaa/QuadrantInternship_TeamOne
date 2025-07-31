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
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    dateJoined: "",
    managerName: "", // ✅ take manager name instead of ID
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddHire = async () => {
    const { name, email, role, dateJoined, managerName } = formData;

    if (!name || !email || !role || !dateJoined) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
      });
      return;
    }

    try {
      setLoading(true);

      // ✅ Fetch Manager ID if managerName is provided
      let managerId = null;
      if (managerName.trim() !== "") {
        const resManager = await fetch("/onboarding/managerid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ managerName }),
        });

        const managerResult = await resManager.json();
        if (resManager.ok && managerResult.managerId) {
          managerId = managerResult.managerId;
        } else {
          toast({
            title: "Warning",
            description: "Manager not found. Adding hire without Manager ID.",
          });
        }
      }

      // ✅ Build payload
      const payload = {
        name,
        email,
        role,
        dateJoined: new Date(dateJoined).toISOString().split("T")[0], // format YYYY-MM-DD
        managerId,
      };

      // ✅ Send request to backend
      const res = await fetch("/onboarding/newhires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to add new hire");

      toast({
        title: "Success",
        description: `New hire ${result.name} created successfully!`,
      });

      fetchCandidates && fetchCandidates();
      onOpenChange(false);

      setFormData({
        name: "",
        email: "",
        role: "",
        dateJoined: "",
        managerName: "",
      });
    } catch (err) {
      toast({ title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Hire</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Name *</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
            />
          </div>

          <div>
            <Label>Email *</Label>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
            />
          </div>

          <div>
            <Label>Role *</Label>
            <Input
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Job Role"
            />
          </div>

          <div>
            <Label>Start Date *</Label>
            <Input
              type="date"
              name="dateJoined"
              value={formData.dateJoined}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Manager Name (Optional)</Label>
            <Input
              name="managerName"
              value={formData.managerName}
              onChange={handleChange}
              placeholder="Manager Name"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddHire} disabled={loading}>
            {loading ? "Adding..." : "Add Hire"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
