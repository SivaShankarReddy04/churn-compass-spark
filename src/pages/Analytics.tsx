import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, BarChart3, TrendingDown, Users, Activity } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import ChurnInsights from '@/components/dashboard/ChurnInsights';
import SegmentChurnChart from '@/components/dashboard/SegmentChurnChart';
import EngagementChurnChart from '@/components/dashboard/EngagementChurnChart';
import ChurnTrendChart from '@/components/dashboard/ChurnTrendChart';
import RiskDistributionChart from '@/components/dashboard/RiskDistributionChart';
import FeatureImportanceChart from '@/components/dashboard/FeatureImportanceChart';
import { useSpotifyData } from '@/hooks/useSpotifyData';
import { 
  getSubscriptionChurnData, 
  getAgeGroupChurnData, 
  getCountryChurnData,
  getRiskDistribution 
} from '@/data/spotifyChurnData';

const Analytics = () => {
  const { users, loading, error } = useSpotifyData(10000);

  const stats = useMemo(() => {
    if (!users.length) return null;
    
    const totalUsers = users.length;
    const highRiskUsers = users.filter(u => u.riskCategory === 'High').length;
    const churnedUsers = users.filter(u => u.churn === 1).length;
    const churnRate = (churnedUsers / totalUsers) * 100;
    const avgListening = users.reduce((sum, u) => sum + u.avg_listening_hours_per_week, 0) / totalUsers;

    return {
      totalUsers,
      highRiskUsers,
      churnedUsers,
      churnRate,
      avgListening,
    };
  }, [users]);

  const subscriptionChurnData = useMemo(() => getSubscriptionChurnData(users), [users]);
  const ageGroupChurnData = useMemo(() => getAgeGroupChurnData(users), [users]);
  const countryChurnData = useMemo(() => getCountryChurnData(users), [users]);
  const riskDistribution = useMemo(() => getRiskDistribution(users), [users]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics data...</p>
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
        <h1 className="text-2xl font-bold">Analytics & Insights</h1>
        <p className="text-muted-foreground">Deep dive into churn patterns and user behavior</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Overall Churn Rate"
          value={`${stats.churnRate.toFixed(1)}%`}
          subtitle={`${stats.churnedUsers.toLocaleString()} users churned`}
          icon={<TrendingDown className="w-5 h-5" />}
          trend={{ value: stats.churnRate, isPositive: false }}
        />
        <StatCard
          title="At-Risk Users"
          value={stats.highRiskUsers.toLocaleString()}
          subtitle={`${((stats.highRiskUsers / stats.totalUsers) * 100).toFixed(1)}% of total`}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <StatCard
          title="Avg Listening Hours"
          value={`${stats.avgListening.toFixed(1)}h`}
          subtitle="Per week per user"
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          title="Total Users Analyzed"
          value={stats.totalUsers.toLocaleString()}
          subtitle="From 434K+ dataset"
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChurnInsights users={users} />
        <FeatureImportanceChart />
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Churn Trend Analysis
          </CardTitle>
          <CardDescription>Historical churn patterns and projections</CardDescription>
        </CardHeader>
        <CardContent>
          <ChurnTrendChart users={users} />
        </CardContent>
      </Card>

      {/* Segment Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SegmentChurnChart
          data={subscriptionChurnData}
          title="Churn by Subscription"
          subtitle="Free vs Premium retention"
        />
        <SegmentChurnChart
          data={ageGroupChurnData}
          title="Churn by Age Group"
          subtitle="Demographic analysis"
        />
        <EngagementChurnChart users={users} />
      </div>

      {/* Geographic Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Churn Analysis</CardTitle>
          <CardDescription>Churn rates by country</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {countryChurnData.slice(0, 10).map((country) => (
              <div key={country.segment} className="p-4 rounded-lg border bg-card text-center">
                <p className="font-semibold text-lg">{country.segment}</p>
                <p className="text-2xl font-bold text-primary mt-1">{country.churnRate}%</p>
                <p className="text-xs text-muted-foreground">{country.totalUsers.toLocaleString()} users</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistributionChart data={riskDistribution} />
        
        <Card>
          <CardHeader>
            <CardTitle>Key Findings</CardTitle>
            <CardDescription>Summary of analytics insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant="destructive" className="mt-0.5">Critical</Badge>
              <div>
                <p className="font-medium">Inactivity is the #1 churn driver</p>
                <p className="text-sm text-muted-foreground">Users inactive for 30+ days have 3x higher churn probability</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant="secondary" className="mt-0.5">Insight</Badge>
              <div>
                <p className="font-medium">Free tier users churn at higher rates</p>
                <p className="text-sm text-muted-foreground">Premium conversion could reduce overall churn by 15%</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant="secondary" className="mt-0.5">Insight</Badge>
              <div>
                <p className="font-medium">High skip rates correlate with churn</p>
                <p className="text-sm text-muted-foreground">Users skipping 50+ songs/week are 2.5x more likely to churn</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge className="mt-0.5 bg-primary">Opportunity</Badge>
              <div>
                <p className="font-medium">Young users (18-24) most engaged</p>
                <p className="text-sm text-muted-foreground">Highest listening hours but also highest skip rates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
