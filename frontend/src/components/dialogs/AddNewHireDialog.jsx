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
    managerName: "",
    phoneNumber: "",
    dob: "",
    gender: "",
    location: "",
    employmentType: "",
    managerEmail: "",
    notes: "",
    systemAccessList: "",
  });

  const [w4File, setW4File] = useState(null);
  const [i9File, setI9File] = useState(null);
  const [depositFile, setDepositFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddHire = async () => {
    const {
      name,
      email,
      role,
      dateJoined,
      managerName,
      phoneNumber,
      dob,
      gender,
      location,
      employmentType,
      managerEmail,
      notes,
      systemAccessList,
    } = formData;

    if (!name || !email || !role || !dateJoined) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
      });
      return;
    }

    try {
      setLoading(true);

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

      const form = new FormData();
      form.append("name", name);
      form.append("email", email);
      form.append("role", role);
      form.append("dateJoined", new Date(dateJoined).toISOString().split("T")[0]);
      form.append("managerId", managerId || "");
      form.append("phoneNumber", phoneNumber);
      form.append("dob", dob);
      form.append("gender", gender);
      form.append("location", location);
      form.append("employmentType", employmentType);
      form.append("managerEmail", managerEmail);
      form.append("notes", notes);
      form.append("systemAccessList", systemAccessList);
      if (w4File) form.append("w4", w4File);
      if (i9File) form.append("i9", i9File);
      if (depositFile) form.append("deposit", depositFile);

      const res = await fetch("/onboarding/newhires", {
        method: "POST",
        body: form,
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
        phoneNumber: "",
        dob: "",
        gender: "",
        location: "",
        employmentType: "",
        managerEmail: "",
        notes: "",
        systemAccessList: "",
      });

      setW4File(null);
      setI9File(null);
      setDepositFile(null);
    } catch (err) {
      toast({ title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Hire</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2 max-h-[65vh] overflow-y-auto pr-2">
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

          <div>
            <Label>Phone Number</Label>
            <Input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1 555 123 4567"
            />
          </div>

          <div>
            <Label>Date of Birth</Label>
            <Input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Gender</Label>
            <Input
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              placeholder="Male / Female / Non-binary"
            />
          </div>

          <div>
            <Label>Location</Label>
            <Input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Remote / HQ / Other"
            />
          </div>

          <div>
            <Label>Employment Type</Label>
            <Input
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              placeholder="Full-time / Part-time / Intern"
            />
          </div>

          <div>
            <Label>Manager Email</Label>
            <Input
              name="managerEmail"
              value={formData.managerEmail}
              onChange={handleChange}
              placeholder="Manager Email"
            />
          </div>

          <div>
            <Label>System Access (comma-separated)</Label>
            <Input
              name="systemAccessList"
              value={formData.systemAccessList}
              onChange={handleChange}
              placeholder="Slack, Email, GitHub"
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Input
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special notes"
            />
          </div>

          {/* File Uploads */}
          <div>
            <Label>W-4 Tax Form</Label>
            <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setW4File(e.target.files[0])} />
            {w4File && <p className="text-sm text-muted">Selected: {w4File.name}</p>}
          </div>

          <div>
            <Label>I-9 Employment Eligibility</Label>
            <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setI9File(e.target.files[0])} />
            {i9File && <p className="text-sm text-muted">Selected: {i9File.name}</p>}
          </div>

          <div>
            <Label>Direct Deposit Form</Label>
            <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setDepositFile(e.target.files[0])} />
            {depositFile && <p className="text-sm text-muted">Selected: {depositFile.name}</p>}
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
