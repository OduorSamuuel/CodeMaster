
import { createClient } from '@/lib/supabase/client';

/**
 * Ensure user profile exists, create if missing
 */
export async function ensureUserProfile(userId: string) {
  const supabase = createClient();
  
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
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Ensure profile exists
  await ensureUserProfile(user.id);
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
}

/**
 * Initialize achievement progress for new users
 */
export async function initializeAchievements(userId: string) {
  const supabase = createClient();
  
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