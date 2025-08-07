import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const EditProfileDialog = ({ open, onOpenChange, employeeId, onUpdated }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", gender: "", campus: ""
  });

  useEffect(() => {
    if (open && employeeId) {
      fetch(`/resume/employees/${employeeId}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            gender: data.gender || "",
            campus: data.campus || "",
          });
        });
    }
  }, [open, employeeId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const res = await fetch(`/resume/employees/${employeeId}/update-personal`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      toast({ title: "Personal info updated" });
      onOpenChange(false);
      onUpdated?.();
    } else {
      toast({ title: "Error", description: "Update failed", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Personal Info</DialogTitle></DialogHeader>
        <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
        <Input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <Input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
        <Input name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
        <Input name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} />
        <Input name="campus" placeholder="Location/Campus" value={formData.campus} onChange={handleChange} />
        <Button onClick={handleSubmit}>Save</Button>
      </DialogContent>
    </Dialog>
  );
};
