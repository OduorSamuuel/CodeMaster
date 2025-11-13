'use server';

import { createClient } from "@/lib/supabase/server";



export interface UserProgress {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  streak: number;
  lastActiveDate: string;
  exercisesCompletedToday: number;
  dailyGoal: number;
  totalSolved: number;
  totalPoints: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  total?: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  points: number;
  solvedToday: number;
  isCurrentUser?: boolean;
}

export interface ActiveMultiplier {
  type: string;
  value: number;
  expiresAt: string;
  hoursRemaining: number;
}

export interface MysteryBoxReward {
  progress: number;
  total: number;
  isClaimed: boolean;
}

/**
 * Fetch user progress for dashboard
 */
export async function fetchUserProgress(): Promise<UserProgress | null> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        level,
        current_xp,
        xp_to_next_level,
        total_points,
        current_streak,
        last_activity,
        exercises_completed_today,
        daily_goal,
        total_solved
      `)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error('Error fetching user progress:', error);
      return null;
    }

    return {
      level: data.level || 1,
      currentXP: data.current_xp || 0,
      xpToNextLevel: data.xp_to_next_level || 100,
      totalXP: data.total_points || 0,
      streak: data.current_streak || 0,
      lastActiveDate: data.last_activity || new Date().toISOString(),
      exercisesCompletedToday: data.exercises_completed_today || 0,
      dailyGoal: data.daily_goal || 5,
      totalSolved: data.total_solved || 0,
      totalPoints: data.total_points || 0
    };
  } catch (error) {
    console.error('Fetch user progress error:', error);
    return null;
  }
}

/**
 * Fetch user achievements
 */
export async function fetchUserAchievements(): Promise<Achievement[]> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        achievement_id,
        progress,
        total,
        earned_at,
        achievements (
          name,
          description,
          icon
        )
      `)
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(4);

    if (error || !data) {
      return [];
    }

    return data.map((item: any) => ({
      id: item.achievement_id,
      name: item.achievements?.name || 'Unknown',
      description: item.achievements?.description || '',
      icon: item.achievements?.icon || '🏆',
      unlockedAt: item.progress >= item.total ? item.earned_at : undefined,
      progress: item.progress,
      total: item.total
    }));
  } catch (error) {
    console.error('Fetch achievements error:', error);
    return [];
  }
}

/**
 * Fetch today's leaderboard
 */
export async function fetchTodayLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    // Get today's leaderboard snapshot
    const { data, error } = await supabase
      .from('leaderboard_snapshots')
      .select('*')
      .eq('period_type', 'daily')
      .eq('period_date', new Date().toISOString().split('T')[0])
      .order('rank', { ascending: true })
      .limit(10);

    if (error || !data) {
      // If no snapshot exists yet, create one
      await supabase.rpc('update_daily_leaderboard');
      return [];
    }

    return data.map((entry: any) => ({
      rank: entry.rank,
      username: entry.username || 'Anonymous',
      avatar: entry.avatar || '👤',
      points: entry.points,
      solvedToday: entry.challenges_solved,
      isCurrentUser: entry.user_id === currentUserId
    }));
  } catch (error) {
    console.error('Fetch leaderboard error:', error);
    return [];
  }
}

/**
 * Fetch active XP multipliers
 */
export async function fetchActiveMultipliers(): Promise<ActiveMultiplier[]> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return [];
    }

    const { data, error } = await supabase
      .from('active_multipliers')
      .select('*')
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((mult: any) => {
      const expiresAt = new Date(mult.expires_at);
      const now = new Date();
      const hoursRemaining = Math.max(0, (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      return {
        type: mult.multiplier_type,
        value: parseFloat(mult.multiplier_value),
        expiresAt: mult.expires_at,
        hoursRemaining: Math.round(hoursRemaining * 100) / 100
      };
    });
  } catch (error) {
    console.error('Fetch multipliers error:', error);
    return [];
  }
}

/**
 * Fetch mystery box progress
 */
export async function fetchMysteryBoxProgress(): Promise<MysteryBoxReward | null> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', user.id)
      .eq('reward_type', 'mystery_box')
      .single();

    if (error || !data) {
      return {
        progress: 0,
        total: 5,
        isClaimed: false
      };
    }

    return {
      progress: data.progress || 0,
      total: data.total_required || 5,
      isClaimed: data.is_claimed || false
    };
  } catch (error) {
    console.error('Fetch mystery box error:', error);
    return null;
  }
}

/**
 * Fetch recent activity
 */
export async function fetchRecentActivity(limit: number = 10) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_activity_log')
      .select(`
        activity_type,
        points_earned,
        coins_earned,
        metadata,
        created_at,
        exercises (name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data;
  } catch (error) {
    console.error('Fetch activity error:', error);
    return [];
  }
}

/**
 * Get total XP multiplier currently active
 */
export async function getCurrentMultiplier(): Promise<number> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return 1.0;
    }

    const { data, error } = await supabase.rpc('get_active_multiplier', {
      p_user_id: user.id
    });

    if (error) {
      return 1.0;
    }

    return parseFloat(data) || 1.0;
  } catch (error) {
    console.error('Get multiplier error:', error);
    return 1.0;
  }
}