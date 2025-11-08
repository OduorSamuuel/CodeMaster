'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface SubmitSolutionParams {
  exerciseId: number;
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
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to submit solutions'
      };
    }

    // Get exercise details to calculate points
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .select('points, rank')
      .eq('id', params.exerciseId)
      .single();

    if (exerciseError || !exercise) {
      return {
        success: false,
        error: 'Challenge not found'
      };
    }

    // Calculate points earned
    let pointsEarned = exercise.points;
    
    // Bonus for perfect solve
    if (params.isPerfectSolve) {
      pointsEarned = Math.floor(pointsEarned * 1.5);
    }
    
    // Penalty for hints (lose 10% per hint, max 50% penalty)
    const hintPenalty = Math.min(params.hintsUsed * 0.1, 0.5);
    pointsEarned = Math.floor(pointsEarned * (1 - hintPenalty));

    // Determine if all tests passed
    const allTestsPassed = params.testsPassed === params.testsTotal;
    const status = allTestsPassed ? 'completed' : 'in_progress';

    // Insert or update user solution
    // This will trigger update_user_profile_stats_with_xp() automatically
    const { data: solution, error: solutionError } = await supabase
      .from('user_solutions')
      .upsert({
        user_id: user.id,
        exercise_id: params.exerciseId,
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
        onConflict: 'user_id,exercise_id'
      })
      .select()
      .single();

    if (solutionError) {
      console.error('Solution insert error:', solutionError);
      return {
        success: false,
        error: 'Failed to save solution: ' + solutionError.message
      };
    }

    // Get updated user profile to return level-up info
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('level, current_xp, total_points')
      .eq('user_id', user.id)
      .single();

    // Get activity log to check if leveled up
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activity_log')
      .select('activity_type, metadata')
      .eq('user_id', user.id)
      .eq('activity_type', 'level_up')
      .order('created_at', { ascending: false })
      .limit(1);

    const leveledUp = activities && activities.length > 0;
    const newLevel = leveledUp ? profile?.level : undefined;

    // Get current multiplier
    const { data: multiplier } = await supabase.rpc('get_active_multiplier', {
      p_user_id: user.id
    });

    const xpGained = Math.floor(pointsEarned * (multiplier || 1.0));

    // Revalidate paths to refresh data
    revalidatePath('/challenges');
    revalidatePath('/dashboard');
    revalidatePath(`/challenges/${params.exerciseId}`);

    return {
      success: true,
      data: {
        pointsEarned: allTestsPassed ? pointsEarned : 0,
        xpGained: allTestsPassed ? xpGained : 0,
        leveledUp: leveledUp || false,
        newLevel,
        rewards: {
          baseXP: exercise.points,
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
export async function getUserSolution(exerciseId: number) {
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
      .eq('exercise_id', exerciseId)
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
export async function hasCompletedChallenge(exerciseId: number): Promise<boolean> {
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
      .eq('exercise_id', exerciseId)
      .eq('status', 'completed')
      .single();

    return !!data && !error;
  } catch (error) {
    return false;
  }
}