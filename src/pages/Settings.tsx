import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  DollarSign, 
  Target, 
  Bell, 
  Shield,
  Save,
  RotateCcw,
  User,
  IndianRupee
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Risk Thresholds
  const [lowRiskMax, setLowRiskMax] = useState(30);
  const [mediumRiskMax, setMediumRiskMax] = useState(60);

  // Business Parameters
  const [arpu, setArpu] = useState('799');
  const [retentionCost, setRetentionCost] = useState('200');
  const [customerLifetime, setCustomerLifetime] = useState('24');

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [highRiskAlerts, setHighRiskAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  const handleSaveSettings = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  const handleResetDefaults = () => {
    setLowRiskMax(30);
    setMediumRiskMax(60);
    setArpu('799');
    setRetentionCost('200');
    setCustomerLifetime('24');
    setEmailAlerts(true);
    setHighRiskAlerts(true);
    setWeeklyReports(false);

    toast({
      title: 'Settings Reset',
      description: 'All settings have been restored to defaults.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure analytics parameters and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Defaults
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex items-center h-10">
                <Badge variant="outline" className="text-sm">Analyst</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Risk Thresholds
          </CardTitle>
          <CardDescription>
            Configure churn probability thresholds for risk categorization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Low Risk Maximum (%)</Label>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  0% - {lowRiskMax}%
                </Badge>
              </div>
              <Slider
                value={[lowRiskMax]}
                onValueChange={(value) => setLowRiskMax(value[0])}
                max={50}
                min={10}
                step={5}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Medium Risk Maximum (%)</Label>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                  {lowRiskMax}% - {mediumRiskMax}%
                </Badge>
              </div>
              <Slider
                value={[mediumRiskMax]}
                onValueChange={(value) => setMediumRiskMax(value[0])}
                max={80}
                min={lowRiskMax + 10}
                step={5}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
              <span className="font-medium">High Risk</span>
              <Badge variant="destructive">
                {mediumRiskMax}% - 100%
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg border">
              <div className="w-4 h-4 rounded-full bg-primary mx-auto mb-2" />
              <p className="font-medium">Low Risk</p>
              <p className="text-sm text-muted-foreground">&lt; {lowRiskMax}%</p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mx-auto mb-2" />
              <p className="font-medium">Medium Risk</p>
              <p className="text-sm text-muted-foreground">{lowRiskMax}% - {mediumRiskMax}%</p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="w-4 h-4 rounded-full bg-destructive mx-auto mb-2" />
              <p className="font-medium">High Risk</p>
              <p className="text-sm text-muted-foreground">&gt; {mediumRiskMax}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary" />
            Business Parameters
          </CardTitle>
          <CardDescription>
            Configure financial assumptions for ROI and revenue calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="arpu">Average Revenue Per User (ARPU)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="arpu"
                  type="number"
                  value={arpu}
                  onChange={(e) => setArpu(e.target.value)}
                  className="pl-7"
                  step="1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Monthly revenue per user</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention-cost">Retention Action Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="retention-cost"
                  type="number"
                  value={retentionCost}
                  onChange={(e) => setRetentionCost(e.target.value)}
                  className="pl-7"
                  step="1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Cost per retention intervention</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifetime">Customer Lifetime (months)</Label>
              <Input
                id="lifetime"
                type="number"
                value={customerLifetime}
                onChange={(e) => setCustomerLifetime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Average subscription duration</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Calculated Customer Lifetime Value (CLV)</p>
            <p className="text-2xl font-bold text-primary">
              ₹{(parseFloat(arpu) * parseInt(customerLifetime)).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ARPU × Customer Lifetime = ₹{arpu} × {customerLifetime} months
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure alert preferences and reporting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Email Alerts</p>
              <p className="text-sm text-muted-foreground">Receive email notifications for important events</p>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">High Risk Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when users enter high risk category</p>
            </div>
            <Switch checked={highRiskAlerts} onCheckedChange={setHighRiskAlerts} />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Weekly Reports</p>
              <p className="text-sm text-muted-foreground">Receive weekly churn analytics summary</p>
            </div>
            <Switch checked={weeklyReports} onCheckedChange={setWeeklyReports} />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
