
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
import { Calendar, AlertCircle, CreditCard } from 'lucide-react';

export function RenewLicenseDialog({ children, software }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    renewalPeriod: '12',
    newExpiryDate: '',
    costPerLicense: software?.costPerLicense || '',
    totalLicenses: software?.totalLicenses || '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Renewing license:', software.name, formData);
    toast({
      title: "License Renewal Initiated",
      description: `Renewal process started for ${software.name}. You will receive confirmation shortly.`,
    });
    setOpen(false);
  };

  const calculateRenewalCost = () => {
    const cost = parseFloat(formData.costPerLicense) || 0;
    const licenses = parseInt(formData.totalLicenses) || 0;
    const months = parseInt(formData.renewalPeriod) || 0;
    return (cost * licenses * months).toFixed(2);
  };

  const calculateNewExpiryDate = () => {
    const currentExpiry = new Date(software.expiryDate);
    const months = parseInt(formData.renewalPeriod) || 0;
    const newDate = new Date(currentExpiry);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate.toISOString().split('T')[0];
  };

  const isExpiringSoon = () => {
    const expiryDate = new Date(software.expiryDate);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  if (!software) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Renew License - {software.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current License Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Current License Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Current Expiry</Label>
                  <p className="font-medium">{new Date(software.expiryDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2">
                    {isExpiringSoon() && <AlertCircle className="h-4 w-4 text-warning" />}
                    <Badge variant={isExpiringSoon() ? "outline" : "default"} className={isExpiringSoon() ? "text-warning border-warning" : ""}>
                      {software.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Current Licenses</Label>
                  <p className="font-medium">{software.totalLicenses}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Monthly Cost</Label>
                  <p className="font-medium">${software.totalCost}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Renewal Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Renewal Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="renewalPeriod">Renewal Period</Label>
                    <Select value={formData.renewalPeriod} onValueChange={(value) => setFormData({ ...formData, renewalPeriod: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 months</SelectItem>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newExpiryDate">New Expiry Date</Label>
                    <Input
                      id="newExpiryDate"
                      type="date"
                      value={calculateNewExpiryDate()}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalLicenses">Number of Licenses</Label>
                    <Input
                      id="totalLicenses"
                      type="number"
                      value={formData.totalLicenses}
                      onChange={(e) => setFormData({ ...formData, totalLicenses: e.target.value })}
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
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Renewal Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special requirements or notes for this renewal..."
                    rows={3}
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Renewal Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Renewal Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Renewal Period:</span>
                  <span className="font-medium">{formData.renewalPeriod} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number of Licenses:</span>
                  <span className="font-medium">{formData.totalLicenses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost per License:</span>
                  <span className="font-medium">${formData.costPerLicense}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Renewal Cost:</span>
                    <span>${calculateRenewalCost()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Process Renewal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
