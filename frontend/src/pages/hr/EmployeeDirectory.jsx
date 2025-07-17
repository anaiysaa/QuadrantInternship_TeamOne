import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddEmployeeDialog } from '@/components/dialogs/AddEmployeeDialog';
import { ViewEmployeeDialog } from '@/components/dialogs/ViewEmployeeDialog';
import { EditEmployeeDialog } from '@/components/dialogs/EditEmployeeDialog';

export default function EmployeeDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock employee data - in a real app this would come from an API
  const employees = [
    {
      id: 'EMP001',
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Engineering',
      position: 'Senior Developer',
      status: 'Active',
      joinDate: '2023-01-15',
      manager: 'Sarah Johnson',
      phone: '+1 (555) 123-4567'
    },
    {
      id: 'EMP002', 
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      department: 'Engineering',
      position: 'Engineering Manager',
      status: 'Active',
      joinDate: '2022-03-10',
      manager: 'Mike Wilson',
      phone: '+1 (555) 234-5678'
    },
    {
      id: 'EMP003',
      name: 'Mike Wilson',
      email: 'mike.wilson@company.com', 
      department: 'Engineering',
      position: 'VP Engineering',
      status: 'Active',
      joinDate: '2021-06-01',
      manager: 'CEO',
      phone: '+1 (555) 345-6789'
    },
    {
      id: 'EMP004',
      name: 'Emma Davis',
      email: 'emma.davis@company.com',
      department: 'HR',
      position: 'HR Manager',
      status: 'Active', 
      joinDate: '2022-09-12',
      manager: 'Lisa Brown',
      phone: '+1 (555) 456-7890'
    },
    {
      id: 'EMP005',
      name: 'Alex Brown',
      email: 'alex.brown@company.com',
      department: 'Marketing',
      position: 'Marketing Specialist',
      status: 'Active',
      joinDate: '2023-11-20',
      manager: 'Tom Wilson',
      phone: '+1 (555) 567-8901'
    },
    {
      id: 'EMP006',
      name: 'Lisa Brown',
      email: 'lisa.brown@company.com',
      department: 'HR',
      position: 'HR Director',
      status: 'Active',
      joinDate: '2020-04-15',
      manager: 'CEO',
      phone: '+1 (555) 678-9012'
    }
  ];

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'Engineering': return 'bg-primary text-primary-foreground';
      case 'HR': return 'bg-success text-success-foreground';
      case 'Marketing': return 'bg-warning text-warning-foreground';
      case 'Sales': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const handleAddEmployee = () => {
    setShowAddDialog(true);
  };

  const handleView = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setSelectedEmployee(employee);
    setShowViewDialog(true);
  };

  const handleEdit = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setSelectedEmployee(employee);
    setShowEditDialog(true);
  };

  const handleFilter = () => {
    toast({
      title: "Filter Applied",
      description: "Advanced filters have been applied to the directory.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Directory",
      description: "Employee directory is being exported...",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Employee Directory</h1>
            <p className="text-muted-foreground">Browse all company employees</p>
          </div>
          <Button onClick={handleAddEmployee}>Add Employee</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Employees</h3>
              </div>
              <p className="text-2xl font-bold mt-1">{employees.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Active</h3>
              </div>
              <p className="text-2xl font-bold mt-1">{employees.filter(e => e.status === 'Active').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Departments</h3>
              </div>
              <p className="text-2xl font-bold mt-1">{new Set(employees.map(e => e.department)).size}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <h3 className="text-sm font-medium text-muted-foreground">New This Month</h3>
              </div>
              <p className="text-2xl font-bold mt-1">2</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search employees by name, department, position, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleFilter}>Filter</Button>
              <Button variant="outline" onClick={handleExport}>Export</Button>
            </div>
          </CardContent>
        </Card>

        {/* Employee Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Employees ({filteredEmployees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={employee.avatar} alt={employee.name} />
                          <AvatarFallback className="text-xs">
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">{employee.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDepartmentColor(employee.department)}>
                        {employee.department}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.manager}</TableCell>
                    <TableCell>{new Date(employee.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(employee.id)}>View</Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(employee.id)}>Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddEmployeeDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      <ViewEmployeeDialog open={showViewDialog} onOpenChange={setShowViewDialog} employee={selectedEmployee} />
      <EditEmployeeDialog open={showEditDialog} onOpenChange={setShowEditDialog} employee={selectedEmployee} />
    </DashboardLayout>
  );
}
