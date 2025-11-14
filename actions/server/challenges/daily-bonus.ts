'use server';


import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function claimDailyBonus(): Promise<{
  success: boolean;
  message: string;
  xpEarned?: number;
  streak?: number;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if user already claimed bonus today
    const { data: existingClaim } = await supabase
      .from('user_activity_log')
      .select('id')
      .eq('user_id', user.id)
      .eq('activity_type', 'daily_bonus')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .single();

    if (existingClaim) {
      return { success: false, message: 'Daily bonus already claimed today' };
    }

    // Get user's current streak
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('current_streak, last_activity')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return { success: false, message: 'User profile not found' };
    }

    // Calculate XP based on streak (base 50 XP + 10 XP per streak day)
    const baseXP = 50;
    const streakBonus = Math.min(profile.current_streak * 10, 200); // Cap at 200 bonus XP
    const totalXP = baseXP + streakBonus;

    // Add XP to user
    const { error: xpError } = await supabase.rpc('add_user_xp', {
      p_user_id: user.id,
      p_xp_amount: totalXP
    });

    if (xpError) {
      console.error('Error adding XP:', xpError);
      return { success: false, message: 'Failed to add XP' };
    }

    // Update streak (this counts as activity)
    const { error: streakError } = await supabase.rpc('update_user_streak', {
      p_user_id: user.id
    });

    if (streakError) {
      console.error('Error updating streak:', streakError);
    }

    // Log the bonus claim
    const { error: logError } = await supabase
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        activity_type: 'daily_bonus',
        points_earned: totalXP,
        metadata: {
          base_xp: baseXP,
          streak_bonus: streakBonus,
          total_xp: totalXP,
          streak: profile.current_streak + 1 // +1 because streak updates after this
        }
      });

    if (logError) {
      console.error('Error logging bonus:', logError);
      return { success: false, message: 'Failed to log bonus' };
    }

    // Get updated streak
    const { data: updatedProfile } = await supabase
      .from('user_profiles')
      .select('current_streak')
      .eq('user_id', user.id)
      .single();

    revalidatePath('/dashboard');
    revalidatePath('/profile');

    return {
      success: true,
      message: `Daily bonus claimed! +${totalXP} XP`,
      xpEarned: totalXP,
      streak: updatedProfile?.current_streak || profile.current_streak
    };

  } catch (error) {
    console.error('Error claiming daily bonus:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

export async function checkDailyBonusEligibility(): Promise<{
  eligible: boolean;
  lastClaimed?: string;
  streak: number;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { eligible: false, streak: 0 };
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if user already claimed bonus today
    const { data: lastClaim } = await supabase
      .from('user_activity_log')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('activity_type', 'daily_bonus')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get current streak
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('current_streak')
      .eq('user_id', user.id)
      .single();

    const claimedToday = lastClaim && 
      new Date(lastClaim.created_at).toISOString().split('T')[0] === today;

    return {
      eligible: !claimedToday,
      lastClaimed: lastClaim?.created_at,
      streak: profile?.current_streak || 0
    };

  } catch (error) {
    console.error('Error checking bonus eligibility:', error);
    return { eligible: false, streak: 0 };
  }
}