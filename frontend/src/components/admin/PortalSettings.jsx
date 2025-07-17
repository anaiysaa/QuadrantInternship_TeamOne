
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Palette, Layout, Eye, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PortalSettings() {
  const { toast } = useToast();
  const [selectedPortal, setSelectedPortal] = useState('employee');
  
  const defaultPortalConfigs = {
    employee: {
      name: 'Employee Portal',
      theme: 'purple',
      welcomeMessage: 'Welcome to your employee dashboard',
      features: ['profile', 'timesheet', 'leave', 'performance', 'career']
    },
    hr: {
      name: 'HR Portal',
      theme: 'blue',
      welcomeMessage: 'HR Management Dashboard',
      features: ['employees', 'leave-requests', 'timesheets', 'onboarding', 'payroll']
    },
    it: {
      name: 'IT Portal',
      theme: 'green',
      welcomeMessage: 'IT Support & Asset Management',
      features: ['support', 'assets', 'inventory', 'software', 'knowledge']
    }
  };

  const [portalConfigs, setPortalConfigs] = useState(defaultPortalConfigs);
  const currentConfig = portalConfigs[selectedPortal];

  const handleInputChange = (field, value) => {
    setPortalConfigs(prev => ({
      ...prev,
      [selectedPortal]: {
        ...prev[selectedPortal],
        [field]: value
      }
    }));
  };

  const handleSaveChanges = () => {
    console.log('Saving portal configurations:', portalConfigs);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Changes Saved",
        description: `${currentConfig.name} settings have been saved successfully.`,
      });
    }, 500);
  };

  const handlePreviewPortal = () => {
    console.log('Opening preview for:', currentConfig.name);
    
    // Simulate opening preview window
    toast({
      title: "Portal Preview",
      description: `Opening preview for ${currentConfig.name}...`,
    });
    
    // In a real app, this would open a new window/tab with the portal preview
    window.open(`/preview/${selectedPortal}`, '_blank');
  };

  const handleResetToDefault = () => {
    setPortalConfigs(prev => ({
      ...prev,
      [selectedPortal]: defaultPortalConfigs[selectedPortal]
    }));
    
    toast({
      title: "Settings Reset",
      description: `${currentConfig.name} has been reset to default settings.`,
      variant: "destructive",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Portal Settings
        </CardTitle>
        <CardDescription>
          Configure portal-specific content, themes, and UI elements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Portal Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Portal</label>
          <Select value={selectedPortal} onValueChange={setSelectedPortal}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee Portal</SelectItem>
              <SelectItem value="hr">HR Portal</SelectItem>
              <SelectItem value="it">IT Portal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Portal Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Basic Settings
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Portal Name</label>
              <Input 
                value={currentConfig.name} 
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Welcome Message</label>
              <Input 
                value={currentConfig.welcomeMessage} 
                onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Theme Color</label>
              <Select 
                value={currentConfig.theme} 
                onValueChange={(value) => handleInputChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Feature Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Feature Configuration
            </h3>
            
            <div className="space-y-3">
              {currentConfig.features.map((feature) => (
                <div key={feature} className="flex items-center justify-between p-3 border rounded">
                  <span className="capitalize">{feature.replace('-', ' ')}</span>
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    Visible
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSaveChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={handlePreviewPortal}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Portal
          </Button>
          <Button 
            variant="outline" 
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleResetToDefault}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
