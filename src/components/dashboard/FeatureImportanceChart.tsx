import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { featureImportanceData } from '@/data/mockChurnData';

const FeatureImportanceChart = () => {
  const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  return (
    <div className="chart-container h-full">
      <h3 className="text-lg font-semibold mb-4">Feature Importance</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Key factors influencing churn prediction
      </p>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={featureImportanceData}
            layout="vertical"
            margin={{ top: 0, right: 20, bottom: 0, left: 100 }}
          >
            <XAxis
              type="number"
              domain={[0, 0.3]}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="feature"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              width={95}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                      <p className="font-semibold text-foreground">{data.feature}</p>
                      <p className="text-sm text-primary font-medium">
                        Importance: {(data.importance * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {data.description}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
              {featureImportanceData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={chartColors[index % chartColors.length]}
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

export default FeatureImportanceChart;
