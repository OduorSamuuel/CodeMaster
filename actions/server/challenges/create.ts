"use server";
import { createClient } from "@/lib/supabase/server";
import { CreateChallengeInput } from "./fetch";

import { mapDifficultyToRank } from "@/lib/mapDifficultyToRank";
import { calculatePoints } from "@/lib/calculatePoints";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkAdminRole } from "../admin";


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
  

    // Insert tags
    if (challengeData.tags && challengeData.tags.length > 0) {
    
      const tagInserts = challengeData.tags.map(tag => ({
        exercise_id: exerciseId,
        tag: tag
      }));

      const { error: tagsError } = await adminClient
        .from('exercise_tags')
        .insert(tagInserts);

      if (tagsError) {
        console.warn(' Error inserting tags:', tagsError);
      } else {
     
      }
    }

    // Insert test cases
    if (challengeData.test_cases && challengeData.test_cases.length > 0) {
   
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
      
      }
    }

    // Insert daily challenge if applicable
    if (challengeData.is_daily_challenge) {

      const { error: dailyChallengeError } = await adminClient
        .from('daily_challenges')
        .insert([{
          exercise_id: exerciseId,
          challenge_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          bonus_points: challengeData.daily_bonus_points || 50
        }]);

      if (dailyChallengeError) {
        console.warn(' Error creating daily challenge:', dailyChallengeError);
      } else {
     
      }
    }

  
    revalidatePath('/admin/challenges');
    return { success: true, challengeId: exerciseId.toString() };
  } catch (error) {

    return { success: false, error: 'An unexpected error occurred' };
  }
}
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
      console.error(' Error adding test case:', error);
      return { success: false, error: error.message };
    }

  
    revalidatePath('/admin/challenges');
    return { success: true };
  } catch (error) {
    console.error(' Unexpected error in addTestCase:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
