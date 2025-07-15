
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Calendar } from 'lucide-react';

export function GenerateReportsDialog({ open, onOpenChange }) {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [departments, setDepartments] = useState([]);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'payroll-summary', label: 'Payroll Summary' },
    { value: 'department-breakdown', label: 'Department Breakdown' },
    { value: 'tax-withholdings', label: 'Tax Withholdings' },
    { value: 'employee-earnings', label: 'Employee Earnings' },
    { value: 'deduction-analysis', label: 'Deduction Analysis' },
  ];

  const dateRanges = [
    { value: 'current-period', label: 'Current Pay Period' },
    { value: 'last-period', label: 'Last Pay Period' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const availableDepartments = ['Engineering', 'HR', 'Marketing', 'Sales', 'Finance'];

  const handleDepartmentChange = (dept, checked) => {
    if (checked) {
      setDepartments([...departments, dept]);
    } else {
      setDepartments(departments.filter(d => d !== dept));
    }
  };

  const handleGenerate = async () => {
    if (!reportType || !dateRange) {
      toast({
        title: "Missing Information",
        description: "Please select a report type and date range.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Report Generated",
        description: `${reportTypes.find(r => r.value === reportType)?.label} report has been generated successfully.`,
      });
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Reports
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-range">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Departments (optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableDepartments.map((dept) => (
                <div key={dept} className="flex items-center space-x-2">
                  <Checkbox
                    id={dept}
                    checked={departments.includes(dept)}
                    onCheckedChange={(checked) => handleDepartmentChange(dept, checked)}
                  />
                  <Label htmlFor={dept} className="text-sm">{dept}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-details"
              checked={includeDetails}
              onCheckedChange={setIncludeDetails}
            />
            <Label htmlFor="include-details">Include detailed breakdown</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
