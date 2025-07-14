import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Download, 
  Upload, 
  Trash2, 
  Key, 
  Database,
  Bell,
  Palette,
  Info,
  AlertTriangle,
  CheckCircle,
  Lock
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export default function Settings() {
  const [settings, setSettings] = useState({
    autoBackup: true,
    notifications: true,
    darkMode: false,
    voiceRecognition: true,
    gpsTracking: true,
    dataRetention: '12', // months
  });
  
  const [storageInfo, setStorageInfo] = useState({
    incidents: 0,
    storageUsed: '0 KB',
    lastBackup: null as string | null
  });
  
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    calculateStorageInfo();
  }, [loadSettings, calculateStorageInfo]);

  const loadSettings = useCallback(() => {
    const savedSettings = localStorage.getItem('childfirst_settings');
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  }, [settings]);

  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem('childfirst_settings', JSON.stringify(newSettings));
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  const calculateStorageInfo = useCallback(() => {
    const incidents = JSON.parse(localStorage.getItem('childfirst_incidents') || '[]');
    const dataSize = new Blob([JSON.stringify(incidents)]).size;
    const lastBackup = localStorage.getItem('childfirst_last_backup');
    
    setStorageInfo({
      incidents: incidents.length,
      storageUsed: formatBytes(dataSize),
      lastBackup
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const exportData = () => {
    try {
      const incidents = localStorage.getItem('childfirst_incidents') || '[]';
      const settings = localStorage.getItem('childfirst_settings') || '{}';
      
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        incidents: JSON.parse(incidents),
        settings: JSON.parse(settings)
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `childfirst-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      localStorage.setItem('childfirst_last_backup', new Date().toISOString());
      calculateStorageInfo();
      
      toast({
        title: "Data exported successfully",
        description: "Your backup file has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        if (importData.incidents) {
          localStorage.setItem('childfirst_incidents', JSON.stringify(importData.incidents));
        }
        
        if (importData.settings) {
          localStorage.setItem('childfirst_settings', JSON.stringify(importData.settings));
          setSettings({ ...settings, ...importData.settings });
        }
        
        calculateStorageInfo();
        
        toast({
          title: "Data imported successfully",
          description: `Imported ${importData.incidents?.length || 0} incidents.`,
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid backup file format.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearAllData = () => {
    localStorage.removeItem('childfirst_incidents');
    localStorage.removeItem('childfirst_settings');
    localStorage.removeItem('childfirst_last_backup');
    
    setSettings({
      autoBackup: true,
      notifications: true,
      darkMode: false,
      voiceRecognition: true,
      gpsTracking: true,
      dataRetention: '12',
    });
    
    calculateStorageInfo();
    
    toast({
      title: "All data cleared",
      description: "Your app has been reset to default settings.",
    });
  };

  const changePin = () => {
    if (newPin.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 6 digits.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPin !== confirmPin) {
      toast({
        title: "PINs don't match",
        description: "Please ensure both PIN entries match.",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem('childfirst_pin', newPin);
    setNewPin('');
    setConfirmPin('');
    
    toast({
      title: "PIN changed successfully",
      description: "Your new PIN has been set.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your app preferences and data
        </p>
      </div>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Privacy & Security</span>
          </CardTitle>
          <CardDescription>
            Control how your data is stored and protected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PIN Change */}
          <div className="space-y-4">
            <h3 className="font-semibold">Change PIN</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">New PIN (6 digits)</label>
                <Input
                  type="password"
                  placeholder="Enter new PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Confirm PIN</label>
                <Input
                  type="password"
                  placeholder="Confirm new PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </div>
            </div>
            <Button onClick={changePin} disabled={!newPin || !confirmPin}>
              <Key className="w-4 h-4 mr-2" />
              Update PIN
            </Button>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Privacy Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">GPS Location Tracking</label>
                  <p className="text-sm text-muted-foreground">
                    Record location data with incidents for legal documentation
                  </p>
                </div>
                <Switch
                  checked={settings.gpsTracking}
                  onCheckedChange={(checked) => saveSettings({ ...settings, gpsTracking: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Voice Recognition</label>
                  <p className="text-sm text-muted-foreground">
                    Enable automatic speech-to-text transcription
                  </p>
                </div>
                <Switch
                  checked={settings.voiceRecognition}
                  onCheckedChange={(checked) => saveSettings({ ...settings, voiceRecognition: checked })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-accent" />
            <span>App Preferences</span>
          </CardTitle>
          <CardDescription>
            Customize your app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Notifications</label>
              <p className="text-sm text-muted-foreground">
                Receive reminders and app notifications
              </p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => saveSettings({ ...settings, notifications: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Auto Backup</label>
              <p className="text-sm text-muted-foreground">
                Automatically prompt for data backup weekly
              </p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(checked) => saveSettings({ ...settings, autoBackup: checked })}
            />
          </div>
          
          <div>
            <label className="font-medium mb-2 block">Data Retention Period</label>
            <p className="text-sm text-muted-foreground mb-2">
              How long to keep incident data (months)
            </p>
            <Input
              type="number"
              min="1"
              max="60"
              value={settings.dataRetention}
              onChange={(e) => saveSettings({ ...settings, dataRetention: e.target.value })}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-secondary" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>
            Backup, restore, and manage your stored data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Storage Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">{storageInfo.incidents}</div>
              <div className="text-sm text-muted-foreground">Incidents Stored</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-accent">{storageInfo.storageUsed}</div>
              <div className="text-sm text-muted-foreground">Storage Used</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-secondary">
                {storageInfo.lastBackup ? 'Yes' : 'Never'}
              </div>
              <div className="text-sm text-muted-foreground">Last Backup</div>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-4">
            <h3 className="font-semibold">Backup & Restore</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={exportData} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
            <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete all your data. This action cannot be undone.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your incident records, settings, and backup data. 
                    This action cannot be undone. Make sure you have exported your data if you want to keep it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAllData} className="bg-destructive hover:bg-destructive/90">
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-muted-foreground" />
            <span>App Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Version</label>
              <p className="font-semibold">1.0.0</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="font-semibold">January 2024</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data Storage</label>
              <p className="font-semibold">Local Device Only</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Privacy</label>
              <p className="font-semibold">No Cloud Sync</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <div className="flex items-center space-x-2 mb-2">
              <Lock className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">Privacy Protected</span>
            </div>
            <p className="text-sm text-muted-foreground">
              All your data is stored locally on your device. No information is sent to external servers 
              or cloud services, ensuring complete privacy and control over your sensitive family data.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Resources and support for using ChildFirst
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold mb-2">User Guide</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Learn how to use all features of ChildFirst effectively
              </p>
              <Button variant="outline" size="sm">
                View Guide
              </Button>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold mb-2">Privacy Policy</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Understand how your data is protected and used
              </p>
              <Button variant="outline" size="sm">
                Read Policy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}