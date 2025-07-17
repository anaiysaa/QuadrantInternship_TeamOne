
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Download, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function RemoteDesktopDialog({ children, employee }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const remoteTools = [
    {
      name: 'TeamViewer',
      description: 'Cross-platform remote access',
      status: 'Available',
      action: 'Connect',
      icon: Monitor
    },
    {
      name: 'Windows RDP',
      description: 'Built-in Windows remote desktop',
      status: 'Available',
      action: 'Connect',
      icon: Monitor
    },
    {
      name: 'Chrome Remote Desktop',
      description: 'Browser-based remote access',
      status: 'Available',
      action: 'Open',
      icon: ExternalLink
    },
    {
      name: 'Quick Assist',
      description: 'Windows 10/11 quick assistance',
      status: 'Available',
      action: 'Generate Code',
      icon: Copy
    }
  ];

  const handleConnect = (tool) => {
    toast({
      title: `Connecting via ${tool.name}`,
      description: `Initiating remote connection to ${employee || 'employee'}'s computer...`,
    });
    setOpen(false);
  };

  const handleGenerateCode = () => {
    const code = Math.random().toString(36).substr(2, 9).toUpperCase();
    navigator.clipboard.writeText(code);
    toast({
      title: "Quick Assist Code Generated",
      description: `Code ${code} copied to clipboard. Share with employee.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Remote Desktop Connection</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Choose a remote desktop tool to connect with {employee || 'the employee'}:
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {remoteTools.map((tool, index) => (
              <Card key={index} className="cursor-pointer hover:bg-accent transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <tool.icon className="h-6 w-6 text-primary" />
                      <div>
                        <h4 className="font-medium">{tool.name}</h4>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-success border-success">
                        {tool.status}
                      </Badge>
                      <Button 
                        size="sm"
                        onClick={() => tool.name === 'Quick Assist' ? handleGenerateCode() : handleConnect(tool)}
                      >
                        {tool.action}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Connection Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Always get employee consent before connecting</li>
              <li>• Document the session in the support ticket</li>
              <li>• Disconnect immediately after resolving the issue</li>
              <li>• Follow company security protocols</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
