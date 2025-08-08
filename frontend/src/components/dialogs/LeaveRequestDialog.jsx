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
  const [paidLeave, setPaidLeave] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Live business days calculation
  const days = countBusinessDays(startDate, endDate);

  // Reset fields when dialog opens
  useEffect(() => {
    if (open) {
      setType(defaultType || '');
      setStartDate('');
      setEndDate('');
      setReason('');
      setUrgent(false);
      setPaidLeave(false);
    }
  }, [open, defaultType]);

  // Auto-set end date when start date changes (for single day requests)
  useEffect(() => {
    if (startDate && !endDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const handleSubmit = async () => {
    if (!type || !startDate || !endDate || !reason) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (days === 0) {
      alert('Please select valid business days for your leave');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await onSubmit({
        type,
        startDate,
        endDate,
        reason,
        urgent,
        paidLeave
      });
    } catch (error) {
      console.error('Error submitting leave request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Leave Type *</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">Select leave type</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Personal Leave">Personal Leave</option>
              <option value="Maternity">Maternity/Paternity Leave</option>
              <option value="Vacation">Vacation</option>
              <option value="Bereavement">Bereavement Leave</option>
              <option value="Emergency">Emergency Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                required 
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date *</label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                required 
                min={startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <div className="flex items-center space-x-2">
              <Input 
                value={days > 0 ? `${days} business day${days !== 1 ? 's' : ''}` : '0 days'} 
                readOnly 
                className="bg-muted"
              />
              <span className="text-xs text-muted-foreground">(weekends excluded)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reason *</label>
            <Input 
              value={reason} 
              onChange={e => setReason(e.target.value)} 
              placeholder="Please provide a reason for your leave request"
              required 
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={paidLeave} 
                onCheckedChange={setPaidLeave} 
                id="paidLeave" 
              />
              <label htmlFor="paidLeave" className="text-sm font-medium">
                Request as paid leave
              </label>
              <span className="text-xs text-muted-foreground ml-2">
                (will deduct from your paid leave balance if approved)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={urgent} 
                onCheckedChange={setUrgent} 
                id="urgent" 
              />
              <label htmlFor="urgent" className="text-sm font-medium">
                Mark as urgent
              </label>
              <span className="text-xs text-muted-foreground ml-2">
                (requires immediate attention)
              </span>
            </div>
          </div>

          {/* Payment Information Panel */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Payment Information</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Paid leave: Deducted from your paid leave balance</p>
              <p>• Unpaid leave: No deduction from balance, no pay for leave days</p>
              <p>• Final approval depends on leave policy and availability</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={submitting || days === 0 || !type || !startDate || !endDate || !reason}
              className="min-w-[120px]"
            >
              {submitting ? 'Submitting...' : `Submit Request`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}