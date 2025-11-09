'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { checkAdminRole } from '@/actions/admin';
import { revalidatePath } from 'next/cache';

export interface ChallengeData {
  id: string;
  name: string;
  slug: string;
  category: string;
  rank: number;
  rank_name: string;
  description: string;
  tags: string[];
  points: number;
  time_limit?: number;
  solved_count: number;
  is_locked: boolean;
  required_level?: number;
  created_at: string;
  updated_at: string;
}

export interface TestCaseData {
  id: string;
  exercise_id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  order_index: number;
  description?: string;
}

/**
 * Get all challenges with admin privileges
 */
export async function getAllChallenges(
  page: number = 1,
  limit: number = 20,
  searchQuery?: string,
  categoryFilter?: string,
  difficultyFilter?: string
): Promise<{ challenges: ChallengeData[]; total: number; totalPages: number } | null> {
  console.log(' getAllChallenges called:', { page, limit, searchQuery, categoryFilter, difficultyFilter });
  
  try {
    console.log(' Step 1: Checking admin role...');
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.warn(' User is not admin');
      return null;
    }
    console.log(' Admin role verified');

    console.log(' Step 2: Creating admin client...');
    const adminClient = createAdminClient();
    console.log(' Admin client created');

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    console.log(' Step 3: Building query...');
    let query = adminClient
      .from('exercises_full')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter);
    }

    // Apply difficulty filter
    if (difficultyFilter && difficultyFilter !== 'all') {
      query = query.eq('rank_name', difficultyFilter);
    }

    console.log(' Step 4: Fetching challenges...');
    const { data: challenges, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(' Error fetching challenges:', error);
      return null;
    }

    console.log(`✅ Fetched ${challenges?.length || 0} challenges`);
    
    return {
      challenges: challenges || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('❌ Unexpected error in getAllChallenges:', error);
    return null;
  }
}

/**
 * Get challenge by ID with admin privileges
 */
export async function getChallengeById(id: string): Promise<ChallengeData | null> {
  console.log(' getChallengeById called:', id);
  
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) return null;

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('exercises_full')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(' Error fetching challenge:', error);
      return null;
    }

    console.log(' Challenge fetched');
    return data;
  } catch (error) {
    console.error(' Unexpected error in getChallengeById:', error);
    return null;
  }
}

/**
 * Create new challenge
 */
/**
 * Create new challenge with daily challenge support
 */
export async function createChallenge(
  challengeData: {
    name: string;
    category: string;
    difficulty: string; // 'easy', 'medium', 'hard'
    description: string;
    solutions: string;
    tags: string[];
    points?: number;
    time_limit?: number;
    estimated_time?: number;
    is_locked?: boolean;
    required_level?: number;
    is_daily_challenge?: boolean;
    daily_bonus_points?: number;
    test_cases?: Array<{
      input: string;
      expected_output: string;
      description?: string;
      is_hidden: boolean;
    }>;
  }
): Promise<{ success: boolean; error?: string; challengeId?: string }> {
  console.log('🚀 createChallenge called');
  
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const adminClient = createAdminClient();

    // Map difficulty to rank and rank_name
    const difficultyMap: Record<string, { rank: number; rank_name: string; defaultPoints: number }> = {
      'easy': { rank: 1, rank_name: '8 kyu', defaultPoints: 10 },
      'medium': { rank: 4, rank_name: '5 kyu', defaultPoints: 30 },
      'hard': { rank: 7, rank_name: '2 kyu', defaultPoints: 50 }
    };

    const difficulty = difficultyMap[challengeData.difficulty.toLowerCase()] || difficultyMap['easy'];
    
    // Prepare exercise data
    const exerciseData = {
      name: challengeData.name,
      category: challengeData.category,
      description: challengeData.description,
      rank: difficulty.rank,
      rank_name: difficulty.rank_name,
      solutions: challengeData.solutions,
      points: challengeData.points || difficulty.defaultPoints,
      time_limit: challengeData.time_limit,
      estimated_time: challengeData.estimated_time,
      is_locked: challengeData.is_locked || false,
      required_level: challengeData.required_level,
      solved_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Step 1: Inserting exercise...');
    const { data: exercise, error: exerciseError } = await adminClient
      .from('exercises')
      .insert([exerciseData])
      .select()
      .single();

    if (exerciseError) {
      console.error('❌ Error creating exercise:', exerciseError);
      return { success: false, error: exerciseError.message };
    }

    const exerciseId = exercise.id;
    console.log('✅ Exercise created:', exerciseId);

    // Insert tags
    if (challengeData.tags && challengeData.tags.length > 0) {
      console.log('📝 Step 2: Inserting tags...');
      const tagInserts = challengeData.tags.map(tag => ({
        exercise_id: exerciseId,
        tag: tag
      }));

      const { error: tagsError } = await adminClient
        .from('exercise_tags')
        .insert(tagInserts);

      if (tagsError) {
        console.warn('⚠️ Error inserting tags:', tagsError);
      } else {
        console.log('✅ Tags inserted');
      }
    }

    // Insert test cases
    if (challengeData.test_cases && challengeData.test_cases.length > 0) {
      console.log('📝 Step 3: Inserting test cases...');
      const testCaseInserts = challengeData.test_cases.map((tc, index) => ({
        exercise_id: exerciseId,
        input: tc.input,
        expected_output: tc.expected_output,
        description: tc.description || `Test case ${index + 1}`,
        order_index: index,
        is_hidden: tc.is_hidden || false
      }));

      const { error: testCasesError } = await adminClient
        .from('test_cases')
        .insert(testCaseInserts);

      if (testCasesError) {
        console.warn('⚠️ Error inserting test cases:', testCasesError);
      } else {
        console.log('✅ Test cases inserted');
      }
    }

    // Insert daily challenge if applicable
    if (challengeData.is_daily_challenge) {
      console.log('📝 Step 4: Creating daily challenge...');
      const { error: dailyChallengeError } = await adminClient
        .from('daily_challenges')
        .insert([{
          exercise_id: exerciseId,
          challenge_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          bonus_points: challengeData.daily_bonus_points || 50
        }]);

      if (dailyChallengeError) {
        console.warn('⚠️ Error creating daily challenge:', dailyChallengeError);
      } else {
        console.log('✅ Daily challenge created');
      }
    }

    console.log('✅ Challenge creation complete');
    revalidatePath('/admin/challenges');
    return { success: true, challengeId: exerciseId.toString() };
  } catch (error) {
    console.error('❌ Unexpected error in createChallenge:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
/**
 * Update challenge
 */
export async function updateChallenge(
  id: string,
  updates: Partial<ChallengeData>
): Promise<{ success: boolean; error?: string }> {
  console.log('🚀 updateChallenge called:', id);
  
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('exercises_full')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('❌ Error updating challenge:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Challenge updated');
    revalidatePath('/admin/challenges');
    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error in updateChallenge:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete challenge
 */
export async function deleteChallenge(id: string): Promise<{ success: boolean; error?: string }> {
  console.log('🚀 deleteChallenge called:', id);
  
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const adminClient = createAdminClient();

    // First delete test cases
    await adminClient
      .from('test_cases')
      .delete()
      .eq('exercise_id', id);

    // Then delete challenge
    const { error } = await adminClient
      .from('exercises_full')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting challenge:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Challenge deleted');
    revalidatePath('/admin/challenges');
    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error in deleteChallenge:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get test cases for a challenge
 */
export async function getTestCases(exerciseId: string): Promise<TestCaseData[] | null> {
  console.log('🚀 getTestCases called:', exerciseId);
  
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) return null;

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('test_cases')
      .select('*')
      .eq('exercise_id', exerciseId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('❌ Error fetching test cases:', error);
      return null;
    }

    console.log(`✅ Fetched ${data?.length || 0} test cases`);
    return data || [];
  } catch (error) {
    console.error('❌ Unexpected error in getTestCases:', error);
    return null;
  }
}

/**
 * Add test case to challenge
 */
export async function addTestCase(
  testCaseData: {
    exercise_id: string;
    input: string;
    expected_output: string;
    is_hidden: boolean;
    order_index: number;
    description?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  console.log('🚀 addTestCase called');
  
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('test_cases')
      .insert([testCaseData]);

    if (error) {
      console.error('❌ Error adding test case:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Test case added');
    revalidatePath('/admin/challenges');
    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error in addTestCase:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get challenge statistics
 */
export async function getChallengeStats() {
  console.log('🚀 getChallengeStats called');
  
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) return null;

    const adminClient = createAdminClient();

    // Total challenges
    const { count: totalChallenges } = await adminClient
      .from('exercises_full')
      .select('*', { count: 'exact', head: true });

    // By difficulty
    const { data: byDifficulty } = await adminClient
      .from('exercises_full')
      .select('rank_name');

    const difficultyCount = (byDifficulty || []).reduce((acc, curr) => {
      acc[curr.rank_name] = (acc[curr.rank_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // By category
    const { data: byCategory } = await adminClient
      .from('exercises_full')
      .select('category');

    const categoryCount = (byCategory || []).reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Most solved
    const { data: mostSolved } = await adminClient
      .from('exercises_full')
      .select('name, solved_count')
      .order('solved_count', { ascending: false })
      .limit(5);

    console.log('✅ Challenge stats compiled');
    return {
      totalChallenges: totalChallenges || 0,
      byDifficulty: difficultyCount,
      byCategory: categoryCount,
      mostSolved: mostSolved || []
    };
  } catch (error) {
    console.error(' Unexpected error in getChallengeStats:', error);
    return null;
  }
}