"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdminRole } from "../admin";

export async function deleteChallenge(id: string): Promise<{ success: boolean; error?: string }> {
 
  
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
      console.error('Error deleting challenge:', error);
      return { success: false, error: error.message };
    }

  
    revalidatePath('/admin/challenges/manage');
    return { success: true };
  } catch (error) {
    console.error(' Unexpected error in deleteChallenge:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
