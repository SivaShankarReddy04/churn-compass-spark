import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  risk: 'Low' | 'Medium' | 'High';
  size?: 'sm' | 'md' | 'lg';
}

const RiskBadge = ({ risk, size = 'md' }: RiskBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const riskClasses = {
    Low: 'risk-badge-low',
    Medium: 'risk-badge-medium',
    High: 'risk-badge-high',
  };

  return (
    <span className={cn('risk-badge', sizeClasses[size], riskClasses[risk])}>
      {risk} Risk
    </span>
  );
};

export default RiskBadge;
