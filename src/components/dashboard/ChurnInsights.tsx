import { useMemo } from 'react';
import { SpotifyUserData } from '@/data/spotifyChurnData';
import { Lightbulb, AlertTriangle, TrendingUp, Users } from 'lucide-react';

interface ChurnInsightsProps {
  users: SpotifyUserData[];
}

interface Insight {
  type: 'warning' | 'success' | 'info';
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ChurnInsights = ({ users }: ChurnInsightsProps) => {
  const insights = useMemo((): Insight[] => {
    const totalUsers = users.length;
    const churnedUsers = users.filter(u => u.churn === 1);
    const nonChurnedUsers = users.filter(u => u.churn === 0);
    const highRiskUsers = users.filter(u => u.riskCategory === 'High');
    const freeUsers = users.filter(u => u.subscription_type === 'Free');
    const premiumUsers = users.filter(u => u.subscription_type === 'Premium');
    
    const churnRate = (churnedUsers.length / totalUsers) * 100;
    const freeChurnRate = freeUsers.length > 0 
      ? (freeUsers.filter(u => u.churn === 1).length / freeUsers.length) * 100 
      : 0;
    const premiumChurnRate = premiumUsers.length > 0 
      ? (premiumUsers.filter(u => u.churn === 1).length / premiumUsers.length) * 100 
      : 0;

    // Calculate average metrics for churned vs non-churned
    const avgListeningChurned = churnedUsers.reduce((sum, u) => sum + u.avg_listening_hours_per_week, 0) / (churnedUsers.length || 1);
    const avgListeningRetained = nonChurnedUsers.reduce((sum, u) => sum + u.avg_listening_hours_per_week, 0) / (nonChurnedUsers.length || 1);
    
    const avgSkipsChurned = churnedUsers.reduce((sum, u) => sum + u.songs_skipped_per_week, 0) / (churnedUsers.length || 1);
    const avgSkipsRetained = nonChurnedUsers.reduce((sum, u) => sum + u.songs_skipped_per_week, 0) / (nonChurnedUsers.length || 1);
    
    const avgInactivityChurned = churnedUsers.reduce((sum, u) => sum + u.days_since_last_login, 0) / (churnedUsers.length || 1);
    const avgInactivityRetained = nonChurnedUsers.reduce((sum, u) => sum + u.days_since_last_login, 0) / (nonChurnedUsers.length || 1);

    const generatedInsights: Insight[] = [];

    // High-risk user warning
    const highRiskPercentage = (highRiskUsers.length / totalUsers) * 100;
    if (highRiskPercentage > 30) {
      generatedInsights.push({
        type: 'warning',
        icon: <AlertTriangle className="w-5 h-5" />,
        title: `${highRiskPercentage.toFixed(1)}% of users are high-risk`,
        description: `${highRiskUsers.length.toLocaleString()} users require immediate retention intervention. Consider personalized outreach campaigns.`,
      });
    }

    // Free vs Premium insight
    if (freeChurnRate > premiumChurnRate * 1.5) {
      generatedInsights.push({
        type: 'info',
        icon: <Users className="w-5 h-5" />,
        title: 'Free tier shows higher churn',
        description: `Free users churn at ${freeChurnRate.toFixed(1)}% vs ${premiumChurnRate.toFixed(1)}% for Premium. Premium conversion could reduce overall churn by ~${((freeChurnRate - premiumChurnRate) * freeUsers.length / totalUsers).toFixed(1)}%.`,
      });
    }

    // Listening hours insight
    const listeningDiff = avgListeningRetained - avgListeningChurned;
    if (listeningDiff > 5) {
      generatedInsights.push({
        type: 'success',
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Engagement strongly predicts retention',
        description: `Retained users stream ${avgListeningRetained.toFixed(1)} hrs/week vs ${avgListeningChurned.toFixed(1)} hrs for churned. Focus on increasing early engagement.`,
      });
    }

    // Skip rate insight
    const skipDiff = avgSkipsChurned - avgSkipsRetained;
    if (skipDiff > 10) {
      generatedInsights.push({
        type: 'warning',
        icon: <Lightbulb className="w-5 h-5" />,
        title: 'High skip rate correlates with churn',
        description: `Churned users skip ${avgSkipsChurned.toFixed(0)} songs/week vs ${avgSkipsRetained.toFixed(0)} for retained. Improve recommendation algorithms to reduce skips.`,
      });
    }

    // Inactivity insight
    if (avgInactivityChurned > avgInactivityRetained * 2) {
      generatedInsights.push({
        type: 'warning',
        icon: <AlertTriangle className="w-5 h-5" />,
        title: 'Inactivity is a strong churn predictor',
        description: `Churned users were inactive for ${avgInactivityChurned.toFixed(0)} days on avg vs ${avgInactivityRetained.toFixed(0)} for retained. Re-engagement emails after 14 days of inactivity recommended.`,
      });
    }

    // Overall churn rate context
    generatedInsights.push({
      type: churnRate > 30 ? 'warning' : 'info',
      icon: <Lightbulb className="w-5 h-5" />,
      title: `Overall churn rate: ${churnRate.toFixed(1)}%`,
      description: churnRate > 30 
        ? 'This is above industry average (25-30%). Prioritize retention initiatives.'
        : 'This is within acceptable range. Focus on maintaining engagement.',
    });

    return generatedInsights;
  }, [users]);

  const getInsightStyles = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return 'border-risk-high/30 bg-risk-high/5';
      case 'success':
        return 'border-risk-low/30 bg-risk-low/5';
      default:
        return 'border-chart-2/30 bg-chart-2/5';
    }
  };

  const getIconStyles = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return 'text-risk-high bg-risk-high/10';
      case 'success':
        return 'text-risk-low bg-risk-low/10';
      default:
        return 'text-chart-2 bg-chart-2/10';
    }
  };

  return (
    <div className="chart-container">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-chart-3/10">
          <Lightbulb className="w-5 h-5 text-chart-3" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">AI-Generated Insights</h3>
          <p className="text-sm text-muted-foreground">
            Key findings from churn analysis
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getInsightStyles(insight.type)} transition-all hover:scale-[1.01]`}
          >
            <div className="flex gap-4">
              <div className={`p-2 rounded-lg h-fit ${getIconStyles(insight.type)}`}>
                {insight.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChurnInsights;
