'use server';

import { createClient } from '@/lib/supabase/server';

import { createAdminClient } from '@/lib/supabase/admin';

import { checkAdminRole } from '../admin';
import { ChallengeData, TestCase } from '@/types';




/**
 * Delete a challenge
 */

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
export async function getAllChallenges(
  page: number = 1,
  limit: number = 20,
  searchQuery?: string,
  categoryFilter?: string,
  difficultyFilter?: string
): Promise<{ challenges: ChallengeData[]; total: number; totalPages: number } | null> {

  
  try {

    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.warn(' User is not admin');
      return null;
    }
  


    const adminClient = createAdminClient();
   

    const from = (page - 1) * limit;
    const to = from + limit - 1;

 
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


    const { data: challenges, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(' Error fetching challenges:', error);
      return null;
    }

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
export async function getTestCases(exerciseId: string): Promise<TestCase[] | null> {
 
  
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
      console.error(' Error fetching test cases:', error);
      return null;
    }


    return data || [];
  } catch (error) {
    console.error(' Unexpected error in getTestCases:', error);
    return null;
  }
}
export async function getChallengeStats() {
 
  
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