import { useState, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TrendingDown, TrendingUp, Zap, Music, SkipForward, Calendar, Crown } from 'lucide-react';
import { SpotifyUserData } from '@/data/spotifyChurnData';

interface WhatIfSimulatorProps {
  users: SpotifyUserData[];
}

const WhatIfSimulator = ({ users }: WhatIfSimulatorProps) => {
  // Scenario adjustments (% change)
  const [streamingChange, setStreamingChange] = useState(0);
  const [skipRateChange, setSkipRateChange] = useState(0);
  const [loginFrequencyChange, setLoginFrequencyChange] = useState(0);
  const [subscriptionUpgrade, setSubscriptionUpgrade] = useState(false);

  // Calculate baseline metrics
  const baselineMetrics = useMemo(() => {
    const totalUsers = users.length;
    const churnedUsers = users.filter(u => u.churn === 1).length;
    const highRiskUsers = users.filter(u => u.riskCategory === 'High').length;
    const avgListening = users.reduce((sum, u) => sum + u.avg_listening_hours_per_week, 0) / totalUsers;
    const avgSkipRate = users.reduce((sum, u) => sum + u.songs_skipped_per_week, 0) / totalUsers;
    
    return {
      churnRate: (churnedUsers / totalUsers) * 100,
      highRiskCount: highRiskUsers,
      avgListening,
      avgSkipRate,
    };
  }, [users]);

  // Simulate impact based on feature importance weights
  const simulatedImpact = useMemo(() => {
    // Feature importance weights from XGBoost model
    const weights = {
      streaming: 0.18,  // avg_listening_hours importance
      skipRate: 0.20,   // songs_skipped importance
      loginFreq: 0.14,  // login_frequency importance
      subscription: 0.08, // subscription_type importance
    };

    // Calculate churn reduction based on improvements
    let churnReduction = 0;

    // More streaming = less churn (positive change = reduction)
    if (streamingChange > 0) {
      churnReduction += (streamingChange / 100) * weights.streaming * 100;
    } else if (streamingChange < 0) {
      churnReduction += (streamingChange / 100) * weights.streaming * 100;
    }

    // Lower skip rate = less churn (negative change = reduction)
    if (skipRateChange < 0) {
      churnReduction += Math.abs(skipRateChange / 100) * weights.skipRate * 100;
    } else if (skipRateChange > 0) {
      churnReduction -= (skipRateChange / 100) * weights.skipRate * 100;
    }

    // More logins = less churn
    if (loginFrequencyChange > 0) {
      churnReduction += (loginFrequencyChange / 100) * weights.loginFreq * 100;
    } else if (loginFrequencyChange < 0) {
      churnReduction += (loginFrequencyChange / 100) * weights.loginFreq * 100;
    }

    // Premium upgrade reduces churn
    if (subscriptionUpgrade) {
      churnReduction += weights.subscription * 100 * 0.5; // 50% of subscribers are already premium
    }

    const newChurnRate = Math.max(0, baselineMetrics.churnRate - churnReduction);
    const usersRetained = Math.round((churnReduction / 100) * users.length);
    
    return {
      churnReduction: Math.min(churnReduction, baselineMetrics.churnRate),
      newChurnRate,
      usersRetained: Math.max(0, usersRetained),
      revenueImpact: usersRetained * 9.99, // Average monthly revenue per user
    };
  }, [streamingChange, skipRateChange, loginFrequencyChange, subscriptionUpgrade, baselineMetrics, users.length]);

  const getInsightMessage = () => {
    const insights: string[] = [];
    
    if (streamingChange > 0) {
      insights.push(`Increasing engagement by ${streamingChange}% through personalized playlists and recommendations`);
    }
    if (skipRateChange < 0) {
      insights.push(`Improving music matching to reduce skip rate by ${Math.abs(skipRateChange)}%`);
    }
    if (loginFrequencyChange > 0) {
      insights.push(`Boosting daily active usage by ${loginFrequencyChange}% with push notifications and daily mixes`);
    }
    if (subscriptionUpgrade) {
      insights.push('Converting free users to Premium with targeted upgrade campaigns');
    }
    
    if (insights.length === 0) {
      return 'Adjust the sliders to simulate retention strategies and see their potential impact on churn.';
    }
    
    return insights.join('. ') + '.';
  };

  return (
    <div className="chart-container">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">What-If Retention Simulator</h3>
          <p className="text-sm text-muted-foreground">
            Simulate engagement changes to predict churn impact
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Controls */}
        <div className="space-y-6">
          {/* Streaming Hours */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-chart-1" />
                <Label className="text-sm font-medium">Streaming Hours</Label>
              </div>
              <span className={`text-sm font-semibold ${streamingChange >= 0 ? 'text-risk-low' : 'text-risk-high'}`}>
                {streamingChange >= 0 ? '+' : ''}{streamingChange}%
              </span>
            </div>
            <Slider
              value={[streamingChange]}
              onValueChange={(v) => setStreamingChange(v[0])}
              min={-50}
              max={100}
              step={5}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Current avg: {baselineMetrics.avgListening.toFixed(1)} hrs/week
            </p>
          </div>

          {/* Skip Rate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SkipForward className="w-4 h-4 text-chart-3" />
                <Label className="text-sm font-medium">Skip Rate</Label>
              </div>
              <span className={`text-sm font-semibold ${skipRateChange <= 0 ? 'text-risk-low' : 'text-risk-high'}`}>
                {skipRateChange >= 0 ? '+' : ''}{skipRateChange}%
              </span>
            </div>
            <Slider
              value={[skipRateChange]}
              onValueChange={(v) => setSkipRateChange(v[0])}
              min={-50}
              max={50}
              step={5}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Current avg: {baselineMetrics.avgSkipRate.toFixed(0)} skips/week
            </p>
          </div>

          {/* Login Frequency */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-chart-2" />
                <Label className="text-sm font-medium">Login Frequency</Label>
              </div>
              <span className={`text-sm font-semibold ${loginFrequencyChange >= 0 ? 'text-risk-low' : 'text-risk-high'}`}>
                {loginFrequencyChange >= 0 ? '+' : ''}{loginFrequencyChange}%
              </span>
            </div>
            <Slider
              value={[loginFrequencyChange]}
              onValueChange={(v) => setLoginFrequencyChange(v[0])}
              min={-50}
              max={100}
              step={5}
              className="cursor-pointer"
            />
          </div>

          {/* Subscription Upgrade */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-chart-4" />
              <div>
                <Label className="text-sm font-medium">Premium Upgrade Campaign</Label>
                <p className="text-xs text-muted-foreground">Convert free users to Premium</p>
              </div>
            </div>
            <Switch
              checked={subscriptionUpgrade}
              onCheckedChange={setSubscriptionUpgrade}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Estimated Churn Reduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">
                  {simulatedImpact.churnReduction.toFixed(1)}%
                </span>
                <TrendingDown className="w-6 h-6 text-risk-low" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                From {baselineMetrics.churnRate.toFixed(1)}% → {simulatedImpact.newChurnRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Users Retained
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-risk-low">
                    +{simulatedImpact.usersRetained.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Revenue Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-chart-2">
                    +${simulatedImpact.revenueImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <TrendingUp className="w-5 h-5 text-chart-2" />
                </div>
                <p className="text-xs text-muted-foreground">/month</p>
              </CardContent>
            </Card>
          </div>

          {/* Insight Message */}
          <Card className="border-chart-3/20 bg-chart-3/5">
            <CardContent className="pt-4">
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-chart-3">Strategy Insight: </span>
                {getInsightMessage()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulator;
