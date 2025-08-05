import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const EditProfessionalDialog = ({ open, onOpenChange, employeeId, onUpdated }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    department: "", role: "", status: "", managerId: "", teamId: "",
    paidLeavesLeft: "", trainingsDone: "", trainingsLeft: "", employmentStatus: ""
  });

  useEffect(() => {
    if (open && employeeId) {
      fetch(`/resume/employees/${employeeId}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            department: data.department || "",
            role: data.role || "",
            status: data.status || "",
            managerId: data.managerId || "",
            teamId: data.teamId || "",
            paidLeavesLeft: data.paidLeavesLeft ?? "",
            trainingsDone: data.trainingsDone ?? "",
            trainingsLeft: data.trainingsLeft ?? "",
            employmentStatus: data.employmentStatus || "",
          });
        });
    }
  }, [open, employeeId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const res = await fetch(`/resume/employees/${employeeId}/update-professional`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      toast({ title: "Professional info updated" });
      onOpenChange(false);
      onUpdated?.();
    } else {
      toast({ title: "Error", description: "Update failed", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Professional Info</DialogTitle></DialogHeader>
        <Input name="department" placeholder="Department" value={formData.department} onChange={handleChange} />
        <Input name="role" placeholder="Role" value={formData.role} onChange={handleChange} />
        <Input name="status" placeholder="Status" value={formData.status} onChange={handleChange} />
        <Input name="managerId" placeholder="Manager ID" value={formData.managerId} onChange={handleChange} />
        <Input name="teamId" placeholder="Team ID" value={formData.teamId} onChange={handleChange} />
        <Input name="paidLeavesLeft" placeholder="Paid Leaves Left" value={formData.paidLeavesLeft} onChange={handleChange} />
        <Input name="trainingsDone" placeholder="Trainings Done" value={formData.trainingsDone} onChange={handleChange} />
        <Input name="trainingsLeft" placeholder="Trainings Left" value={formData.trainingsLeft} onChange={handleChange} />
        <Input name="employmentStatus" placeholder="Employment Status" value={formData.employmentStatus} onChange={handleChange} />
        <Button onClick={handleSubmit}>Save</Button>
      </DialogContent>
    </Dialog>
  );
};

