// Mock Spotify user churn data based on typical streaming service metrics
export interface UserChurnData {
  userId: string;
  username: string;
  subscriptionType: 'Free' | 'Premium' | 'Family' | 'Student';
  tenure: number; // months
  monthlyListeningHours: number;
  playlistsCreated: number;
  songsLiked: number;
  skipRate: number; // percentage
  lastLoginDays: number;
  deviceCount: number;
  ageGroup: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  churnProbability: number;
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

// Generate realistic mock data
const subscriptionTypes: UserChurnData['subscriptionType'][] = ['Free', 'Premium', 'Family', 'Student'];
const ageGroups: UserChurnData['ageGroup'][] = ['18-24', '25-34', '35-44', '45-54', '55+'];

const generateUsername = (index: number): string => {
  const prefixes = ['music', 'melody', 'beats', 'sound', 'audio', 'rhythm', 'tune', 'vibe', 'sonic', 'wave'];
  const suffixes = ['lover', 'fan', 'head', 'junkie', 'master', 'guru', 'ninja', 'pro', 'king', 'queen'];
  return `${prefixes[index % prefixes.length]}_${suffixes[Math.floor(index / 10) % suffixes.length]}_${index}`;
};

const calculateChurnProbability = (user: Partial<UserChurnData>): number => {
  let probability = 0;
  
  // Skip rate is a strong indicator
  probability += (user.skipRate || 0) * 0.3;
  
  // Days since last login
  probability += Math.min((user.lastLoginDays || 0) * 2, 30);
  
  // Low engagement
  if ((user.monthlyListeningHours || 0) < 10) probability += 20;
  if ((user.playlistsCreated || 0) === 0) probability += 10;
  if ((user.songsLiked || 0) < 5) probability += 10;
  
  // Free tier more likely to churn
  if (user.subscriptionType === 'Free') probability += 15;
  
  // New users churn more
  if ((user.tenure || 0) < 3) probability += 10;
  
  // Single device usage
  if ((user.deviceCount || 0) === 1) probability += 5;
  
  return Math.min(Math.max(probability + Math.random() * 10 - 5, 0), 100);
};

const getRiskCategory = (probability: number): 'Low' | 'Medium' | 'High' => {
  if (probability < 30) return 'Low';
  if (probability < 60) return 'Medium';
  return 'High';
};

export const generateMockUsers = (count: number = 500): UserChurnData[] => {
  return Array.from({ length: count }, (_, i) => {
    const partialUser: Partial<UserChurnData> = {
      subscriptionType: subscriptionTypes[Math.floor(Math.random() * subscriptionTypes.length)],
      tenure: Math.floor(Math.random() * 60) + 1,
      monthlyListeningHours: Math.floor(Math.random() * 150),
      playlistsCreated: Math.floor(Math.random() * 50),
      songsLiked: Math.floor(Math.random() * 500),
      skipRate: Math.floor(Math.random() * 60),
      lastLoginDays: Math.floor(Math.random() * 30),
      deviceCount: Math.floor(Math.random() * 5) + 1,
      ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
    };
    
    const churnProbability = calculateChurnProbability(partialUser);
    
    return {
      userId: `USR-${String(i + 1).padStart(6, '0')}`,
      username: generateUsername(i),
      ...partialUser,
      churnProbability: Math.round(churnProbability * 10) / 10,
      riskCategory: getRiskCategory(churnProbability),
    } as UserChurnData;
  });
};

export const featureImportanceData: FeatureImportance[] = [
  { feature: 'Skip Rate', importance: 0.28, description: 'Percentage of songs skipped before 30 seconds' },
  { feature: 'Last Login Days', importance: 0.22, description: 'Days since last app usage' },
  { feature: 'Monthly Listening Hours', importance: 0.18, description: 'Total hours listened per month' },
  { feature: 'Subscription Type', importance: 0.12, description: 'Current subscription tier' },
  { feature: 'Playlists Created', importance: 0.08, description: 'Number of user-created playlists' },
  { feature: 'Songs Liked', importance: 0.06, description: 'Total songs in library' },
  { feature: 'Device Count', importance: 0.04, description: 'Number of connected devices' },
  { feature: 'Tenure', importance: 0.02, description: 'Months as a subscriber' },
];

export const getSegmentChurnData = (users: UserChurnData[]): SegmentChurn[] => {
  const segments: Record<string, { total: number; churned: number }> = {
    'Free': { total: 0, churned: 0 },
    'Premium': { total: 0, churned: 0 },
    'Family': { total: 0, churned: 0 },
    'Student': { total: 0, churned: 0 },
  };

  users.forEach(user => {
    segments[user.subscriptionType].total++;
    if (user.riskCategory === 'High') {
      segments[user.subscriptionType].churned++;
    }
  });

  return Object.entries(segments).map(([segment, data]) => ({
    segment,
    totalUsers: data.total,
    churnedUsers: data.churned,
    churnRate: Math.round((data.churned / data.total) * 100 * 10) / 10,
  }));
};

export const getAgeGroupChurnData = (users: UserChurnData[]): SegmentChurn[] => {
  const segments: Record<string, { total: number; churned: number }> = {};

  ageGroups.forEach(group => {
    segments[group] = { total: 0, churned: 0 };
  });

  users.forEach(user => {
    segments[user.ageGroup].total++;
    if (user.riskCategory === 'High') {
      segments[user.ageGroup].churned++;
    }
  });

  return Object.entries(segments).map(([segment, data]) => ({
    segment,
    totalUsers: data.total,
    churnedUsers: data.churned,
    churnRate: data.total > 0 ? Math.round((data.churned / data.total) * 100 * 10) / 10 : 0,
  }));
};

export const getRiskDistribution = (users: UserChurnData[]): { name: string; value: number; fill: string }[] => {
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

// Pre-generated dataset for consistency
export const mockUsers = generateMockUsers(500);
