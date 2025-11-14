"use server";

import { createClient } from "@/lib/supabase/server";

export async function register(email: string, password: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    });

    if (error) {
      console.error('Supabase registration error:', error);
      return {
        success: false,
        error: getUserFriendlyError(error.message),
      };
    }

    // Check if user already exists
    // Supabase returns identities as empty array for existing users
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return {
        success: false,
        error: "An account with this email already exists. Please log in instead.",
      };
    }

    // Additional check: if user exists but wasn't created
    if (!data.user) {
      return {
        success: false,
        error: "Registration failed. This email may already be registered.",
      };
    }

    return {
      success: true,
      user: data.user,
      message: "Registration successful. Please check your email to verify your account.",
    };
  } catch (error) {
    console.error('Unexpected registration error:', error);
    return {
      success: false,
      error: "Failed to register user. Please try again later.",
    };
  }
}

function getUserFriendlyError(errorMessage: string): string {
  if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
    return "An account with this email already exists.";
  }
  if (errorMessage.includes('password')) {
    return "Password must be at least 6 characters long.";
  }
  if (errorMessage.includes('invalid email')) {
    return "Please enter a valid email address.";
  }
  if (errorMessage.includes('Email rate limit exceeded')) {
    return "Too many attempts. Please try again later.";
  }
  return "Registration failed. Please try again.";
}