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
} from 'lucide-react';

import SystemReportsClient from '@/components/ReportsClient';
import { getChallengePerformance, getEngagementMetrics, getPerformanceByLevel, getSystemReportsSummary, getTopPerformers, getUserDistribution, getUserGrowthData } from '@/actions';


interface PageProps {
  searchParams: Promise<{
    dateRange?: string;
    reportType?: string;
  }>;
}

export default async function SystemReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const dateRange = params.dateRange || 'last_30_days';
  const reportType = params.reportType || 'comprehensive';

  console.log('📊 Loading System Reports page with:', { dateRange, reportType });

  // Fetch all data in parallel
  const [
    summary,
    userGrowth,
    performanceByLevel,
    userDistribution,
    topPerformers,
    challengePerformance,
    engagementMetrics
  ] = await Promise.all([
    getSystemReportsSummary(dateRange),
    getUserGrowthData(dateRange),
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
              You don't have permission to view system reports.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {engagementMetrics.map((metric, index) => (
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
              {topPerformers.map((user) => (
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
            <CardDescription>Success rates and average completion times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {challengePerformance.map((challenge, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        challenge.difficulty === 'Easy' ? 'default' :
                        challenge.difficulty === 'Medium' ? 'secondary' : 'destructive'
                      }>
                        {challenge.difficulty}
                      </Badge>
                      <span className="font-semibold">
                        {challenge.completed.toLocaleString()} / {challenge.attempted.toLocaleString()} completed
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">Avg time: {challenge.avgTime}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="font-semibold">{challenge.successRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          challenge.difficulty === 'Easy' ? 'bg-green-500' :
                          challenge.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${challenge.successRate}%` }}
                      />
                    </div>
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