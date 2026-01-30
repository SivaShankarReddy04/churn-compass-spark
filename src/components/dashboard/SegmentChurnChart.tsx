import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SegmentChurn } from '@/data/mockChurnData';

interface SegmentChurnChartProps {
  data: SegmentChurn[];
  title: string;
  subtitle?: string;
}

const SegmentChurnChart = ({ data, title, subtitle }: SegmentChurnChartProps) => {
  const getBarColor = (churnRate: number) => {
    if (churnRate < 15) return 'hsl(var(--risk-low))';
    if (churnRate < 30) return 'hsl(var(--risk-medium))';
    return 'hsl(var(--risk-high))';
  };

  return (
    <div className="chart-container h-full">
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {subtitle && (
        <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
      )}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 20, left: 0 }}
          >
            <XAxis
              dataKey="segment"
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
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as SegmentChurn;
                  return (
                    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                      <p className="font-semibold text-foreground">{data.segment}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Total Users: <span className="text-foreground font-medium">{data.totalUsers.toLocaleString()}</span>
                        </p>
                        <p className="text-muted-foreground">
                          High Risk: <span className="text-risk-high font-medium">{data.churnedUsers.toLocaleString()}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Churn Rate: <span className="font-medium" style={{ color: getBarColor(data.churnRate) }}>{data.churnRate}%</span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="churnRate" radius={[4, 4, 0, 0]}>
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

export default SegmentChurnChart;
