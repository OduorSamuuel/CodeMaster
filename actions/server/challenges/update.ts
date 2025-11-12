"use server";
import { createClient } from "@/lib/supabase/server";
import { CreateChallengeInput } from "./fetch";

import { mapDifficultyToRank } from "@/lib/mapDifficultyToRank";
import { calculatePoints } from "@/lib/calculatePoints";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";

import { checkAdminRole } from "../admin";
import { ChallengeData } from "@/types";

export async function updateChallenge(
  id: string,
  updates: Partial<ChallengeData>
): Promise<{ success: boolean; error?: string }> {
 
  
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
      console.error(' Error updating challenge:', error);
      return { success: false, error: error.message };
    }

   
    revalidatePath('/admin/challenges');
    return { success: true };
  } catch (error) {
    console.error(' Unexpected error in updateChallenge:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
