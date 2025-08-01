import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, User, FileText } from 'lucide-react';

export function ViewTimesheetDialog({ timesheet, open, onOpenChange, employees = [] }) {
  if (!timesheet) return null;

  // --- Find Employee Info ---
  const employeeInfo = employees.find(emp =>
    String(emp.id) === String(timesheet.employeeId)
  ) || {};

  // --- Find Manager/Approver ---
  let managerName = "";
  if (String(timesheet.employeeId) === "10001") {
    managerName = "Approved by Admin";
  } else if (employeeInfo.managerName) {
    managerName = employeeInfo.managerName + " (Manager)";
  } else if (employeeInfo.managerId) {
    const mgr = employees.find(emp => String(emp.id) === String(employeeInfo.managerId));
    managerName = mgr ? mgr.name + " (Manager)" : "";
  }

  // --- Daily Hours from Timesheet ---
  const dailyHours = {
    monday: Number(timesheet.MondayHours ?? 0),
    tuesday: Number(timesheet.TuesdayHours ?? 0),
    wednesday: Number(timesheet.WednesdayHours ?? 0),
    thursday: Number(timesheet.ThursdayHours ?? 0),
    friday: Number(timesheet.FridayHours ?? 0),
    saturday: Number(timesheet.SaturdayHours ?? 0),
    sunday: Number(timesheet.SundayHours ?? 0),
  };

  const days = [
    { key: 'monday', name: 'Monday' },
    { key: 'tuesday', name: 'Tuesday' },
    { key: 'wednesday', name: 'Wednesday' },
    { key: 'thursday', name: 'Thursday' },
    { key: 'friday', name: 'Friday' },
    { key: 'saturday', name: 'Saturday' },
    { key: 'sunday', name: 'Sunday' }
  ];

  const regularHours = Math.min(Number(timesheet.totalHours) || 0, 40);
  const overtimeHours = Math.max((Number(timesheet.totalHours) || 0) - 40, 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="default" className="bg-success text-success-foreground">Approved</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="text-warning border-warning">Pending</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="dialog-desc">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Timesheet Details - {timesheet.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6" id="dialog-desc">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Employee Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{employeeInfo.name || timesheet.employeeName || ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee ID:</span>
                  <span className="font-medium">{timesheet.employeeId || ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{employeeInfo.department || ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position:</span>
                  <span className="font-medium">{employeeInfo.position || ""}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Timesheet Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Week Period:</span>
                  <span className="font-medium">{timesheet.week}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <div>{getStatusBadge(timesheet.status)}</div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span className="font-medium">
                    {timesheet.submittedDate ? new Date(timesheet.submittedDate).toLocaleDateString() : ""}
                  </span>
                </div>
                {timesheet.status === "Approved" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Approved By:</span>
                      <span className="font-medium">
                        {timesheet.approvedBy || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Approved Date:</span>
                      <span className="font-medium">
                        {timesheet.approvedDate ? new Date(timesheet.approvedDate).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Hours Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hours Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{timesheet.totalHours}h</div>
                  <div className="text-sm text-muted-foreground">Total Hours</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-success">{regularHours}h</div>
                  <div className="text-sm text-muted-foreground">Regular Hours</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-warning">{overtimeHours}h</div>
                  <div className="text-sm text-muted-foreground">Overtime Hours</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Hours Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Hours Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {days.map((day) => (
                  <div key={day.key} className="text-center p-3 border rounded-lg">
                    <div className="font-medium text-sm mb-1">{day.name}</div>
                    <div className="text-2xl font-bold">
                      {dailyHours[day.key]}h
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          {timesheet.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{timesheet.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={() => window.print()}>
              Print Timesheet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
