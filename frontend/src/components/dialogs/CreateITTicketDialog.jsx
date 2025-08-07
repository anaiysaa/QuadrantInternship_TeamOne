import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// API function for posting IT tickets only
const postITTicket = async (ticketData) => {
  try {
    console.log('Posting IT Ticket:', ticketData);
    
    // Match the structure from your example - using the same field names as the SupportTickets component
    const payload = {
      EmployeeID: ticketData.EmployeeID,
      Status: ticketData.Status,
      title: ticketData.title,
      description: ticketData.description,
      summary: ticketData.summary || '',
      department: ticketData.department,
      // Map our form fields to match the expected format
      Priority: ticketData.priority,  // Note: uppercase P to match backend expectation
      Category: ticketData.category,  // Note: uppercase C to match backend expectation
    };
    
    console.log('API Payload being sent:', payload);
    
    const response = await axios.post('http://localhost:8000/api/tickets/it', payload);
    console.log('IT Ticket created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating IT ticket:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
      
      // Log the specific error message from the server
      if (error.response.data && error.response.data.error) {
        console.error('Server error message:', error.response.data.error);
        throw new Error(`Server error: ${error.response.data.error}`);
      }
    }
    throw new Error(`Failed to create IT ticket: ${error.message}`);
  }
};

export function CreateITTicketDialog({ open, onOpenChange, onTicketCreated }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    selectedEmployee: '',
    description: '',
    summary: '',
    priority: 'Medium',
    category: 'General',
  });
  
  const { toast } = useToast();

  // IT ticket categories
  const itCategories = [
    'Hardware',
    'Software',
    'Network',
    'Security',
    'Account Access',
    'Email',
    'Printer',
    'Phone/VoIP',
    'General',
    'Other'
  ];

  // Priority levels
  const priorities = [
    'Low',
    'Medium',
    'High',
    'Critical'
  ];

  // Fetch employees when dialog opens
  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/employees');
      console.log('Employees fetched:', response.data);
      
      // Handle different possible response structures
      const employeeData = Array.isArray(response.data) ? response.data : 
                          response.data.employees ? response.data.employees : [];
      
      console.log('Processed employee data:', employeeData);
      setEmployees(employeeData);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form data on submit:', formData);
    console.log('Available employees:', employees);
    
    if (!formData.title || !formData.description || !formData.selectedEmployee) {
      console.log('Validation failed:', {
        title: !!formData.title,
        description: !!formData.description,
        selectedEmployee: !!formData.selectedEmployee,
      });
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Find the selected employee to get their details - convert to string for comparison
      const selectedEmployeeStr = String(formData.selectedEmployee);
      const selectedEmp = employees.find(emp => {
        const empId = String(emp.EmployeeID || emp.id || '');
        return empId === selectedEmployeeStr;
      });
      
      console.log('Looking for employee with ID:', selectedEmployeeStr);
      console.log('Found employee:', selectedEmp);
      console.log('All available employees:', employees.map(e => ({
        id: e.EmployeeID || e.id,
        name: e.Name || e.name,
        department: e.Department || e.department
      })));
      
      if (!selectedEmp) {
        console.error('Employee not found. Available employees:', employees.map(e => ({
          id: e.EmployeeID || e.id,
          name: e.Name || e.name,
          department: e.Department || e.department
        })));
        throw new Error('Selected employee not found');
      }

      // Get the employee's department - check multiple possible field names
      const employeeDepartment = selectedEmp.Department || 
                                selectedEmp.department || 
                                selectedEmp.Dept || 
                                selectedEmp.dept || 
                                'Unknown';

      console.log('Employee department found:', employeeDepartment);

      // Prepare ticket data to match the API requirements exactly
      const ticketData = {
        EmployeeID: parseInt(selectedEmp.EmployeeID || selectedEmp.id), // Ensure it's an integer
        Status: 'Open',
        title: formData.title.trim(),
        description: formData.description.trim(),
        summary: formData.summary ? formData.summary.trim() : '',
        department: employeeDepartment.trim(),
        priority: formData.priority,
        category: formData.category,
      };

      // Validate that we have all required fields
      console.log('Final ticket data before sending:', ticketData);
      console.log('Employee data used:', {
        id: selectedEmp.EmployeeID || selectedEmp.id,
        name: selectedEmp.Name || selectedEmp.name,
        department: employeeDepartment
      });
      
      // Additional validation
      if (!ticketData.EmployeeID || isNaN(ticketData.EmployeeID)) {
        throw new Error('Invalid Employee ID');
      }
      
      if (!ticketData.title || !ticketData.description) {
        throw new Error('Missing required fields: title or description');
      }
      
      if (!ticketData.department || ticketData.department === 'Unknown') {
        console.warn('Department not found for employee, using "Unknown"');
      }

      console.log('Submitting IT ticket data:', ticketData);

      // Submit the IT ticket
      await postITTicket(ticketData);

      console.log('IT ticket successfully created');

      toast({
        title: "IT Ticket Created",
        description: `IT ticket "${formData.title}" has been created for ${selectedEmp.Name || selectedEmp.name || 'selected employee'}.`,
      });

      // Reset form
      setFormData({
        title: '',
        selectedEmployee: '',
        description: '',
        summary: '',
        priority: 'Medium',
        category: 'General',
      });

      onOpenChange(false);
      
      // Callback to refresh tickets if provided
      if (onTicketCreated) {
        onTicketCreated();
      }

    } catch (error) {
      console.error('Error creating IT ticket:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create IT ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      selectedEmployee: '',
      description: '',
      summary: '',
      priority: 'Medium',
      category: 'General',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create IT Ticket on Behalf of Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="selectedEmployee">Employee *</Label>
            <Select 
              value={formData.selectedEmployee} 
              onValueChange={(value) => {
                console.log('Employee selected:', value);
                setFormData({...formData, selectedEmployee: value});
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.length === 0 ? (
                  <SelectItem value="loading" disabled>Loading employees...</SelectItem>
                ) : (
                  employees.map((emp) => {
                    const empId = emp.EmployeeID || emp.id;
                    const empName = emp.Name || emp.name;
                    const empDept = emp.Department || emp.department || 'No Dept';
                    
                    // Skip if empId is falsy or empty
                    if (!empId) {
                      console.warn('Employee found without valid ID:', emp);
                      return null;
                    }
                    
                    return (
                      <SelectItem 
                        key={empId} 
                        value={String(empId)}
                      >
                        {empName} - {empDept}
                      </SelectItem>
                    );
                  }).filter(Boolean) // Remove any null entries
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {itCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({...formData, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Brief description of the IT issue"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Issue Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detailed description of the IT issue, including steps to reproduce if applicable"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="summary">Additional Notes</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
              placeholder="Any additional information or context (optional)"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Creating IT Ticket...' : 'Create IT Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}