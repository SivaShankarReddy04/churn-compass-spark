import { useMemo, useState } from 'react';
import { Users, AlertTriangle, TrendingDown, UserCheck, Loader2, Target, Percent } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import ChurnGauge from '@/components/dashboard/ChurnGauge';
import FeatureImportanceChart from '@/components/dashboard/FeatureImportanceChart';
import SegmentChurnChart from '@/components/dashboard/SegmentChurnChart';
import RiskDistributionChart from '@/components/dashboard/RiskDistributionChart';
import SpotifyUserTable from '@/components/dashboard/SpotifyUserTable';
import WhatIfSimulator from '@/components/dashboard/WhatIfSimulator';
import ChurnInsights from '@/components/dashboard/ChurnInsights';
import EngagementChurnChart from '@/components/dashboard/EngagementChurnChart';
import ChurnTrendChart from '@/components/dashboard/ChurnTrendChart';
import SubscriptionDonutChart from '@/components/dashboard/SubscriptionDonutChart';
import UserPrediction from '@/components/dashboard/UserPrediction';
import { useSpotifyData } from '@/hooks/useSpotifyData';
import {
  getSubscriptionChurnData,
  getAgeGroupChurnData,
  getRiskDistribution,
} from '@/data/spotifyChurnData';

const Index = () => {
  const { users, loading, error } = useSpotifyData(10000);
  const [activeTab, setActiveTab] = useState('overview');

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

  const subscriptionChurnData = useMemo(() => getSubscriptionChurnData(users), [users]);
  const ageGroupChurnData = useMemo(() => getAgeGroupChurnData(users), [users]);
  const riskDistribution = useMemo(() => getRiskDistribution(users), [users]);

  if (loading) {
    return (
      <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading Spotify user data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-destructive" />
            <p className="text-destructive">Failed to load data: {error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
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
                    <p className="text-xl lg:text-2xl font-bold text-risk-low">{stats.lowRiskUsers.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Low Risk</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl lg:text-2xl font-bold text-risk-medium">{stats.mediumRiskUsers.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Medium Risk</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl lg:text-2xl font-bold text-risk-high">{stats.highRiskUsers.toLocaleString()}</p>
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

      case 'segmentation':
        return (
          <div className="space-y-6">
            {/* Segment Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Free Tier Users"
                value={users.filter(u => u.subscription_type === 'Free').length.toLocaleString()}
                subtitle={`${((users.filter(u => u.subscription_type === 'Free').length / users.length) * 100).toFixed(1)}% of users`}
                icon={<Users className="w-5 h-5" />}
              />
              <StatCard
                title="Premium Users"
                value={users.filter(u => u.subscription_type === 'Premium').length.toLocaleString()}
                subtitle={`${((users.filter(u => u.subscription_type === 'Premium').length / users.length) * 100).toFixed(1)}% of users`}
                icon={<UserCheck className="w-5 h-5" />}
              />
              <StatCard
                title="Churned Users"
                value={stats.churnedUsers.toLocaleString()}
                subtitle={`${stats.churnRate.toFixed(1)}% churn rate`}
                icon={<TrendingDown className="w-5 h-5" />}
                trend={{ value: stats.churnRate, isPositive: false }}
              />
              <StatCard
                title="Retained Users"
                value={(stats.totalUsers - stats.churnedUsers).toLocaleString()}
                subtitle={`${(100 - stats.churnRate).toFixed(1)}% retention`}
                icon={<UserCheck className="w-5 h-5" />}
              />
            </div>

            {/* Segment Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <EngagementChurnChart users={users} />
            </div>

            {/* User Table */}
            <div>
              <h3 className="text-xl font-semibold mb-4">User Churn Analysis</h3>
              <SpotifyUserTable users={users} />
            </div>
          </div>
        );

      case 'insights':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FeatureImportanceChart />
              <ChurnInsights users={users} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChurnTrendChart users={users} />
              <RiskDistributionChart data={riskDistribution} />
            </div>
          </div>
        );

      case 'simulator':
        return (
          <div className="space-y-6">
            <WhatIfSimulator users={users} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FeatureImportanceChart />
              <EngagementChurnChart users={users} />
            </div>
          </div>
        );

      case 'predict':
        return <UserPrediction />;

      default:
        return null;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="p-4 lg:p-6 xl:p-8">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-bold mb-1">
            {activeTab === 'overview' && 'Churn Prediction & Retention Analytics'}
            {activeTab === 'segmentation' && 'User Segmentation Analysis'}
            {activeTab === 'insights' && 'AI-Powered Churn Insights'}
            {activeTab === 'simulator' && 'What-If Retention Simulator'}
            {activeTab === 'predict' && 'Instant Churn Prediction'}
          </h2>
          <p className="text-sm text-muted-foreground">
            XGBoost model predictions • {users.length.toLocaleString()} sampled users from 434K+ dataset
          </p>
        </div>

        {renderContent()}

        {/* Footer */}
        <footer className="text-center py-6 border-t border-border/50 mt-8">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Spotify Churn Analytics Dashboard • XGBoost Model Predictions • Built for Data-Driven Retention Decisions
          </p>
        </footer>
      </div>
    </DashboardLayout>
  );
};

export default Index;
