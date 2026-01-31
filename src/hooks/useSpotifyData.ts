import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SpotifyUserData, parseCSVData, deriveRiskCategory } from '@/data/spotifyChurnData';

interface UseSpotifyDataResult {
  users: SpotifyUserData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSpotifyData = (sampleSize: number = 10000): UseSpotifyDataResult => {
  const [users, setUsers] = useState<SpotifyUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromDatabase = async (): Promise<SpotifyUserData[] | null> => {
    try {
      const { data, error: dbError } = await supabase
        .from('spotify_users')
        .select('*')
        .limit(sampleSize);

      if (dbError) throw dbError;

      if (data && data.length > 0) {
        return data.map(row => ({
          user_id: row.user_id,
          subscription_type: row.subscription_type as 'Free' | 'Premium',
          age: row.age,
          country: row.country,
          avg_listening_hours_per_week: Number(row.avg_listening_hours_per_week),
          login_frequency_per_week: row.login_frequency_per_week,
          songs_skipped_per_week: row.songs_skipped_per_week,
          playlists_created: row.playlists_created,
          days_since_last_login: row.days_since_last_login,
          monthly_spend_usd: Number(row.monthly_spend_usd),
          churn: row.churn as 0 | 1,
          riskCategory: row.risk_category as 'Low' | 'Medium' | 'High',
        }));
      }
      return null;
    } catch {
      return null;
    }
  };

  const loadFromCSV = async (): Promise<SpotifyUserData[]> => {
    const response = await fetch('/data/spotify_users.csv');
    if (!response.ok) {
      throw new Error('Failed to load data');
    }
    const csvText = await response.text();
    const allUsers = parseCSVData(csvText);
    
    // Sample data for performance (434k+ rows is too large for frontend)
    const step = Math.max(1, Math.floor(allUsers.length / sampleSize));
    return allUsers.filter((_, index) => index % step === 0).slice(0, sampleSize);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try database first
      const dbUsers = await loadFromDatabase();
      
      if (dbUsers) {
        setUsers(dbUsers);
        setError(null);
      } else {
        // Fall back to CSV if database is empty
        const csvUsers = await loadFromCSV();
        setUsers(csvUsers);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sampleSize]);

  return { users, loading, error, refetch: loadData };
};
