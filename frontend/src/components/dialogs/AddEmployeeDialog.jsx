import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const STATUS_OPTIONS = ['Active', 'On Leave', 'Terminated', 'Inactive'];

function AddEmployeeDialog({ open, onOpenChange, onAdd }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    manager: '',
    joinDate: '',
    status: 'Active',
    phone: '',
  });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setForm({
        name: '',
        email: '',
        department: '',
        position: '',
        manager: '',
        joinDate: '',
        status: 'Active',
        phone: '',
      });
    }
  }, [open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await onAdd({ ...form });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div><b>Full Name</b>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Employee Name" />
          </div>
          <div><b>Email</b>
            <Input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
          </div>
          <div><b>Department</b>
            <Input name="department" value={form.department} onChange={handleChange} placeholder="Department" />
          </div>
          <div><b>Position</b>
            <Input name="position" value={form.position} onChange={handleChange} placeholder="Position" />
          </div>
          <div><b>Manager (Name or ID)</b>
            <Input name="manager" value={form.manager} onChange={handleChange} placeholder="Manager Name or ID" />
          </div>
          <div><b>Phone</b>
            <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
          </div>
          <div><b>Join Date</b>
            <Input type="date" name="joinDate" value={form.joinDate} onChange={handleChange} />
          </div>
          <div><b>Status</b>
            <select
              className="w-full border rounded px-2 py-2 mt-1"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map(option =>
                <option key={option} value={option}>{option}</option>
              )}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddEmployeeDialog;