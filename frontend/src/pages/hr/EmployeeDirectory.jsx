import { useEffect, useState } from 'react';
import axios from 'axios';
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
import AddEmployeeDialog from '@/components/dialogs/AddEmployeeDialog';
import EditEmployeeDialog from '@/components/dialogs/EditEmployeeDialog';
import ViewEmployeeDialog from '@/components/dialogs/ViewEmployeeDialog';


const API_URL = 'http://localhost:8000/api/employees';

function resolveManagerId(managerInput, employees) {
  if (!managerInput) return null;
  const input = String(managerInput).trim().toLowerCase();
  // Try ID match (case-insensitive)
  const idMatch = employees.find(e =>
    String(e.id).toLowerCase() === input
  );
  if (idMatch) return idMatch.id;
  // Try name match (case-insensitive, unique only)
  const matches = employees.filter(e =>
    (e.name || '').toLowerCase() === input
  );
  if (matches.length === 1) return matches[0].id;
  // No unique match found
  return null;
}


export default function EmployeeDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => setEmployees(res.data))
      .catch(() => {
        setEmployees([]);
        toast({ title: 'Error', description: 'Failed to load employees from server.' });
      });
  }, [refreshKey, toast]);

  const filteredEmployees = employees.filter(employee =>
    (employee.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return (name || '').split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'Admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'HR': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IT': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-secondary text-secondary-foreground text-white';
    }
  };

  const handleAddEmployee = () => setShowAddDialog(true);

  const handleAddEmployeeSubmit = async (newData) => {
    const managerInput = newData.manager;
    const managerId = resolveManagerId(managerInput, employees);
    if (managerInput && !managerId) {
      toast({
        title: "Manager Not Found",
        description: "Please enter a valid manager name or ID (case insensitive).",
        variant: "destructive"
      });
      return;
    }
    try {
      await axios.post(API_URL, { ...newData, manager: managerId });
      setShowAddDialog(false);
      toast({
        title: "Employee Added",
        description: `${newData.name} has been added.`,
      });
      setRefreshKey(k => k + 1);
    } catch {
      toast({
        title: "Error",
        description: "Failed to add employee.",
        variant: "destructive"
      });
    }
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

  const handleEditEmployeeSubmit = async (updatedData) => {
    const managerInput = updatedData.manager;
    const managerId = resolveManagerId(managerInput, employees);
    if (managerInput && !managerId) {
      toast({
        title: "Manager Not Found",
        description: "Please enter a valid manager name or ID (case insensitive).",
        variant: "destructive"
      });
      return;
    }
    try {
      await axios.put(`${API_URL}/${selectedEmployee.id}`, { ...updatedData, manager: managerId });
      setShowEditDialog(false);
      toast({
        title: "Employee Updated",
        description: `${updatedData.name}'s info updated.`,
      });
      setRefreshKey(k => k + 1);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update employee.",
        variant: "destructive"
      });
    }
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const departmentCount = new Set(employees.map(e => e.department)).size;
  const newThisMonth = employees.filter(e => {
    if (!e.joinDate) return false;
    const date = new Date(e.joinDate);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

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
              <p className="text-2xl font-bold mt-1">{totalEmployees}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Active</h3>
              </div>
              <p className="text-2xl font-bold mt-1">{activeEmployees}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Departments</h3>
              </div>
              <p className="text-2xl font-bold mt-1">{departmentCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <h3 className="text-sm font-medium text-muted-foreground">New This Month</h3>
              </div>
              <p className="text-2xl font-bold mt-1">{newThisMonth}</p>
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
                {filteredEmployees.map((employee, idx) => (
                  <TableRow key={employee.id || idx}>
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
                        {employee.department || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.position || '-'}</TableCell>
                    <TableCell>
                      {employee.managerId && employee.managerName
                        ? `${employee.managerName} (${employee.managerId})`
                        : employee.managerId
                          ? employee.managerId
                          : '-'}
                    </TableCell>
                    <TableCell>
                      {employee.joinDate
                        ? new Date(employee.joinDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.status === 'Active' ? 'default' : 'text-white'}>
                        {employee.status || '-'}
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
      <AddEmployeeDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        onAdd={handleAddEmployeeSubmit} 
      />
      <ViewEmployeeDialog 
        open={showViewDialog} 
        onOpenChange={setShowViewDialog} 
        employee={selectedEmployee} 
      />
      <EditEmployeeDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
        employee={selectedEmployee}
        onEdit={handleEditEmployeeSubmit}
      />
    </DashboardLayout>
  );
}