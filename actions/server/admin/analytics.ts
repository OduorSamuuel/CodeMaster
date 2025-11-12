'use server';

import { createClient } from '@/lib/supabase/server';
import { DashboardStats, DifficultyDistribution, TopChallenge, WeeklyActivity } from '@/types';
import { revalidatePath } from 'next/cache';




/**
 * Get dashboard overview statistics
 */
export async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const supabase = await createClient();

    const isAdmin = await checkAdminRole();
    if (!isAdmin) return null;

    // Get total users
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: activeToday } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', today.toISOString());

    // Get active yesterday for growth calculation
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { count: activeYesterday } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', yesterday.toISOString())
      .lt('last_login', today.toISOString());

    // Get total challenges
    const { count: totalChallenges } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });

    // Get challenges added this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { count: challengesAddedThisWeek } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    // Get total submissions
    const { count: totalSubmissions } = await supabase
      .from('user_solutions')
      .select('*', { count: 'exact', head: true });

    // Get completed submissions for completion rate
    const { count: completedSubmissions } = await supabase
      .from('user_solutions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const completionRate = totalSubmissions 
      ? Math.round((completedSubmissions! / totalSubmissions!) * 1000) / 10
      : 0;

    // Get completion rate from last week
    const { count: lastWeekTotal } = await supabase
      .from('user_solutions')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', weekAgo.toISOString());

    const { count: lastWeekCompleted } = await supabase
      .from('user_solutions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .lt('created_at', weekAgo.toISOString());

    const lastWeekRate = lastWeekTotal 
      ? (lastWeekCompleted! / lastWeekTotal!) * 100
      : 0;
    
    const completionRateGrowth = lastWeekRate > 0 
      ? Math.round((completionRate - lastWeekRate) * 10) / 10
      : 0;

    // Calculate average session time from completed solutions
    const { data: completedSolutions } = await supabase
      .from('user_solutions')
      .select('completion_time')
      .eq('status', 'completed')
      .not('completion_time', 'is', null)
      .limit(1000);

    const avgTime = completedSolutions && completedSolutions.length > 0
      ? completedSolutions.reduce((acc, s) => acc + (s.completion_time || 0), 0) / completedSolutions.length
      : 0;

    const avgSessionTime = `${Math.round(avgTime / 60)}m`;

    // User growth (comparing this month vs last month)
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const { count: usersLastMonth } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', monthAgo.toISOString());

    const userGrowth = usersLastMonth && totalUsers
      ? Math.round(((totalUsers - usersLastMonth) / usersLastMonth) * 100)
      : 0;

    // Active today growth
    const activeTodayGrowth = activeYesterday && activeToday
      ? Math.round(((activeToday - activeYesterday) / activeYesterday) * 100)
      : 0;

    return {
      totalUsers: totalUsers || 0,
      activeToday: activeToday || 0,
      totalChallenges: totalChallenges || 0,
      completionRate,
      avgSessionTime,
      totalSubmissions: totalSubmissions || 0,
      userGrowth,
      activeTodayGrowth,
      challengesAddedThisWeek: challengesAddedThisWeek || 0,
      completionRateGrowth
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

/**
 * Get weekly activity data
 */
export async function getWeeklyActivity(): Promise<WeeklyActivity[] | null> {
  try {
    const supabase = await createClient();

    const isAdmin = await checkAdminRole();
    if (!isAdmin) return null;

    const weeklyData: WeeklyActivity[] = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dateStr = date.toISOString();
      const nextDateStr = nextDate.toISOString();

      // Active users for this day
      const { count: users } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', dateStr)
        .lt('last_login', nextDateStr);

      // Submissions for this day
      const { count: submissions } = await supabase
        .from('user_solutions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dateStr)
        .lt('created_at', nextDateStr);

      // Completions for this day
      const { count: completions } = await supabase
        .from('user_solutions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', dateStr)
        .lt('created_at', nextDateStr);

      weeklyData.push({
        day: days[date.getDay()],
        users: users || 0,
        submissions: submissions || 0,
        completions: completions || 0
      });
    }

    return weeklyData;
  } catch (error) {
    console.error('Error fetching weekly activity:', error);
    return null;
  }
}

/**
 * Get difficulty distribution
 */
export async function getDifficultyDistribution(): Promise<DifficultyDistribution[] | null> {
  try {
    const supabase = await createClient();

    const isAdmin = await checkAdminRole();
    if (!isAdmin) return null;

    const { count: totalChallenges } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });

    if (!totalChallenges) return [];

    // Easy: rank 1-3
    const { count: easy } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .lte('rank', 3);

    // Medium: rank 4-6
    const { count: medium } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .gte('rank', 4)
      .lte('rank', 6);

    // Hard: rank 7-8
    const { count: hard } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .gte('rank', 7);

    return [
      { 
        name: 'Easy', 
        value: Math.round((easy! / totalChallenges) * 100), 
        color: '#10b981' 
      },
      { 
        name: 'Medium', 
        value: Math.round((medium! / totalChallenges) * 100), 
        color: '#f59e0b' 
      },
      { 
        name: 'Hard', 
        value: Math.round((hard! / totalChallenges) * 100), 
        color: '#ef4444' 
      }
    ];
  } catch (error) {
    console.error('Error fetching difficulty distribution:', error);
    return null;
  }
}

/**
 * Get top performing challenges
 */
export async function getTopChallenges(): Promise<TopChallenge[] | null> {
  try {
    const supabase = await createClient();

    const isAdmin = await checkAdminRole();
    if (!isAdmin) return null;

    // Get all exercises with their completion stats
    const { data: exercises } = await supabase
      .from('exercises')
      .select('id, name')
      .limit(50);

    if (!exercises) return [];

    // Get completion counts for each exercise
    const challengeStats = await Promise.all(
      exercises.map(async (exercise) => {
        const { count: completions } = await supabase
          .from('user_solutions')
          .select('*', { count: 'exact', head: true })
          .eq('exercise_id', exercise.id)
          .eq('status', 'completed');

        const { data: solutions } = await supabase
          .from('user_solutions')
          .select('completion_time')
          .eq('exercise_id', exercise.id)
          .eq('status', 'completed')
          .not('completion_time', 'is', null);

        const avgTime = solutions && solutions.length > 0
          ? solutions.reduce((acc, s) => acc + (s.completion_time || 0), 0) / solutions.length
          : 0;

        // Calculate rating based on completion rate and average time
        const { count: totalAttempts } = await supabase
          .from('user_solutions')
          .select('*', { count: 'exact', head: true })
          .eq('exercise_id', exercise.id);

        const completionRate = totalAttempts 
          ? (completions! / totalAttempts) * 100
          : 0;

        // Simple rating: higher completion rate = better rating
        const rating = Math.min(5, Math.max(3, 3 + (completionRate / 25)));

        return {
          id: exercise.id,
          title: exercise.name,
          completions: completions || 0,
          avgTime: `${Math.round(avgTime / 60)}m`,
          rating: Math.round(rating * 10) / 10
        };
      })
    );

    // Sort by completions and return top 5
    return challengeStats
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching top challenges:', error);
    return null;
  }
}

export interface AdminStats {
  activeUsers: number;
  todaySubmissions: number;
  totalUsers: number;
  totalChallenges: number;
  pendingReports: number;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  role: string;
  level: number;
  total_points: number;
  total_solved: number;
  current_streak: number;
}

/**
 * Check if current user is admin
 */
export async function checkAdminRole(): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;
    
    if (!user?.sub) {
      return false;
    }

    // Check if user has admin role in user_profiles
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.sub)
      .single();

    if (error || !profile) {
      return false;
    }

    return profile.role === 'admin';
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
}



/**
 * Get admin dashboard stats
 */
export async function getAdminStats(): Promise<AdminStats | null> {
  try {
    const supabase = await createClient();

    // Verify admin role
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return null;
    }

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (users who logged in within last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { count: activeUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', yesterday.toISOString());

    // Get today's submissions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: todaySubmissions } = await supabase
      .from('user_solutions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get total challenges
    const { count: totalChallenges } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });

    // Get pending reports (assuming you have a reports table)
    const { count: pendingReports } = await supabase
      .from('user_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    return {
      activeUsers: activeUsers || 0,
      todaySubmissions: todaySubmissions || 0,
      totalUsers: totalUsers || 0,
      totalChallenges: totalChallenges || 0,
      pendingReports: pendingReports || 0,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return null;
  }
}


/**
 * Get pending reports (admin only)
 */
export async function getPendingReports(
  page = 1,
  limit = 20
): Promise<{ reports: any[]; total: number } | null> {
  try {
    const supabase = await createClient();

    // Verify admin role
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return null;
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: reports, error, count } = await supabase
      .from('user_reports')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return null;
    }

    return {
      reports: reports || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching pending reports:', error);
    return null;
  }
}

/**
 * Update report status (admin only)
 */
export async function updateReportStatus(
  reportId: string,
  status: 'pending' | 'resolved' | 'dismissed'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify admin role
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('user_reports')
      .update({ status, resolved_at: new Date().toISOString() })
      .eq('id', reportId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/users/reports');
    return { success: true };
  } catch (error) {
    console.error('Error updating report status:', error);
    return { success: false, error: 'Failed to update report status' };
  }
}