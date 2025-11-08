'use server';

import { createClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/actions/admin';
import { revalidatePath } from 'next/cache';

export interface TestCase {
  input: string;
  expected_output: string;
  description: string;
  is_hidden: boolean;
  order_index?: number;
}

export interface CreateChallengeInput {
  name: string;
  category: 'reference' | 'bug_fixes' | 'algorithms' | 'data_structures';
  description: string;
  difficulty: 'easy' | 'medium' | 'hard'; // Maps to rank
  solutions: string;
  tags: string[];
  test_cases: TestCase[];
  time_limit?: number;
  estimated_time?: number;
  required_level?: number;
  is_daily_challenge?: boolean;
  daily_bonus_points?: number;
}

/**
 * Map difficulty to rank (kyu system)
 */
function mapDifficultyToRank(difficulty: 'easy' | 'medium' | 'hard'): { rank: number; rank_name: string } {
  const difficultyMap = {
    easy: { rank: 8, rank_name: '8 kyu' },    // Beginner
    medium: { rank: 5, rank_name: '5 kyu' },  // Intermediate
    hard: { rank: 2, rank_name: '2 kyu' }     // Advanced
  };
  
  return difficultyMap[difficulty];
}

/**
 * Calculate points based on rank
 */
function calculatePoints(rank: number): number {
  const pointsMap: Record<number, number> = {
    8: 10,   // 8 kyu
    7: 20,   // 7 kyu
    6: 30,   // 6 kyu
    5: 50,   // 5 kyu
    4: 80,   // 4 kyu
    3: 120,  // 3 kyu
    2: 180,  // 2 kyu
    1: 250   // 1 kyu
  };
  
  return pointsMap[rank] || 10;
}

/**
 * Create a new challenge
 */
export async function createChallenge(
  input: CreateChallengeInput
): Promise<{ success: boolean; error?: string; challengeId?: number }> {
  try {
    const supabase = await createClient();

    // Check admin role
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Validate required fields
    if (!input.name || !input.category || !input.description || !input.solutions) {
      return { success: false, error: 'Missing required fields' };
    }

    if (!input.test_cases || input.test_cases.length === 0) {
      return { success: false, error: 'At least one test case is required' };
    }

    // Map difficulty to rank
    const { rank, rank_name } = mapDifficultyToRank(input.difficulty);
    const points = calculatePoints(rank);

    // Insert exercise
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .insert({
        name: input.name,
        category: input.category,
        description: input.description,
        rank: rank,
        rank_name: rank_name,
        solutions: input.solutions,
        points: points,
        time_limit: input.time_limit,
        estimated_time: input.estimated_time,
        required_level: input.required_level,
        is_locked: input.required_level ? input.required_level > 1 : false,
      })
      .select()
      .single();

    if (exerciseError) {
      console.error('Exercise creation error:', exerciseError);
      return { success: false, error: exerciseError.message };
    }

    const exerciseId = exercise.id;

    // Insert tags
    if (input.tags && input.tags.length > 0) {
      const tagsToInsert = input.tags.map(tag => ({
        exercise_id: exerciseId,
        tag: tag.trim().toLowerCase()
      }));

      const { error: tagsError } = await supabase
        .from('exercise_tags')
        .insert(tagsToInsert);

      if (tagsError) {
        console.error('Tags insertion error:', tagsError);
        // Continue even if tags fail
      }
    }

    // Insert test cases
    const testCasesToInsert = input.test_cases.map((tc, index) => ({
      exercise_id: exerciseId,
      input: tc.input.trim(),
      expected_output: tc.expected_output.trim(),
      description: tc.description,
      order_index: tc.order_index || index + 1,
      is_hidden: tc.is_hidden || false,
    }));

    const { error: testCasesError } = await supabase
      .from('test_cases')
      .insert(testCasesToInsert);

    if (testCasesError) {
      console.error('Test cases insertion error:', testCasesError);
      return { success: false, error: testCasesError.message };
    }

    // Handle daily challenge
    if (input.is_daily_challenge) {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if there's already a daily challenge for today
      const { data: existingDaily } = await supabase
        .from('daily_challenges')
        .select('id')
        .eq('challenge_date', today)
        .single();

      if (existingDaily) {
        // Update existing daily challenge
        const { error: updateError } = await supabase
          .from('daily_challenges')
          .update({
            exercise_id: exerciseId,
            bonus_points: input.daily_bonus_points || 50,
          })
          .eq('challenge_date', today);

        if (updateError) {
          console.error('Daily challenge update error:', updateError);
        }
      } else {
        // Insert new daily challenge
        const { error: dailyError } = await supabase
          .from('daily_challenges')
          .insert({
            exercise_id: exerciseId,
            challenge_date: today,
            bonus_points: input.daily_bonus_points || 50,
          });

        if (dailyError) {
          console.error('Daily challenge insertion error:', dailyError);
        }
      }
    }

    // Revalidate paths
    revalidatePath('/admin/challenges');
    revalidatePath('/challenges');

    return { 
      success: true, 
      challengeId: exerciseId 
    };
  } catch (error) {
    console.error('Unexpected error creating challenge:', error);
    return { success: false, error: 'Failed to create challenge' };
  }
}

/**
 * Update an existing challenge
 */
export async function updateChallenge(
  id: number,
  updates: Partial<CreateChallengeInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update exercise
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.category) updateData.category = updates.category;
    if (updates.description) updateData.description = updates.description;
    if (updates.solutions) updateData.solutions = updates.solutions;
    if (updates.time_limit !== undefined) updateData.time_limit = updates.time_limit;
    if (updates.estimated_time !== undefined) updateData.estimated_time = updates.estimated_time;
    if (updates.required_level !== undefined) {
      updateData.required_level = updates.required_level;
      updateData.is_locked = updates.required_level > 1;
    }
    
    if (updates.difficulty) {
      const { rank, rank_name } = mapDifficultyToRank(updates.difficulty);
      updateData.rank = rank;
      updateData.rank_name = rank_name;
      updateData.points = calculatePoints(rank);
    }

    if (Object.keys(updateData).length > 0) {
      const { error: exerciseError } = await supabase
        .from('exercises')
        .update(updateData)
        .eq('id', id);

      if (exerciseError) {
        return { success: false, error: exerciseError.message };
      }
    }

    // Update tags if provided
    if (updates.tags) {
      // Delete existing tags
      await supabase
        .from('exercise_tags')
        .delete()
        .eq('exercise_id', id);

      // Insert new tags
      if (updates.tags.length > 0) {
        const tagsToInsert = updates.tags.map(tag => ({
          exercise_id: id,
          tag: tag.trim().toLowerCase()
        }));

        await supabase
          .from('exercise_tags')
          .insert(tagsToInsert);
      }
    }

    // Update test cases if provided
    if (updates.test_cases) {
      // Delete existing test cases
      await supabase
        .from('test_cases')
        .delete()
        .eq('exercise_id', id);

      // Insert new test cases
      if (updates.test_cases.length > 0) {
        const testCasesToInsert = updates.test_cases.map((tc, index) => ({
          exercise_id: id,
          input: tc.input.trim(),
          expected_output: tc.expected_output.trim(),
          description: tc.description,
          order_index: tc.order_index || index + 1,
          is_hidden: tc.is_hidden || false,
        }));

        await supabase
          .from('test_cases')
          .insert(testCasesToInsert);
      }
    }

    // Handle daily challenge status
    if (updates.is_daily_challenge !== undefined) {
      const today = new Date().toISOString().split('T')[0];
      
      if (updates.is_daily_challenge) {
        // Add to daily challenges
        const { error: dailyError } = await supabase
          .from('daily_challenges')
          .upsert({
            exercise_id: id,
            challenge_date: today,
            bonus_points: updates.daily_bonus_points || 50,
          }, {
            onConflict: 'challenge_date'
          });

        if (dailyError) {
          console.error('Daily challenge update error:', dailyError);
        }
      } else {
        // Remove from daily challenges
        await supabase
          .from('daily_challenges')
          .delete()
          .eq('exercise_id', id)
          .eq('challenge_date', today);
      }
    }

    revalidatePath('/admin/challenges');
    revalidatePath('/challenges');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating challenge:', error);
    return { success: false, error: 'Failed to update challenge' };
  }
}

/**
 * Delete a challenge
 */
export async function deleteChallenge(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/challenges');
    revalidatePath('/challenges');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting challenge:', error);
    return { success: false, error: 'Failed to delete challenge' };
  }
}

/**
 * Get today's daily challenge
 */
export async function getTodaysDailyChallenge() {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_challenges')
      .select(`
        id,
        bonus_points,
        exercises (
          id,
          name,
          category,
          description,
          rank_name,
          points,
          solved_count
        )
      `)
      .eq('challenge_date', today)
      .single();

    if (error) {
      console.error('Error fetching daily challenge:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}