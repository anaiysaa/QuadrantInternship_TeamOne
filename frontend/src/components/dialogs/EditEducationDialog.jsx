import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const EditEducationDialog = ({ open, onOpenChange, employeeId, onUpdated }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    degree: "",
    field: "",
    institution: "",
    year: ""
  });

  useEffect(() => {
    if (open && employeeId) {
      fetch(`/resume/employees/${employeeId}`)
        .then(res => res.json())
        .then(data => {
          setForm({
            degree: data.educationDegree || "",
            field: data.educationField || "",
            institution: data.educationInstitution || "",
            year: data.educationYear || ""
          });
        });
    }
  }, [open, employeeId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const res = await fetch(`/resume/employees/${employeeId}/update-education`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast({ title: "Education updated!" });
      onOpenChange(false);
      onUpdated?.();
    } else {
      toast({ title: "Error", description: "Failed to update education.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Education</DialogTitle>
        </DialogHeader>
        <Input
          name="degree"
          placeholder="Degree"
          value={form.degree}
          onChange={handleChange}
        />
        <Input
          name="field"
          placeholder="Field of Study"
          value={form.field}
          onChange={handleChange}
        />
        <Input
          name="institution"
          placeholder="Institution"
          value={form.institution}
          onChange={handleChange}
        />
        <Input
          name="year"
          placeholder="Year"
          value={form.year}
          onChange={handleChange}
        />
        <Button onClick={handleSubmit}>Save</Button>
      </DialogContent>
    </Dialog>
  );
};
