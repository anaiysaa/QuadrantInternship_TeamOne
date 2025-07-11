
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Timesheet() {
  const [weekHours, setWeekHours] = useState({
    monday: 8,
    tuesday: 8,
    wednesday: 8,
    thursday: 8,
    friday: 8,
    saturday: 0,
    sunday: 0
  });

  const [currentWeek] = useState('February 12 - 18, 2024');

  const timesheetHistory = [
    {
      id: 'TS001',
      week: 'Feb 5 - 11, 2024',
      totalHours: 40,
      status: 'Approved',
      submittedDate: '2024-02-11'
    },
    {
      id: 'TS002',
      week: 'Jan 29 - Feb 4, 2024',
      totalHours: 42,
      status: 'Approved',
      submittedDate: '2024-02-04'
    },
    {
      id: 'TS003',
      week: 'Jan 22 - 28, 2024',
      totalHours: 38,
      status: 'Approved',
      submittedDate: '2024-01-28'
    }
  ];

  const days = [
    { key: 'monday', name: 'Monday', date: 'Feb 12' },
    { key: 'tuesday', name: 'Tuesday', date: 'Feb 13' },
    { key: 'wednesday', name: 'Wednesday', date: 'Feb 14' },
    { key: 'thursday', name: 'Thursday', date: 'Feb 15' },
    { key: 'friday', name: 'Friday', date: 'Feb 16' },
    { key: 'saturday', name: 'Saturday', date: 'Feb 17' },
    { key: 'sunday', name: 'Sunday', date: 'Feb 18' }
  ];

  const totalHours = Object.values(weekHours).reduce((sum, hours) => sum + hours, 0);
  const regularHours = Math.min(totalHours, 40);
  const overtimeHours = Math.max(totalHours - 40, 0);

  const handleHoursChange = (day, value) => {
    const hours = Math.max(0, Math.min(24, parseInt(value) || 0));
    setWeekHours(prev => ({ ...prev, [day]: hours }));
  };

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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Timesheet</h1>
            <p className="text-muted-foreground">Track your working hours</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Save Draft</Button>
            <Button>Submit Timesheet</Button>
          </div>
        </div>

        {/* Current Week Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Hours</h3>
              </div>
              <p className="text-2xl font-bold mt-1">{totalHours}h</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Regular Hours</h3>
              </div>
              <p className="text-2xl font-bold mt-1">{regularHours}h</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Overtime</h3>
              </div>
              <p className="text-2xl font-bold mt-1">{overtimeHours}h</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Week</h3>
              </div>
              <p className="text-sm font-medium mt-1">{currentWeek}</p>
            </CardContent>
          </Card>
        </div>

        {/* Time Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Time Entry - {currentWeek}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {days.map((day) => (
                <div key={day.key} className="space-y-2">
                  <Label htmlFor={day.key} className="text-sm font-medium">
                    {day.name}
                    <span className="text-muted-foreground ml-1">({day.date})</span>
                  </Label>
                  <Input
                    id={day.key}
                    type="number"
                    min="0"
                    max="24"
                    value={weekHours[day.key]}
                    onChange={(e) => handleHoursChange(day.key, e.target.value)}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Remember to submit your timesheet by end of day Sunday
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">Reset</Button>
                <Button variant="outline">Save Draft</Button>
                <Button>Submit for Approval</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timesheet History */}
        <Card>
          <CardHeader>
            <CardTitle>Timesheet History</CardTitle>
          </CardHeader>
          <CardContent>
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
                {timesheetHistory.map((timesheet) => (
                  <TableRow key={timesheet.id}>
                    <TableCell className="font-medium">{timesheet.id}</TableCell>
                    <TableCell>{timesheet.week}</TableCell>
                    <TableCell>{timesheet.totalHours}h</TableCell>
                    <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                    <TableCell>{new Date(timesheet.submittedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
