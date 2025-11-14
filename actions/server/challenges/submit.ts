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

    // Determine if all tests passed and set appropriate status
    const allTestsPassed = params.testsPassed === params.testsTotal;
    const status = allTestsPassed ? 'completed' : 'failed';
    const passed = allTestsPassed;
    
    console.log('All tests passed:', allTestsPassed, 'Status:', status, 'Passed:', passed);

    // Calculate points earned (only for completed challenges)
    let pointsEarned = 0;
    
    if (allTestsPassed) {
      pointsEarned = challenge.points;
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
    }

    // Get current multiplier (only for XP calculation)
    const { data: multiplier, error: multiplierError } = await supabase.rpc('get_active_multiplier', {
      p_user_id: user.id
    });
    console.log('Active multiplier:', multiplier, 'multiplierError:', multiplierError);

    const xpGained = allTestsPassed ? Math.floor(pointsEarned * (multiplier || 1.0)) : 0;
    console.log('XP gained:', xpGained);

    // Insert or update user solution with the new fields
    const { data: solution, error: solutionError } = await supabase
      .from('user_solutions')
      .upsert({
        user_id: user.id,
        challenge_id: params.challengeId,
        code: params.code,
        status: status,
        tests_passed: params.testsPassed,
        tests_total: params.testsTotal,
        points_earned: pointsEarned,
        completion_time: params.timeElapsed,
        hints_used: params.hintsUsed,
        is_perfect_solve: params.isPerfectSolve,
        passed: passed,
        failed_attempts: allTestsPassed ? 0 : 1, // Will be auto-incremented by trigger
        last_attempted: new Date().toISOString(),
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

    // Get updated user profile to check for level ups
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('level, current_xp, total_points')
      .eq('user_id', user.id)
      .single();
    console.log('User profile:', profile, 'profileError:', profileError);

    // Get latest level up activity (check if level up occurred)
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activity_log')
      .select('activity_type, metadata')
      .eq('user_id', user.id)
      .eq('activity_type', 'level_up')
      .order('created_at', { ascending: false })
      .limit(1);
    console.log('User activities:', activities, 'activitiesError:', activitiesError);

    const leveledUp = activities && activities.length > 0 && 
                     activities[0].metadata?.new_level > profile?.level;
    const newLevel = leveledUp ? activities[0].metadata?.new_level : profile?.level;

    // Revalidate paths
    console.log('Revalidating paths...');
    revalidatePath('/challenges');
    revalidatePath('/dashboard');
    revalidatePath(`/challenges/${params.challengeId}`);

    return {
      success: true,
      data: {
        pointsEarned: pointsEarned,
        xpGained: xpGained,
        leveledUp: leveledUp || false,
        newLevel,
        rewards: {
          baseXP: challenge.points,
          totalXP: xpGained,
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