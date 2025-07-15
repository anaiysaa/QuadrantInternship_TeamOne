
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, ToggleLeft, ToggleRight, AlertTriangle, Server, Key, Download, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SystemSettings() {
  const { toast } = useToast();
  
  const defaultSettings = {
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    autoBackup: true,
    debugMode: false,
    analyticsTracking: true
  };

  const defaultEnvVars = [
    { key: 'SMTP_HOST', value: 'smtp.company.com', masked: false },
    { key: 'DATABASE_URL', value: '••••••••••••••••', masked: true },
    { key: 'API_KEY', value: '••••••••••••••••', masked: true },
    { key: 'APP_NAME', value: 'Company Portal', masked: false },
  ];

  const [settings, setSettings] = useState(defaultSettings);
  const [envVars, setEnvVars] = useState(defaultEnvVars);

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getToggleIcon = (value) => {
    return value ? (
      <ToggleRight className="h-5 w-5 text-green-600" />
    ) : (
      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
    );
  };

  const handleSaveSettings = () => {
    console.log('Saving all settings:', { settings, envVars });
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Settings Saved",
        description: "All system settings have been saved successfully.",
      });
    }, 500);
  };

  const handleExportConfiguration = () => {
    const configuration = {
      settings,
      envVars: envVars.map(env => ({ ...env, value: env.masked ? '[MASKED]' : env.value })),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const dataStr = JSON.stringify(configuration, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-configuration-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Configuration Exported",
      description: "System configuration has been exported successfully.",
    });
  };

  const handleResetToDefaults = () => {
    setSettings(defaultSettings);
    setEnvVars(defaultEnvVars);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
      variant: "destructive",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Settings
        </CardTitle>
        <CardDescription>
          Configure global features, maintenance modes, and environment variables
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Global Features</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">Maintenance Mode</div>
                <div className="text-sm text-muted-foreground">Temporarily disable access for system updates</div>
              </div>
              <div className="flex items-center gap-2">
                {settings.maintenanceMode && <Badge className="bg-red-100 text-red-800">Active</Badge>}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSetting('maintenanceMode')}
                >
                  {getToggleIcon(settings.maintenanceMode)}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">User Registration</div>
                <div className="text-sm text-muted-foreground">Allow new user account creation</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleSetting('userRegistration')}
              >
                {getToggleIcon(settings.userRegistration)}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">System-wide email notification service</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleSetting('emailNotifications')}
              >
                {getToggleIcon(settings.emailNotifications)}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">Automatic Backup</div>
                <div className="text-sm text-muted-foreground">Daily automated system backups</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleSetting('autoBackup')}
              >
                {getToggleIcon(settings.autoBackup)}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">Debug Mode</div>
                <div className="text-sm text-muted-foreground">Enable detailed logging and error reporting</div>
              </div>
              <div className="flex items-center gap-2">
                {settings.debugMode && <Badge className="bg-yellow-100 text-yellow-800">Debug</Badge>}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSetting('debugMode')}
                >
                  {getToggleIcon(settings.debugMode)}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">Analytics Tracking</div>
                <div className="text-sm text-muted-foreground">Collect usage analytics and metrics</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleSetting('analyticsTracking')}
              >
                {getToggleIcon(settings.analyticsTracking)}
              </Button>
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Key className="h-4 w-4" />
              Environment Variables
            </h3>
            <Button variant="outline" size="sm">
              Add Variable
            </Button>
          </div>
          
          <div className="space-y-2">
            {envVars.map((envVar, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded">
                <div className="flex-1">
                  <div className="font-mono text-sm font-medium">{envVar.key}</div>
                </div>
                <div className="flex-1">
                  <Input 
                    value={envVar.value} 
                    type={envVar.masked ? 'password' : 'text'}
                    className="font-mono text-sm"
                    readOnly
                  />
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="outline">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Server className="h-4 w-4" />
            System Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded text-center">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="p-4 border rounded text-center">
              <div className="text-2xl font-bold text-blue-600">12GB</div>
              <div className="text-sm text-muted-foreground">Storage Used</div>
            </div>
            <div className="p-4 border rounded text-center">
              <div className="text-2xl font-bold text-purple-600">45ms</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
          <Button variant="outline" onClick={handleExportConfiguration}>
            <Download className="h-4 w-4 mr-2" />
            Export Configuration
          </Button>
          <Button 
            variant="outline" 
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleResetToDefaults}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
