"use server";

import { createClient } from "@/lib/supabase/server";

export async function login(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error);
    
    // Check if user is banned
    if (error.code === 'user_banned') {
      return {
        success: false,
        error: "Your account is banned. Please contact support if you believe this is an error.",
      };
    }
    
    // Check for other specific error codes
    if (error.code === 'invalid_credentials') {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }
    
    // Generic error for other cases
    return {
      success: false,
      error: error.message || "Invalid email or password",
    };
  }

  const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
  
  if (factorsError) {
    console.error("Error checking MFA factors:", factorsError);
    return {
      success: false,
      error: "Unable to verify authentication settings. Please try again.",
    };
  }

  const verifiedFactors = factorsData?.totp?.filter(f => f.status === "verified") || [];
  
  if (verifiedFactors.length > 0) {
    const factor = verifiedFactors[0];
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: factor.id,
    });

    if (challengeError) {
      console.error("MFA challenge error:", challengeError);
      return {
        success: false,
        error: "Unable to initiate two-factor authentication. Please try again.",
      };
    }

    return {
      success: false,
      mfaRequired: true,
      factorId: factor.id,
      challengeId: challengeData.id,
    };
  }

  return { success: true, user: data.user };
}