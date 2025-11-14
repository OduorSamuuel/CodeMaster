import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Code,
  Target,
  Activity,
  Crown,
  Star,
  Zap,
} from 'lucide-react';

import SystemReportsClient from '@/components/ReportsClient';
import { 
  getChallengePerformance, 
  getEngagementMetrics, 
  getPerformanceByLevel, 
  getSystemReportsSummary, 
  getTopPerformers, 
  getUserDistribution, 
  getUserGrowthData 
} from '@/actions';

import type {
  SystemReportsSummary,
  UserGrowthData,
  PerformanceByLevel,
  UserDistribution,
  TopPerformer,
  ChallengePerformance,
  EngagementMetric
} from '@/types';

interface PageProps {
  searchParams: Promise<{
    dateRange?: string;
    reportType?: string;
  }>;
}

export default async function SystemReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const dateRange: string = params.dateRange || 'last_30_days';
  const reportType: string = params.reportType || 'comprehensive';

  // Fetch all data in parallel
  const [
    summary,
    userGrowth,
    performanceByLevel,
    userDistribution,
    topPerformers,
    challengePerformance,
    engagementMetrics
  ]: [
    SystemReportsSummary | null,
    UserGrowthData[] | null,
    PerformanceByLevel[] | null,
    UserDistribution[] | null,
    TopPerformer[] | null,
    ChallengePerformance[] | null,
    EngagementMetric[] | null
  ] = await Promise.all([
    getSystemReportsSummary(dateRange),
    getUserGrowthData(),
    getPerformanceByLevel(),
    getUserDistribution(),
    getTopPerformers(),
    getChallengePerformance(),
    getEngagementMetrics()
  ]);

  // If user is not admin or data fetch failed, show error
  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You don&apos;t have permission to view system reports.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function to get success rate color
  const getSuccessRateColor = (successRate: number) => {
    if (successRate >= 80) return 'bg-green-500'; // Excellent
    if (successRate >= 60) return 'bg-blue-500';  // Good
    if (successRate >= 40) return 'bg-yellow-500'; // Average
    if (successRate >= 20) return 'bg-orange-500'; // Below Average
    return 'bg-red-500'; // Poor
  };

  // Helper function to get success rate badge variant
  const getSuccessRateBadgeVariant = (successRate: number) => {
    if (successRate >= 80) return 'default';
    if (successRate >= 60) return 'secondary';
    if (successRate >= 40) return 'outline';
    return 'destructive';
  };

  // Helper function to get difficulty badge color based on kyu rank
  const getDifficultyBadgeColor = (kyuRank: string) => {
    const rankMap: Record<string, string> = {
      '8 kyu': 'bg-green-100 text-green-800 border-green-300',
      '7 kyu': 'bg-green-100 text-green-800 border-green-300',
      '6 kyu': 'bg-blue-100 text-blue-800 border-blue-300',
      '5 kyu': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      '4 kyu': 'bg-orange-100 text-orange-800 border-orange-300',
      '3 kyu': 'bg-red-100 text-red-800 border-red-300',
      '2 kyu': 'bg-purple-100 text-purple-800 border-purple-300',
      '1 kyu': 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return rankMap[kyuRank] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Helper function to get difficulty icon
  const getDifficultyIcon = (kyuRank: string) => {
    if (kyuRank.includes('8 kyu') || kyuRank.includes('7 kyu')) return <Star className="w-3 h-3" />;
    if (kyuRank.includes('6 kyu') || kyuRank.includes('5 kyu')) return <Zap className="w-3 h-3" />;
    return <Crown className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6 p-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{summary.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{summary.newUsersThisMonth} this month
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{summary.activeUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.totalUsers > 0 
                    ? ((summary.activeUsers / summary.totalUsers) * 100).toFixed(1)
                    : 0}% of total
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{summary.totalSubmissions.toLocaleString()}</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {dateRange === 'last_30_days' ? 'Last 30 days' : 'In period'}
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
                <p className="text-sm text-muted-foreground">Avg Completion Rate</p>
                <p className="text-2xl font-bold">{summary.avgCompletionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.totalChallenges} total challenges
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      {engagementMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>Key performance indicators for user engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {engagementMetrics.map((metric: EngagementMetric, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{metric.metric}</p>
                    {metric.status === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className={`text-xs mt-1 ${metric.status === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.trend} vs last period
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      {topPerformers && topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top {topPerformers.length} Performers</CardTitle>
            <CardDescription>Users with highest XP and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topPerformers.map((user: TopPerformer) => (
                <div key={user.rank} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      user.rank === 1 ? 'bg-yellow-500 text-white' :
                      user.rank === 2 ? 'bg-gray-400 text-white' :
                      user.rank === 3 ? 'bg-orange-600 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {user.rank}
                    </div>
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        Level {user.level} • {user.challengesCompleted} challenges • {user.streak} day streak
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{user.xp.toLocaleString()} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenge Performance */}
      {challengePerformance && challengePerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Challenge Performance by Difficulty</CardTitle>
            <CardDescription>Success rates and average completion times by kyu rank</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {challengePerformance.map((challenge: ChallengePerformance, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 ${getDifficultyBadgeColor(challenge.difficulty)}`}
                      >
                        {getDifficultyIcon(challenge.difficulty)}
                        {challenge.difficulty}
                      </Badge>
                      <Badge variant={getSuccessRateBadgeVariant(challenge.successRate)}>
                        {challenge.successRate}% Success
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {challenge.completed.toLocaleString()} / {challenge.attempted.toLocaleString()} completed
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">Avg time: {challenge.avgTime}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className={`font-semibold ${
                        challenge.successRate >= 80 ? 'text-green-600' :
                        challenge.successRate >= 60 ? 'text-blue-600' :
                        challenge.successRate >= 40 ? 'text-yellow-600' :
                        challenge.successRate >= 20 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {challenge.successRate}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getSuccessRateColor(challenge.successRate)}`}
                        style={{ width: `${Math.min(challenge.successRate, 100)}%` }}
                      />
                    </div>
                    {/* Additional metrics if available */}
                    {(challenge.avgTestPassRate || challenge.perfectSolves) && (
                      <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                        {challenge.avgTestPassRate && (
                          <span>Test Pass Rate: {challenge.avgTestPassRate}%</span>
                        )}
                        {challenge.perfectSolves && (
                          <span>Perfect Solves: {challenge.perfectSolves}</span>
                        )}
                        {challenge.totalChallenges && (
                          <span>Total Challenges: {challenge.totalChallenges}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client-side interactive components (charts) */}
      <SystemReportsClient 
        userGrowth={userGrowth || []}
        performanceByLevel={performanceByLevel || []}
        userDistribution={userDistribution || []}
        dateRange={dateRange}
        reportType={reportType}
      />
    </div>
  );
}