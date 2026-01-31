import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { SpotifyUserData } from '@/data/spotifyChurnData';

interface ChurnTrendChartProps {
  users: SpotifyUserData[];
}

const ChurnTrendChart = ({ users }: ChurnTrendChartProps) => {
  // Simulate monthly trend based on days_since_last_login distribution
  const data = useMemo(() => {
    // Group users by when they likely churned based on days_since_last_login
    // This creates a simulated time series for demonstration
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Distribute churned users across months based on inactivity patterns
    const churnedUsers = users.filter(u => u.churn === 1);
    const totalUsers = users.length;
    
    // Simulate gradual churn accumulation
    let cumulativeChurn = 0;
    const baseChurnRate = (churnedUsers.length / totalUsers) * 100;
    
    return months.map((month, index) => {
      // Simulate seasonal variation (higher churn in early months, stabilizing later)
      const seasonalFactor = 1 + Math.sin((index - 3) * Math.PI / 6) * 0.2;
      const monthlyAddition = (baseChurnRate / 12) * seasonalFactor;
      cumulativeChurn = Math.min(baseChurnRate, cumulativeChurn + monthlyAddition);
      
      // Add some variance
      const variance = (Math.random() - 0.5) * 2;
      
      return {
        month,
        churnRate: Math.max(0, Math.min(100, cumulativeChurn + variance)),
        newChurns: Math.round((monthlyAddition / 100) * totalUsers),
        retained: totalUsers - Math.round((cumulativeChurn / 100) * totalUsers),
      };
    });
  }, [users]);

  return (
    <div className="chart-container h-full">
      <h3 className="text-lg font-semibold mb-2">Churn Trend Over Time</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Cumulative churn rate progression (simulated)
      </p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="churnGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--risk-high))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--risk-high))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.3}
            />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                      <p className="font-semibold text-foreground">{label}</p>
                      <p className="text-sm text-risk-high font-medium">
                        Cumulative Churn: {d.churnRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ~{d.newChurns.toLocaleString()} new churns
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {d.retained.toLocaleString()} users retained
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="churnRate"
              stroke="hsl(var(--risk-high))"
              strokeWidth={2}
              fill="url(#churnGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChurnTrendChart;
