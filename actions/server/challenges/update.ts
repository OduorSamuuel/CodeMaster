"use server";


import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";

import { checkAdminRole } from "../admin";
import { Challenge } from "@/types";

export async function updateChallenge(
  id: string,
  updates: Partial<Challenge>
): Promise<{ success: boolean; error?: string }> {
 
  
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('challenges_full')
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
