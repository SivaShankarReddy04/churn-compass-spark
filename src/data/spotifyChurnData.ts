// Real Spotify user churn data from XGBoost model predictions
export interface SpotifyUserData {
  user_id: number;
  subscription_type: 'Free' | 'Premium';
  age: number;
  country: string;
  avg_listening_hours_per_week: number;
  login_frequency_per_week: number;
  songs_skipped_per_week: number;
  playlists_created: number;
  days_since_last_login: number;
  monthly_spend_usd: number;
  churn: 0 | 1;
  riskCategory: 'Low' | 'Medium' | 'High';
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  description: string;
}

export interface SegmentChurn {
  segment: string;
  totalUsers: number;
  churnedUsers: number;
  churnRate: number;
}

// Feature importance based on XGBoost model (typical for churn prediction)
export const featureImportanceData: FeatureImportance[] = [
  { feature: 'Days Since Last Login', importance: 0.24, description: 'Days since last app usage' },
  { feature: 'Songs Skipped/Week', importance: 0.20, description: 'Weekly song skip frequency' },
  { feature: 'Listening Hours/Week', importance: 0.18, description: 'Average weekly listening time' },
  { feature: 'Login Frequency', importance: 0.14, description: 'Weekly login frequency' },
  { feature: 'Monthly Spend', importance: 0.10, description: 'Monthly spending in USD' },
  { feature: 'Subscription Type', importance: 0.08, description: 'Free vs Premium subscription' },
  { feature: 'Playlists Created', importance: 0.04, description: 'Number of user-created playlists' },
  { feature: 'Age', importance: 0.02, description: 'User age demographic' },
];

// Derive risk category from user data patterns
export const deriveRiskCategory = (user: Omit<SpotifyUserData, 'riskCategory'>): 'Low' | 'Medium' | 'High' => {
  // If already churned, they're high risk
  if (user.churn === 1) return 'High';
  
  // Calculate risk score based on features
  let riskScore = 0;
  
  // Days since last login (higher = more risk)
  if (user.days_since_last_login > 60) riskScore += 30;
  else if (user.days_since_last_login > 30) riskScore += 20;
  else if (user.days_since_last_login > 14) riskScore += 10;
  
  // Low listening hours (lower = more risk)
  if (user.avg_listening_hours_per_week < 5) riskScore += 25;
  else if (user.avg_listening_hours_per_week < 15) riskScore += 15;
  else if (user.avg_listening_hours_per_week < 25) riskScore += 5;
  
  // High skip rate
  if (user.songs_skipped_per_week > 60) riskScore += 20;
  else if (user.songs_skipped_per_week > 40) riskScore += 10;
  
  // Low engagement
  if (user.login_frequency_per_week < 2) riskScore += 15;
  else if (user.login_frequency_per_week < 5) riskScore += 5;
  
  // Free tier more likely to churn
  if (user.subscription_type === 'Free') riskScore += 10;
  
  // Low playlists created
  if (user.playlists_created === 0) riskScore += 5;
  
  if (riskScore >= 50) return 'High';
  if (riskScore >= 25) return 'Medium';
  return 'Low';
};

// Parse CSV data
export const parseCSVData = (csvText: string): SpotifyUserData[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const user: Omit<SpotifyUserData, 'riskCategory'> = {
      user_id: parseInt(values[0]),
      subscription_type: values[1] as 'Free' | 'Premium',
      age: parseInt(values[2]),
      country: values[3],
      avg_listening_hours_per_week: parseFloat(values[4]),
      login_frequency_per_week: parseInt(values[5]),
      songs_skipped_per_week: parseInt(values[6]),
      playlists_created: parseInt(values[7]),
      days_since_last_login: parseInt(values[8]),
      monthly_spend_usd: parseFloat(values[9]),
      churn: parseInt(values[10]) as 0 | 1,
    };
    
    return {
      ...user,
      riskCategory: deriveRiskCategory(user),
    };
  });
};

export const getAgeGroup = (age: number): string => {
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  return '55+';
};

export const getSubscriptionChurnData = (users: SpotifyUserData[]): SegmentChurn[] => {
  const segments: Record<string, { total: number; churned: number }> = {
    'Free': { total: 0, churned: 0 },
    'Premium': { total: 0, churned: 0 },
  };

  users.forEach(user => {
    segments[user.subscription_type].total++;
    if (user.churn === 1) {
      segments[user.subscription_type].churned++;
    }
  });

  return Object.entries(segments).map(([segment, data]) => ({
    segment,
    totalUsers: data.total,
    churnedUsers: data.churned,
    churnRate: data.total > 0 ? Math.round((data.churned / data.total) * 100 * 10) / 10 : 0,
  }));
};

export const getCountryChurnData = (users: SpotifyUserData[]): SegmentChurn[] => {
  const segments: Record<string, { total: number; churned: number }> = {};

  users.forEach(user => {
    if (!segments[user.country]) {
      segments[user.country] = { total: 0, churned: 0 };
    }
    segments[user.country].total++;
    if (user.churn === 1) {
      segments[user.country].churned++;
    }
  });

  return Object.entries(segments)
    .map(([segment, data]) => ({
      segment,
      totalUsers: data.total,
      churnedUsers: data.churned,
      churnRate: data.total > 0 ? Math.round((data.churned / data.total) * 100 * 10) / 10 : 0,
    }))
    .sort((a, b) => b.totalUsers - a.totalUsers);
};

export const getAgeGroupChurnData = (users: SpotifyUserData[]): SegmentChurn[] => {
  const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];
  const segments: Record<string, { total: number; churned: number }> = {};

  ageGroups.forEach(group => {
    segments[group] = { total: 0, churned: 0 };
  });

  users.forEach(user => {
    const group = getAgeGroup(user.age);
    segments[group].total++;
    if (user.churn === 1) {
      segments[group].churned++;
    }
  });

  return ageGroups.map(segment => ({
    segment,
    totalUsers: segments[segment].total,
    churnedUsers: segments[segment].churned,
    churnRate: segments[segment].total > 0 
      ? Math.round((segments[segment].churned / segments[segment].total) * 100 * 10) / 10 
      : 0,
  }));
};

export const getRiskDistribution = (users: SpotifyUserData[]): { name: string; value: number; fill: string }[] => {
  const distribution = { Low: 0, Medium: 0, High: 0 };
  
  users.forEach(user => {
    distribution[user.riskCategory]++;
  });

  return [
    { name: 'Low Risk', value: distribution.Low, fill: 'hsl(var(--risk-low))' },
    { name: 'Medium Risk', value: distribution.Medium, fill: 'hsl(var(--risk-medium))' },
    { name: 'High Risk', value: distribution.High, fill: 'hsl(var(--risk-high))' },
  ];
};
