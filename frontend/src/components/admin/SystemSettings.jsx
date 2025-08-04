import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, ToggleLeft, ToggleRight, Key, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export function SystemSettings() {
  const { toast } = useToast();
  const [envVars, setEnvVars] = useState([]);
  const [uptimeStart, setUptimeStart] = useState(null);
  const [currentUptime, setCurrentUptime] = useState('');
  const [settings, setSettings] = useState({
    maintenanceMode: false, 
  });
  const [databaseSize, setDatabaseSize] = useState('0 MB');

useEffect(() => {
  axios.get('http://localhost:8000/api/database-size')
    .then(res => {
      setDatabaseSize(res.data.databaseSize);
    })
    .catch(err => {
      console.error('Failed to fetch database size:', err);
    });
}, []);

  useEffect(() => {
    axios.get('http://localhost:8000/api/system-settings')
      .then(res => {
        const data = res.data;
        if (data?.uptime) {
          const parsed = new Date(data.uptime);
          setUptimeStart(new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000));
          console.log('Uptime start set to:', parsed.toLocaleString());
      }


        if (data?.maintenanceMode !== undefined) {
          setSettings(prev => ({
            ...prev,
            maintenanceMode: data.maintenanceMode,
          }));
        }

        if (Array.isArray(data.envs)) {
          const withMask = data.envs.map(env => ({
            key: env.key,
            value: env.value,
            masked: true,
          }));
          setEnvVars(withMask);
        }
      })
      .catch(err => {
        console.error('Failed to fetch system settings:', err);
      });
  }, []);

  
  // Handle the uptime counting logic
  useEffect(() => {
    if (!uptimeStart || settings.maintenanceMode) return;

    const interval = setInterval(() => {
      const diff = Date.now() - uptimeStart.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCurrentUptime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [uptimeStart, settings.maintenanceMode]);

  // Toggle maintenance mode in the system
  const toggleMaintenanceMode = () => {
    const newValue = !settings.maintenanceMode;

    axios.put('/api/system-settings/maintenance', { maintenanceMode: newValue })
      .then(res => {
        const data = res.data;
        if (data.success) {
          setSettings(prev => ({
            ...prev,
            maintenanceMode: newValue,
          }));

          if (!newValue && data?.uptime) {
            setUptimeStart(new Date(data.uptime));
          }

          toast({
            title: 'Maintenance Mode Updated',
            description: `System is now ${newValue ? 'in maintenance' : 'live'}.`,
          });
        }
      })
      .catch(err => {
        console.error('Failed to update maintenance mode:', err);
      });
      
      if (!newValue) {
        window.location.reload();
      }
   };


  const getToggleIcon = (value) => {
    return value ? (
      <ToggleRight className="h-5 w-5 text-green-600" />
    ) : (
      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
    );
  };

  // Toggle visibility of environment variables
  const toggleEnvVisibility = (index) => {
    setEnvVars(prev => {
      const newVars = [...prev];
      newVars[index].masked = !newVars[index].masked;
      return newVars;
    });
  };

  // Export configuration data
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

  // Reset to default settings
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
          View application uptime/storage status, environment variables, and adjust maintenance mode,
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
                  onClick={toggleMaintenanceMode}
                >
                  {getToggleIcon(settings.maintenanceMode)}
                </Button>
              </div>
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleEnvVisibility(index)}
                  >
                    {envVar.masked ? 'View' : 'Hide'}
                  </Button>
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
              <div className="p-4 border rounded text-center">
                <div className="text-2xl font-bold text-green-600">
                  {settings.maintenanceMode ? 'DOWN' : currentUptime || 'Loading...'}
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
            <div className="p-4 border rounded text-center">
              <div className="text-2xl font-bold text-blue-600">{databaseSize}</div>
              <div className="text-sm text-muted-foreground">Storage Used</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
