import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SpotifyUserData } from '@/data/spotifyChurnData';

interface SubscriptionDonutChartProps {
  users: SpotifyUserData[];
}

const SubscriptionDonutChart = ({ users }: SubscriptionDonutChartProps) => {
  const data = useMemo(() => {
    const freeUsers = users.filter(u => u.subscription_type === 'Free');
    const premiumUsers = users.filter(u => u.subscription_type === 'Premium');
    
    const freeChurned = freeUsers.filter(u => u.churn === 1).length;
    const premiumChurned = premiumUsers.filter(u => u.churn === 1).length;
    
    return [
      {
        name: 'Free - Churned',
        value: freeChurned,
        fill: 'hsl(var(--risk-high))',
      },
      {
        name: 'Free - Retained',
        value: freeUsers.length - freeChurned,
        fill: 'hsl(var(--chart-3))',
      },
      {
        name: 'Premium - Churned',
        value: premiumChurned,
        fill: 'hsl(var(--chart-5))',
      },
      {
        name: 'Premium - Retained',
        value: premiumUsers.length - premiumChurned,
        fill: 'hsl(var(--chart-1))',
      },
    ];
  }, [users]);

  const stats = useMemo(() => {
    const freeUsers = users.filter(u => u.subscription_type === 'Free');
    const premiumUsers = users.filter(u => u.subscription_type === 'Premium');
    
    return {
      freeChurnRate: freeUsers.length > 0 
        ? (freeUsers.filter(u => u.churn === 1).length / freeUsers.length) * 100 
        : 0,
      premiumChurnRate: premiumUsers.length > 0 
        ? (premiumUsers.filter(u => u.churn === 1).length / premiumUsers.length) * 100 
        : 0,
      freeCount: freeUsers.length,
      premiumCount: premiumUsers.length,
    };
  }, [users]);

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-2">Churn by Subscription</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Distribution across plan types
      </p>
      
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="hsl(var(--background))"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                      <p className="font-semibold text-foreground">{d.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {d.value.toLocaleString()} users
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Stats below chart */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-2xl font-bold text-chart-3">{stats.freeChurnRate.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Free Churn Rate</p>
          <p className="text-xs text-muted-foreground">{stats.freeCount.toLocaleString()} users</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-chart-1">{stats.premiumChurnRate.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Premium Churn Rate</p>
          <p className="text-xs text-muted-foreground">{stats.premiumCount.toLocaleString()} users</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDonutChart;
