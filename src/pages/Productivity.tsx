import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Zap, 
  Users, 
  Target, 
  Mail, 
  Gift, 
  Music, 
  Bell,
  TrendingUp,
  Loader2,
  AlertTriangle,
  Download,
  Filter
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { useSpotifyData } from '@/hooks/useSpotifyData';
import { SpotifyUserData } from '@/data/spotifyChurnData';

interface RetentionAction {
  userId: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  churnDriver: string;
  recommendedAction: string;
  actionType: 'email' | 'discount' | 'playlist' | 'notification';
  priority: number;
}

const getChurnDriver = (user: SpotifyUserData): string => {
  if (user.days_since_last_login > 30) return 'Inactivity';
  if (user.songs_skipped_per_week > 50) return 'High Skip Rate';
  if (user.avg_listening_hours_per_week < 5) return 'Low Engagement';
  if (user.login_frequency_per_week < 2) return 'Low Login Frequency';
  if (user.subscription_type === 'Free') return 'Free Tier';
  return 'Multiple Factors';
};

const getRecommendedAction = (driver: string, subscription: string): { action: string; type: 'email' | 'discount' | 'playlist' | 'notification' } => {
  switch (driver) {
    case 'Inactivity':
      return { action: 'Send re-engagement email with personalized content', type: 'email' };
    case 'High Skip Rate':
      return { action: 'Curate improved personalized playlists', type: 'playlist' };
    case 'Low Engagement':
      return { action: 'Push notification with trending music', type: 'notification' };
    case 'Low Login Frequency':
      return { action: 'Weekly digest email with new releases', type: 'email' };
    case 'Free Tier':
      return { action: subscription === 'Free' ? 'Offer Premium trial discount' : 'Loyalty reward', type: 'discount' };
    default:
      return { action: 'Personalized retention outreach', type: 'email' };
  }
};

const Productivity = () => {
  const { users, loading, error } = useSpotifyData(10000);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const retentionActions = useMemo<RetentionAction[]>(() => {
    const highRiskUsers = users
      .filter(u => u.riskCategory === 'High' || u.riskCategory === 'Medium')
      .slice(0, 100);

    return highRiskUsers.map(user => {
      const churnDriver = getChurnDriver(user);
      const { action, type } = getRecommendedAction(churnDriver, user.subscription_type);
      
      return {
        userId: user.user_id,
        riskLevel: user.riskCategory as 'High' | 'Medium' | 'Low',
        churnDriver,
        recommendedAction: action,
        actionType: type,
        priority: user.riskCategory === 'High' ? 1 : 2,
      };
    }).sort((a, b) => a.priority - b.priority);
  }, [users]);

  const filteredActions = useMemo(() => {
    if (priorityFilter === 'all') return retentionActions;
    if (priorityFilter === 'high') return retentionActions.filter(a => a.riskLevel === 'High');
    if (priorityFilter === 'medium') return retentionActions.filter(a => a.riskLevel === 'Medium');
    return retentionActions;
  }, [retentionActions, priorityFilter]);

  const stats = useMemo(() => {
    const highPriority = retentionActions.filter(a => a.riskLevel === 'High').length;
    const mediumPriority = retentionActions.filter(a => a.riskLevel === 'Medium').length;
    const emailActions = retentionActions.filter(a => a.actionType === 'email').length;
    const discountActions = retentionActions.filter(a => a.actionType === 'discount').length;

    return { highPriority, mediumPriority, emailActions, discountActions };
  }, [retentionActions]);

  const actionTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'discount': return <Gift className="w-4 h-4" />;
      case 'playlist': return <Music className="w-4 h-4" />;
      case 'notification': return <Bell className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading retention data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive">Failed to load data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Retention Actions</h1>
          <p className="text-muted-foreground">Personalized retention recommendations for at-risk users</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Actions
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Actions"
          value={retentionActions.length.toString()}
          subtitle="Pending retention actions"
          icon={<Zap className="w-5 h-5" />}
        />
        <StatCard
          title="High Priority"
          value={stats.highPriority.toString()}
          subtitle="Immediate attention needed"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <StatCard
          title="Email Campaigns"
          value={stats.emailActions.toString()}
          subtitle="Re-engagement emails"
          icon={<Mail className="w-5 h-5" />}
        />
        <StatCard
          title="Discount Offers"
          value={stats.discountActions.toString()}
          subtitle="Premium upgrade offers"
          icon={<Gift className="w-5 h-5" />}
        />
      </div>

      {/* Strategy Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Most Effective Strategies
          </CardTitle>
          <CardDescription>Recommended focus areas based on churn drivers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-card text-center">
              <Mail className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">Re-engagement Emails</p>
              <p className="text-2xl font-bold text-primary mt-1">35%</p>
              <p className="text-xs text-muted-foreground">of all actions</p>
            </div>
            <div className="p-4 rounded-lg border bg-card text-center">
              <Music className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">Personalized Playlists</p>
              <p className="text-2xl font-bold text-primary mt-1">25%</p>
              <p className="text-xs text-muted-foreground">of all actions</p>
            </div>
            <div className="p-4 rounded-lg border bg-card text-center">
              <Gift className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">Discount Offers</p>
              <p className="text-2xl font-bold text-primary mt-1">20%</p>
              <p className="text-xs text-muted-foreground">of all actions</p>
            </div>
            <div className="p-4 rounded-lg border bg-card text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">Push Notifications</p>
              <p className="text-2xl font-bold text-primary mt-1">20%</p>
              <p className="text-xs text-muted-foreground">of all actions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Retention Action Queue</CardTitle>
              <CardDescription>Prioritized list of retention actions by user</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Churn Driver</TableHead>
                  <TableHead>Recommended Action</TableHead>
                  <TableHead>Action Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActions.slice(0, 20).map((action) => (
                  <TableRow key={action.userId}>
                    <TableCell className="font-mono">{action.userId}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={action.riskLevel === 'High' ? 'destructive' : 'secondary'}
                        className={action.riskLevel === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                      >
                        {action.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>{action.churnDriver}</TableCell>
                    <TableCell className="max-w-xs truncate">{action.recommendedAction}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {actionTypeIcon(action.actionType)}
                        <span className="capitalize">{action.actionType}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredActions.length > 20 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Showing 20 of {filteredActions.length} actions
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Productivity;
