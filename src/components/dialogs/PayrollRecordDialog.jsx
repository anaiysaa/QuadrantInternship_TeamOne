
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Eye, Play, User, Calendar, DollarSign } from 'lucide-react';

export function PayrollRecordDialog({ open, onOpenChange, record, mode = 'view' }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  if (!record) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Processed':
        return <Badge variant="default" className="bg-success text-success-foreground">Processed</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="text-warning border-warning">Pending</Badge>;
      case 'Review Required':
        return <Badge variant="destructive">Review Required</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Payroll Processed",
        description: `Payroll for ${record.employee} has been processed successfully.`,
      });
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'view' ? <Eye className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {mode === 'view' ? 'Payroll Record Details' : 'Process Payroll Record'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-semibold">{record.employee}</span>
            </div>
            {getStatusBadge(record.status)}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-muted-foreground">Employee ID</label>
              <p className="font-medium">{record.employeeId}</p>
            </div>
            <div>
              <label className="text-muted-foreground">Department</label>
              <p className="font-medium">{record.department}</p>
            </div>
            <div>
              <label className="text-muted-foreground">Pay Period</label>
              <p className="font-medium">{record.payPeriod}</p>
            </div>
            <div>
              <label className="text-muted-foreground">Pay Date</label>
              <p className="font-medium">{record.payDate}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Hours & Earnings
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-muted-foreground">Regular Hours</label>
                <p className="font-medium">{record.hoursWorked}h</p>
              </div>
              <div>
                <label className="text-muted-foreground">Overtime Hours</label>
                <p className="font-medium">{record.overtimeHours}h</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold">Financial Summary</h4>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Gross Pay:</span>
                <span className="font-medium">{formatCurrency(record.grossPay)}</span>
              </div>
              <div className="flex justify-between text-destructive">
                <span>Total Deductions:</span>
                <span className="font-medium">-{formatCurrency(record.deductions)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Net Pay:</span>
                <span className="text-success">{formatCurrency(record.netPay)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode === 'process' && record.status !== 'Processed' && (
              <Button onClick={handleProcess} disabled={isProcessing}>
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Process Payment
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
