import { useMemo } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import WhatIfSimulator from '@/components/dashboard/WhatIfSimulator';
import FeatureImportanceChart from '@/components/dashboard/FeatureImportanceChart';
import EngagementChurnChart from '@/components/dashboard/EngagementChurnChart';
import { useSpotifyData } from '@/hooks/useSpotifyData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, TrendingUp, DollarSign } from 'lucide-react';

const WhatIfAnalysis = () => {
  const { users, loading, error } = useSpotifyData(10000);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading simulation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive">Failed to load data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">What-If Analysis</h1>
        <p className="text-muted-foreground">Simulate retention strategies and estimate churn impact</p>
      </div>

      {/* How It Works */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            How What-If Simulation Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">1</span>
              </div>
              <div>
                <p className="font-medium">Adjust Parameters</p>
                <p className="text-sm text-muted-foreground">
                  Use sliders to simulate changes in streaming hours, skip rate, and login frequency.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Calculate Impact</p>
                <p className="text-sm text-muted-foreground">
                  The model uses feature importance weights to estimate churn reduction.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Business Outcome</p>
                <p className="text-sm text-muted-foreground">
                  See estimated users retained and monthly revenue impact.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Simulator */}
      <WhatIfSimulator users={users} />

      {/* Supporting Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeatureImportanceChart />
        <EngagementChurnChart users={users} />
      </div>

      {/* Strategy Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Recommended Retention Strategies
          </CardTitle>
          <CardDescription>Based on feature importance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-medium">Increase Engagement</span>
                <Badge variant="secondary">High Impact</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Target users with declining listening hours through personalized playlists and recommendations.
              </p>
              <div className="text-xs text-muted-foreground">
                Expected Impact: <span className="text-primary font-medium">15-20% churn reduction</span>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-medium">Re-engagement Campaigns</span>
                <Badge variant="secondary">High Impact</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Send push notifications to users who haven't logged in recently with personalized content.
              </p>
              <div className="text-xs text-muted-foreground">
                Expected Impact: <span className="text-primary font-medium">20-25% churn reduction</span>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="font-medium">Premium Upgrade Offers</span>
                <Badge variant="outline">Medium Impact</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Offer discounted Premium trials to engaged Free tier users showing retention signals.
              </p>
              <div className="text-xs text-muted-foreground">
                Expected Impact: <span className="text-primary font-medium">8-12% churn reduction</span>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="font-medium">Reduce Skip Friction</span>
                <Badge variant="outline">Medium Impact</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Improve song recommendations to reduce skip rates and increase user satisfaction.
              </p>
              <div className="text-xs text-muted-foreground">
                Expected Impact: <span className="text-primary font-medium">10-15% churn reduction</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatIfAnalysis;
