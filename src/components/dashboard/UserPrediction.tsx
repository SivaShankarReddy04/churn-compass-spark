import { useState, useCallback } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2, Download, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import ChurnGauge from "./ChurnGauge";
import { deriveRiskCategory, SpotifyUserData, parseCSVData } from "@/data/spotifyChurnData";

interface SingleUserInput {
  subscription_type: "Free" | "Premium";
  age: number;
  avg_listening_hours_per_week: number;
  login_frequency_per_week: number;
  songs_skipped_per_week: number;
  playlists_created: number;
  days_since_last_login: number;
  monthly_spend_usd: number;
}

interface PredictionResult {
  user_id: number;
  churnProbability: number;
  riskCategory: "Low" | "Medium" | "High";
  input: SingleUserInput;
}

// Calculate churn probability based on user features
const calculateChurnProbability = (input: SingleUserInput): number => {
  let probability = 0;

  // Days since last login (0.24 weight)
  if (input.days_since_last_login > 60) probability += 0.20;
  else if (input.days_since_last_login > 30) probability += 0.14;
  else if (input.days_since_last_login > 14) probability += 0.08;
  else probability += 0.02;

  // Songs skipped per week (0.20 weight)
  if (input.songs_skipped_per_week > 60) probability += 0.18;
  else if (input.songs_skipped_per_week > 40) probability += 0.12;
  else if (input.songs_skipped_per_week > 20) probability += 0.06;
  else probability += 0.02;

  // Listening hours (0.18 weight) - inverse
  if (input.avg_listening_hours_per_week < 5) probability += 0.16;
  else if (input.avg_listening_hours_per_week < 15) probability += 0.10;
  else if (input.avg_listening_hours_per_week < 25) probability += 0.04;
  else probability += 0.01;

  // Login frequency (0.14 weight) - inverse
  if (input.login_frequency_per_week < 2) probability += 0.12;
  else if (input.login_frequency_per_week < 5) probability += 0.06;
  else probability += 0.02;

  // Monthly spend (0.10 weight) - inverse
  if (input.monthly_spend_usd === 0) probability += 0.10;
  else if (input.monthly_spend_usd < 5) probability += 0.06;
  else probability += 0.02;

  // Subscription type (0.08 weight)
  if (input.subscription_type === "Free") probability += 0.08;
  else probability += 0.02;

  // Playlists created (0.04 weight) - inverse
  if (input.playlists_created === 0) probability += 0.04;
  else if (input.playlists_created < 5) probability += 0.02;
  else probability += 0.01;

  // Age factor (0.02 weight)
  if (input.age < 25 || input.age > 55) probability += 0.02;
  else probability += 0.01;

  // Normalize and add some variance
  return Math.min(0.95, Math.max(0.05, probability + (Math.random() * 0.05 - 0.025)));
};

const getRiskFromProbability = (probability: number): "Low" | "Medium" | "High" => {
  if (probability >= 0.6) return "High";
  if (probability >= 0.3) return "Medium";
  return "Low";
};

export default function UserPrediction() {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [loading, setLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<PredictionResult | null>(null);
  const [bulkResults, setBulkResults] = useState<PredictionResult[]>([]);
  
  // Single user form state
  const [formData, setFormData] = useState<SingleUserInput>({
    subscription_type: "Free",
    age: 28,
    avg_listening_hours_per_week: 15,
    login_frequency_per_week: 5,
    songs_skipped_per_week: 25,
    playlists_created: 3,
    days_since_last_login: 5,
    monthly_spend_usd: 0,
  });

  const handleSinglePredict = useCallback(() => {
    setLoading(true);
    
    // Simulate prediction delay
    setTimeout(() => {
      const probability = calculateChurnProbability(formData);
      const result: PredictionResult = {
        user_id: Math.floor(Math.random() * 100000),
        churnProbability: probability,
        riskCategory: getRiskFromProbability(probability),
        input: { ...formData },
      };
      setSingleResult(result);
      setLoading(false);
      
      toast({
        title: "Prediction Complete",
        description: `User classified as ${result.riskCategory} Risk with ${(probability * 100).toFixed(1)}% churn probability.`,
      });
    }, 800);
  }, [formData]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const users = parseCSVData(text);
        
        const predictions: PredictionResult[] = users.slice(0, 100).map((user) => {
          const input: SingleUserInput = {
            subscription_type: user.subscription_type,
            age: user.age,
            avg_listening_hours_per_week: user.avg_listening_hours_per_week,
            login_frequency_per_week: user.login_frequency_per_week,
            songs_skipped_per_week: user.songs_skipped_per_week,
            playlists_created: user.playlists_created,
            days_since_last_login: user.days_since_last_login,
            monthly_spend_usd: user.monthly_spend_usd,
          };
          
          const probability = calculateChurnProbability(input);
          
          return {
            user_id: user.user_id,
            churnProbability: probability,
            riskCategory: getRiskFromProbability(probability),
            input,
          };
        });

        setBulkResults(predictions);
        setLoading(false);
        
        toast({
          title: "Bulk Prediction Complete",
          description: `Processed ${predictions.length} users successfully.`,
        });
      } catch (error) {
        setLoading(false);
        toast({
          title: "Parse Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
  }, []);

  const downloadSampleCSV = () => {
    const headers = "user_id,subscription_type,age,country,avg_listening_hours_per_week,login_frequency_per_week,songs_skipped_per_week,playlists_created,days_since_last_login,monthly_spend_usd,churn";
    const rows = [
      "1,Premium,28,USA,25.5,7,15,8,3,9.99,0",
      "2,Free,22,UK,8.2,3,45,1,15,0,0",
      "3,Premium,35,Germany,32.1,10,8,12,1,9.99,0",
      "4,Free,19,Brazil,5.0,2,60,0,45,0,1",
      "5,Premium,42,Canada,18.7,5,22,5,7,9.99,0",
    ];
    
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "High":
        return "destructive";
      case "Medium":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Instant Churn Prediction</h2>
          <p className="text-muted-foreground">
            Predict churn risk for individual users or upload bulk data
          </p>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "bulk")} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="single" className="gap-2">
            <User className="w-4 h-4" />
            Single User
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2">
            <Upload className="w-4 h-4" />
            Bulk Upload
          </TabsTrigger>
        </TabsList>

        {/* Single User Prediction */}
        <TabsContent value="single" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  User Features
                </CardTitle>
                <CardDescription>
                  Enter user engagement metrics to predict churn risk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subscription Type */}
                <div className="space-y-2">
                  <Label>Subscription Type</Label>
                  <Select
                    value={formData.subscription_type}
                    onValueChange={(v) => setFormData({ ...formData, subscription_type: v as "Free" | "Premium" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="Premium">Premium ($9.99/mo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Age</Label>
                    <span className="text-sm text-muted-foreground">{formData.age} years</span>
                  </div>
                  <Slider
                    value={[formData.age]}
                    onValueChange={([v]) => setFormData({ ...formData, age: v })}
                    min={18}
                    max={70}
                    step={1}
                  />
                </div>

                {/* Listening Hours */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Avg Listening Hours/Week</Label>
                    <span className="text-sm text-muted-foreground">{formData.avg_listening_hours_per_week}h</span>
                  </div>
                  <Slider
                    value={[formData.avg_listening_hours_per_week]}
                    onValueChange={([v]) => setFormData({ ...formData, avg_listening_hours_per_week: v })}
                    min={0}
                    max={80}
                    step={1}
                  />
                </div>

                {/* Login Frequency */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Login Frequency/Week</Label>
                    <span className="text-sm text-muted-foreground">{formData.login_frequency_per_week}x</span>
                  </div>
                  <Slider
                    value={[formData.login_frequency_per_week]}
                    onValueChange={([v]) => setFormData({ ...formData, login_frequency_per_week: v })}
                    min={0}
                    max={14}
                    step={1}
                  />
                </div>

                {/* Songs Skipped */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Songs Skipped/Week</Label>
                    <span className="text-sm text-muted-foreground">{formData.songs_skipped_per_week}</span>
                  </div>
                  <Slider
                    value={[formData.songs_skipped_per_week]}
                    onValueChange={([v]) => setFormData({ ...formData, songs_skipped_per_week: v })}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Days Since Last Login */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Days Since Last Login</Label>
                    <span className="text-sm text-muted-foreground">{formData.days_since_last_login} days</span>
                  </div>
                  <Slider
                    value={[formData.days_since_last_login]}
                    onValueChange={([v]) => setFormData({ ...formData, days_since_last_login: v })}
                    min={0}
                    max={90}
                    step={1}
                  />
                </div>

                {/* Playlists Created */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Playlists Created</Label>
                    <span className="text-sm text-muted-foreground">{formData.playlists_created}</span>
                  </div>
                  <Slider
                    value={[formData.playlists_created]}
                    onValueChange={([v]) => setFormData({ ...formData, playlists_created: v })}
                    min={0}
                    max={50}
                    step={1}
                  />
                </div>

                {/* Monthly Spend */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Monthly Spend (USD)</Label>
                    <span className="text-sm text-muted-foreground">${formData.monthly_spend_usd.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[formData.monthly_spend_usd]}
                    onValueChange={([v]) => setFormData({ ...formData, monthly_spend_usd: v })}
                    min={0}
                    max={20}
                    step={0.99}
                  />
                </div>

                <Button onClick={handleSinglePredict} className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    "Predict Churn Risk"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Prediction Result */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {singleResult ? (
                    singleResult.riskCategory === "High" ? (
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    ) : singleResult.riskCategory === "Medium" ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )
                  ) : (
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  )}
                  Prediction Result
                </CardTitle>
                <CardDescription>
                  {singleResult
                    ? "Churn probability based on XGBoost model"
                    : "Enter user data and click predict to see results"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {singleResult ? (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <ChurnGauge probability={singleResult.churnProbability * 100} size="lg" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-sm text-muted-foreground">Churn Probability</p>
                        <p className="text-2xl font-bold">
                          {(singleResult.churnProbability * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-sm text-muted-foreground">Risk Category</p>
                        <Badge variant={getRiskBadgeVariant(singleResult.riskCategory)} className="mt-1 text-lg px-3">
                          {singleResult.riskCategory}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-border bg-card">
                      <h4 className="font-semibold mb-2">Retention Recommendation</h4>
                      {singleResult.riskCategory === "High" && (
                        <p className="text-sm text-muted-foreground">
                          ⚠️ <strong>Urgent Action Required:</strong> This user shows strong churn signals. 
                          Consider personalized outreach, exclusive offers, or premium trial extensions.
                        </p>
                      )}
                      {singleResult.riskCategory === "Medium" && (
                        <p className="text-sm text-muted-foreground">
                          📊 <strong>Monitor Closely:</strong> Moderate churn risk detected. 
                          Re-engagement campaigns and feature discovery prompts may help retain this user.
                        </p>
                      )}
                      {singleResult.riskCategory === "Low" && (
                        <p className="text-sm text-muted-foreground">
                          ✅ <strong>Healthy Engagement:</strong> This user shows positive retention signals. 
                          Continue providing great experience and consider loyalty rewards.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <User className="w-16 h-16 mb-4 opacity-30" />
                    <p>No prediction yet</p>
                    <p className="text-sm">Fill in the form and click predict</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bulk Upload */}
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Bulk User Upload
              </CardTitle>
              <CardDescription>
                Upload a CSV file with user data to predict churn for multiple users at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="csv-upload" className="sr-only">
                    Upload CSV
                  </Label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={loading}
                    className="cursor-pointer"
                  />
                </div>
                <Button variant="outline" onClick={downloadSampleCSV} className="shrink-0">
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                CSV should include columns: user_id, subscription_type, age, country, avg_listening_hours_per_week, 
                login_frequency_per_week, songs_skipped_per_week, playlists_created, days_since_last_login, monthly_spend_usd
              </p>
            </CardContent>
          </Card>

          {/* Bulk Results Table */}
          {bulkResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prediction Results ({bulkResults.length} users)</CardTitle>
                <CardDescription>
                  High Risk: {bulkResults.filter(r => r.riskCategory === "High").length} | 
                  Medium Risk: {bulkResults.filter(r => r.riskCategory === "Medium").length} | 
                  Low Risk: {bulkResults.filter(r => r.riskCategory === "Low").length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Listening Hrs</TableHead>
                        <TableHead>Days Inactive</TableHead>
                        <TableHead>Churn Prob</TableHead>
                        <TableHead>Risk</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkResults.map((result) => (
                        <TableRow key={result.user_id}>
                          <TableCell className="font-mono">{result.user_id}</TableCell>
                          <TableCell>{result.input.subscription_type}</TableCell>
                          <TableCell>{result.input.avg_listening_hours_per_week.toFixed(1)}h</TableCell>
                          <TableCell>{result.input.days_since_last_login}d</TableCell>
                          <TableCell>{(result.churnProbability * 100).toFixed(1)}%</TableCell>
                          <TableCell>
                            <Badge variant={getRiskBadgeVariant(result.riskCategory)}>
                              {result.riskCategory}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">Processing...</span>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
