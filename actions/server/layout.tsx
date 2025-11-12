'use server';

import { createClient } from '@/lib/supabase/server';

export interface LayoutUserData {
  name: string;
  avatar: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  streak: number;
  rank: string;
  coins: number;
  totalSolved: number;
}

/**
 * Fetch user data for layout
 */
export async function fetchLayoutUserData(): Promise<LayoutUserData | null> {
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
        current_streak,
        coins,
        total_solved,
        avatar
      `)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error('Error fetching layout user data:', error);
      return null;
    }

    // Determine rank based on level
    const getRank = (level: number): string => {
      if (level >= 50) return 'Platinum';
      if (level >= 30) return 'Diamond';
      if (level >= 20) return 'Gold';
      if (level >= 10) return 'Silver';
      return 'Bronze';
    };

    // Get username from email or use default
    const username = user.email?.split('@')[0] || user.user_metadata?.username || 'CodeMaster';

    return {
      name: username,
      avatar: data.avatar || '👤',
      level: data.level || 1,
      currentXP: data.current_xp || 0,
      xpToNextLevel: data.xp_to_next_level || 100,
      streak: data.current_streak || 0,
      rank: getRank(data.level || 1),
      coins: data.coins || 0,
      totalSolved: data.total_solved || 0,
    };
  } catch (error) {
    console.error('Fetch layout user data error:', error);
    return null;
  }
}

/**
 * Get count of in-progress challenges
 */
export async function getInProgressCount(): Promise<number> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return 0;

    const { count, error } = await supabase
      .from('user_solutions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'in_progress');

    if (error) return 0;

    return count || 0;
  } catch (error) {
    return 0;
  }
}

export async function getAdminUserInfo() {
  try {
    const supabase = await createClient();
    
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;
    
    if (!user?.sub) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role, avatar, level')
      .eq('user_id', user.sub)
      .single();

    if (error || !profile || profile.role !== 'admin') {
      return null;
    }

    return {
      email: user.email || 'Admin',
      username: user.email?.split('@')[0] || 'Admin',
      role: profile.role,
      avatar: profile.avatar,
      level: profile.level,
    };
  } catch (error) {
    console.error('Error fetching admin user info:', error);
    return null;
  }
}