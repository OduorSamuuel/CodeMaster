"use server";

import { createClient } from "@/lib/supabase/server";

export async function login(email: string, password: string) {
  const supabase =  await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);


  const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
  if (factorsError) {
    console.error("Error checking MFA factors:", factorsError);
  }

  const verifiedFactors = factorsData?.totp?.filter(f => f.status === "verified") || [];


  if (verifiedFactors.length > 0) {
    const factor = verifiedFactors[0];
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: factor.id,
    });

    if (challengeError) {
      throw new Error("Failed to create MFA challenge");
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
