
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

export default function Payroll() {
  const [searchTerm, setSearchTerm] = useState('');

  const payrollData = [
    {
      id: 'PAY001',
      employee: 'John Doe',
      employeeId: 'EMP001',
      department: 'Engineering',
      payPeriod: '2024-02-01 to 2024-02-15',
      grossPay: 4500,
      deductions: 1350,
      netPay: 3150,
      status: 'Processed',
      payDate: '2024-02-20',
      hoursWorked: 80,
      overtimeHours: 4
    },
    {
      id: 'PAY002',
      employee: 'Sarah Johnson',
      employeeId: 'EMP002',
      department: 'Engineering',
      payPeriod: '2024-02-01 to 2024-02-15',
      grossPay: 5000,
      deductions: 1500,
      netPay: 3500,
      status: 'Pending',
      payDate: '2024-02-20',
      hoursWorked: 80,
      overtimeHours: 0
    },
    {
      id: 'PAY003',
      employee: 'Mike Wilson',
      employeeId: 'EMP003',
      department: 'Engineering',
      payPeriod: '2024-02-01 to 2024-02-15',
      grossPay: 6000,
      deductions: 1800,
      netPay: 4200,
      status: 'Processed',
      payDate: '2024-02-20',
      hoursWorked: 80,
      overtimeHours: 0
    },
    {
      id: 'PAY004',
      employee: 'Emma Davis',
      employeeId: 'EMP004',
      department: 'HR',
      payPeriod: '2024-02-01 to 2024-02-15',
      grossPay: 4800,
      deductions: 1440,
      netPay: 3360,
      status: 'Processed',
      payDate: '2024-02-20',
      hoursWorked: 80,
      overtimeHours: 2
    },
    {
      id: 'PAY005',
      employee: 'Alex Brown',
      employeeId: 'EMP005',
      department: 'Marketing',
      payPeriod: '2024-02-01 to 2024-02-15',
      grossPay: 3800,
      deductions: 1140,
      netPay: 2660,
      status: 'Review Required',
      payDate: '2024-02-20',
      hoursWorked: 75,
      overtimeHours: 0
    }
  ];

  const filteredPayroll = payrollData.filter(payroll =>
    payroll.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payroll.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payroll.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payroll.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Processed':
        return <Badge variant="default" className="bg-success text-success-foreground">Processed</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="text-warning border-warning">Pending</Badge>;
      case 'Review Required':
        return <Badge variant="destructive">Review Required</Badge>;
      case 'On Hold':
        return <Badge variant="secondary">On Hold</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'Engineering': return 'bg-primary';
      case 'HR': return 'bg-success';
      case 'Marketing': return 'bg-warning';
      case 'Sales': return 'bg-destructive';
      case 'Design': return 'bg-accent';
      default: return 'bg-secondary';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalGrossPay = payrollData.reduce((acc, p) => acc + p.grossPay, 0);
  const totalNetPay = payrollData.reduce((acc, p) => acc + p.netPay, 0);
  const totalDeductions = payrollData.reduce((acc, p) => acc + p.deductions, 0);

  const stats = [
    { title: 'Total Employees', value: payrollData.length, color: 'bg-primary' },
    { title: 'Gross Payroll', value: formatCurrency(totalGrossPay), color: 'bg-success' },
    { title: 'Net Payroll', value: formatCurrency(totalNetPay), color: 'bg-accent' },
    { title: 'Pending Review', value: payrollData.filter(p => p.status === 'Review Required' || p.status === 'Pending').length, color: 'bg-warning' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payroll</h1>
            <p className="text-muted-foreground">Manage employee payroll</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Generate Reports</Button>
            <Button variant="outline">Export Data</Button>
            <Button>Process Payroll</Button>
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

        {/* Payroll Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Current Pay Period: February 1-15, 2024</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-accent rounded-lg">
                <h3 className="text-lg font-semibold">Gross Pay</h3>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalGrossPay)}</p>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <h3 className="text-lg font-semibold">Total Deductions</h3>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalDeductions)}</p>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <h3 className="text-lg font-semibold">Net Pay</h3>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalNetPay)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Payroll Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by employee, department, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">Filter by Period</Button>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Records ({filteredPayroll.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayroll.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payroll.employee}</p>
                        <p className="text-sm text-muted-foreground">{payroll.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getDepartmentColor(payroll.department)}`}></div>
                        <span>{payroll.department}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{payroll.hoursWorked}h regular</p>
                        {payroll.overtimeHours > 0 && (
                          <p className="text-muted-foreground">{payroll.overtimeHours}h overtime</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(payroll.grossPay)}</TableCell>
                    <TableCell className="text-destructive">{formatCurrency(payroll.deductions)}</TableCell>
                    <TableCell className="font-medium text-success">{formatCurrency(payroll.netPay)}</TableCell>
                    <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">View</Button>
                        {payroll.status !== 'Processed' && (
                          <Button size="sm" variant="default">Process</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">Tax Reports</h3>
              <p className="text-sm text-muted-foreground">Generate tax and compliance reports</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-semibold mb-1">Payroll Settings</h3>
              <p className="text-sm text-muted-foreground">Configure pay schedules and deductions</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">🏦</div>
              <h3 className="font-semibold mb-1">Bank Integration</h3>
              <p className="text-sm text-muted-foreground">Manage direct deposit settings</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
