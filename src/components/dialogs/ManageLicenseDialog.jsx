
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ManageLicenseDialog({ children, software }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    totalLicenses: software?.totalLicenses || '',
    usedLicenses: software?.usedLicenses || '',
    costPerLicense: software?.costPerLicense || '',
    manager: software?.manager || '',
    status: software?.status || '',
    notes: software?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Managing license:', software.name, formData);
    toast({
      title: "License Updated",
      description: `${software.name} license has been updated successfully.`,
    });
    setOpen(false);
  };

  const handleAssignLicense = () => {
    console.log('Assigning license to user');
    toast({
      title: "License Assigned",
      description: "License has been assigned to selected user.",
    });
  };

  const handleRevokeLicense = () => {
    console.log('Revoking license from user');
    toast({
      title: "License Revoked",
      description: "License has been revoked from selected user.",
    });
  };

  if (!software) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage License - {software.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* License Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">License Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Vendor</Label>
                  <p className="font-medium">{software.vendor}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Category</Label>
                  <Badge variant="outline">{software.category}</Badge>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">License Type</Label>
                  <p className="font-medium">{software.licenseType}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Expiry Date</Label>
                  <p className="font-medium">{new Date(software.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleAssignLicense}>
                  Assign License
                </Button>
                <Button variant="outline" onClick={handleRevokeLicense}>
                  Revoke License
                </Button>
                <Button variant="outline">
                  View Usage History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Edit License Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Edit License Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalLicenses">Total Licenses</Label>
                    <Input
                      id="totalLicenses"
                      type="number"
                      value={formData.totalLicenses}
                      onChange={(e) => setFormData({ ...formData, totalLicenses: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usedLicenses">Used Licenses</Label>
                    <Input
                      id="usedLicenses"
                      type="number"
                      value={formData.usedLicenses}
                      onChange={(e) => setFormData({ ...formData, usedLicenses: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costPerLicense">Cost per License ($)</Label>
                    <Input
                      id="costPerLicense"
                      type="number"
                      step="0.01"
                      value={formData.costPerLicense}
                      onChange={(e) => setFormData({ ...formData, costPerLicense: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager">License Manager</Label>
                  <Input
                    id="manager"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
