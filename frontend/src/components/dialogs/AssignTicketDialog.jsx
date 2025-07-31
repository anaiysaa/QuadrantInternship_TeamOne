import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function AssignTicketDialog({ open, onOpenChange, ticket, employees = [], onAssign }) {
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  // Default IT personnel if employees prop is empty
  const defaultItPersonnel = [
    { id: 'john-smith', name: 'John Smith', role: 'Senior IT Technician', department: 'IT', available: true },
    { id: 'sarah-johnson', name: 'Sarah Johnson', role: 'Network Administrator', department: 'IT', available: true },
    { id: 'mike-davis', name: 'Mike Davis', role: 'System Administrator', department: 'IT', available: false },
    { id: 'lisa-brown', name: 'Lisa Brown', role: 'IT Support Specialist', department: 'IT', available: true },
    { id: 'david-wilson', name: 'David Wilson', role: 'Security Analyst', department: 'IT', available: true },
  ];

  // Filter employees to only include those with "IT" in their department
  const getItPersonnel = () => {
    if (employees.length > 0) {
      // Filter employees to only show those with IT department
      const itEmployees = employees.filter(employee => {
        const department = (employee.department || '').toLowerCase();
        return department.includes('it') || department === 'information technology';
      });
      
      // If no IT employees found, use default
      return itEmployees.length > 0 ? itEmployees : defaultItPersonnel;
    }
    
    // Use default IT personnel if no employees provided
    return defaultItPersonnel;
  };

  const itPersonnel = getItPersonnel();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedPersonnel('');
      setAssignmentNotes('');
      setIsAssigning(false);
    }
  }, [open]);

  // Early return if no ticket
  if (!ticket) {
    return null;
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'High':
        return <Badge variant="outline" className="text-destructive border-destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="text-warning border-warning">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline" className="text-success border-success">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const handleAssign = async () => {
    if (!selectedPersonnel) {
      toast({
        title: "Assignment Failed",
        description: "Please select an IT personnel to assign the ticket to.",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);

    try {
      const personnel = itPersonnel.find(p => p.id === selectedPersonnel);
      const personnelName = personnel ? personnel.name : selectedPersonnel;
      
      console.log('Assigning ticket:', ticket.id, 'to:', personnelName);
      
      // Call the onAssign function if provided (for API integration)
      if (onAssign && typeof onAssign === 'function') {
        await onAssign(ticket.id, personnelName);
      } else {
        // Fallback toast if no onAssign function
        toast({
          title: "Ticket Assigned",
          description: `Ticket ${ticket.id} has been assigned to ${personnelName}.`,
        });
        
        // Close dialog after a short delay
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCancel = () => {
    setSelectedPersonnel('');
    setAssignmentNotes('');
    setIsAssigning(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Ticket - {ticket.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Ticket Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">{ticket.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{ticket.employee}</span>
              <span>•</span>
              <span>{ticket.department}</span>
              <span>•</span>
              {getSeverityBadge(ticket.severity)}
            </div>
            {ticket.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {ticket.description}
              </p>
            )}
          </div>

          {/* Assignment Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Assign to IT Personnel 
                <span className="text-xs text-muted-foreground ml-1">
                  ({itPersonnel.length} available)
                </span>
              </label>
              <Select 
                value={selectedPersonnel} 
                onValueChange={setSelectedPersonnel}
                disabled={isAssigning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select IT personnel" />
                </SelectTrigger>
                <SelectContent>
                  {itPersonnel.length === 0 ? (
                    <SelectItem value="no-personnel" disabled>
                      No IT personnel available
                    </SelectItem>
                  ) : (
                    itPersonnel.map((person) => (
                      <SelectItem 
                        key={person.id} 
                        value={person.id}
                        disabled={person.available === false}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <span className="font-medium">{person.name}</span>
                            {person.role && (
                              <span className="text-sm text-muted-foreground ml-2">
                                {person.role}
                              </span>
                            )}
                            {person.department && (
                              <span className="text-xs text-muted-foreground ml-1">
                                • {person.department}
                              </span>
                            )}
                          </div>
                          {person.available === false && (
                            <Badge variant="secondary" className="ml-2">Busy</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              {/* Show message if filtering resulted in fewer options */}
              {employees.length > 0 && itPersonnel.length < employees.length
                
              }
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Assignment Notes (Optional)</label>
              <Textarea
                placeholder="Add any specific instructions or notes for the assigned personnel..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                rows={3}
                disabled={isAssigning}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={isAssigning || itPersonnel.length === 0}
            >
              {isAssigning ? 'Assigning...' : 'Assign Ticket'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}