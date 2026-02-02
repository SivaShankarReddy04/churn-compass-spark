import { useMemo } from 'react';
import { Users, AlertTriangle, TrendingDown, Target, Percent, Loader2 } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import ChurnGauge from '@/components/dashboard/ChurnGauge';
import RiskDistributionChart from '@/components/dashboard/RiskDistributionChart';
import ChurnTrendChart from '@/components/dashboard/ChurnTrendChart';
import SubscriptionDonutChart from '@/components/dashboard/SubscriptionDonutChart';
import EngagementChurnChart from '@/components/dashboard/EngagementChurnChart';
import { useSpotifyData } from '@/hooks/useSpotifyData';
import { getRiskDistribution } from '@/data/spotifyChurnData';

const Overview = () => {
  const { users, loading, error } = useSpotifyData(10000);

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

  const riskDistribution = useMemo(() => getRiskDistribution(users), [users]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
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
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Real-time churn analytics • {users.length.toLocaleString()} users from 434K+ dataset
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          subtitle="Sampled from 434K+"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Overall Churn Rate"
          value={`${stats.churnRate.toFixed(1)}%`}
          subtitle={`${stats.churnedUsers.toLocaleString()} users churned`}
          icon={<Percent className="w-5 h-5" />}
          trend={{ value: stats.churnRate, isPositive: false }}
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
          subtitle="Weighted by risk segments"
          icon={<Target className="w-5 h-5" />}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Churn Gauge */}
        <div className="chart-container flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold mb-6 self-start">Actual Churn Rate</h3>
          <ChurnGauge probability={stats.churnRate} size="lg" />
          <div className="mt-6 grid grid-cols-3 gap-4 w-full">
            <div className="text-center">
              <p className="text-xl lg:text-2xl font-bold text-primary">{stats.lowRiskUsers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Low Risk</p>
            </div>
            <div className="text-center">
              <p className="text-xl lg:text-2xl font-bold text-yellow-500">{stats.mediumRiskUsers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Medium Risk</p>
            </div>
            <div className="text-center">
              <p className="text-xl lg:text-2xl font-bold text-destructive">{stats.highRiskUsers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">High Risk</p>
            </div>
          </div>
        </div>

        {/* Churn Trend Chart */}
        <div className="lg:col-span-2">
          <ChurnTrendChart users={users} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SubscriptionDonutChart users={users} />
        <RiskDistributionChart data={riskDistribution} />
        <EngagementChurnChart users={users} />
      </div>
    </div>
  );
};

export default Overview;
