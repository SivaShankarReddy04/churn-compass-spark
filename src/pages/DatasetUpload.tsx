import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Database,
  FileText,
  Download,
  Loader2,
  UserPlus,
  Target
} from 'lucide-react';
import { parseCSVData, SpotifyUserData, deriveRiskCategory } from '@/data/spotifyChurnData';
import { useToast } from '@/hooks/use-toast';
import ChurnGauge from '@/components/dashboard/ChurnGauge';

interface DatasetStats {
  totalRows: number;
  columns: string[];
  churnRate: number;
  subscriptionBreakdown: { free: number; premium: number };
  countriesCount: number;
  ageRange: { min: number; max: number };
  avgListeningHours: number;
}

interface SingleUserInput {
  subscription_type: 'Free' | 'Premium';
  age: string;
  country: string;
  avg_listening_hours_per_week: string;
  login_frequency_per_week: string;
  songs_skipped_per_week: string;
  playlists_created: string;
  days_since_last_login: string;
  monthly_spend_inr: string;
}

const DatasetUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [datasetStats, setDatasetStats] = useState<DatasetStats | null>(null);
  const [previewData, setPreviewData] = useState<SpotifyUserData[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('single');
  
  // Single user prediction state
  const [singleUserInput, setSingleUserInput] = useState<SingleUserInput>({
    subscription_type: 'Free',
    age: '25',
    country: 'India',
    avg_listening_hours_per_week: '15',
    login_frequency_per_week: '5',
    songs_skipped_per_week: '20',
    playlists_created: '3',
    days_since_last_login: '5',
    monthly_spend_inr: '0',
  });
  const [singleUserResult, setSingleUserResult] = useState<{
    probability: number;
    riskCategory: 'Low' | 'Medium' | 'High';
  } | null>(null);
  
  const { toast } = useToast();

  const expectedColumns = [
    'user_id', 'subscription_type', 'age', 'country', 
    'avg_listening_hours_per_week', 'login_frequency_per_week',
    'songs_skipped_per_week', 'playlists_created', 
    'days_since_last_login', 'monthly_spend_usd', 'churn'
  ];

  const countries = ['India', 'USA', 'UK', 'Canada', 'Germany', 'France', 'Australia', 'Brazil', 'Japan', 'Mexico'];

  const validateSchema = (headers: string[]): string[] => {
    const errors: string[] = [];
    const headerLower = headers.map(h => h.toLowerCase().trim());
    
    expectedColumns.forEach(col => {
      if (!headerLower.includes(col.toLowerCase())) {
        errors.push(`Missing required column: ${col}`);
      }
    });

    return errors;
  };

  const calculateStats = (data: SpotifyUserData[]): DatasetStats => {
    const churnedUsers = data.filter(u => u.churn === 1).length;
    const freeUsers = data.filter(u => u.subscription_type === 'Free').length;
    const ages = data.map(u => u.age);
    const countries = new Set(data.map(u => u.country));
    const avgListening = data.reduce((sum, u) => sum + u.avg_listening_hours_per_week, 0) / data.length;

    return {
      totalRows: data.length,
      columns: expectedColumns,
      churnRate: (churnedUsers / data.length) * 100,
      subscriptionBreakdown: {
        free: freeUsers,
        premium: data.length - freeUsers,
      },
      countriesCount: countries.size,
      ageRange: { min: Math.min(...ages), max: Math.max(...ages) },
      avgListeningHours: avgListening,
    };
  };

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setUploading(true);
    setUploadProgress(0);
    setValidationErrors([]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const text = await selectedFile.text();
      clearInterval(progressInterval);
      setUploadProgress(95);

      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      // Validate schema
      const errors = validateSchema(headers);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setUploadProgress(100);
        setUploading(false);
        return;
      }

      // Parse data
      const parsedData = parseCSVData(text);
      setUploadProgress(100);

      // Calculate stats
      const stats = calculateStats(parsedData);
      setDatasetStats(stats);

      // Preview first 10 rows
      setPreviewData(parsedData.slice(0, 10));

      toast({
        title: 'Dataset Uploaded Successfully',
        description: `Loaded ${stats.totalRows.toLocaleString()} records.`,
      });

    } catch (err) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to parse CSV file. Please check the format.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const handleDownloadSample = () => {
    const sampleData = `user_id,subscription_type,age,country,avg_listening_hours_per_week,login_frequency_per_week,songs_skipped_per_week,playlists_created,days_since_last_login,monthly_spend_usd,churn
1,Premium,28,India,25.5,7,15,5,2,799,0
2,Free,22,India,12.3,4,35,2,14,0,1
3,Premium,35,USA,30.2,6,10,8,5,9.99,0`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_spotify_users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateChurnProbability = (input: SingleUserInput): number => {
    let probability = 0;
    
    // Days since last login (weight: 0.24)
    const daysSinceLogin = parseInt(input.days_since_last_login) || 0;
    if (daysSinceLogin > 60) probability += 24;
    else if (daysSinceLogin > 30) probability += 18;
    else if (daysSinceLogin > 14) probability += 10;
    else probability += (daysSinceLogin / 60) * 10;
    
    // Songs skipped (weight: 0.20)
    const skipped = parseInt(input.songs_skipped_per_week) || 0;
    if (skipped > 60) probability += 20;
    else if (skipped > 40) probability += 14;
    else if (skipped > 20) probability += 8;
    else probability += (skipped / 60) * 8;
    
    // Listening hours (weight: 0.18) - inverse relationship
    const listeningHours = parseFloat(input.avg_listening_hours_per_week) || 0;
    if (listeningHours < 5) probability += 18;
    else if (listeningHours < 15) probability += 12;
    else if (listeningHours < 25) probability += 6;
    else probability += Math.max(0, (35 - listeningHours) / 35) * 6;
    
    // Login frequency (weight: 0.14) - inverse relationship
    const loginFreq = parseInt(input.login_frequency_per_week) || 0;
    if (loginFreq < 2) probability += 14;
    else if (loginFreq < 4) probability += 8;
    else if (loginFreq < 6) probability += 4;
    else probability += 0;
    
    // Monthly spend (weight: 0.10)
    const spend = parseFloat(input.monthly_spend_inr) || 0;
    if (spend === 0) probability += 10;
    else if (spend < 200) probability += 6;
    else probability += 0;
    
    // Subscription type (weight: 0.08)
    if (input.subscription_type === 'Free') probability += 8;
    
    // Playlists created (weight: 0.04)
    const playlists = parseInt(input.playlists_created) || 0;
    if (playlists === 0) probability += 4;
    else if (playlists < 3) probability += 2;
    
    // Age factor (weight: 0.02)
    const age = parseInt(input.age) || 25;
    if (age < 20 || age > 50) probability += 2;
    
    return Math.min(100, Math.max(0, probability));
  };

  const handleSingleUserPredict = () => {
    const probability = calculateChurnProbability(singleUserInput);
    let riskCategory: 'Low' | 'Medium' | 'High';
    
    if (probability < 30) riskCategory = 'Low';
    else if (probability < 60) riskCategory = 'Medium';
    else riskCategory = 'High';
    
    setSingleUserResult({ probability, riskCategory });
    
    toast({
      title: 'Prediction Complete',
      description: `Churn probability: ${probability.toFixed(1)}% (${riskCategory} Risk)`,
    });
  };

  const handleInputChange = (field: keyof SingleUserInput, value: string) => {
    setSingleUserInput(prev => ({ ...prev, [field]: value }));
    setSingleUserResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dataset Upload</h1>
        <p className="text-muted-foreground">Upload user data for churn prediction</p>
      </div>

      {/* Tabs for Single User vs Bulk Upload */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Single User
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Bulk Upload
          </TabsTrigger>
        </TabsList>

        {/* Single User Prediction */}
        <TabsContent value="single" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Enter User Details
                </CardTitle>
                <CardDescription>
                  Input individual user metrics for instant churn prediction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subscription Type</Label>
                    <Select
                      value={singleUserInput.subscription_type}
                      onValueChange={(value) => handleInputChange('subscription_type', value as 'Free' | 'Premium')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      type="number"
                      value={singleUserInput.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      min="13"
                      max="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select
                      value={singleUserInput.country}
                      onValueChange={(value) => handleInputChange('country', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Listening Hours/Week</Label>
                    <Input
                      type="number"
                      value={singleUserInput.avg_listening_hours_per_week}
                      onChange={(e) => handleInputChange('avg_listening_hours_per_week', e.target.value)}
                      min="0"
                      max="168"
                      step="0.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Login Frequency/Week</Label>
                    <Input
                      type="number"
                      value={singleUserInput.login_frequency_per_week}
                      onChange={(e) => handleInputChange('login_frequency_per_week', e.target.value)}
                      min="0"
                      max="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Songs Skipped/Week</Label>
                    <Input
                      type="number"
                      value={singleUserInput.songs_skipped_per_week}
                      onChange={(e) => handleInputChange('songs_skipped_per_week', e.target.value)}
                      min="0"
                      max="500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Playlists Created</Label>
                    <Input
                      type="number"
                      value={singleUserInput.playlists_created}
                      onChange={(e) => handleInputChange('playlists_created', e.target.value)}
                      min="0"
                      max="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Days Since Last Login</Label>
                    <Input
                      type="number"
                      value={singleUserInput.days_since_last_login}
                      onChange={(e) => handleInputChange('days_since_last_login', e.target.value)}
                      min="0"
                      max="365"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Monthly Spend (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      value={singleUserInput.monthly_spend_inr}
                      onChange={(e) => handleInputChange('monthly_spend_inr', e.target.value)}
                      className="pl-7"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>

                <Button onClick={handleSingleUserPredict} className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Predict Churn Risk
                </Button>
              </CardContent>
            </Card>

            {/* Prediction Result */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Prediction Result
                </CardTitle>
                <CardDescription>
                  Churn probability based on XGBoost model
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                {singleUserResult ? (
                  <>
                    <ChurnGauge probability={singleUserResult.probability} size="lg" />
                    <div className="mt-6 text-center">
                      <Badge 
                        variant="outline"
                        className={
                          singleUserResult.riskCategory === 'High' ? 'border-destructive text-destructive text-lg px-4 py-1' :
                          singleUserResult.riskCategory === 'Medium' ? 'border-yellow-500 text-yellow-500 text-lg px-4 py-1' :
                          'border-primary text-primary text-lg px-4 py-1'
                        }
                      >
                        {singleUserResult.riskCategory} Risk
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-3">
                        {singleUserResult.riskCategory === 'High' 
                          ? 'Immediate intervention recommended' 
                          : singleUserResult.riskCategory === 'Medium'
                          ? 'Monitor and engage proactively'
                          : 'User is likely to remain active'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Enter user details and click predict</p>
                    <p className="text-sm mt-1">to see churn probability</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bulk Upload */}
        <TabsContent value="bulk" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload CSV File
                </CardTitle>
                <CardDescription>
                  Upload a CSV file containing user data with churn labels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="text-primary font-medium">Click to upload</span>
                    <span className="text-muted-foreground"> or drag and drop</span>
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">CSV files only, max 50MB</p>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Processing...</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {file && !uploading && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {validationErrors.length === 0 && datasetStats && (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </div>
                )}

                <Button variant="outline" onClick={handleDownloadSample} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Required Schema
                </CardTitle>
                <CardDescription>
                  Your CSV must contain these columns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expectedColumns.map((col, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                      <code className="font-mono">{col}</code>
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Schema Validation Failed</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Dataset Stats */}
      {datasetStats && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Dataset Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{datasetStats.totalRows.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Records</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{datasetStats.columns.length}</p>
                  <p className="text-xs text-muted-foreground">Columns</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-destructive">{datasetStats.churnRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Churn Rate</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{datasetStats.countriesCount}</p>
                  <p className="text-xs text-muted-foreground">Countries</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{datasetStats.ageRange.min}-{datasetStats.ageRange.max}</p>
                  <p className="text-xs text-muted-foreground">Age Range</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{datasetStats.avgListeningHours.toFixed(1)}h</p>
                  <p className="text-xs text-muted-foreground">Avg Listening</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-2">Subscription Breakdown</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Free</span>
                        <span>{datasetStats.subscriptionBreakdown.free.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(datasetStats.subscriptionBreakdown.free / datasetStats.totalRows) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Premium</span>
                        <span>{datasetStats.subscriptionBreakdown.premium.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(datasetStats.subscriptionBreakdown.premium / datasetStats.totalRows) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>First 10 rows of your dataset</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Listening Hrs</TableHead>
                      <TableHead>Skip Rate</TableHead>
                      <TableHead>Days Inactive</TableHead>
                      <TableHead>Churn</TableHead>
                      <TableHead>Risk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row) => (
                      <TableRow key={row.user_id}>
                        <TableCell className="font-mono">{row.user_id}</TableCell>
                        <TableCell>
                          <Badge variant={row.subscription_type === 'Premium' ? 'default' : 'secondary'}>
                            {row.subscription_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.age}</TableCell>
                        <TableCell>{row.country}</TableCell>
                        <TableCell>{row.avg_listening_hours_per_week.toFixed(1)}</TableCell>
                        <TableCell>{row.songs_skipped_per_week}</TableCell>
                        <TableCell>{row.days_since_last_login}</TableCell>
                        <TableCell>
                          <Badge variant={row.churn === 1 ? 'destructive' : 'outline'}>
                            {row.churn === 1 ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              row.riskCategory === 'High' ? 'border-destructive text-destructive' :
                              row.riskCategory === 'Medium' ? 'border-yellow-500 text-yellow-500' :
                              'border-primary text-primary'
                            }
                          >
                            {row.riskCategory}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DatasetUpload;
