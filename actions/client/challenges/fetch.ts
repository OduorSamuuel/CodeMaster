import { createClient } from "@/lib/supabase/client";

import { Challenge } from "@/types/challenge";

export async function fetchChallenges(): Promise<Challenge[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('challenges_full')
    .select('*')
    .order('rank', { ascending: true });

  if (error) {
    console.error('Error fetching challenges:', error);
    throw error;
  }

  if (!data) {
    return [];
  }

  return data as Challenge[];
}

/**
 * Fetch all challenges (challenges)
 */


/**
 * Fetch single challenge by ID
 */
export async function fetchChallengeById(id: string): Promise<Challenge | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('challenges_full')
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

  return data as Challenge;
}

/**
 * Fetch challenges by category
 */
export async function fetchChallengesByCategory(category: string): Promise<Challenge[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('challenges_full')
    .select('*')
    .eq('category', category)
    .order('rank', { ascending: true });

  if (error) {
    console.error('Error fetching challenges by category:', error);
    throw error;
  }

  return data as Challenge[] || [];
}

/**
 * Fetch challenges by difficulty (rank)
 */
export async function fetchChallengesByDifficulty(rankName: string): Promise<Challenge[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('challenges_full')
    .select('*')
    .eq('rank_name', rankName)
    .order('solved_count', { ascending: false });

  if (error) {
    console.error('Error fetching challenges by difficulty:', error);
    throw error;
  }

  return data as Challenge[] || [];
}

/**
 * Search challenges by tags
 */
export async function fetchChallengesByTag(tag: string): Promise<Challenge[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('challenges_full')
    .select('*')
    .filter('tags', 'cs', `{${tag}}`); // contains

  if (error) {
    console.error('Error fetching challenges by tag:', error);
    throw error;
  }

  return data as Challenge[] || [];
}

/**
 * Fetch test cases for a challenge
 */
export async function fetchTestCases(challengeId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('test_cases')
    .select('*')
    .eq('challenge_id', challengeId)
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