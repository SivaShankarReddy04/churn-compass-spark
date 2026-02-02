import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain, CheckCircle2, Target, BarChart3, TrendingUp } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import FeatureImportanceChart from '@/components/dashboard/FeatureImportanceChart';

const modelMetrics = [
  {
    model: 'XGBoost',
    accuracy: 0.873,
    precision: 0.82,
    recall: 0.79,
    f1Score: 0.81,
    rocAuc: 0.924,
    selected: true,
  },
  {
    model: 'Random Forest',
    accuracy: 0.841,
    precision: 0.78,
    recall: 0.75,
    f1Score: 0.76,
    rocAuc: 0.892,
    selected: false,
  },
  {
    model: 'Logistic Regression',
    accuracy: 0.789,
    precision: 0.72,
    recall: 0.68,
    f1Score: 0.70,
    rocAuc: 0.834,
    selected: false,
  },
  {
    model: 'Gradient Boosting',
    accuracy: 0.865,
    precision: 0.80,
    recall: 0.77,
    f1Score: 0.78,
    rocAuc: 0.912,
    selected: false,
  },
  {
    model: 'Neural Network',
    accuracy: 0.852,
    precision: 0.79,
    recall: 0.76,
    f1Score: 0.77,
    rocAuc: 0.901,
    selected: false,
  },
];

// ROC curve data for visualization
const rocCurveData = [
  { fpr: 0, tpr_xgb: 0, tpr_rf: 0, tpr_lr: 0 },
  { fpr: 0.05, tpr_xgb: 0.42, tpr_rf: 0.38, tpr_lr: 0.28 },
  { fpr: 0.1, tpr_xgb: 0.62, tpr_rf: 0.55, tpr_lr: 0.45 },
  { fpr: 0.15, tpr_xgb: 0.72, tpr_rf: 0.65, tpr_lr: 0.55 },
  { fpr: 0.2, tpr_xgb: 0.80, tpr_rf: 0.72, tpr_lr: 0.62 },
  { fpr: 0.3, tpr_xgb: 0.88, tpr_rf: 0.80, tpr_lr: 0.72 },
  { fpr: 0.4, tpr_xgb: 0.92, tpr_rf: 0.86, tpr_lr: 0.78 },
  { fpr: 0.5, tpr_xgb: 0.95, tpr_rf: 0.90, tpr_lr: 0.83 },
  { fpr: 0.6, tpr_xgb: 0.97, tpr_rf: 0.93, tpr_lr: 0.88 },
  { fpr: 0.7, tpr_xgb: 0.98, tpr_rf: 0.95, tpr_lr: 0.92 },
  { fpr: 0.8, tpr_xgb: 0.99, tpr_rf: 0.97, tpr_lr: 0.95 },
  { fpr: 0.9, tpr_xgb: 0.995, tpr_rf: 0.98, tpr_lr: 0.97 },
  { fpr: 1, tpr_xgb: 1, tpr_rf: 1, tpr_lr: 1 },
];

// Confusion matrix data
const confusionMatrix = {
  truePositive: 7892,
  falsePositive: 1723,
  trueNegative: 28456,
  falseNegative: 2106,
};

const MLModels = () => {
  const totalPredictions = confusionMatrix.truePositive + confusionMatrix.falsePositive + 
    confusionMatrix.trueNegative + confusionMatrix.falseNegative;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">ML Model Comparison</h1>
        <p className="text-muted-foreground">Performance metrics and model selection justification</p>
      </div>

      {/* Selected Model Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                XGBoost
                <Badge className="bg-primary">Selected Model</Badge>
              </h2>
              <p className="text-muted-foreground">Best performing model with highest ROC-AUC score</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">0.924</p>
              <p className="text-sm text-muted-foreground">ROC-AUC</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">87.3%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Model Performance Comparison
          </CardTitle>
          <CardDescription>Evaluation metrics across all trained models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-center">Accuracy</TableHead>
                  <TableHead className="text-center">Precision</TableHead>
                  <TableHead className="text-center">Recall</TableHead>
                  <TableHead className="text-center">F1-Score</TableHead>
                  <TableHead className="text-center">ROC-AUC</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modelMetrics.map((model) => (
                  <TableRow key={model.model} className={model.selected ? 'bg-primary/5' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {model.model}
                        {model.selected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{(model.accuracy * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-center">{model.precision.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{model.recall.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{model.f1Score.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <span className={model.selected ? 'text-primary font-bold' : ''}>
                        {model.rocAuc.toFixed(3)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {model.selected ? (
                        <Badge className="bg-primary">Selected</Badge>
                      ) : (
                        <Badge variant="outline">Evaluated</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ROC Curve & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC Curve */}
        <Card>
          <CardHeader>
            <CardTitle>ROC Curve Comparison</CardTitle>
            <CardDescription>Receiver Operating Characteristic curves for top models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rocCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="fpr" 
                    label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="tpr_xgb" 
                    name="XGBoost (0.924)"
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tpr_rf" 
                    name="Random Forest (0.892)"
                    stroke="hsl(var(--muted-foreground))" 
                    fill="hsl(var(--muted-foreground))"
                    fillOpacity={0.1}
                    strokeWidth={1}
                  />
                  <Line 
                    type="linear" 
                    dataKey="fpr" 
                    name="Random (0.5)"
                    stroke="hsl(var(--destructive))" 
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Confusion Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Confusion Matrix (XGBoost)</CardTitle>
            <CardDescription>Classification results on test dataset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <p className="text-3xl font-bold text-primary">{confusionMatrix.truePositive.toLocaleString()}</p>
                <p className="text-sm font-medium mt-1">True Positive</p>
                <p className="text-xs text-muted-foreground">Correctly predicted churn</p>
              </div>
              <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                <p className="text-3xl font-bold text-destructive">{confusionMatrix.falsePositive.toLocaleString()}</p>
                <p className="text-sm font-medium mt-1">False Positive</p>
                <p className="text-xs text-muted-foreground">Incorrectly predicted churn</p>
              </div>
              <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                <p className="text-3xl font-bold text-destructive">{confusionMatrix.falseNegative.toLocaleString()}</p>
                <p className="text-sm font-medium mt-1">False Negative</p>
                <p className="text-xs text-muted-foreground">Missed churn prediction</p>
              </div>
              <div className="p-6 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <p className="text-3xl font-bold text-primary">{confusionMatrix.trueNegative.toLocaleString()}</p>
                <p className="text-sm font-medium mt-1">True Negative</p>
                <p className="text-xs text-muted-foreground">Correctly predicted retention</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">
                Total Predictions: <span className="font-semibold">{totalPredictions.toLocaleString()}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Importance */}
      <FeatureImportanceChart />

      {/* Model Selection Justification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Model Selection Justification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Why XGBoost?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Highest ROC-AUC score (0.924) among all evaluated models</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Excellent handling of imbalanced datasets common in churn prediction</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Built-in feature importance for interpretability</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Efficient training and prediction speed for large datasets</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Strong generalization with regularization parameters</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Model Training Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Training Set Size</span>
                  <span className="font-medium">347,662 samples (80%)</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Test Set Size</span>
                  <span className="font-medium">86,915 samples (20%)</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Cross-Validation</span>
                  <span className="font-medium">5-Fold Stratified</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Hyperparameter Tuning</span>
                  <span className="font-medium">Grid Search</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Class Imbalance Handling</span>
                  <span className="font-medium">SMOTE + Scale Pos Weight</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MLModels;
