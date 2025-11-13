
"use server";
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { DetailedStats, UserProfile} from '@/types';
import { UserSolution } from '@/types/challenge';


import { revalidatePath } from 'next/cache';

/**
 * Ensure user profile exists, create if missing
 */
export async function ensureUserProfile(userId: string) {
  const supabase = await createClient();
  
  // Check if profile exists
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  
  // Create if doesn't exist
  if (!existing) {
    const { error } = await supabase
      .from('user_profiles')
      .insert({ user_id: userId });
    
    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
}

/**
 * Get user profile with defaults
 */
export async function getUserProfile() {
  const supabase =await createClient();
  
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  
  if (!user?.sub) return null;
  
  // Ensure profile exists
  await ensureUserProfile(user.sub);
  
  const { data: profileData, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.sub)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return profileData;
}

/**
 * Initialize achievement progress for new users
 */
export async function initializeAchievements(userId: string) {
  const supabase = await createClient();
  
  // Get all achievements
  const { data: achievements } = await supabase
    .from('achievements')
    .select('id, requirement_total')
    .eq('is_active', true);
  
  if (!achievements) return;
  
  // Create progress entries for each achievement
  const achievementProgress = achievements.map(achievement => ({
    user_id: userId,
    achievement_id: achievement.id,
    progress: 0,
    total: achievement.requirement_total
  }));
  
  const { error } = await supabase
    .from('user_achievements')
    .upsert(achievementProgress, {
      onConflict: 'user_id,achievement_id',
      ignoreDuplicates: true
    });
  
  if (error) {
    console.error('Error initializing achievements:', error);
  }
}



/**
 * Fetch user profile data
 */
export async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    const supabase =await createClient();
    
    const { data } = await supabase.auth.getClaims();

    const user = data?.claims;
    

    
    if (!user?.sub) {
      return null;
    }

    const { data: profileData, error } = await supabase
      .from('user_profiles')
      .select(`
        level,
        current_xp,
        xp_to_next_level,
        total_points,
        coins,
        current_streak,
        longest_streak,
        total_solved,
        programming_language,
        experience_level,
        avatar,
        created_at
      `)
      .eq('user_id', user.sub)
      .single();

    if (error || !profileData) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    

    
    // Fetch user goals
    const { data: goalsData } = await supabase
      .from('user_goals')
      .select('goal')
      .eq('user_id', user.sub)
      .eq('is_completed', false)
      .limit(5);

    // Fetch preferred topics
    const { data: topicsData } = await supabase
      .from('user_preferred_topics')
      .select('topic')
      .eq('user_id', user.sub);

    const username = user.email?.split('@')[0] || 'User';

    return {
      username,
      avatar: profileData.avatar || '👤',
      level: profileData.level || 1,
      currentXP: profileData.current_xp || 0,
      xpToNextLevel: profileData.xp_to_next_level || 100,
      totalXP: profileData.total_points || 0,
      coins: profileData.coins || 0,
      streak: profileData.current_streak || 0,
      longestStreak: profileData.longest_streak || 0,
      joinedDate: profileData.created_at || new Date().toISOString(),
      totalChallengesSolved: profileData.total_solved || 0,

      experienceLevel: profileData.experience_level || 'beginner',
      
    };
  } catch (error) {
    console.error('Fetch user profile error:', error);
    return null;
  }
}

/**
 * Fetch detailed stats
 */
export async function fetchDetailedStats(): Promise<DetailedStats | null> {
  try {
    const supabase =await createClient();
    
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;
    
    if (!user?.sub) return null;

    // Get all user solutions
   const { data: solutions, error: solutionsError } = await supabase
  .from('user_solutions')
  .select(`
    status,
    completion_time,
    hints_used,
    is_perfect_solve,
    completed_at,
    points_earned,
    exercises (
      name,
      rank,
      category
    )
  `)
  .eq('user_id', user.sub)
  .overrideTypes<UserSolution[], { merge: false }>()


    if (solutionsError || !solutions) {
      return null;
    }

    // Calculate stats
    const totalAttempts = solutions.length;
    const completedSolutions = solutions.filter(s => s.status === 'completed');
    const successRate = totalAttempts > 0 ? (completedSolutions.length / totalAttempts) * 100 : 0;
    
    const avgTime = completedSolutions.length > 0
      ? completedSolutions.reduce((acc, s) => acc + (s.completion_time || 0), 0) / completedSolutions.length
      : 0;

    const perfectSolves = solutions.filter(s => s.is_perfect_solve).length;
    const hintsUsed = solutions.reduce((acc, s) => acc + (s.hints_used || 0), 0);

    // Challenges by difficulty
    const challengesByDifficulty = {
      beginner: completedSolutions.filter(s => s.exercises?.rank <= 2).length,
      intermediate: completedSolutions.filter(s => s.exercises?.rank >= 3 && s.exercises?.rank <= 5).length,
      advanced: completedSolutions.filter(s => s.exercises?.rank >= 6 && s.exercises?.rank <= 7).length,
      expert: completedSolutions.filter(s => s.exercises?.rank === 8).length,
    };

    // Activity by day (last 7 days)
    const activityByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const challengesOnDay = completedSolutions.filter(s => 
        s.completed_at?.startsWith(dateStr)
      ).length;

      activityByDay.push({
        date: dateStr,
        challenges: challengesOnDay,
      });
    }

    // Top categories
    const categoryCounts: Record<string, number> = {};
    completedSolutions.forEach(s => {
      const category = s.exercises?.category || 'Other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / completedSolutions.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    // Recent activity
    const recentActivity = completedSolutions
      .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())
      .slice(0, 5)
      .map(s => ({
        date: s.completed_at || '',
        challengeName: s.exercises?.name || 'Unknown',
        points: s.points_earned || 0,
        status: s.status as 'completed' | 'attempted',
      }));

    return {
      totalAttempts,
      successRate: Math.round(successRate * 10) / 10,
      averageTime: Math.round(avgTime),
      perfectSolves,
      hintsUsed,
      challengesByDifficulty,
      activityByDay,
      topCategories,
      recentActivity,
    };
  } catch (error) {
    console.error('Fetch detailed stats error:', error);
    return null;
  }
}

/**
 * Update user avatar
 */


/**
 * Update user programming language
 */





/**
 * Update user password
 */
export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!currentPassword || !newPassword) {
      return { success: false, error: 'Both current and new password are required' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters' };
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return { success: false, error: updateError.message || 'Failed to update password' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updatePassword:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update user profile information
 */
export async function updateProfile(
  { username, avatar }: { username?: string; avatar?: string; }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (username && username.trim().length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const updates: { username?: string; avatar?: string } = {};
    if (username) updates.username = username.trim();
    if (avatar) updates.avatar = avatar;

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath('/admin/profile');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateProfile:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role === 'admin') {
      const adminClient = createAdminClient();
      const { count: adminCount } = await adminClient
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (adminCount && adminCount <= 1) {
        return { success: false, error: 'Cannot delete the last admin account' };
      }
    }

    const { error: banError } = await supabase
      .from('user_profiles')
      .update({ 
        is_banned: true,
        ban_reason: 'Account deleted by user',
        banned_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (banError) {
      return { success: false, error: 'Failed to delete account' };
    }

    await supabase.auth.signOut();
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteAccount:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in logoutUser:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get admin profile data
 */
export async function getAdminProfile() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, avatar')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      username: user.email?.split('@')[0] || 'User',
      role: profile?.role || 'user',
      avatar: profile?.avatar,
      created_at: user.created_at,
      email_verified: user.email_confirmed_at !== null,
      last_login: user.last_sign_in_at || undefined,
    };
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return null;
  }
}