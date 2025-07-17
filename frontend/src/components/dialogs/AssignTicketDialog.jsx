
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function AssignTicketDialog({ open, onOpenChange, ticket }) {
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const { toast } = useToast();

  const itPersonnel = [
    { id: 'john-smith', name: 'John Smith', role: 'Senior IT Technician', available: true },
    { id: 'sarah-johnson', name: 'Sarah Johnson', role: 'Network Administrator', available: true },
    { id: 'mike-davis', name: 'Mike Davis', role: 'System Administrator', available: false },
    { id: 'lisa-brown', name: 'Lisa Brown', role: 'IT Support Specialist', available: true },
    { id: 'david-wilson', name: 'David Wilson', role: 'Security Analyst', available: true },
  ];

  if (!ticket) return null;

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

  const handleAssign = () => {
    if (!selectedPersonnel) {
      toast({
        title: "Assignment Failed",
        description: "Please select an IT personnel to assign the ticket to.",
        variant: "destructive"
      });
      return;
    }

    const personnel = itPersonnel.find(p => p.id === selectedPersonnel);
    console.log('Assigning ticket:', ticket.id, 'to:', personnel.name);
    
    toast({
      title: "Ticket Assigned",
      description: `Ticket ${ticket.id} has been assigned to ${personnel.name}.`,
    });

    // Reset form
    setSelectedPersonnel('');
    setAssignmentNotes('');
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
          </div>

          {/* Assignment Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Assign to IT Personnel</label>
              <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select IT personnel" />
                </SelectTrigger>
                <SelectContent>
                  {itPersonnel.map((person) => (
                    <SelectItem 
                      key={person.id} 
                      value={person.id}
                      disabled={!person.available}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span className="font-medium">{person.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {person.role}
                          </span>
                        </div>
                        {!person.available && (
                          <Badge variant="secondary" className="ml-2">Busy</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Assignment Notes (Optional)</label>
              <Textarea
                placeholder="Add any specific instructions or notes for the assigned personnel..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign}>
              Assign Ticket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
