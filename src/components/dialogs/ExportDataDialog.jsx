
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

export function ExportDataDialog({ open, onOpenChange }) {
  const [exportFormat, setExportFormat] = useState('');
  const [dataType, setDataType] = useState('');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [includeFilters, setIncludeFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportFormats = [
    { value: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
    { value: 'csv', label: 'CSV (.csv)', icon: FileText },
    { value: 'pdf', label: 'PDF (.pdf)', icon: FileText },
  ];

  const dataTypes = [
    { value: 'current-payroll', label: 'Current Payroll Records' },
    { value: 'all-payroll', label: 'All Payroll Records' },
    { value: 'employee-data', label: 'Employee Data Only' },
    { value: 'financial-summary', label: 'Financial Summary' },
  ];

  const handleExport = async () => {
    if (!exportFormat || !dataType) {
      toast({
        title: "Missing Information",
        description: "Please select export format and data type.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Export Successful",
        description: `Data exported as ${exportFormats.find(f => f.value === exportFormat)?.label}`,
      });
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="export-format">Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {exportFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex items-center gap-2">
                      <format.icon className="h-4 w-4" />
                      {format.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-type">Data to Export</Label>
            <Select value={dataType} onValueChange={setDataType}>
              <SelectTrigger>
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                {dataTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Export Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-headers"
                  checked={includeHeaders}
                  onCheckedChange={setIncludeHeaders}
                />
                <Label htmlFor="include-headers">Include column headers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-filters"
                  checked={includeFilters}
                  onCheckedChange={setIncludeFilters}
                />
                <Label htmlFor="include-filters">Apply current filters</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>Exporting...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
