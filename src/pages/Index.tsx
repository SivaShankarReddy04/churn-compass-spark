import { useMemo } from 'react';
import { Users, AlertTriangle, TrendingDown, UserCheck, Loader2, BarChart3, Target, Percent } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
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
import { useSpotifyData } from '@/hooks/useSpotifyData';
import {
  getSubscriptionChurnData,
  getAgeGroupChurnData,
  getRiskDistribution,
} from '@/data/spotifyChurnData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    
    // Calculate average churn probability (using risk distribution as proxy)
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
          <h2 className="text-2xl font-bold mb-2">Churn Prediction & Retention Analytics</h2>
          <p className="text-muted-foreground">
            XGBoost model predictions • {users.length.toLocaleString()} sampled users from 434K+ dataset
          </p>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-secondary/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="segmentation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Segmentation
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Insights
            </TabsTrigger>
            <TabsTrigger value="simulator" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              What-If
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

              {/* Churn Trend Chart */}
              <div className="lg:col-span-2">
                <ChurnTrendChart users={users} />
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SubscriptionDonutChart users={users} />
              <RiskDistributionChart data={riskDistribution} />
              <EngagementChurnChart users={users} />
            </div>
          </TabsContent>

          {/* Segmentation Tab */}
          <TabsContent value="segmentation" className="space-y-6">
            {/* Segment Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                User Churn Analysis
              </h3>
              <SpotifyUserTable users={users} />
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feature Importance */}
              <FeatureImportanceChart />
              
              {/* AI Insights */}
              <ChurnInsights users={users} />
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChurnTrendChart users={users} />
              <RiskDistributionChart data={riskDistribution} />
            </div>
          </TabsContent>

          {/* What-If Simulator Tab */}
          <TabsContent value="simulator" className="space-y-6">
            <WhatIfSimulator users={users} />
            
            {/* Supporting Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FeatureImportanceChart />
              <EngagementChurnChart users={users} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-border/50 mt-8">
          <p className="text-sm text-muted-foreground">
            Spotify Churn Analytics Dashboard • XGBoost Model Predictions • Built for Data-Driven Retention Decisions
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
