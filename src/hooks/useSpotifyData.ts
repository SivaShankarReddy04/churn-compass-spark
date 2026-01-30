import { useState, useEffect } from 'react';
import { SpotifyUserData, parseCSVData } from '@/data/spotifyChurnData';

interface UseSpotifyDataResult {
  users: SpotifyUserData[];
  loading: boolean;
  error: string | null;
}

export const useSpotifyData = (sampleSize: number = 10000): UseSpotifyDataResult => {
  const [users, setUsers] = useState<SpotifyUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/spotify_users.csv');
        if (!response.ok) {
          throw new Error('Failed to load data');
        }
        const csvText = await response.text();
        const allUsers = parseCSVData(csvText);
        
        // Sample data for performance (434k+ rows is too large for frontend)
        // Take a representative sample
        const step = Math.max(1, Math.floor(allUsers.length / sampleSize));
        const sampledUsers = allUsers.filter((_, index) => index % step === 0).slice(0, sampleSize);
        
        setUsers(sampledUsers);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sampleSize]);

  return { users, loading, error };
};
