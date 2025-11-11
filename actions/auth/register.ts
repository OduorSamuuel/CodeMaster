"use server";

import { createClient } from "@/lib/supabase/server";

export async function register(email: string, password: string) {
  const supabase =await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    },
  });

  if (error) throw new Error(error.message);

  return {
    success: true,
    user: data.user,
    message: "Registration successful. Please check your email to verify your account.",
  };
}
