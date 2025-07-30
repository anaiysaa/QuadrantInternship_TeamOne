import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

function countBusinessDays(start, end) {
  if (!start || !end) return 0;
  let s = new Date(start);
  let e = new Date(end);
  if (s > e) return 0;
  let count = 0;
  while (s <= e) {
    if (s.getDay() !== 0 && s.getDay() !== 6) count++;
    s.setDate(s.getDate() + 1);
  }
  return count;
}

export default function LeaveRequestDialog({ open, onOpenChange, defaultType, onSubmit }) {
  const [type, setType] = useState(defaultType || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Live business days calculation
  const days = countBusinessDays(startDate, endDate);

  // Reset fields on open
  React.useEffect(() => {
    if (open) {
      setType(defaultType || '');
      setStartDate('');
      setEndDate('');
      setReason('');
      setUrgent(false);
    }
  }, [open, defaultType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !startDate || !endDate || !reason) return;
    setSubmitting(true);
    await onSubmit({
      type,
      startDate,
      endDate,
      reason,
      urgent
    });
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium">Leave Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full border rounded px-2 py-1"
              required
            >
              <option value="">Select type</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Personal Leave">Personal Leave</option>
              <option value="Maternity">Maternity</option>
              <option value="Vacation">Vacation</option>
              <option value="Work from Home">Work from Home</option>
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium">Start Date</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">End Date</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Days (auto-calculated, excluding weekends)</label>
            <Input value={days || ''} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium">Reason</label>
            <Input value={reason} onChange={e => setReason(e.target.value)} required />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox checked={urgent} onCheckedChange={setUrgent} id="urgent" />
            <label htmlFor="urgent" className="text-sm">Mark as urgent</label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || days === 0 || !type || !startDate || !endDate || !reason}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
