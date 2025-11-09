import { createClient } from '@/lib/supabase/client';
import { Challenge, ExerciseFull } from '@/types/challenge';

/**
 * Transform database exercise to frontend Challenge type
 * Handles all null/undefined cases with safe defaults
 */
export function transformExerciseToChallenge(exercise: ExerciseFull): Challenge {
  return {
    id: exercise.id.toString(),
    title: exercise.name || 'Untitled Challenge',
    difficulty: exercise.rank_name || '8 kyu',
    category: exercise.category || 'reference',
    description: exercise.description || '',
    tags: exercise.tags || [],
    points: exercise.points || 0,
    timeLimit: exercise.time_limit ?? undefined,
    solvedCount: exercise.solved_count ?? 0,
    locked: exercise.is_locked ?? false,
    requiredLevel: exercise.required_level ?? undefined,
    rank: exercise.rank ?? 0,
    rank_name: exercise.rank_name || '8 kyu',
  };
}

/**
 * Fetch all challenges (exercises)
 */
export async function fetchChallenges(): Promise<Challenge[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('exercises_full')
    .select('*')
    .order('rank', { ascending: true });

  if (error) {
    console.error('Error fetching challenges:', error);
    throw error;
  }

  if (!data) {
    return [];
  }

  return (data as ExerciseFull[]).map(transformExerciseToChallenge);
}

/**
 * Fetch single challenge by ID
 */
export async function fetchChallengeById(id: string): Promise<Challenge | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('exercises_full')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching challenge:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return transformExerciseToChallenge(data as ExerciseFull);
}

/**
 * Fetch challenges by category
 */
export async function fetchChallengesByCategory(category: string): Promise<Challenge[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('exercises_full')
    .select('*')
    .eq('category', category)
    .order('rank', { ascending: true });

  if (error) {
    console.error('Error fetching challenges by category:', error);
    throw error;
  }

  return (data || []).map(transformExerciseToChallenge);
}

/**
 * Fetch challenges by difficulty (rank)
 */
export async function fetchChallengesByDifficulty(rankName: string): Promise<Challenge[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('exercises_full')
    .select('*')
    .eq('rank_name', rankName)
    .order('solved_count', { ascending: false });

  if (error) {
    console.error('Error fetching challenges by difficulty:', error);
    throw error;
  }

  return (data || []).map(transformExerciseToChallenge);
}

/**
 * Search challenges by tags
 */
export async function fetchChallengesByTag(tag: string): Promise<Challenge[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('exercises_full')
    .select('*')
    .filter('tags', 'cs', `{${tag}}`); // contains

  if (error) {
    console.error('Error fetching challenges by tag:', error);
    throw error;
  }

  return (data || []).map(transformExerciseToChallenge);
}

/**
 * Fetch test cases for a challenge
 */
export async function fetchTestCases(exerciseId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('test_cases')
    .select('*')
    .eq('exercise_id', exerciseId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching test cases:', error);
    throw error;
  }

  return data || [];
}

/**
 * Increment solved count when user completes challenge
 */
export async function incrementSolvedCount(exerciseId: string) {
  const supabase = createClient();
  
  const { error } = await supabase.rpc('increment_solved_count', {
    exercise_id: exerciseId
  });

  if (error) {
    console.error('Error incrementing solved count:', error);
  }
}