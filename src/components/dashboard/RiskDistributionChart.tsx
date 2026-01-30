import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RiskDistributionChartProps {
  data: { name: string; value: number; fill: string }[];
}

const RiskDistributionChart = ({ data }: RiskDistributionChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-container h-full">
      <h3 className="text-lg font-semibold mb-1">Risk Distribution</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Users by risk category
      </p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const percentage = ((data.value / total) * 100).toFixed(1);
                  return (
                    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                      <p className="font-semibold text-foreground">{data.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.value.toLocaleString()} users ({percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RiskDistributionChart;
