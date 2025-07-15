import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle, MessageSquare, Book, Phone, Mail, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SupportDialog({ children }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');
  
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: '',
    description: '',
    attachments: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.category || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Support Request Submitted",
      description: "We'll get back to you within 24 hours.",
    });
    
    setFormData({
      subject: '',
      category: '',
      priority: '',
      description: '',
      attachments: null
    });
    setOpen(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKnowledgeBase = () => {
    setOpen(false);
    // Navigate to IT Knowledge Base if user has access, otherwise show toast
    if (user?.role === 'IT' || user?.role === 'Admin') {
      navigate('/it/knowledge-base');
    } else {
      toast({
        title: "Knowledge Base",
        description: "Redirecting to help articles and documentation...",
      });
      // For regular users, you could navigate to a public knowledge base or help section
      window.open('/help', '_blank');
    }
  };

  const handleLiveChat = () => {
    setOpen(false);
    // Navigate to live chat page
    navigate('/live-chat');
    toast({
      title: "Live Chat",
      description: "Connecting you to our support team...",
    });
  };

  const handlePhoneSupport = () => {
    const phoneNumber = '+15551234567';
    
    toast({
      title: "Phone Support",
      description: `Calling ${phoneNumber}...`,
    });
    
    // Attempt to initiate phone call
    try {
      window.location.href = `tel:${phoneNumber}`;
    } catch (error) {
      // Fallback - copy number to clipboard if available
      if (navigator.clipboard) {
        navigator.clipboard.writeText(phoneNumber).then(() => {
          toast({
            title: "Phone Number Copied",
            description: `${phoneNumber} has been copied to your clipboard.`,
          });
        });
      } else {
        toast({
          title: "Call Support",
          description: `Please call: ${phoneNumber}`,
        });
      }
    }
  };

  const supportCategories = [
    'Technical Issue',
    'Account Access',
    'Feature Request',
    'Bug Report',
    'General Question',
    'HR Related',
    'IT Support',
    'Other'
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low - General inquiry' },
    { value: 'medium', label: 'Medium - Affects my work' },
    { value: 'high', label: 'High - Blocking my work' },
    { value: 'urgent', label: 'Urgent - System down' }
  ];

  const quickHelp = [
    {
      title: 'Knowledge Base',
      description: 'Search our comprehensive help articles',
      icon: Book,
      action: handleKnowledgeBase
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: MessageSquare,
      action: handleLiveChat
    },
    {
      title: 'Phone Support',
      description: 'Call us at (555) 123-4567',
      icon: Phone,
      action: handlePhoneSupport
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Support Center
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'contact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('contact')}
              className="flex-1"
            >
              Contact Support
            </Button>
            <Button
              variant={activeTab === 'help' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('help')}
              className="flex-1"
            >
              Quick Help
            </Button>
          </div>

          {/* Contact Support Tab */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityLevels.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Please provide detailed information about your issue..."
                  rows={6}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="attachments">Attachments (Optional)</Label>
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  onChange={(e) => handleInputChange('attachments', e.target.files)}
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT (Max 10MB)
                </p>
              </div>
              
              <Separator />
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Your Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span> {user?.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span> {user?.email}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Employee ID:</span> {user?.employeeId}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Role:</span> {user?.role}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Request
                </Button>
              </div>
            </form>
          )}

          {/* Quick Help Tab */}
          {activeTab === 'help' && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {quickHelp.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={item.action}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-3 text-lg">
                          <Icon className="h-5 w-5 text-primary" />
                          {item.title}
                          <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                        </CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
              
              <Separator />
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>support@company.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>(555) 123-4567</span>
                  </div>
                  <div className="mt-3 text-muted-foreground">
                    <p><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST</p>
                    <p><strong>Emergency Support:</strong> Available 24/7 for critical issues</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
