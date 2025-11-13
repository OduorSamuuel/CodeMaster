"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function verifyMFAEnrollment(
  factorId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!code || code.length !== 6) {
      return { success: false, error: 'Invalid code format' };
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Challenge and verify the factor
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    
    if (challenge.error) {
      console.error('MFA challenge error:', challenge.error);
      return { success: false, error: challenge.error.message };
    }

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code
    });

    if (verify.error) {
      console.error('MFA verification error:', verify.error);
      return { success: false, error: 'Invalid verification code' };
    }

    revalidatePath('/admin/profile');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in verifyMFAEnrollment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function verifyMFA(factorId: string, challengeId: string, code: string) {
  // Validate code format
  if (!code || code.length !== 6) {
    return {
      success: false,
      error: "Please enter a valid 6-digit code",
    };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code,
  });

  if (error) {
 
    console.error("MFA verification error:", error);
    
  
    return {
      success: false,
      error: "Invalid verification code. Please try again.",
    };
  }

  return { 
    success: true, 
    user: data.user 
  };
}