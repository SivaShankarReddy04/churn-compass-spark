import { useState, useMemo } from 'react';
import { UserChurnData } from '@/data/mockChurnData';
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

interface UserTableProps {
  users: UserChurnData[];
}

const UserTable = ({ users }: UserTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.userId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRisk = riskFilter === 'all' || user.riskCategory === riskFilter;
      const matchesSubscription = subscriptionFilter === 'all' || user.subscriptionType === subscriptionFilter;

      return matchesSearch && matchesRisk && matchesSubscription;
    });
  }, [users, searchQuery, riskFilter, subscriptionFilter]);

  return (
    <div className="chart-container">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
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
            <SelectItem value="Family">Family</SelectItem>
            <SelectItem value="Student">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">User ID</TableHead>
              <TableHead className="font-semibold">Username</TableHead>
              <TableHead className="font-semibold">Plan</TableHead>
              <TableHead className="font-semibold text-center">Tenure</TableHead>
              <TableHead className="font-semibold text-center">Hours/Mo</TableHead>
              <TableHead className="font-semibold text-center">Skip Rate</TableHead>
              <TableHead className="font-semibold text-center">Churn %</TableHead>
              <TableHead className="font-semibold text-center">Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.slice(0, 20).map((user) => (
              <TableRow key={user.userId} className="border-border/50 hover:bg-muted/20">
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {user.userId}
                </TableCell>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                    {user.subscriptionType}
                  </span>
                </TableCell>
                <TableCell className="text-center">{user.tenure} mo</TableCell>
                <TableCell className="text-center">{user.monthlyListeningHours}h</TableCell>
                <TableCell className="text-center">{user.skipRate}%</TableCell>
                <TableCell className="text-center font-semibold">
                  <span style={{ 
                    color: user.churnProbability < 30 
                      ? 'hsl(var(--risk-low))' 
                      : user.churnProbability < 60 
                        ? 'hsl(var(--risk-medium))' 
                        : 'hsl(var(--risk-high))'
                  }}>
                    {user.churnProbability}%
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
        Showing {Math.min(20, filteredUsers.length)} of {filteredUsers.length} users
      </p>
    </div>
  );
};

export default UserTable;
