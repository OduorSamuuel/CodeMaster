// actions/submissions.ts
"use server";
import { createClient } from '@/lib/supabase/server';

export interface SubmitSolutionParams {
  exerciseId: string;
  code: string;
  testsPassed: number;
  testsTotal: number;
  timeElapsed: number;
  hintsUsed: number;
  isPerfectSolve: boolean;
}

export interface RewardBreakdown {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  coins: number;
  bonuses: {
    type: 'perfect' | 'no_hints' | 'speed';
    name: string;
    xp?: number;
    coins?: number;
  }[];
}

export interface SubmitSolutionResult {
  success: boolean;
  pointsEarned: number;
  coinsEarned: number;
  totalPoints: number;
  totalCoins: number;
  rewardBreakdown: RewardBreakdown;
  achievementsUnlocked?: string[];
  error?: string;
}

/**
 * Calculate rewards (XP and Coins) based on performance
 */
function calculateRewards(
  basePoints: number,
  testsPassed: number,
  testsTotal: number,
  isPerfectSolve: boolean,
  hintsUsed: number,
  timeElapsed: number,
  timeLimit?: number
): RewardBreakdown {
  let xp = basePoints;
  let coins = Math.floor(basePoints / 2); // Base coins = half of base XP
  const bonuses: RewardBreakdown['bonuses'] = [];

  // Perfect solve bonus (first attempt, all tests)
  if (isPerfectSolve) {
    const perfectXP = 50;
    const perfectCoins = 25;
    xp += perfectXP;
    coins += perfectCoins;
    bonuses.push({
      type: 'perfect',
      name: 'Perfect Solve',
      xp: perfectXP,
      coins: perfectCoins
    });
  }

  // No hints bonus
  if (hintsUsed === 0) {
    const noHintsXP = 20;
    const noHintsCoins = 10;
    xp += noHintsXP;
    coins += noHintsCoins;
    bonuses.push({
      type: 'no_hints',
      name: 'No Hints Used',
      xp: noHintsXP,
      coins: noHintsCoins
    });
  }

  // Speed bonus (completed in less than half time limit)
  if (timeLimit && timeElapsed < timeLimit / 2) {
    const speedXP = 30;
    const speedCoins = 15;
    xp += speedXP;
    coins += speedCoins;
    bonuses.push({
      type: 'speed',
      name: 'Speed Demon',
      xp: speedXP,
      coins: speedCoins
    });
  }

  // Partial credit if not all tests passed
  if (testsPassed < testsTotal) {
    const completionRate = testsPassed / testsTotal;
    xp = Math.floor(xp * completionRate);
    coins = Math.floor(coins * completionRate);
  }

  return {
    baseXP: basePoints,
    bonusXP: xp - basePoints,
    totalXP: Math.max(0, xp),
    coins: Math.max(0, coins),
    bonuses
  };
}

/**
 * Submit a solution and update user progress
 */
export async function submitSolution(
  params: SubmitSolutionParams
): Promise<SubmitSolutionResult> {
  const supabase = await createClient();

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { 
        success: false, 
        pointsEarned: 0,
        coinsEarned: 0,
        totalPoints: 0,
        totalCoins: 0,
        rewardBreakdown: {
          baseXP: 0,
          bonusXP: 0,
          totalXP: 0,
          coins: 0,
          bonuses: []
        },
        error: 'User not authenticated' 
      };
    }

    // Ensure user profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingProfile) {
      await supabase
        .from('user_profiles')
        .insert({ user_id: user.id });
    }

    // Get exercise details
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .select('points, rank, time_limit')
      .eq('id', params.exerciseId)
      .single();

    if (exerciseError || !exercise) {
      return { 
        success: false, 
        pointsEarned: 0,
        coinsEarned: 0,
        totalPoints: 0,
        totalCoins: 0,
        rewardBreakdown: {
          baseXP: 0,
          bonusXP: 0,
          totalXP: 0,
          coins: 0,
          bonuses: []
        },
        error: 'Exercise not found' 
      };
    }

    // Calculate rewards
    const rewards = calculateRewards(
      exercise.points,
      params.testsPassed,
      params.testsTotal,
      params.isPerfectSolve,
      params.hintsUsed,
      params.timeElapsed,
      exercise.time_limit
    );

    const isCompleted = params.testsPassed === params.testsTotal;
    const status = isCompleted ? 'completed' : 'in_progress';

    // Check if this is an update to existing solution
    const { data: existingSolution } = await supabase
      .from('user_solutions')
      .select('status')
      .eq('user_id', user.id)
      .eq('exercise_id', params.exerciseId)
      .maybeSingle();

    // Only award rewards if first time completing (not updating a completed solution)
    const isFirstCompletion = !existingSolution || existingSolution.status !== 'completed';
    const actualXP = isFirstCompletion ? rewards.totalXP : 0;
    const actualCoins = isFirstCompletion ? rewards.coins : 0;

    // Insert or update user solution
    const { error: solutionError } = await supabase
      .from('user_solutions')
      .upsert({
        user_id: user.id,
        exercise_id: params.exerciseId,
        code: params.code,
        status,
        tests_passed: params.testsPassed,
        tests_total: params.testsTotal,
        points_earned: actualXP,
        completion_time: params.timeElapsed,
        hints_used: params.hintsUsed,
        is_perfect_solve: params.isPerfectSolve,
        completed_at: isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,exercise_id'
      });

    if (solutionError) {
      console.error('Error saving solution:', solutionError);
      return { 
        success: false, 
        pointsEarned: 0,
        coinsEarned: 0,
        totalPoints: 0,
        totalCoins: 0,
        rewardBreakdown: rewards,
        error: solutionError.message 
      };
    }

    // Award coins if first completion
    if (isFirstCompletion && actualCoins > 0) {
      const { error: coinsError } = await supabase
        .rpc('increment_user_coins', { 
          p_user_id: user.id, 
          p_coins_amount: actualCoins 
        });
      
      if (coinsError) {
        console.error('Error awarding coins:', coinsError);
      }
    }

    // Increment exercise solved count if completed
    if (isCompleted && isFirstCompletion) {
      await supabase.rpc('increment_solved_count', {
        exercise_id: params.exerciseId
      });

      // Log activity
      await supabase
        .from('user_activity_log')
        .insert({
          user_id: user.id,
          activity_type: 'challenge_completed',
          challenge_id: params.exerciseId,
          points_earned: actualXP,
          coins_earned: actualCoins,
          metadata: {
            isPerfectSolve: params.isPerfectSolve,
            timeElapsed: params.timeElapsed,
            hintsUsed: params.hintsUsed
          }
        });
    }

    // Get updated profile stats
    const { data: updatedProfile } = await supabase
      .from('user_profiles')
      .select('total_points, coins')
      .eq('user_id', user.id)
      .single();

    return {
      success: true,
      pointsEarned: actualXP,
      coinsEarned: actualCoins,
      totalPoints: updatedProfile?.total_points || 0,
      totalCoins: updatedProfile?.coins || 0,
      rewardBreakdown: rewards
    };

  } catch (error) {
    console.error('Submission error:', error);
    return { 
      success: false, 
      pointsEarned: 0,
      coinsEarned: 0,
      totalPoints: 0,
      totalCoins: 0,
      rewardBreakdown: {
        baseXP: 0,
        bonusXP: 0,
        totalXP: 0,
        coins: 0,
        bonuses: []
      },
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Track attempt (call this when running tests)
 */
export async function trackAttempt(exerciseId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Increment total_attempts in user_profiles
  await supabase
    .from('user_profiles')
    .update({
      total_attempts: supabase.raw('total_attempts + 1')
    })
    .eq('user_id', user.id);
}