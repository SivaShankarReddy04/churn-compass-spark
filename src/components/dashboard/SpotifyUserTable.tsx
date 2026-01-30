import { useState, useMemo } from 'react';
import { SpotifyUserData } from '@/data/spotifyChurnData';
import RiskBadge from './RiskBadge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search } from 'lucide-react';

interface SpotifyUserTableProps {
  users: SpotifyUserData[];
}

const SpotifyUserTable = ({ users }: SpotifyUserTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const countries = useMemo(() => {
    return [...new Set(users.map(u => u.country))].sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.user_id.toString().includes(searchQuery);
      const matchesRisk = riskFilter === 'all' || user.riskCategory === riskFilter;
      const matchesSubscription = subscriptionFilter === 'all' || user.subscription_type === subscriptionFilter;
      const matchesCountry = countryFilter === 'all' || user.country === countryFilter;

      return matchesSearch && matchesRisk && matchesSubscription && matchesCountry;
    });
  }, [users, searchQuery, riskFilter, subscriptionFilter, countryFilter]);

  return (
    <div className="chart-container">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border"
          />
        </div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
        <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
          <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
            <SelectValue placeholder="Subscription" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="Free">Free</SelectItem>
            <SelectItem value="Premium">Premium</SelectItem>
          </SelectContent>
        </Select>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map(country => (
              <SelectItem key={country} value={country}>{country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">User ID</TableHead>
              <TableHead className="font-semibold">Plan</TableHead>
              <TableHead className="font-semibold text-center">Age</TableHead>
              <TableHead className="font-semibold">Country</TableHead>
              <TableHead className="font-semibold text-center">Hrs/Week</TableHead>
              <TableHead className="font-semibold text-center">Skips/Week</TableHead>
              <TableHead className="font-semibold text-center">Last Login</TableHead>
              <TableHead className="font-semibold text-center">Churn</TableHead>
              <TableHead className="font-semibold text-center">Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.slice(0, 25).map((user) => (
              <TableRow key={user.user_id} className="border-border/50 hover:bg-muted/20">
                <TableCell className="font-mono text-sm text-muted-foreground">
                  #{user.user_id.toLocaleString()}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    user.subscription_type === 'Premium' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {user.subscription_type}
                  </span>
                </TableCell>
                <TableCell className="text-center">{user.age}</TableCell>
                <TableCell>{user.country}</TableCell>
                <TableCell className="text-center">{user.avg_listening_hours_per_week.toFixed(1)}h</TableCell>
                <TableCell className="text-center">{user.songs_skipped_per_week}</TableCell>
                <TableCell className="text-center">{user.days_since_last_login}d ago</TableCell>
                <TableCell className="text-center font-semibold">
                  <span style={{ 
                    color: user.churn === 0 
                      ? 'hsl(var(--risk-low))' 
                      : 'hsl(var(--risk-high))'
                  }}>
                    {user.churn === 1 ? 'Yes' : 'No'}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <RiskBadge risk={user.riskCategory} size="sm" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <p className="text-sm text-muted-foreground mt-4 text-center">
        Showing {Math.min(25, filteredUsers.length)} of {filteredUsers.length.toLocaleString()} users
      </p>
    </div>
  );
};

export default SpotifyUserTable;
