
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
import { Download, FileSpreadsheet, FileText, FileJson } from 'lucide-react';

export function ExportKnowledgeBaseDialog({ open, onOpenChange }) {
  const [exportFormat, setExportFormat] = useState('');
  const [exportScope, setExportScope] = useState('');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeStatistics, setIncludeStatistics] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportFormats = [
    { value: 'pdf', label: 'PDF Document', icon: FileText },
    { value: 'excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet },
    { value: 'csv', label: 'CSV File', icon: FileText },
    { value: 'json', label: 'JSON Data', icon: FileJson },
  ];

  const exportScopes = [
    { value: 'all', label: 'All Articles' },
    { value: 'category', label: 'By Category' },
    { value: 'popular', label: 'Popular Articles Only (>200 views)' },
    { value: 'recent', label: 'Recent Articles (Last 30 days)' },
  ];

  const categories = ['Security', 'Network', 'Hardware', 'Software', 'Setup'];

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleExport = async () => {
    if (!exportFormat || !exportScope) {
      toast({
        title: "Missing Information",
        description: "Please select export format and scope.",
        variant: "destructive",
      });
      return;
    }

    if (exportScope === 'category' && selectedCategories.length === 0) {
      toast({
        title: "No Categories Selected",
        description: "Please select at least one category to export.",
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
        description: `Knowledge base exported as ${exportFormats.find(f => f.value === exportFormat)?.label}`,
      });
      
      // Reset form
      setExportFormat('');
      setExportScope('');
      setSelectedCategories([]);
      setIncludeMetadata(true);
      setIncludeStatistics(false);
      
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Knowledge Base
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
            <Label htmlFor="export-scope">Export Scope</Label>
            <Select value={exportScope} onValueChange={setExportScope}>
              <SelectTrigger>
                <SelectValue placeholder="Select what to export" />
              </SelectTrigger>
              <SelectContent>
                {exportScopes.map((scope) => (
                  <SelectItem key={scope.value} value={scope.value}>
                    {scope.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {exportScope === 'category' && (
            <div className="space-y-2">
              <Label>Select Categories</Label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label htmlFor={category} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Export Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-metadata"
                  checked={includeMetadata}
                  onCheckedChange={setIncludeMetadata}
                />
                <Label htmlFor="include-metadata" className="text-sm">
                  Include metadata (author, dates, views)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-statistics"
                  checked={includeStatistics}
                  onCheckedChange={setIncludeStatistics}
                />
                <Label htmlFor="include-statistics" className="text-sm">
                  Include usage statistics
                </Label>
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
                  Export KB
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
