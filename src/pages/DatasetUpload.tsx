import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Database,
  FileText,
  Download,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { parseCSVData, SpotifyUserData } from '@/data/spotifyChurnData';
import { useToast } from '@/hooks/use-toast';

interface DatasetStats {
  totalRows: number;
  columns: string[];
  churnRate: number;
  subscriptionBreakdown: { free: number; premium: number };
  countriesCount: number;
  ageRange: { min: number; max: number };
  avgListeningHours: number;
}

const DatasetUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [datasetStats, setDatasetStats] = useState<DatasetStats | null>(null);
  const [previewData, setPreviewData] = useState<SpotifyUserData[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const expectedColumns = [
    'user_id', 'subscription_type', 'age', 'country', 
    'avg_listening_hours_per_week', 'login_frequency_per_week',
    'songs_skipped_per_week', 'playlists_created', 
    'days_since_last_login', 'monthly_spend_usd', 'churn'
  ];

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
1,Premium,28,USA,25.5,7,15,5,2,9.99,0
2,Free,22,UK,12.3,4,35,2,14,0,1
3,Premium,35,Canada,30.2,6,10,8,5,9.99,0`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_spotify_users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dataset Upload</h1>
        <p className="text-muted-foreground">Upload your Spotify user data for churn analysis</p>
      </div>

      {/* Upload Section */}
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
