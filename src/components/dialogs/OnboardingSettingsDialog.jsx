
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function OnboardingSettingsDialog({ open, onOpenChange }) {
  const [settings, setSettings] = useState({
    autoAssignManager: true,
    sendWelcomeEmail: true,
    requireManagerApproval: false,
    defaultOnboardingDuration: '7',
    reminderFrequency: 'daily',
    completionNotifications: true,
    escalationEnabled: true,
    escalationDays: '3',
    allowSelfService: true,
    requireDigitalSignature: false,
    enableProgressTracking: true,
    showCompletionPercentage: true
  });
  const { toast } = useToast();

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log('Saving onboarding settings:', settings);
    toast({
      title: "Settings Saved",
      description: "Onboarding configuration has been updated successfully.",
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setSettings({
      autoAssignManager: true,
      sendWelcomeEmail: true,
      requireManagerApproval: false,
      defaultOnboardingDuration: '7',
      reminderFrequency: 'daily',
      completionNotifications: true,
      escalationEnabled: true,
      escalationDays: '3',
      allowSelfService: true,
      requireDigitalSignature: false,
      enableProgressTracking: true,
      showCompletionPercentage: true
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboarding Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-assign Manager</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign managers based on department
                  </p>
                </div>
                <Switch
                  checked={settings.autoAssignManager}
                  onCheckedChange={(value) => handleSettingChange('autoAssignManager', value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Send Welcome Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Send welcome email when onboarding starts
                  </p>
                </div>
                <Switch
                  checked={settings.sendWelcomeEmail}
                  onCheckedChange={(value) => handleSettingChange('sendWelcomeEmail', value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Manager Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    Manager must approve before onboarding completion
                  </p>
                </div>
                <Switch
                  checked={settings.requireManagerApproval}
                  onCheckedChange={(value) => handleSettingChange('requireManagerApproval', value)}
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Default Duration (Days)</Label>
                  <Input
                    id="duration"
                    value={settings.defaultOnboardingDuration}
                    onChange={(e) => handleSettingChange('defaultOnboardingDuration', e.target.value)}
                    type="number"
                    min="1"
                    max="30"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reminder">Reminder Frequency</Label>
                  <Select 
                    value={settings.reminderFrequency} 
                    onValueChange={(value) => handleSettingChange('reminderFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Completion Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify HR when onboarding is completed
                  </p>
                </div>
                <Switch
                  checked={settings.completionNotifications}
                  onCheckedChange={(value) => handleSettingChange('completionNotifications', value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Escalation</Label>
                  <p className="text-sm text-muted-foreground">
                    Escalate overdue onboarding tasks
                  </p>
                </div>
                <Switch
                  checked={settings.escalationEnabled}
                  onCheckedChange={(value) => handleSettingChange('escalationEnabled', value)}
                />
              </div>
              
              {settings.escalationEnabled && (
                <div>
                  <Label htmlFor="escalation">Escalation After (Days)</Label>
                  <Input
                    id="escalation"
                    value={settings.escalationDays}
                    onChange={(e) => handleSettingChange('escalationDays', e.target.value)}
                    type="number"
                    min="1"
                    max="14"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employee Self-Service */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employee Self-Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Self-Service</Label>
                  <p className="text-sm text-muted-foreground">
                    Employees can update their own onboarding progress
                  </p>
                </div>
                <Switch
                  checked={settings.allowSelfService}
                  onCheckedChange={(value) => handleSettingChange('allowSelfService', value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Digital Signature</Label>
                  <p className="text-sm text-muted-foreground">
                    Require digital signature for document completion
                  </p>
                </div>
                <Switch
                  checked={settings.requireDigitalSignature}
                  onCheckedChange={(value) => handleSettingChange('requireDigitalSignature', value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Progress Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Show detailed progress tracking to employees
                  </p>
                </div>
                <Switch
                  checked={settings.enableProgressTracking}
                  onCheckedChange={(value) => handleSettingChange('enableProgressTracking', value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Completion Percentage</Label>
                  <p className="text-sm text-muted-foreground">
                    Display completion percentage in employee dashboard
                  </p>
                </div>
                <Switch
                  checked={settings.showCompletionPercentage}
                  onCheckedChange={(value) => handleSettingChange('showCompletionPercentage', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
