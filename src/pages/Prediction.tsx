import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, AlertTriangle, Target, TrendingDown, Search, Filter, Loader2 } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import SpotifyUserTable from '@/components/dashboard/SpotifyUserTable';
import RiskDistributionChart from '@/components/dashboard/RiskDistributionChart';
import ChurnGauge from '@/components/dashboard/ChurnGauge';
import { useSpotifyData } from '@/hooks/useSpotifyData';
import { getRiskDistribution } from '@/data/spotifyChurnData';

const Prediction = () => {
  const { users, loading, error } = useSpotifyData(10000);
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesRisk = riskFilter === 'all' || user.riskCategory === riskFilter;
      const matchesSub = subscriptionFilter === 'all' || user.subscription_type === subscriptionFilter;
      const matchesSearch = searchQuery === '' || 
        user.user_id.toString().includes(searchQuery) ||
        user.country.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRisk && matchesSub && matchesSearch;
    });
  }, [users, riskFilter, subscriptionFilter, searchQuery]);

  const stats = useMemo(() => {
    if (!users.length) return null;
    
    const totalUsers = users.length;
    const highRiskUsers = users.filter(u => u.riskCategory === 'High').length;
    const mediumRiskUsers = users.filter(u => u.riskCategory === 'Medium').length;
    const lowRiskUsers = users.filter(u => u.riskCategory === 'Low').length;
    const churnedUsers = users.filter(u => u.churn === 1).length;
    const churnRate = (churnedUsers / totalUsers) * 100;
    
    const avgChurnProbability = (
      (highRiskUsers * 0.75 + mediumRiskUsers * 0.45 + lowRiskUsers * 0.15) / totalUsers
    ) * 100;

    return {
      totalUsers,
      highRiskUsers,
      mediumRiskUsers,
      lowRiskUsers,
      churnedUsers,
      churnRate,
      avgChurnProbability,
    };
  }, [users]);

  const riskDistribution = useMemo(() => getRiskDistribution(filteredUsers), [filteredUsers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading prediction data...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
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
      <div>
        <h1 className="text-2xl font-bold">Churn Prediction</h1>
        <p className="text-muted-foreground">User-level churn probability and risk segmentation</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          subtitle="In prediction dataset"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="High Risk Users"
          value={stats.highRiskUsers.toLocaleString()}
          subtitle={`${((stats.highRiskUsers / stats.totalUsers) * 100).toFixed(1)}% of total`}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <StatCard
          title="Avg Churn Probability"
          value={`${stats.avgChurnProbability.toFixed(1)}%`}
          subtitle="Weighted average"
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          title="Actual Churn Rate"
          value={`${stats.churnRate.toFixed(1)}%`}
          subtitle={`${stats.churnedUsers.toLocaleString()} churned`}
          icon={<TrendingDown className="w-5 h-5" />}
          trend={{ value: stats.churnRate, isPositive: false }}
        />
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Overall Churn Rate</CardTitle>
            <CardDescription>Based on XGBoost predictions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChurnGauge probability={stats.churnRate} size="lg" />
            <div className="mt-6 grid grid-cols-3 gap-4 w-full">
              <div className="text-center">
                <p className="text-xl font-bold text-primary">{stats.lowRiskUsers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Low Risk</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-yellow-500">{stats.mediumRiskUsers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Medium Risk</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-destructive">{stats.highRiskUsers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Users segmented by predicted churn risk</CardDescription>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart data={riskDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="User ID or Country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Risk Level</label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Risks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  <SelectItem value="High">High Risk</SelectItem>
                  <SelectItem value="Medium">Medium Risk</SelectItem>
                  <SelectItem value="Low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription</label>
              <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subscriptions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscriptions</SelectItem>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="flex items-center h-10 px-3 bg-muted rounded-md">
                <span className="text-sm">
                  <span className="font-semibold">{filteredUsers.length.toLocaleString()}</span> users
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Predictions</CardTitle>
          <CardDescription>Detailed user-level churn predictions with risk categories</CardDescription>
        </CardHeader>
        <CardContent>
          <SpotifyUserTable users={filteredUsers} />
        </CardContent>
      </Card>

      {/* Risk Category Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Category Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary">Low Risk</Badge>
                <span className="text-sm text-muted-foreground">Probability &lt; 30%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Engaged users with healthy activity patterns. Standard monitoring recommended.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-yellow-500">Medium Risk</Badge>
                <span className="text-sm text-muted-foreground">Probability 30-60%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Users showing early warning signs. Proactive engagement recommended.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive">High Risk</Badge>
                <span className="text-sm text-muted-foreground">Probability &gt; 60%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Users likely to churn. Immediate retention intervention required.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Prediction;
