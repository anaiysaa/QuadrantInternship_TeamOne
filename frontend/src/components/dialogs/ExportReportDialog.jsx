import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileDown, FileText, Table as TableIcon, BarChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export function ExportReportDialog({ open, onOpenChange }) {
  const [format, setFormat] = useState("pdf");
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [reportType, setReportType] = useState("complete");
  const { toast } = useToast();

  const exportFormats = [
    { value: "pdf", label: "PDF Document", icon: FileText },
    { value: "excel", label: "Excel Spreadsheet", icon: TableIcon },
    { value: "csv", label: "CSV File", icon: FileDown },
  ];

  const reportTypes = [
    { value: "complete", label: "Complete Inventory" },
    { value: "summary", label: "Summary Report" },
    { value: "low_stock", label: "Low Stock Items" },
    { value: "valuation", label: "Inventory Valuation" },
  ];

  const handleExport = () => {
    toast({
      title: "Report Generated",
      description: `Your ${reportType} report has been generated in ${format.toUpperCase()} format.`,
    });
    // In a real application, this would trigger the actual report generation and download
    setTimeout(() => {
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Export Inventory Report</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="format" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="format">Format Options</TabsTrigger>
            <TabsTrigger value="content">Content Options</TabsTrigger>
          </TabsList>
          <TabsContent value="format" className="space-y-4">
            <div className="space-y-4">
              <Label>Select Format</Label>
              <div className="grid grid-cols-3 gap-4">
                {exportFormats.map((item) => (
                  <div
                    key={item.value}
                    onClick={() => setFormat(item.value)}
                    className={`flex flex-col items-center p-4 border rounded-md cursor-pointer transition-colors ${
                      format === item.value
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    <item.icon className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Checkbox id="includeHeader" defaultChecked />
                <Label htmlFor="includeHeader">
                  Include header and pagination
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="compress" />
                <Label htmlFor="compress">Compress file</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-4">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full">
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

              <Separator className="my-4" />

              <Label>Data to Include</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="itemDetails" defaultChecked />
                  <Label htmlFor="itemDetails">Item details</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="pricing" defaultChecked />
                  <Label htmlFor="pricing">Pricing information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="suppliers" defaultChecked />
                  <Label htmlFor="suppliers">Supplier data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="stock" defaultChecked />
                  <Label htmlFor="stock">Stock levels</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="analytics"
                    checked={includeAnalytics}
                    onCheckedChange={setIncludeAnalytics}
                  />
                  <Label htmlFor="analytics">Include analytics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="history" />
                  <Label htmlFor="history">Order history</Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center mt-2 pt-2">
          <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {includeAnalytics
              ? "Analytics will be included in the report"
              : "Analytics will not be included in the report"}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="flex items-center">
            <FileDown className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
