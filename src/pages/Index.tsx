import { useMemo } from 'react';
import { Users, AlertTriangle, TrendingDown, UserCheck, Loader2 } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCard from '@/components/dashboard/StatCard';
import ChurnGauge from '@/components/dashboard/ChurnGauge';
import FeatureImportanceChart from '@/components/dashboard/FeatureImportanceChart';
import SegmentChurnChart from '@/components/dashboard/SegmentChurnChart';
import RiskDistributionChart from '@/components/dashboard/RiskDistributionChart';
import SpotifyUserTable from '@/components/dashboard/SpotifyUserTable';
import { useSpotifyData } from '@/hooks/useSpotifyData';
import {
  getSubscriptionChurnData,
  getAgeGroupChurnData,
  getRiskDistribution,
} from '@/data/spotifyChurnData';

const Index = () => {
  const { users, loading, error } = useSpotifyData(10000);

  const stats = useMemo(() => {
    if (!users.length) return null;
    
    const totalUsers = users.length;
    const highRiskUsers = users.filter(u => u.riskCategory === 'High').length;
    const mediumRiskUsers = users.filter(u => u.riskCategory === 'Medium').length;
    const lowRiskUsers = users.filter(u => u.riskCategory === 'Low').length;
    const churnedUsers = users.filter(u => u.churn === 1).length;
    const churnRate = (churnedUsers / totalUsers) * 100;

    return {
      totalUsers,
      highRiskUsers,
      mediumRiskUsers,
      lowRiskUsers,
      churnedUsers,
      churnRate,
    };
  }, [users]);

  const subscriptionChurnData = useMemo(() => getSubscriptionChurnData(users), [users]);
  const ageGroupChurnData = useMemo(() => getAgeGroupChurnData(users), [users]);
  const riskDistribution = useMemo(() => getRiskDistribution(users), [users]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading Spotify user data...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive">Failed to load data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Spotify User Churn Prediction</h2>
          <p className="text-muted-foreground">
            XGBoost model predictions on {users.length.toLocaleString()} sampled users
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            subtitle="Sampled from 434K+"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Churned Users"
            value={stats.churnedUsers.toLocaleString()}
            subtitle={`${stats.churnRate.toFixed(1)}% churn rate`}
            icon={<AlertTriangle className="w-5 h-5" />}
            trend={{ value: stats.churnRate, isPositive: false }}
          />
          <StatCard
            title="High Risk Users"
            value={stats.highRiskUsers.toLocaleString()}
            subtitle={`${((stats.highRiskUsers / stats.totalUsers) * 100).toFixed(1)}% of total`}
            icon={<TrendingDown className="w-5 h-5" />}
          />
          <StatCard
            title="Low Risk Users"
            value={stats.lowRiskUsers.toLocaleString()}
            subtitle="Healthy retention"
            icon={<UserCheck className="w-5 h-5" />}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall Churn Gauge */}
          <div className="chart-container flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-6 self-start">Actual Churn Rate</h3>
            <ChurnGauge probability={stats.churnRate} size="lg" />
            <div className="mt-6 grid grid-cols-3 gap-4 w-full">
              <div className="text-center">
                <p className="text-2xl font-bold text-risk-low">{stats.lowRiskUsers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Low Risk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-risk-medium">{stats.mediumRiskUsers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Medium Risk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-risk-high">{stats.highRiskUsers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">High Risk</p>
              </div>
            </div>
          </div>

          {/* Feature Importance */}
          <div className="lg:col-span-2">
            <FeatureImportanceChart />
          </div>
        </div>

        {/* Segment Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <SegmentChurnChart
            data={subscriptionChurnData}
            title="Churn by Subscription"
            subtitle="Churn rate per plan type"
          />
          <SegmentChurnChart
            data={ageGroupChurnData}
            title="Churn by Age Group"
            subtitle="Churn rate per demographic"
          />
          <RiskDistributionChart data={riskDistribution} />
        </div>

        {/* User Table */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">User Churn Analysis</h3>
          <SpotifyUserTable users={users} />
        </div>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Spotify Churn Analytics • XGBoost Model Predictions
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
