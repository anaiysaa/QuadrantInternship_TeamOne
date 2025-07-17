
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Image, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ExportChartDialog({ open, onOpenChange }) {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(false);
  const [orientation, setOrientation] = useState('landscape');
  const [departments, setDepartments] = useState(['all']);
  const { toast } = useToast();

  const exportFormats = [
    { id: 'pdf', label: 'PDF Document', icon: FileText, description: 'High-quality PDF format' },
    { id: 'png', label: 'PNG Image', icon: Image, description: 'Portable image format' },
    { id: 'svg', label: 'SVG Vector', icon: Image, description: 'Scalable vector graphics' }
  ];

  const departmentOptions = [
    { id: 'all', label: 'All Departments' },
    { id: 'executive', label: 'Executive' },
    { id: 'engineering', label: 'Engineering' },
    { id: 'hr', label: 'HR' },
    { id: 'marketing', label: 'Marketing' }
  ];

  const handleExport = () => {
    toast({
      title: "Chart Export Started",
      description: `Exporting organization chart as ${exportFormat.toUpperCase()}...`,
    });
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Organization chart has been exported successfully.",
      });
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Organization Chart</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
              {exportFormats.map((format) => (
                <div key={format.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={format.id} id={format.id} />
                  <label htmlFor={format.id} className="flex items-center space-x-2 cursor-pointer">
                    <format.icon className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">{format.label}</p>
                      <p className="text-xs text-muted-foreground">{format.description}</p>
                    </div>
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Orientation */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Orientation</Label>
            <Select value={orientation} onValueChange={setOrientation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="landscape">Landscape</SelectItem>
                <SelectItem value="portrait">Portrait</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="details" 
                  checked={includeDetails} 
                  onCheckedChange={setIncludeDetails} 
                />
                <label htmlFor="details" className="text-sm cursor-pointer">
                  Include employee details (email, phone)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="photos" 
                  checked={includePhotos} 
                  onCheckedChange={setIncludePhotos} 
                />
                <label htmlFor="photos" className="text-sm cursor-pointer">
                  Include profile photos
                </label>
              </div>
            </div>
          </div>

          {/* Department Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Departments</Label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Chart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
