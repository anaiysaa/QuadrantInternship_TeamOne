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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { GenerateReportsDialog } from '@/components/dialogs/GenerateReportsDialog';
import { ExportDataDialog } from '@/components/dialogs/ExportDataDialog';
import { ProcessPayrollDialog } from '@/components/dialogs/ProcessPayrollDialog';
import { PayrollRecordDialog } from '@/components/dialogs/PayrollRecordDialog';

export default function Payroll() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPayrollTrends, setShowPayrollTrends] = useState(false);
  const [showDepartmentAnalysis, setShowDepartmentAnalysis] = useState(false);
  const [showDeductionAnalysis, setShowDeductionAnalysis] = useState(false);
  const [showGenerateReports, setShowGenerateReports] = useState(false);
  const [showExportData, setShowExportData] = useState(false);
  const [showProcessPayroll, setShowProcessPayroll] = useState(false);
  const [showPayrollRecord, setShowPayrollRecord] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordMode, setRecordMode] = useState('view');
  const [showTaxReports, setShowTaxReports] = useState(false);
  const [showPayrollSettings, setShowPayrollSettings] = useState(false);
  const [showBankIntegration, setShowBankIntegration] = useState(false);

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

  // Analytics data
  const payrollTrendsData = [
    { month: 'Oct', grossPay: 87500, netPay: 61250, deductions: 26250 },
    { month: 'Nov', grossPay: 92000, netPay: 64400, deductions: 27600 },
    { month: 'Dec', grossPay: 95000, netPay: 66500, deductions: 28500 },
    { month: 'Jan', grossPay: 98000, netPay: 68600, deductions: 29400 },
    { month: 'Feb', grossPay: 94300, netPay: 66010, deductions: 28290 },
  ];

  const departmentPayrollData = [
    { department: 'Engineering', totalPay: 15500, employees: 3, avgPay: 5167 },
    { department: 'HR', totalPay: 4800, employees: 1, avgPay: 4800 },
    { department: 'Marketing', totalPay: 3800, employees: 1, avgPay: 3800 },
    { department: 'Sales', totalPay: 12000, employees: 2, avgPay: 6000 },
    { department: 'Finance', totalPay: 8500, employees: 2, avgPay: 4250 },
  ];

  const deductionBreakdownData = [
    { name: 'Taxes', value: 65, color: '#ef4444' },
    { name: 'Health Insurance', value: 20, color: '#3b82f6' },
    { name: 'Retirement', value: 10, color: '#22c55e' },
    { name: 'Other', value: 5, color: '#f59e0b' },
  ];

  const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];

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

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setRecordMode('view');
    setShowPayrollRecord(true);
  };

  const handleProcessRecord = (record) => {
    setSelectedRecord(record);
    setRecordMode('process');
    setShowPayrollRecord(true);
  };

  const handleFeatureClick = (feature) => {
    const { toast } = useToast();
    toast({
      title: `${feature} Feature`,
      description: `${feature} functionality is now available. Configure your settings to get started.`,
    });
    
    switch (feature) {
      case 'Tax Reports':
        setShowTaxReports(true);
        break;
      case 'Payroll Settings':
        setShowPayrollSettings(true);
        break;
      case 'Bank Integration':
        setShowBankIntegration(true);
        break;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payroll</h1>
            <p className="text-muted-foreground">Manage employee payroll</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowGenerateReports(true)}>
              Generate Reports
            </Button>
            <Button variant="outline" onClick={() => setShowExportData(true)}>
              Export Data
            </Button>
            <Button onClick={() => setShowProcessPayroll(true)}>
              Process Payroll
            </Button>
          </div>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowPayrollTrends(!showPayrollTrends)}>
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-semibold mb-1">Payroll Trends</h3>
              <p className="text-sm text-muted-foreground">View monthly payroll trends</p>
              <Button variant="outline" size="sm" className="mt-2">
                {showPayrollTrends ? 'Hide Chart' : 'Show Chart'}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowDepartmentAnalysis(!showDepartmentAnalysis)}>
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">Department Analysis</h3>
              <p className="text-sm text-muted-foreground">View payroll by department</p>
              <Button variant="outline" size="sm" className="mt-2">
                {showDepartmentAnalysis ? 'Hide Chart' : 'Show Chart'}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowDeductionAnalysis(!showDeductionAnalysis)}>
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">🍰</div>
              <h3 className="font-semibold mb-1">Deduction Breakdown</h3>
              <p className="text-sm text-muted-foreground">View deduction distribution</p>
              <Button variant="outline" size="sm" className="mt-2">
                {showDeductionAnalysis ? 'Hide Chart' : 'Show Chart'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {showPayrollTrends && (
          <Card>
            <CardHeader>
              <CardTitle>Payroll Trends (Last 5 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={payrollTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="grossPay" stroke="#3b82f6" name="Gross Pay" strokeWidth={2} />
                  <Line type="monotone" dataKey="netPay" stroke="#22c55e" name="Net Pay" strokeWidth={2} />
                  <Line type="monotone" dataKey="deductions" stroke="#ef4444" name="Deductions" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {showDepartmentAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle>Department Payroll Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentPayrollData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => name === 'employees' ? value : formatCurrency(value)} />
                  <Bar dataKey="totalPay" fill="#3b82f6" name="Total Pay" />
                  <Bar dataKey="avgPay" fill="#22c55e" name="Average Pay" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {showDeductionAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle>Deduction Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deductionBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deductionBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-4 mt-4">
                {deductionBreakdownData.map((item, index) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewRecord(payroll)}
                        >
                          View
                        </Button>
                        {payroll.status !== 'Processed' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleProcessRecord(payroll)}
                          >
                            Process
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleFeatureClick('Tax Reports')}
          >
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">Tax Reports</h3>
              <p className="text-sm text-muted-foreground">Generate tax and compliance reports</p>
              <Button variant="outline" size="sm" className="mt-2">
                Open Tax Reports
              </Button>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleFeatureClick('Payroll Settings')}
          >
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-semibold mb-1">Payroll Settings</h3>
              <p className="text-sm text-muted-foreground">Configure pay schedules and deductions</p>
              <Button variant="outline" size="sm" className="mt-2">
                Manage Settings
              </Button>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleFeatureClick('Bank Integration')}
          >
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">🏦</div>
              <h3 className="font-semibold mb-1">Bank Integration</h3>
              <p className="text-sm text-muted-foreground">Manage direct deposit settings</p>
              <Button variant="outline" size="sm" className="mt-2">
                Setup Banking
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <GenerateReportsDialog 
        open={showGenerateReports} 
        onOpenChange={setShowGenerateReports} 
      />
      
      <ExportDataDialog 
        open={showExportData} 
        onOpenChange={setShowExportData} 
      />
      
      <ProcessPayrollDialog 
        open={showProcessPayroll} 
        onOpenChange={setShowProcessPayroll} 
      />
      
      <PayrollRecordDialog 
        open={showPayrollRecord} 
        onOpenChange={setShowPayrollRecord}
        record={selectedRecord}
        mode={recordMode}
      />
    </DashboardLayout>
  );
}
