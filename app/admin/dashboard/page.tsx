import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, Code, Activity, Target, Star
} from 'lucide-react';

import DashboardCharts from '@/components/DashboardCharts';
import { getDashboardStats, getDifficultyDistribution, getTopChallenges, getWeeklyActivity } from '@/actions';


export default async function AdminDashboardPage() {
  // Fetch all data in parallel
  const [stats, weeklyActivity, difficultyDistribution, topChallenges] = await Promise.all([
    getDashboardStats(),
    getWeeklyActivity(),
    getDifficultyDistribution(),
    getTopChallenges()
  ]);

  // Helper function to format growth indicator
  const formatGrowth = (value: number) => {
    const sign = value > 0 ? '+' : '';
    const color = value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-muted-foreground';
    return (
      <p className={`text-xs ${color} mt-1`}>
        {sign}{value}% {value > 0 ? 'increase' : value < 0 ? 'decrease' : 'no change'}
      </p>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Platform performance and key metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">
                  {stats?.totalUsers.toLocaleString() || 0}
                </p>
                {stats && formatGrowth(stats.userGrowth)}
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold">
                  {stats?.activeToday || 0}
                </p>
                {stats && formatGrowth(stats.activeTodayGrowth)}
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Challenges</p>
                <p className="text-2xl font-bold">
                  {stats?.totalChallenges || 0}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  {stats?.challengesAddedThisWeek || 0} added this week
                </p>
              </div>
              <Code className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {stats?.completionRate || 0}%
                </p>
                {stats && formatGrowth(stats.completionRateGrowth)}
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Component */}
      <DashboardCharts 
        weeklyActivity={weeklyActivity || []}
        difficultyDistribution={difficultyDistribution || []}
      />

      {/* Top Challenges */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Challenges</CardTitle>
          <CardDescription>Most completed challenges this month</CardDescription>
        </CardHeader>
        <CardContent>
          {topChallenges && topChallenges.length > 0 ? (
            <div className="space-y-3">
              {topChallenges.map((challenge, index) => (
                <div 
                  key={challenge.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{challenge.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {challenge.completions.toLocaleString()} completions • Avg: {challenge.avgTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{challenge.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No challenge data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Submissions</p>
            <p className="text-3xl font-bold">{stats?.totalSubmissions.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Avg Session Time</p>
            <p className="text-3xl font-bold">{stats?.avgSessionTime || '0m'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Platform Engagement</p>
            <p className="text-3xl font-bold">
              {stats ? Math.round((stats.activeToday / stats.totalUsers) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Active users today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}