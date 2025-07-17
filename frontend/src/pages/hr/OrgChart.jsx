import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ExportChartDialog } from '@/components/dialogs/ExportChartDialog';
import { EditStructureDialog } from '@/components/dialogs/EditStructureDialog';

export default function OrgChart() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const orgData = {
    ceo: {
      id: 'CEO',
      name: 'Robert Johnson',
      title: 'Chief Executive Officer',
      department: 'Executive',
      email: 'robert.johnson@company.com',
      phone: '+1 (555) 000-0001',
      directReports: 4,
      level: 1
    },
    departments: [
      {
        head: {
          id: 'ENG-HEAD',
          name: 'Mike Wilson',
          title: 'VP Engineering',
          department: 'Engineering',
          email: 'mike.wilson@company.com',
          phone: '+1 (555) 345-6789',
          reportsTo: 'CEO',
          directReports: 2,
          level: 2
        },
        managers: [
          {
            id: 'EMP002',
            name: 'Sarah Johnson',
            title: 'Engineering Manager',
            department: 'Engineering',
            email: 'sarah.johnson@company.com',
            phone: '+1 (555) 234-5678',
            reportsTo: 'ENG-HEAD',
            directReports: 3,
            level: 3
          }
        ],
        employees: [
          {
            id: 'EMP001',
            name: 'John Doe',
            title: 'Senior Developer',
            department: 'Engineering',
            email: 'john.doe@company.com',
            phone: '+1 (555) 123-4567',
            reportsTo: 'EMP002',
            directReports: 0,
            level: 4
          }
        ]
      },
      {
        head: {
          id: 'HR-HEAD',
          name: 'Lisa Brown',
          title: 'HR Director',
          department: 'HR',
          email: 'lisa.brown@company.com',
          phone: '+1 (555) 678-9012',
          reportsTo: 'CEO',
          directReports: 1,
          level: 2
        },
        managers: [],
        employees: [
          {
            id: 'EMP004',
            name: 'Emma Davis',
            title: 'HR Manager',
            department: 'HR',
            email: 'emma.davis@company.com',
            phone: '+1 (555) 456-7890',
            reportsTo: 'HR-HEAD',
            directReports: 0,
            level: 3
          }
        ]
      },
      {
        head: {
          id: 'MKT-HEAD',
          name: 'Tom Wilson',
          title: 'Marketing Director',
          department: 'Marketing',
          email: 'tom.wilson@company.com',
          phone: '+1 (555) 789-0123',
          reportsTo: 'CEO',
          directReports: 1,
          level: 2
        },
        managers: [],
        employees: [
          {
            id: 'EMP005',
            name: 'Alex Brown',
            title: 'Marketing Specialist',
            department: 'Marketing',
            email: 'alex.brown@company.com',
            phone: '+1 (555) 567-8901',
            reportsTo: 'MKT-HEAD',
            directReports: 0,
            level: 3
          }
        ]
      }
    ]
  };

  const allEmployees = [
    orgData.ceo,
    ...orgData.departments.flatMap(dept => [dept.head, ...dept.managers, ...dept.employees])
  ];

  const filteredEmployees = allEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || emp.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = ['All', 'Executive', 'Engineering', 'HR', 'Marketing'];

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'Executive': return 'bg-purple-500';
      case 'Engineering': return 'bg-primary';
      case 'HR': return 'bg-success';
      case 'Marketing': return 'bg-warning';
      case 'Sales': return 'bg-destructive';
      default: return 'bg-secondary';
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const stats = [
    { title: 'Total Employees', value: allEmployees.length, color: 'bg-primary' },
    { title: 'Departments', value: departments.length - 1, color: 'bg-success' }, // -1 to exclude "All"
    { title: 'Managers', value: allEmployees.filter(e => e.directReports > 0).length, color: 'bg-warning' },
    { title: 'Direct Reports Avg', value: (allEmployees.reduce((acc, e) => acc + e.directReports, 0) / allEmployees.filter(e => e.directReports > 0).length).toFixed(1), color: 'bg-accent' },
  ];

  const handleExportChart = () => {
    setShowExportDialog(true);
  };

  const handleEditStructure = () => {
    setShowEditDialog(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Organization Chart</h1>
            <p className="text-muted-foreground">View company organization structure</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportChart}>Export Chart</Button>
            <Button onClick={handleEditStructure}>Edit Structure</Button>
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

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by name, title, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Organization Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Structure</CardTitle>
          </CardHeader>
          <CardContent>
            {/* CEO */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold">
                  {getInitials(orgData.ceo.name)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{orgData.ceo.name}</h3>
                  <p className="text-sm text-muted-foreground">{orgData.ceo.title}</p>
                  <p className="text-xs text-muted-foreground">{orgData.ceo.email}</p>
                </div>
                <Badge className="bg-purple-500 text-white">CEO</Badge>
              </div>
            </div>

            {/* Department Heads */}
            {orgData.departments.map((dept, deptIndex) => (
              <div key={deptIndex} className="ml-8 mb-4">
                {/* Department Head */}
                <div className="flex items-center space-x-4 p-4 bg-accent/50 border rounded-lg mb-3">
                  <div className={`w-10 h-10 ${getDepartmentColor(dept.head.department)} text-white rounded-full flex items-center justify-center font-semibold text-sm`}>
                    {getInitials(dept.head.name)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{dept.head.name}</h4>
                    <p className="text-sm text-muted-foreground">{dept.head.title}</p>
                    <p className="text-xs text-muted-foreground">{dept.head.email}</p>
                  </div>
                  <Badge className={getDepartmentColor(dept.head.department)}>{dept.head.department}</Badge>
                </div>

                {/* Managers */}
                {dept.managers.map((manager, managerIndex) => (
                  <div key={managerIndex} className="ml-8 mb-3">
                    <div className="flex items-center space-x-4 p-3 bg-muted/50 border rounded-lg">
                      <div className={`w-8 h-8 ${getDepartmentColor(manager.department)} text-white rounded-full flex items-center justify-center font-semibold text-xs`}>
                        {getInitials(manager.name)}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{manager.name}</h5>
                        <p className="text-sm text-muted-foreground">{manager.title}</p>
                        <p className="text-xs text-muted-foreground">{manager.email}</p>
                      </div>
                      <Badge variant="outline">{manager.directReports} reports</Badge>
                    </div>
                  </div>
                ))}

                {/* Employees */}
                {dept.employees.map((employee, empIndex) => (
                  <div key={empIndex} className="ml-16">
                    <div className="flex items-center space-x-3 p-3 bg-background border rounded-lg mb-2">
                      <div className={`w-6 h-6 ${getDepartmentColor(employee.department)} text-white rounded-full flex items-center justify-center font-semibold text-xs`}>
                        {getInitials(employee.name)}
                      </div>
                      <div className="flex-1">
                        <h6 className="font-medium text-sm">{employee.name}</h6>
                        <p className="text-xs text-muted-foreground">{employee.title}</p>
                        <p className="text-xs text-muted-foreground">{employee.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Department Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {orgData.departments.map((dept, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getDepartmentColor(dept.head.department)}`}></div>
                  <span>{dept.head.department}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Head:</span>
                    <span className="text-sm font-medium">{dept.head.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Staff:</span>
                    <span className="text-sm font-medium">{1 + dept.managers.length + dept.employees.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Managers:</span>
                    <span className="text-sm font-medium">{dept.managers.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ExportChartDialog 
        open={showExportDialog} 
        onOpenChange={setShowExportDialog} 
      />
      
      <EditStructureDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
      />
    </DashboardLayout>
  );
}
