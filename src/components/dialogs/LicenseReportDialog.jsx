
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FileDown, FileSpreadsheet, FileText, Calendar, Filter } from 'lucide-react';

export function LicenseReportDialog({ children, softwareLicenses }) {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState('comprehensive');
  const [exportFormat, setExportFormat] = useState('csv');
  const { toast } = useToast();

  const [selectedCategories, setSelectedCategories] = useState({
    Productivity: true,
    Creative: true,
    Communication: true,
    Development: true,
    Security: true,
    Analytics: true,
    Finance: true,
    Design: true,
    CRM: true,
    Collaboration: true
  });

  const [includeFields, setIncludeFields] = useState({
    basicInfo: true,
    usage: true,
    costs: true,
    expiry: true,
    manager: true,
    notes: false
  });

  const categories = [...new Set(softwareLicenses.map(s => s.category))];

  const handleCategoryChange = (category, checked) => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: checked
    }));
  };

  const handleFieldChange = (field, checked) => {
    setIncludeFields(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const generateReport = () => {
    // Filter licenses based on selected categories
    const filteredLicenses = softwareLicenses.filter(license => 
      selectedCategories[license.category]
    );

    // Generate report data based on selected fields
    const reportData = filteredLicenses.map(license => {
      const row = {};
      
      if (includeFields.basicInfo) {
        row['Software Name'] = license.name;
        row['Vendor'] = license.vendor;
        row['Category'] = license.category;
        row['License Type'] = license.licenseType;
        row['Status'] = license.status;
      }
      
      if (includeFields.usage) {
        row['Total Licenses'] = license.totalLicenses;
        row['Used Licenses'] = license.usedLicenses;
        row['Available Licenses'] = license.availableLicenses;
        row['Utilization %'] = ((license.usedLicenses / license.totalLicenses) * 100).toFixed(1);
      }
      
      if (includeFields.costs) {
        row['Cost per License'] = `$${license.costPerLicense}`;
        row['Total Monthly Cost'] = `$${license.totalCost}`;
      }
      
      if (includeFields.expiry) {
        row['Expiry Date'] = license.expiryDate;
        const daysUntilExpiry = Math.ceil((new Date(license.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        row['Days Until Expiry'] = daysUntilExpiry;
      }
      
      if (includeFields.manager) {
        row['License Manager'] = license.manager;
      }
      
      if (includeFields.notes) {
        row['Notes'] = license.notes;
      }
      
      return row;
    });

    // Create downloadable file
    if (exportFormat === 'csv') {
      downloadCSV(reportData);
    } else if (exportFormat === 'json') {
      downloadJSON(reportData);
    }

    toast({
      title: "Report Generated",
      description: `License report exported as ${exportFormat.toUpperCase()} with ${reportData.length} licenses.`,
    });

    setOpen(false);
  };

  const downloadCSV = (data) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `license-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadJSON = (data) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `license-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getReportSummary = () => {
    const filtered = softwareLicenses.filter(license => selectedCategories[license.category]);
    const totalCost = filtered.reduce((sum, license) => sum + license.totalCost, 0);
    const totalLicenses = filtered.reduce((sum, license) => sum + license.totalLicenses, 0);
    const usedLicenses = filtered.reduce((sum, license) => sum + license.usedLicenses, 0);

    return {
      count: filtered.length,
      totalCost,
      totalLicenses,
      usedLicenses,
      utilization: ((usedLicenses / totalLicenses) * 100).toFixed(1)
    };
  };

  const summary = getReportSummary();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Generate License Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{summary.count}</p>
                  <p className="text-sm text-muted-foreground">Software Items</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{summary.totalLicenses}</p>
                  <p className="text-sm text-muted-foreground">Total Licenses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">${summary.totalCost}</p>
                  <p className="text-sm text-muted-foreground">Monthly Cost</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning">{summary.utilization}%</p>
                  <p className="text-sm text-muted-foreground">Utilization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Report Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={reportType} onValueChange={setReportType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comprehensive" id="comprehensive" />
                  <Label htmlFor="comprehensive">Comprehensive Report - All license details</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="summary" id="summary" />
                  <Label htmlFor="summary">Summary Report - Key metrics only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expiring" id="expiring" />
                  <Label htmlFor="expiring">Expiring Licenses - Focus on renewal needs</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories[category]}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                    />
                    <Label htmlFor={category} className="text-sm">{category}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fields to Include */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fields to Include</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="basicInfo"
                    checked={includeFields.basicInfo}
                    onCheckedChange={(checked) => handleFieldChange('basicInfo', checked)}
                  />
                  <Label htmlFor="basicInfo" className="text-sm">Basic Information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="usage"
                    checked={includeFields.usage}
                    onCheckedChange={(checked) => handleFieldChange('usage', checked)}
                  />
                  <Label htmlFor="usage" className="text-sm">Usage Statistics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="costs"
                    checked={includeFields.costs}
                    onCheckedChange={(checked) => handleFieldChange('costs', checked)}
                  />
                  <Label htmlFor="costs" className="text-sm">Cost Information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="expiry"
                    checked={includeFields.expiry}
                    onCheckedChange={(checked) => handleFieldChange('expiry', checked)}
                  />
                  <Label htmlFor="expiry" className="text-sm">Expiry Dates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manager"
                    checked={includeFields.manager}
                    onCheckedChange={(checked) => handleFieldChange('manager', checked)}
                  />
                  <Label htmlFor="manager" className="text-sm">License Manager</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notes"
                    checked={includeFields.notes}
                    onCheckedChange={(checked) => handleFieldChange('notes', checked)}
                  />
                  <Label htmlFor="notes" className="text-sm">Notes & Comments</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Format */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Format</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Excel Compatible)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="json" />
                  <Label htmlFor="json" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    JSON (Data Format)
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={generateReport} className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
