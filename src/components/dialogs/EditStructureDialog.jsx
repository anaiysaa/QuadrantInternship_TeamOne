
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Users, Building, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EditStructureDialog({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const employees = [
    { id: 'CEO', name: 'Robert Johnson', title: 'Chief Executive Officer', department: 'Executive', reportsTo: null },
    { id: 'ENG-HEAD', name: 'Mike Wilson', title: 'VP Engineering', department: 'Engineering', reportsTo: 'CEO' },
    { id: 'EMP002', name: 'Sarah Johnson', title: 'Engineering Manager', department: 'Engineering', reportsTo: 'ENG-HEAD' },
    { id: 'EMP001', name: 'John Doe', title: 'Senior Developer', department: 'Engineering', reportsTo: 'EMP002' },
    { id: 'HR-HEAD', name: 'Lisa Brown', title: 'HR Director', department: 'HR', reportsTo: 'CEO' },
    { id: 'EMP004', name: 'Emma Davis', title: 'HR Manager', department: 'HR', reportsTo: 'HR-HEAD' },
  ];

  const departments = [
    { id: 'executive', name: 'Executive', headCount: 1, openPositions: 0 },
    { id: 'engineering', name: 'Engineering', headCount: 3, openPositions: 2 },
    { id: 'hr', name: 'HR', headCount: 2, openPositions: 1 },
    { id: 'marketing', name: 'Marketing', headCount: 1, openPositions: 1 },
  ];

  const handleAddEmployee = () => {
    toast({
      title: "Add Employee",
      description: "Opening employee creation form...",
    });
  };

  const handleEditEmployee = (employee) => {
    toast({
      title: "Edit Employee",
      description: `Opening edit form for ${employee.name}...`,
    });
  };

  const handleDeleteEmployee = (employee) => {
    toast({
      title: "Delete Employee",
      description: `Removing ${employee.name} from organization...`,
      variant: "destructive"
    });
  };

  const handleAddDepartment = () => {
    toast({
      title: "Add Department",
      description: "Opening department creation form...",
    });
  };

  const handleSaveChanges = () => {
    toast({
      title: "Changes Saved",
      description: "Organization structure has been updated successfully.",
    });
    onOpenChange(false);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Edit Organization Structure</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employees" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Employees</span>
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>Departments</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-sm">
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleAddEmployee}>
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </div>

            <div className="space-y-2">
              {filteredEmployees.map((employee) => (
                <Card key={employee.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-medium">{employee.name}</h4>
                            <p className="text-sm text-muted-foreground">{employee.title}</p>
                          </div>
                          <Badge variant="outline">{employee.department}</Badge>
                          {employee.reportsTo && (
                            <Badge variant="secondary" className="text-xs">
                              Reports to: {employees.find(e => e.id === employee.reportsTo)?.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteEmployee(employee)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleAddDepartment}>
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map((department) => (
                <Card key={department.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{department.name}</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Head Count:</span>
                        <span className="text-sm font-medium">{department.headCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Open Positions:</span>
                        <span className="text-sm font-medium">{department.openPositions}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
