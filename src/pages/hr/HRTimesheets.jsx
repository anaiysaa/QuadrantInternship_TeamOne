
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function HRTimesheets() {
  const [searchTerm, setSearchTerm] = useState('');

  const timesheets = [
    {
      id: 'TS001',
      employee: 'John Doe',
      employeeId: 'EMP001',
      week: '2024-02-05 to 2024-02-11',
      totalHours: 42,
      regularHours: 40,
      overtimeHours: 2,
      status: 'Submitted',
      submittedDate: '2024-02-11',
      approvedBy: null
    },
    {
      id: 'TS002',
      employee: 'Sarah Johnson',
      employeeId: 'EMP002',
      week: '2024-02-05 to 2024-02-11',
      totalHours: 38,
      regularHours: 38,
      overtimeHours: 0,
      status: 'Approved',
      submittedDate: '2024-02-10',
      approvedBy: 'Emma Davis'
    },
    {
      id: 'TS003',
      employee: 'Mike Wilson',
      employeeId: 'EMP003',
      week: '2024-02-05 to 2024-02-11',
      totalHours: 45,
      regularHours: 40,
      overtimeHours: 5,
      status: 'Pending Review',
      submittedDate: '2024-02-12',
      approvedBy: null
    },
    {
      id: 'TS004',
      employee: 'Alex Brown',
      employeeId: 'EMP005',
      week: '2024-02-05 to 2024-02-11',
      totalHours: 40,
      regularHours: 40,
      overtimeHours: 0,
      status: 'Approved',
      submittedDate: '2024-02-09',
      approvedBy: 'Emma Davis'
    },
    {
      id: 'TS005',
      employee: 'Lisa Johnson',
      employeeId: 'EMP006',
      week: '2024-02-05 to 2024-02-11',
      totalHours: 35,
      regularHours: 35,
      overtimeHours: 0,
      status: 'Rejected',
      submittedDate: '2024-02-13',
      approvedBy: 'Emma Davis'
    }
  ];

  const filteredTimesheets = timesheets.filter(timesheet =>
    timesheet.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    timesheet.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    timesheet.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return <Badge variant="outline" className="text-primary border-primary">Submitted</Badge>;
      case 'Pending Review':
        return <Badge variant="outline" className="text-warning border-warning">Pending Review</Badge>;
      case 'Approved':
        return <Badge variant="default" className="bg-success text-success-foreground">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = [
    { title: 'Total Timesheets', value: timesheets.length, color: 'bg-primary' },
    { title: 'Pending Review', value: timesheets.filter(t => t.status === 'Pending Review' || t.status === 'Submitted').length, color: 'bg-warning' },
    { title: 'Approved', value: timesheets.filter(t => t.status === 'Approved').length, color: 'bg-success' },
    { title: 'Total Overtime', value: timesheets.reduce((acc, t) => acc + t.overtimeHours, 0), color: 'bg-accent' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Timesheets</h1>
            <p className="text-muted-foreground">Review employee timesheets</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Bulk Approve</Button>
            <Button>Export Report</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                </div>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Timesheets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by employee, status, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">Filter by Week</Button>
            </div>
          </CardContent>
        </Card>

        {/* Timesheets Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Timesheets ({filteredTimesheets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timesheet ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Week Period</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimesheets.map((timesheet) => (
                  <TableRow key={timesheet.id}>
                    <TableCell className="font-medium">{timesheet.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{timesheet.employee}</p>
                        <p className="text-sm text-muted-foreground">{timesheet.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{timesheet.week}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{timesheet.totalHours}h total</p>
                        <p className="text-muted-foreground">
                          {timesheet.regularHours}h regular
                          {timesheet.overtimeHours > 0 && `, ${timesheet.overtimeHours}h OT`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p>{new Date(timesheet.submittedDate).toLocaleDateString()}</p>
                        {timesheet.approvedBy && (
                          <p className="text-muted-foreground">by {timesheet.approvedBy}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {(timesheet.status === 'Submitted' || timesheet.status === 'Pending Review') && (
                          <>
                            <Button size="sm" variant="default">Approve</Button>
                            <Button size="sm" variant="outline">Reject</Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">View</Button>
                      </div>
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
