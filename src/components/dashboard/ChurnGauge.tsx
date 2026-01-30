import { cn } from '@/lib/utils';

interface ChurnGaugeProps {
  probability: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ChurnGauge = ({ probability, size = 'md', showLabel = true }: ChurnGaugeProps) => {
  const sizeConfig = {
    sm: { width: 80, height: 80, strokeWidth: 8, fontSize: 'text-lg' },
    md: { width: 120, height: 120, strokeWidth: 10, fontSize: 'text-2xl' },
    lg: { width: 160, height: 160, strokeWidth: 12, fontSize: 'text-3xl' },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const progress = (probability / 100) * circumference;

  const getColor = () => {
    if (probability < 30) return 'hsl(var(--risk-low))';
    if (probability < 60) return 'hsl(var(--risk-medium))';
    return 'hsl(var(--risk-high))';
  };

  return (
    <div className="flex flex-col items-center">
      <svg 
        width={config.width} 
        height={config.height / 2 + config.strokeWidth}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${config.strokeWidth / 2} ${config.height / 2} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height / 2}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M ${config.strokeWidth / 2} ${config.height / 2} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height / 2}`}
          fill="none"
          stroke={getColor()}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-1000 ease-out"
        />
        {/* Center text */}
        <text
          x={config.width / 2}
          y={config.height / 2 - 5}
          textAnchor="middle"
          className={cn('font-bold fill-current', config.fontSize)}
        >
          {probability.toFixed(1)}%
        </text>
      </svg>
      {showLabel && (
        <p className="text-sm text-muted-foreground mt-1">Churn Probability</p>
      )}
    </div>
  );
};

export default ChurnGauge;
