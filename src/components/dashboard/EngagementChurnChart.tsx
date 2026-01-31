import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SpotifyUserData } from '@/data/spotifyChurnData';

interface EngagementChurnChartProps {
  users: SpotifyUserData[];
}

const EngagementChurnChart = ({ users }: EngagementChurnChartProps) => {
  const data = useMemo(() => {
    // Segment users by engagement level based on listening hours
    const segments = {
      'Very Low (0-10h)': { total: 0, churned: 0 },
      'Low (10-20h)': { total: 0, churned: 0 },
      'Medium (20-35h)': { total: 0, churned: 0 },
      'High (35-50h)': { total: 0, churned: 0 },
      'Very High (50h+)': { total: 0, churned: 0 },
    };

    users.forEach(user => {
      const hours = user.avg_listening_hours_per_week;
      let segment: keyof typeof segments;

      if (hours < 10) segment = 'Very Low (0-10h)';
      else if (hours < 20) segment = 'Low (10-20h)';
      else if (hours < 35) segment = 'Medium (20-35h)';
      else if (hours < 50) segment = 'High (35-50h)';
      else segment = 'Very High (50h+)';

      segments[segment].total++;
      if (user.churn === 1) segments[segment].churned++;
    });

    return Object.entries(segments).map(([segment, data]) => ({
      segment,
      churnRate: data.total > 0 ? Math.round((data.churned / data.total) * 100 * 10) / 10 : 0,
      totalUsers: data.total,
    }));
  }, [users]);

  const getBarColor = (churnRate: number) => {
    if (churnRate < 20) return 'hsl(var(--risk-low))';
    if (churnRate < 35) return 'hsl(var(--risk-medium))';
    return 'hsl(var(--risk-high))';
  };

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-2">Churn by Engagement Level</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Weekly listening hours vs churn rate
      </p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, bottom: 0, left: 100 }}
          >
            <XAxis
              type="number"
              domain={[0, 'auto']}
              tickFormatter={(value) => `${value}%`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="segment"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              width={95}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                      <p className="font-semibold text-foreground">{d.segment}</p>
                      <p className="text-sm text-primary font-medium">
                        Churn Rate: {d.churnRate}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {d.totalUsers.toLocaleString()} users in segment
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="churnRate" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.churnRate)}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EngagementChurnChart;
