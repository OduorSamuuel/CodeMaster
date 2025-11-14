import { getRequiredLevelForChallenge } from "@/lib/challenge-levels";
import { createClient } from "@/lib/supabase/client";

import { Challenge } from "@/types/challenge";

export async function fetchChallenges(userLevel: number = 1): Promise<Challenge[]> {
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

  // Apply level-based locking
  const challengesWithLevelLocking = data.map(challenge => {
    const requiredLevel = getRequiredLevelForChallenge(challenge.rank_name);
    const isUnlocked = userLevel >= requiredLevel;
    
    return {
      ...challenge,
      is_locked: !isUnlocked,
      required_level: requiredLevel
    };
  });

  return challengesWithLevelLocking as Challenge[];
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
export async function fetchChallengesPaginated(
  page: number, 
  pageSize: number = 9,
  userLevel: number = 1 // Add user level parameter
): Promise<{ data: Challenge[], totalCount: number }> {
  const supabase = createClient();
  
  // Calculate range for pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // First, get the total count
  const { count, error: countError } = await supabase
    .from('challenges_full')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting challenges:', countError);
    throw countError;
  }

  // Then fetch the paginated data
  const { data, error } = await supabase
    .from('challenges_full')
    .select('*')
    .order('rank', { ascending: true })
    .range(from, to);

  if (error) {
    console.error('Error fetching challenges:', error);
    throw error;
  }

  // Apply level-based locking dynamically
  const challengesWithLevelLocking = (data as Challenge[] || []).map(challenge => {
    const requiredLevel = getRequiredLevelForChallenge(challenge.rank_name);
    const isUnlocked = userLevel >= requiredLevel;
    
    return {
      ...challenge,
      is_locked: !isUnlocked,
      required_level: requiredLevel
    };
  });

  return {
    data: challengesWithLevelLocking,
    totalCount: count || 0
  };
}