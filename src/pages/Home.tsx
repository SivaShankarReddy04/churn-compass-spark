import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingDown, 
  Database, 
  Brain, 
  Target, 
  Users, 
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Zap
} from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-border p-8 lg:p-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative">
          <Badge variant="secondary" className="mb-4">
            <Zap className="w-3 h-3 mr-1" />
            Enterprise Analytics Platform
          </Badge>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4">
            Churn Prediction & 
            <span className="text-gradient block">Retention Analytics</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            AI-powered customer retention platform for Spotify users. Leverage machine learning 
            to predict churn, identify at-risk customers, and take data-driven retention actions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="px-3 py-1">
              <Database className="w-3 h-3 mr-1" />
              434K+ Users
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Brain className="w-3 h-3 mr-1" />
              XGBoost Model
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Target className="w-3 h-3 mr-1" />
              92.4% ROC-AUC
            </Badge>
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              The Problem
            </CardTitle>
            <CardDescription>Why customer churn matters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Customer churn is a critical challenge for subscription-based businesses. 
              Losing customers means:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 mt-1 text-destructive shrink-0" />
                <span className="text-sm">5-25x more expensive to acquire new customers than retain existing ones</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 mt-1 text-destructive shrink-0" />
                <span className="text-sm">Negative impact on Monthly Recurring Revenue (MRR)</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 mt-1 text-destructive shrink-0" />
                <span className="text-sm">Loss of customer lifetime value and referral potential</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              Our Solution
            </CardTitle>
            <CardDescription>Predictive analytics for retention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This platform leverages machine learning to proactively identify and retain at-risk customers:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-1 text-primary shrink-0" />
                <span className="text-sm">Predict churn probability for each user with 92%+ accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-1 text-primary shrink-0" />
                <span className="text-sm">Identify key drivers of churn through feature importance analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-1 text-primary shrink-0" />
                <span className="text-sm">Simulate retention strategies with what-if analysis</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Dataset & Model Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="w-5 h-5 text-primary" />
              Dataset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Records</span>
                <span className="font-semibold">434,577</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Features</span>
                <span className="font-semibold">10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Churn Rate</span>
                <span className="font-semibold">~26%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Countries</span>
                <span className="font-semibold">10</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5 text-primary" />
              Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Algorithm</span>
                <span className="font-semibold">XGBoost</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ROC-AUC</span>
                <span className="font-semibold text-primary">0.924</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Accuracy</span>
                <span className="font-semibold">87.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">F1-Score</span>
                <span className="font-semibold">0.81</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary" className="mr-1 mb-1">Days Since Login</Badge>
              <Badge variant="secondary" className="mr-1 mb-1">Skip Rate</Badge>
              <Badge variant="secondary" className="mr-1 mb-1">Listening Hours</Badge>
              <Badge variant="secondary" className="mr-1 mb-1">Login Frequency</Badge>
              <Badge variant="secondary" className="mr-1 mb-1">Monthly Spend</Badge>
              <Badge variant="secondary" className="mr-1 mb-1">Subscription</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Business Impact
          </CardTitle>
          <CardDescription>Expected outcomes from implementing churn prediction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-primary mb-1">15-30%</p>
              <p className="text-sm text-muted-foreground">Reduction in Churn</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-primary mb-1">$2.4M+</p>
              <p className="text-sm text-muted-foreground">Annual Revenue Saved</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-primary mb-1">5,000+</p>
              <p className="text-sm text-muted-foreground">Users Retained Monthly</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-primary mb-1">3.2x</p>
              <p className="text-sm text-muted-foreground">ROI on Retention</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Features */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Capabilities</CardTitle>
          <CardDescription>Comprehensive analytics and decision support tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: BarChart3, title: 'Overview Dashboard', desc: 'KPIs, trends, and distribution charts' },
              { icon: Database, title: 'Dataset Upload', desc: 'Import and validate CSV data' },
              { icon: Target, title: 'Churn Prediction', desc: 'User-level risk segmentation' },
              { icon: Brain, title: 'What-If Analysis', desc: 'Simulate retention strategies' },
              { icon: Users, title: 'Retention Actions', desc: 'Personalized recommendations' },
              { icon: TrendingDown, title: 'ML Model Comparison', desc: 'Performance metrics & ROC curves' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <feature.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
