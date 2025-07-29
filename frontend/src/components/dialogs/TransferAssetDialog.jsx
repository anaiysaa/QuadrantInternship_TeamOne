import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function TransferAssetDialog({ children, asset, onTransfer }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    newEmployee: '',
    newDepartment: '',
    newLocation: '',
    transferReason: '',
    transferDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Call the onTransfer function instead of just console.log
    if (onTransfer) {
      onTransfer({
        assetId: asset?.id,
        newEmployee: formData.newEmployee,
        newLocation: formData.newLocation,
        transferReason: formData.transferReason
      });
    }
    
    setOpen(false);
    setFormData({
      newEmployee: '', newDepartment: '', newLocation: '', transferReason: '',
      transferDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer Asset - {asset?.id}</DialogTitle>
        </DialogHeader>
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm"><strong>Current Assignment:</strong></p>
          <p className="text-sm">{asset?.employee} - {asset?.department}</p>
          <p className="text-sm">{asset?.assetType} - {asset?.brand} {asset?.model}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newEmployee">New Employee</Label>
              <Input
                id="newEmployee"
                value={formData.newEmployee}
                onChange={(e) => setFormData({ ...formData, newEmployee: e.target.value })}
                placeholder="Employee name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newDepartment">New Department</Label>
              <Select value={formData.newDepartment} onValueChange={(value) => setFormData({ ...formData, newDepartment: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newLocation">New Location</Label>
              <Input
                id="newLocation"
                value={formData.newLocation}
                onChange={(e) => setFormData({ ...formData, newLocation: e.target.value })}
                placeholder="Physical location"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transferDate">Transfer Date</Label>
              <Input
                id="transferDate"
                type="date"
                value={formData.transferDate}
                onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transferReason">Transfer Reason</Label>
            <Textarea
              id="transferReason"
              value={formData.transferReason}
              onChange={(e) => setFormData({ ...formData, transferReason: e.target.value })}
              placeholder="Reason for transfer"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Transfer Asset</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
