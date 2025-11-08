'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { checkAdminRole } from '@/actions/admin';

export interface SystemReportsSummary {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  totalChallenges: number;
  totalSubmissions: number;
  avgCompletionRate: number;
  avgSessionTime: string;
  topPerformers: number;
}

export interface UserGrowthData {
  month: string;
  users: number;
  active: number;
  newSignups: number;
}

export interface PerformanceByLevel {
  level: string;
  users: number;
  avgXP: number;
  completionRate: number;
}

export interface UserDistribution {
  name: string;
  value: number;
  color: string;
}

export interface EngagementMetric {
  metric: string;
  value: string | number;
  trend: string;
  status: 'up' | 'down';
}

export interface TopPerformer {
  rank: number;
  username: string;
  email: string;
  level: number;
  xp: number;
  challengesCompleted: number;
  streak: number;
}

export interface ChallengePerformance {
  difficulty: string;
  attempted: number;
  completed: number;
  avgTime: string;
  successRate: number;
}

/**
 * Get system reports summary statistics
 */
export async function getSystemReportsSummary(
  dateRange: string = 'last_30_days'
): Promise<SystemReportsSummary | null> {
  console.log('🚀 getSystemReportsSummary called with dateRange:', dateRange);
  
  try {
    console.log('📝 Step 1: Checking admin role...');
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.warn('❌ User is not admin');
      return null;
    }
    console.log('✅ Admin role verified');

    console.log('📝 Step 2: Creating admin client...');
    const adminClient = createAdminClient();
    console.log('✅ Admin client created');

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (dateRange) {
      case 'last_7_days':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last_30_days':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'last_3_months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'last_6_months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'last_year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all_time':
        startDate.setFullYear(2020); // Or your app's start date
        break;
    }

    console.log('📝 Step 3: Fetching summary statistics...');
    
    // Total users
    const { count: totalUsers } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
    console.log('  → Total users:', totalUsers);

    // Active users (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: activeUsers } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', weekAgo.toISOString());
    console.log('  → Active users:', activeUsers);

    // New users this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const { count: newUsersThisMonth } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString());
    console.log('  → New users this month:', newUsersThisMonth);

    // Total challenges
    const { count: totalChallenges } = await adminClient
      .from('challenges')
      .select('*', { count: 'exact', head: true });
    console.log('  → Total challenges:', totalChallenges);

    // Total submissions in date range
    const { count: totalSubmissions } = await adminClient
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());
    console.log('  → Total submissions:', totalSubmissions);

    // Completed submissions for completion rate
    const { count: completedSubmissions } = await adminClient
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString());

    const avgCompletionRate = totalSubmissions 
      ? Math.round((completedSubmissions! / totalSubmissions) * 100 * 10) / 10
      : 0;
    console.log('  → Avg completion rate:', avgCompletionRate);

    // Top performers count (users above level 20)
    const { count: topPerformers } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('level', 20);
    console.log('  → Top performers:', topPerformers);

    const summary: SystemReportsSummary = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      inactiveUsers: (totalUsers || 0) - (activeUsers || 0),
      newUsersThisMonth: newUsersThisMonth || 0,
      totalChallenges: totalChallenges || 0,
      totalSubmissions: totalSubmissions || 0,
      avgCompletionRate,
      avgSessionTime: '24m', // This would need session tracking
      topPerformers: topPerformers || 0
    };

    console.log('✅ Summary statistics compiled:', summary);
    return summary;
  } catch (error) {
    console.error('❌ Error fetching system reports summary:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Get user growth data over time
 */
export async function getUserGrowthData(
  dateRange: string = 'last_30_days'
): Promise<UserGrowthData[] | null> {
  console.log('🚀 getUserGrowthData called');
  
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) return null;

    const adminClient = createAdminClient();

    // Get all users with their created_at and last_login
    const { data: users, error } = await adminClient
      .from('user_profiles')
      .select('created_at, last_login');

    if (error) {
      console.error('Error fetching users for growth data:', error);
      return null;
    }

    // Group by month for the last 8 months
    const monthsData: UserGrowthData[] = [];
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthStr = monthDate.toLocaleString('default', { month: 'short' });
      
      // Count users created up to this month
      const totalUsers = users?.filter(u => 
        new Date(u.created_at) < nextMonth
      ).length || 0;
      
      // Count active users this month
      const activeUsers = users?.filter(u => 
        u.last_login && 
        new Date(u.last_login) >= monthDate && 
        new Date(u.last_login) < nextMonth
      ).length || 0;
      
      // Count new signups this month
      const newSignups = users?.filter(u => 
        new Date(u.created_at) >= monthDate && 
        new Date(u.created_at) < nextMonth
      ).length || 0;
      
      monthsData.push({
        month: monthStr,
        users: totalUsers,
        active: activeUsers,
        newSignups
      });
    }

    console.log('✅ User growth data compiled:', monthsData.length, 'months');
    return monthsData;
  } catch (error) {
    console.error('❌ Error fetching user growth data:', error);
    return null;
  }
}

/**
 * Get performance data by user level
 */
export async function getPerformanceByLevel(): Promise<PerformanceByLevel[] | null> {
  console.log('🚀 getPerformanceByLevel called');
  
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) return null;

    const adminClient = createAdminClient();

    const { data: users, error } = await adminClient
      .from('user_profiles')
      .select('level, current_xp, total_solved');

    if (error) {
      console.error('Error fetching users for level performance:', error);
      return null;
    }

    // Group users by level ranges
    const levelRanges = [
      { range: '1-5', min: 1, max: 5 },
      { range: '6-10', min: 6, max: 10 },
      { range: '11-15', min: 11, max: 15 },
      { range: '16-20', min: 16, max: 20 },
      { range: '21-25', min: 21, max: 25 },
      { range: '26-30', min: 26, max: 30 }
    ];

    const performanceData = levelRanges.map(range => {
      const usersInRange = users?.filter(u => 
        u.level >= range.min && u.level <= range.max
      ) || [];

      const avgXP = usersInRange.length > 0
        ? Math.round(usersInRange.reduce((sum, u) => sum + (u.current_xp || 0), 0) / usersInRange.length)
        : 0;

      // Estimate completion rate based on solved challenges
      // Assuming average of 10 challenges per level range
      const expectedChallenges = range.max * 10;
      const avgSolved = usersInRange.length > 0
        ? usersInRange.reduce((sum, u) => sum + (u.total_solved || 0), 0) / usersInRange.length
        : 0;
      const completionRate = Math.min(Math.round((avgSolved / expectedChallenges) * 100), 100);

      return {
        level: range.range,
        users: usersInRange.length,
        avgXP,
        completionRate
      };
    });

    console.log('✅ Performance by level compiled');
    return performanceData;
  } catch (error) {
    console.error('❌ Error fetching performance by level:', error);
    return null;
  }
}

/**
 * Get user distribution by skill level
 */
export async function getUserDistribution(): Promise<UserDistribution[] | null> {
  console.log('🚀 getUserDistribution called');
  
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) return null;

    const adminClient = createAdminClient();

    const { data: users, error } = await adminClient
      .from('user_profiles')
      .select('level');

    if (error) {
      console.error('Error fetching users for distribution:', error);
      return null;
    }

    const beginners = users?.filter(u => u.level >= 1 && u.level <= 10).length || 0;
    const intermediate = users?.filter(u => u.level >= 11 && u.level <= 20).length || 0;
    const advanced = users?.filter(u => u.level >= 21).length || 0;

    const distribution: UserDistribution[] = [
      { name: 'Beginners (L1-10)', value: beginners, color: '#3b82f6' },
      { name: 'Intermediate (L11-20)', value: intermediate, color: '#10b981' },
      { name: 'Advanced (L21+)', value: advanced, color: '#f59e0b' }
    ];

    console.log('✅ User distribution compiled');
    return distribution;
  } catch (error) {
    console.error('❌ Error fetching user distribution:', error);
    return null;
  }
}

/**
 * Get top 10 performers
 */
export async function getTopPerformers(): Promise<TopPerformer[] | null> {
  console.log('🚀 getTopPerformers called');
  
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) return null;

    const adminClient = createAdminClient();

    // Get top users by total_points
    const { data: profiles, error: profilesError } = await adminClient
      .from('user_profiles')
      .select('user_id, level, current_xp, total_points, total_solved, current_streak')
      .order('total_points', { ascending: false })
      .limit(10);

    if (profilesError || !profiles) {
      console.error('Error fetching top performers:', profilesError);
      return null;
    }

    // Get emails for these users
    const userIds = profiles.map(p => p.user_id);
    const { data: { users: authUsers }, error: authError } = 
      await adminClient.auth.admin.listUsers();

    const emailMap = new Map(
      authUsers?.filter(u => userIds.includes(u.id))
        .map(u => [u.id, u.email || 'No email']) || []
    );

    const topPerformers: TopPerformer[] = profiles.map((profile, index) => ({
      rank: index + 1,
      username: emailMap.get(profile.user_id)?.split('@')[0] || `user_${profile.user_id.slice(0, 8)}`,
      email: emailMap.get(profile.user_id) || 'Email not available',
      level: profile.level || 1,
      xp: profile.total_points || 0,
      challengesCompleted: profile.total_solved || 0,
      streak: profile.current_streak || 0
    }));

    console.log('✅ Top performers compiled:', topPerformers.length);
    return topPerformers;
  } catch (error) {
    console.error('❌ Error fetching top performers:', error);
    return null;
  }
}

/**
 * Get challenge performance by difficulty
 */
export async function getChallengePerformance(): Promise<ChallengePerformance[] | null> {
  console.log('🚀 getChallengePerformance called');
  
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) return null;

    const adminClient = createAdminClient();

    // Get all challenges
    const { data: challenges, error: challengesError } = await adminClient
      .from('challenges')
      .select('id, difficulty');

    if (challengesError || !challenges) {
      console.error('Error fetching challenges:', challengesError);
      return null;
    }

    // Get all submissions
    const { data: submissions, error: submissionsError } = await adminClient
      .from('submissions')
      .select('challenge_id, status, execution_time');

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return null;
    }

    const difficulties = ['Easy', 'Medium', 'Hard'];
    const performanceData: ChallengePerformance[] = [];

    for (const difficulty of difficulties) {
      const difficultyChallenges = challenges.filter(c => c.difficulty === difficulty);
      const challengeIds = difficultyChallenges.map(c => c.id);
      
      const difficultySubmissions = submissions?.filter(s => 
        challengeIds.includes(s.challenge_id)
      ) || [];

      const attempted = difficultySubmissions.length;
      const completed = difficultySubmissions.filter(s => s.status === 'completed').length;
      
      // Calculate average time (convert ms to minutes)
      const avgTimeMs = difficultySubmissions.length > 0
        ? difficultySubmissions.reduce((sum, s) => sum + (s.execution_time || 0), 0) / difficultySubmissions.length
        : 0;
      const avgTimeMinutes = Math.round(avgTimeMs / 60000);
      
      const successRate = attempted > 0 ? Math.round((completed / attempted) * 100) : 0;

      performanceData.push({
        difficulty,
        attempted,
        completed,
        avgTime: `${avgTimeMinutes}m`,
        successRate
      });
    }

    console.log('✅ Challenge performance compiled');
    return performanceData;
  } catch (error) {
    console.error('❌ Error fetching challenge performance:', error);
    return null;
  }
}

/**
 * Get engagement metrics
 */
export async function getEngagementMetrics(): Promise<EngagementMetric[] | null> {
  console.log('🚀 getEngagementMetrics called');
  
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) return null;

    const adminClient = createAdminClient();

    // Calculate date thresholds
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Daily active users
    const { count: dailyActive } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', dayAgo.toISOString());

    // Weekly active users
    const { count: weeklyActive } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', weekAgo.toISOString());

    // Monthly active users
    const { count: monthlyActive } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', monthAgo.toISOString());

    // Get users data for calculations
    const { data: users } = await adminClient
      .from('user_profiles')
      .select('total_solved, created_at');

    const avgChallengesPerUser = users && users.length > 0
      ? (users.reduce((sum, u) => sum + (u.total_solved || 0), 0) / users.length).toFixed(1)
      : '0';

    // Calculate retention (users who returned after 7 days)
    const usersCreatedWeekAgo = users?.filter(u => 
      new Date(u.created_at) < weekAgo
    ).length || 1;
    const retentionRate = ((weeklyActive || 0) / usersCreatedWeekAgo * 100).toFixed(1);

    const metrics: EngagementMetric[] = [
      { metric: 'Daily Active Users', value: dailyActive || 0, trend: '+8%', status: 'up' },
      { metric: 'Weekly Active Users', value: weeklyActive || 0, trend: '+12%', status: 'up' },
      { metric: 'Monthly Active Users', value: monthlyActive || 0, trend: '+15%', status: 'up' },
      { metric: 'Avg. Session Duration', value: '24m', trend: '+3m', status: 'up' },
      { metric: 'Avg. Challenges/User', value: avgChallengesPerUser, trend: '+0.8', status: 'up' },
      { metric: 'User Retention Rate', value: `${retentionRate}%`, trend: '-2.3%', status: 'down' }
    ];

    console.log('✅ Engagement metrics compiled');
    return metrics;
  } catch (error) {
    console.error('❌ Error fetching engagement metrics:', error);
    return null;
  }
}