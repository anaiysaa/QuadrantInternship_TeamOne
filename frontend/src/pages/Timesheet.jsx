import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ViewTimesheetDialog } from '@/components/dialogs/ViewTimesheetDialog';
import { Archive, ArchiveRestore, Eye, EyeOff } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const API_URL = 'http://localhost:8000/api/timesheets';

function getCurrentWeekDates() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatWeekRange(datesArr) {
  const fmt = (date) => date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const year = datesArr[0].getFullYear();
  return `${fmt(datesArr[0])} - ${fmt(datesArr[6])}, ${year}`;
}

function exportTimesheetsToCSV(timesheets) {
  if (!timesheets.length) return;
  const header = [
    "Timesheet ID",
    "Week Period",
    "Total Hours",
    "Status",
    "Submitted"
  ];
  const rows = timesheets.map(ts => [
    ts.id,
    ts.week,
    ts.totalHours,
    ts.status,
    ts.submittedDate ? new Date(ts.submittedDate).toLocaleDateString() : ''
  ]);
  const csv = [header, ...rows].map(row =>
    row.map(field => `"${(field ?? '').toString().replace(/"/g, '""')}"`).join(",")
  ).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "timesheet_history.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper function to determine if a timesheet should be considered archived
function isArchivedTimesheet(timesheet) {
  const archivedStatuses = ['Archived'];
  return archivedStatuses.includes(timesheet.status);
}

export default function Timesheet() {
  const { toast } = useToast();
  const { user } = useAuth();
  const weekDates = getCurrentWeekDates();
  const [currentWeek] = useState(formatWeekRange(weekDates));
  const [weekHours, setWeekHours] = useState({
    monday: 8,
    tuesday: 8,
    wednesday: 8,
    thursday: 8,
    friday: 8,
    saturday: 0,
    sunday: 0
  });
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [timesheetStatus, setTimesheetStatus] = useState('draft');
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [timesheetHistory, setTimesheetHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (!user?.employeeId) return;
    const savedDraft = localStorage.getItem(`timesheet-draft-${currentWeek}-${user.employeeId}`);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setWeekHours(parsedDraft.hours);
        setNote(parsedDraft.note || '');
        setTimesheetStatus(parsedDraft.status || 'draft');
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
    Promise.all([
      fetch(`${API_URL}?employeeId=${encodeURIComponent(user.employeeId)}`).then(res => res.json()),
      fetch('http://localhost:8000/api/employees').then(res => res.json())
    ])
      .then(([timesheets, employees]) => {
        setTimesheetHistory(timesheets);
        setEmployees(employees);
      })
      .catch(() => {
        setTimesheetHistory([]);
        setEmployees([]);
        toast({ title: 'Error', description: 'Failed to load timesheet or employee data.' });
      });
  }, [currentWeek, toast, user]);

  const days = [
    { key: 'monday', name: 'Monday', date: weekDates[0] },
    { key: 'tuesday', name: 'Tuesday', date: weekDates[1] },
    { key: 'wednesday', name: 'Wednesday', date: weekDates[2] },
    { key: 'thursday', name: 'Thursday', date: weekDates[3] },
    { key: 'friday', name: 'Friday', date: weekDates[4] },
    { key: 'saturday', name: 'Saturday', date: weekDates[5] },
    { key: 'sunday', name: 'Sunday', date: weekDates[6] }
  ];

  const totalHours = Object.values(weekHours).reduce((sum, hours) => sum + hours, 0);
  const regularHours = Math.min(totalHours, 40);
  const overtimeHours = Math.max(totalHours - 40, 0);

  const handleHoursChange = (day, value) => {
    const hours = Math.max(0, Math.min(24, parseInt(value) || 0));
    setWeekHours(prev => ({ ...prev, [day]: hours }));
  };

  const monthFormatted = `${weekDates[0].getFullYear()}-${String(weekDates[0].getMonth() + 1).padStart(2, '0')}`;

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      const payload = {
        employeeId: user.employeeId,
        employeeName: user.name,
        month: monthFormatted,
        week: currentWeek,
        totalHours,
        regularHours,
        overtimeHours,
        notes: note,
        MondayHours: weekHours.monday,
        TuesdayHours: weekHours.tuesday,
        WednesdayHours: weekHours.wednesday,
        ThursdayHours: weekHours.thursday,
        FridayHours: weekHours.friday,
        SaturdayHours: weekHours.saturday,
        SundayHours: weekHours.sunday
      };
      const res = await fetch("/api/timesheets/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save draft");
      toast({ title: "Draft Saved", description: "Your timesheet has been saved as a draft." });
      setTimesheetStatus('draft');
    } catch (error) {
      toast({ title: "Error", description: "Failed to save draft.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const submitForApproval = async () => {
    if (totalHours === 0) {
      toast({
        title: "Invalid Submission",
        description: "Please enter hours before submitting for approval.",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        employeeId: user.employeeId,
        employeeName: user.name,
        month: monthFormatted,
        week: currentWeek,
        totalHours,
        regularHours,
        overtimeHours,
        status: 'Submitted',
        submittedDate: new Date().toISOString(),
        notes: note,
        MondayHours: weekHours.monday,
        TuesdayHours: weekHours.tuesday,
        WednesdayHours: weekHours.wednesday,
        ThursdayHours: weekHours.thursday,
        FridayHours: weekHours.friday,
        SaturdayHours: weekHours.saturday,
        SundayHours: weekHours.sunday
      };

      const res = await fetch("http://localhost:8000/api/timesheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Unknown error");
      }

      setTimesheetStatus('submitted');
      localStorage.removeItem(`timesheet-draft-${currentWeek}-${user.employeeId}`);
      toast({
        title: "Submitted for Approval",
        description: `Your timesheet for ${currentWeek} has been submitted and is pending approval.`,
      });
      setNote("");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit for approval. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTimesheet = () => {
    const resetHours = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0
    };
    setWeekHours(resetHours);
    setNote('');
    setTimesheetStatus('draft');
    localStorage.removeItem(`timesheet-draft-${currentWeek}-${user.employeeId}`);
    toast({
      title: "Timesheet Reset",
      description: "All hours have been cleared.",
    });
  };

  const handleViewDetails = (timesheet) => {
    setSelectedTimesheet(timesheet);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="default" className="bg-success text-success-foreground">Approved</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="text-warning border-warning">Pending</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'Paid':
        return <Badge variant="default" className="bg-blue-600 text-white">Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isDisabled = timesheetStatus === 'submitted' || isSubmitting || isSaving;

  // Filter timesheets based on archived status
  const filteredTimesheets = timesheetHistory.filter(timesheet => {
    if (showArchived) {
      return isArchivedTimesheet(timesheet);
    } else {
      return !isArchivedTimesheet(timesheet);
    }
  });

  const archivedCount = timesheetHistory.filter(isArchivedTimesheet).length;
  const activeCount = timesheetHistory.filter(ts => !isArchivedTimesheet(ts)).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Timesheet Entry Form */}
        <Card className="border-primary/30 shadow-xl">
          <CardHeader>
            <CardTitle>Submit Weekly Timesheet</CardTitle>
            <div className="text-muted-foreground text-sm mt-1">
              {currentWeek}
            </div>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={e => { e.preventDefault(); submitForApproval(); }}
            >
              <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                {days.map(day => (
                  <div key={day.key} className="flex flex-col items-center">
                    <Label htmlFor={day.key} className="font-medium mb-1">{day.name}</Label>
                    <Input
                      id={day.key}
                      type="number"
                      value={weekHours[day.key]}
                      onChange={e => handleHoursChange(day.key, e.target.value)}
                      min={0}
                      max={24}
                      step={1}
                      disabled={isDisabled}
                      className="w-20 text-center"
                    />
                    <div className="text-xs text-muted-foreground mt-1">{day.date.toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
              <div>
                <Label htmlFor="note" className="font-medium mb-1">Notes / Comments</Label>
                <Textarea
                  id="note"
                  rows={2}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add a note for this week…"
                  disabled={isDisabled}
                  className="resize-none"
                />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSaving || isDisabled}
                  onClick={saveDraft}
                  className="text-white"
                >
                  {isSaving ? "Saving…" : "Save as Draft"}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isDisabled}
                >
                  {isSubmitting ? "Submitting…" : "Submit for Approval"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetTimesheet}
                  disabled={isDisabled}
                >
                  Reset
                </Button>
                <div className="ml-auto flex flex-col text-xs text-muted-foreground space-y-0.5">
                  <span>Total: <span className="font-bold">{totalHours}h</span></span>
                  <span>Regular: <span className="font-bold">{regularHours}h</span></span>
                  <span>Overtime: <span className="font-bold">{overtimeHours}h</span></span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Timesheet History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle>
                {showArchived ? 'Archived Timesheets' : 'Active Timesheets'}
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Active: {activeCount}</span>
                <span>•</span>
                <span>Archived: {archivedCount}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
                className="flex items-center space-x-2"
              >
                {showArchived ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Hide Archived</span>
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />
                    <span>Show Archived ({archivedCount})</span>
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => exportTimesheetsToCSV(filteredTimesheets)}>
                Export as CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTimesheets.length === 0 && (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-muted flex items-center justify-center">
                  {showArchived ? (
                    <Archive className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <Eye className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-medium mb-1">
                  {showArchived ? 'No Archived Timesheets' : 'No Active Timesheets'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {showArchived 
                    ? 'No timesheets have been archived yet.' 
                    : 'No active timesheets found. Submit your first timesheet to get started.'}
                </p>
              </div>
            )}
            {filteredTimesheets.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timesheet ID</TableHead>
                    <TableHead>Week Period</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTimesheets.map((timesheet) => (
                    <TableRow key={timesheet.id} className={isArchivedTimesheet(timesheet) ? 'opacity-75' : ''}>
                      <TableCell className="font-medium">{timesheet.id}</TableCell>
                      <TableCell>{timesheet.week}</TableCell>
                      <TableCell>{timesheet.totalHours}h</TableCell>
                      <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                      <TableCell>
                        {timesheet.submittedDate
                          ? new Date(timesheet.submittedDate).toLocaleDateString()
                          : ''}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(timesheet)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <ViewTimesheetDialog
        timesheet={selectedTimesheet}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        employees={employees}
      />
    </DashboardLayout>
  );
}