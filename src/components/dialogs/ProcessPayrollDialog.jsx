
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Play, AlertTriangle, DollarSign } from 'lucide-react';

export function ProcessPayrollDialog({ open, onOpenChange }) {
  const [payDate, setPayDate] = useState('');
  const [confirmProcess, setConfirmProcess] = useState(false);
  const [sendNotifications, setSendNotifications] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Mock data for payroll summary
  const payrollSummary = {
    totalEmployees: 5,
    pendingEmployees: 2,
    grossTotal: 24100,
    netTotal: 16870,
    deductionsTotal: 7230,
  };

  const handleProcess = async () => {
    if (!payDate || !confirmProcess) {
      toast({
        title: "Missing Information",
        description: "Please set the pay date and confirm processing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payroll processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Payroll Processed",
        description: `Payroll for ${payrollSummary.totalEmployees} employees has been processed successfully.`,
      });
      onOpenChange(false);
    }, 3000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Process Payroll
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payroll Summary
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Total Employees:</div>
              <div className="font-medium">{payrollSummary.totalEmployees}</div>
              <div>Pending:</div>
              <div>
                <Badge variant="outline" className="text-warning">
                  {payrollSummary.pendingEmployees}
                </Badge>
              </div>
              <div>Gross Total:</div>
              <div className="font-medium">{formatCurrency(payrollSummary.grossTotal)}</div>
              <div>Net Total:</div>
              <div className="font-medium text-success">{formatCurrency(payrollSummary.netTotal)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-date">Pay Date</Label>
            <Input
              id="pay-date"
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="send-notifications"
                checked={sendNotifications}
                onCheckedChange={setSendNotifications}
              />
              <Label htmlFor="send-notifications">Send pay stubs via email</Label>
            </div>
          </div>

          {payrollSummary.pendingEmployees > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Warning</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                {payrollSummary.pendingEmployees} employees have pending payroll records that require review.
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <Checkbox
              id="confirm-process"
              checked={confirmProcess}
              onCheckedChange={setConfirmProcess}
            />
            <Label htmlFor="confirm-process" className="text-sm">
              I confirm that all payroll data has been reviewed and is ready for processing
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcess} 
              disabled={isProcessing || !confirmProcess}
              className="bg-primary"
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Process Payroll
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
