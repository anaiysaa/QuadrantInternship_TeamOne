
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function AddLicenseDialog({ children }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    vendor: '',
    category: '',
    licenseType: '',
    totalLicenses: '',
    costPerLicense: '',
    expiryDate: '',
    manager: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Adding license:', formData);
    toast({
      title: "License Added",
      description: "New software license has been added successfully.",
    });
    setOpen(false);
    setFormData({
      name: '', vendor: '', category: '', licenseType: '', totalLicenses: '',
      costPerLicense: '', expiryDate: '', manager: '', notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Software License</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Software Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Software name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="Vendor name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Productivity">Productivity</SelectItem>
                  <SelectItem value="Creative">Creative</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Communication">Communication</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Analytics">Analytics</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="CRM">CRM</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Collaboration">Collaboration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseType">License Type</Label>
              <Select value={formData.licenseType} onValueChange={(value) => setFormData({ ...formData, licenseType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Subscription">Subscription</SelectItem>
                  <SelectItem value="Annual">Annual</SelectItem>
                  <SelectItem value="Perpetual">Perpetual</SelectItem>
                  <SelectItem value="Site License">Site License</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalLicenses">Total Licenses</Label>
              <Input
                id="totalLicenses"
                type="number"
                value={formData.totalLicenses}
                onChange={(e) => setFormData({ ...formData, totalLicenses: e.target.value })}
                placeholder="Number of licenses"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPerLicense">Cost per License ($)</Label>
              <Input
                id="costPerLicense"
                type="number"
                step="0.01"
                value={formData.costPerLicense}
                onChange={(e) => setFormData({ ...formData, costPerLicense: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Manager</Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                placeholder="License manager"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the license"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add License</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
