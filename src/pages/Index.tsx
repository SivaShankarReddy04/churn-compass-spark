import { useMemo } from 'react';
import { Users, AlertTriangle, TrendingDown, UserCheck } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCard from '@/components/dashboard/StatCard';
import ChurnGauge from '@/components/dashboard/ChurnGauge';
import FeatureImportanceChart from '@/components/dashboard/FeatureImportanceChart';
import SegmentChurnChart from '@/components/dashboard/SegmentChurnChart';
import RiskDistributionChart from '@/components/dashboard/RiskDistributionChart';
import UserTable from '@/components/dashboard/UserTable';
import {
  mockUsers,
  getSegmentChurnData,
  getAgeGroupChurnData,
  getRiskDistribution,
} from '@/data/mockChurnData';

const Index = () => {
  const stats = useMemo(() => {
    const totalUsers = mockUsers.length;
    const highRiskUsers = mockUsers.filter(u => u.riskCategory === 'High').length;
    const mediumRiskUsers = mockUsers.filter(u => u.riskCategory === 'Medium').length;
    const lowRiskUsers = mockUsers.filter(u => u.riskCategory === 'Low').length;
    const averageChurn = mockUsers.reduce((sum, u) => sum + u.churnProbability, 0) / totalUsers;

    return {
      totalUsers,
      highRiskUsers,
      mediumRiskUsers,
      lowRiskUsers,
      averageChurn,
    };
  }, []);

  const segmentChurnData = useMemo(() => getSegmentChurnData(mockUsers), []);
  const ageGroupChurnData = useMemo(() => getAgeGroupChurnData(mockUsers), []);
  const riskDistribution = useMemo(() => getRiskDistribution(mockUsers), []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">User Churn Prediction</h2>
          <p className="text-muted-foreground">
            Monitor user retention metrics and identify at-risk subscribers
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            subtitle="Active subscribers"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="High Risk Users"
            value={stats.highRiskUsers.toLocaleString()}
            subtitle={`${((stats.highRiskUsers / stats.totalUsers) * 100).toFixed(1)}% of total`}
            icon={<AlertTriangle className="w-5 h-5" />}
            trend={{ value: 2.3, isPositive: true }}
          />
          <StatCard
            title="Average Churn Risk"
            value={`${stats.averageChurn.toFixed(1)}%`}
            subtitle="Across all users"
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
            <h3 className="text-lg font-semibold mb-6 self-start">Overall Churn Probability</h3>
            <ChurnGauge probability={stats.averageChurn} size="lg" />
            <div className="mt-6 grid grid-cols-3 gap-4 w-full">
              <div className="text-center">
                <p className="text-2xl font-bold text-risk-low">{stats.lowRiskUsers}</p>
                <p className="text-xs text-muted-foreground">Low Risk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-risk-medium">{stats.mediumRiskUsers}</p>
                <p className="text-xs text-muted-foreground">Medium Risk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-risk-high">{stats.highRiskUsers}</p>
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
            data={segmentChurnData}
            title="Churn by Subscription"
            subtitle="High-risk rate per plan type"
          />
          <SegmentChurnChart
            data={ageGroupChurnData}
            title="Churn by Age Group"
            subtitle="High-risk rate per demographic"
          />
          <RiskDistributionChart data={riskDistribution} />
        </div>

        {/* User Table */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">User Risk Analysis</h3>
          <UserTable users={mockUsers} />
        </div>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Churn Analytics Dashboard • Data refreshed every 24 hours
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
