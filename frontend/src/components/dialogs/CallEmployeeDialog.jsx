
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneCall, Headphones, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CallEmployeeDialog({ children, employee }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const callOptions = [
    {
      type: 'Direct Call',
      description: 'Call employee directly on their work phone',
      icon: Phone,
      number: '+1 (555) 123-4567',
      status: 'Available'
    },
    {
      type: 'Teams Call',
      description: 'Start a Microsoft Teams voice call',
      icon: Headphones,
      number: 'teams://call',
      status: 'Available'
    },
    {
      type: 'Video Call',
      description: 'Start a Teams video call for screen sharing',
      icon: Video,
      number: 'teams://videocall',
      status: 'Available'
    },
    {
      type: 'Mobile',
      description: 'Call employee on their mobile phone',
      icon: PhoneCall,
      number: '+1 (555) 987-6543',
      status: 'Emergency Only'
    }
  ];

  const handleCall = (option) => {
    toast({
      title: `Calling ${employee || 'Employee'}`,
      description: `Initiating ${option.type.toLowerCase()} via ${option.number}...`,
    });
    
    // Log the call attempt
    console.log(`Call initiated: ${option.type} to ${employee || 'employee'} at ${option.number}`);
    
    setOpen(false);
  };

  const getStatusBadge = (status) => {
    if (status === 'Available') {
      return <Badge variant="outline" className="text-success border-success">Available</Badge>;
    }
    return <Badge variant="outline" className="text-warning border-warning">{status}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Call Employee</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Choose how to contact {employee || 'the employee'}:
          </div>
          
          <div className="space-y-3">
            {callOptions.map((option, index) => (
              <Card key={index} className="cursor-pointer hover:bg-accent transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <option.icon className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">{option.type}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{option.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(option.status)}
                      <Button 
                        size="sm"
                        onClick={() => handleCall(option)}
                        disabled={option.status === 'Emergency Only'}
                      >
                        Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Call Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be professional and courteous</li>
              <li>• Document call details in the ticket</li>
              <li>• Use mobile numbers only for emergencies</li>
              <li>• Follow up with written instructions via chat</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
