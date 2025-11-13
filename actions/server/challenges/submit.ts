'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface SubmitSolutionParams {
  challengeId: number;
  code: string;
  testsPassed: number;
  testsTotal: number;
  timeElapsed: number;
  hintsUsed: number;
  isPerfectSolve: boolean;
}

interface Bonus {
  type: string;
  name: string;
  xp?: number;
  coins?: number;
}

export interface RewardBreakdown {
  baseXP: number;
  totalXP: number;
  coins: number;
  bonuses: Bonus[];
  multiplier?: number;
}

interface SubmitSolutionResult {
  success: boolean;
  error?: string;
  data?: {
    pointsEarned: number;
    xpGained: number;
    leveledUp: boolean;
    newLevel?: number;
    rewards: RewardBreakdown;
  };
}

export async function submitSolution(
  params: SubmitSolutionParams
): Promise<SubmitSolutionResult> {
  try {
    console.log('submitSolution called with params:', params);

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', user, 'userError:', userError);

    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to submit solutions'
      };
    }

    // Get challenge details to calculate points
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('points, rank')
      .eq('id', params.challengeId)
      .single();
    console.log('Challenge data:', challenge, 'challengeError:', challengeError);

    if (challengeError || !challenge) {
      return {
        success: false,
        error: 'Challenge not found'
      };
    }

    // Calculate points earned
    let pointsEarned = challenge.points;
    console.log('Initial pointsEarned:', pointsEarned);

    // Bonus for perfect solve
    if (params.isPerfectSolve) {
      pointsEarned = Math.floor(pointsEarned * 1.5);
      console.log('Applied perfect solve bonus, pointsEarned:', pointsEarned);
    }

    // Penalty for hints (lose 10% per hint, max 50% penalty)
    const hintPenalty = Math.min(params.hintsUsed * 0.1, 0.5);
    pointsEarned = Math.floor(pointsEarned * (1 - hintPenalty));
    console.log('Applied hint penalty, pointsEarned:', pointsEarned, 'hintPenalty:', hintPenalty);

    // Determine if all tests passed
    const allTestsPassed = params.testsPassed === params.testsTotal;
    const status = allTestsPassed ? 'completed' : 'in_progress';
    console.log('All tests passed:', allTestsPassed, 'Status:', status);

    // Insert or update user solution
    const { data: solution, error: solutionError } = await supabase
      .from('user_solutions')
      .upsert({
        user_id: user.id,
        challenge_id: params.challengeId,
        code: params.code,
        status: status,
        tests_passed: params.testsPassed,
        tests_total: params.testsTotal,
        points_earned: allTestsPassed ? pointsEarned : 0,
        completion_time: params.timeElapsed,
        hints_used: params.hintsUsed,
        is_perfect_solve: params.isPerfectSolve,
        completed_at: allTestsPassed ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id,challenge_id'
      })
      .select()
      .single();
    console.log('Solution upsert result:', solution, 'solutionError:', solutionError);

    if (solutionError) {
      return {
        success: false,
        error: 'Failed to save solution: ' + solutionError.message
      };
    }

    // Get updated user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('level, current_xp, total_points')
      .eq('user_id', user.id)
      .single();
    console.log('User profile:', profile, 'profileError:', profileError);

    // Get latest level up activity
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activity_log')
      .select('activity_type, metadata')
      .eq('user_id', user.id)
      .eq('activity_type', 'level_up')
      .order('created_at', { ascending: false })
      .limit(1);
    console.log('User activities:', activities, 'activitiesError:', activitiesError);

    const leveledUp = activities && activities.length > 0;
    const newLevel = leveledUp ? profile?.level : undefined;

    // Get current multiplier
    const { data: multiplier, error: multiplierError } = await supabase.rpc('get_active_multiplier', {
      p_user_id: user.id
    });
    console.log('Active multiplier:', multiplier, 'multiplierError:', multiplierError);

    const xpGained = Math.floor(pointsEarned * (multiplier || 1.0));
    console.log('XP gained:', xpGained);

    // Revalidate paths
    console.log('Revalidating paths...');
    revalidatePath('/challenges');
    revalidatePath('/dashboard');
    revalidatePath(`/challenges/${params.challengeId}`);

    return {
      success: true,
      data: {
        pointsEarned: allTestsPassed ? pointsEarned : 0,
        xpGained: allTestsPassed ? xpGained : 0,
        leveledUp: leveledUp || false,
        newLevel,
        rewards: {
          baseXP: challenge.points,
          totalXP: allTestsPassed ? xpGained : 0,
          coins: 0,
          bonuses: [],
          multiplier: multiplier || 1.0
        }
      }
    };

  } catch (error) {
    console.error('Submit solution error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Get user's current progress on a challenge
 */
export async function getUserSolution(challengeId: number) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_solutions')
      .select('*')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Get user solution error:', error);
    return null;
  }
}

/**
 * Check if user has completed a challenge
 */
export async function hasCompletedChallenge(challengeId: number): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return false;
    }

    const { data, error } = await supabase
      .from('user_solutions')
      .select('status')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .eq('status', 'completed')
      .single();

    return !!data && !error;
  } catch (error) {
    return false;
  }
}