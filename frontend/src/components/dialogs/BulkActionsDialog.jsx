
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export function BulkActionsDialog({ open, onOpenChange }) {
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedTickets, setSelectedTickets] = useState([]);
  const { toast } = useToast();

  const mockTickets = [
    { id: 'HR001', title: 'Salary adjustment request' },
    { id: 'HR002', title: 'Policy clarification needed' },
    { id: 'HR003', title: 'Workplace harassment complaint' },
    { id: 'HR004', title: 'Benefits enrollment issue' },
  ];

  const toggleTicket = (ticketId) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleApply = () => {
    if (!selectedAction || selectedTickets.length === 0) {
      toast({
        title: "Error",
        description: "Please select an action and at least one ticket.",
        variant: "destructive"
      });
      return;
    }

    console.log('Applying bulk action:', selectedAction, 'to tickets:', selectedTickets);
    toast({
      title: "Bulk Action Applied",
      description: `${selectedAction} applied to ${selectedTickets.length} tickets.`,
    });
    onOpenChange(false);
    setSelectedAction('');
    setSelectedTickets([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="action">Action</Label>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Assign to me">Assign to me</SelectItem>
                <SelectItem value="Mark as resolved">Mark as resolved</SelectItem>
                <SelectItem value="Change priority">Change priority</SelectItem>
                <SelectItem value="Add tag">Add tag</SelectItem>
                <SelectItem value="Close tickets">Close tickets</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-medium">Select Tickets</Label>
            <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
              {mockTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    id={`ticket-${ticket.id}`}
                    checked={selectedTickets.includes(ticket.id)}
                    onCheckedChange={() => toggleTicket(ticket.id)}
                  />
                  <Label htmlFor={`ticket-${ticket.id}`} className="text-sm flex-1">
                    <span className="font-medium">{ticket.id}</span> - {ticket.title}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Action</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
