'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Check MFA status for current user
 */
export async function checkMFAStatus(): Promise<{
  success: boolean;
  hasVerifiedFactor: boolean;
  hasPendingFactor: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, hasVerifiedFactor: false, hasPendingFactor: false, error: 'Not authenticated' };
    }

    // Get all MFA factors
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    
    if (factorsError) {
      console.error('Error listing MFA factors:', factorsError);
      return { success: false, hasVerifiedFactor: false, hasPendingFactor: false, error: factorsError.message };
    }

    const hasVerifiedFactor = factors?.totp?.some(factor => factor.status === 'verified') || false;
    const hasPendingFactor = factors?.totp?.some(factor => factor.status === 'unverified') || false;

    return {
      success: true,
      hasVerifiedFactor,
      hasPendingFactor
    };
  } catch (error) {
    console.error('Unexpected error in checkMFAStatus:', error);
    return { success: false, hasVerifiedFactor: false, hasPendingFactor: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Start MFA enrollment
 */
export async function enrollMFA(): Promise<{
  success: boolean;
  qrCode?: string;
  secret?: string;
  factorId?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Enroll a new TOTP factor
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `${user.email}'s Authenticator`
    });

    if (error) {
      console.error('MFA enrollment error:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'No enrollment data returned' };
    }

    return {
      success: true,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id
    };
  } catch (error) {
    console.error('Unexpected error in enrollMFA:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Continue existing MFA enrollment
 */
export async function continueExistingEnrollment(): Promise<{
  success: boolean;
  qrCode?: string;
  secret?: string;
  factorId?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get existing factors
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    
    if (factorsError) {
      return { success: false, error: factorsError.message };
    }

    // Find unverified factor
    const pendingFactor = factors?.totp?.find(factor => factor.status === 'unverified');
    
    if (!pendingFactor) {
      return { success: false, error: 'No pending enrollment found' };
    }

    // Get the QR code for the existing factor
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: pendingFactor.friendly_name || 'Authenticator'
    });

    if (error) {
      console.error('Error continuing enrollment:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      qrCode: data?.totp.qr_code,
      secret: data?.totp.secret,
      factorId: pendingFactor.id
    };
  } catch (error) {
    console.error('Unexpected error in continueExistingEnrollment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Verify MFA code during enrollment
 */
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

/**
 * Disable/Unenroll MFA
 */
export async function unenrollMFA(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get all factors
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    
    if (factorsError) {
      return { success: false, error: factorsError.message };
    }

    // Unenroll all TOTP factors
    if (factors?.totp) {
      for (const factor of factors.totp) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({
          factorId: factor.id
        });
        
        if (unenrollError) {
          console.error('Error unenrolling factor:', unenrollError);
          return { success: false, error: unenrollError.message };
        }
      }
    }

    revalidatePath('/admin/profile');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in unenrollMFA:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update user password
 */
export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!currentPassword || !newPassword) {
      return { success: false, error: 'Both current and new password are required' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters' };
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return { success: false, error: updateError.message || 'Failed to update password' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updatePassword:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update user profile information
 */
export async function updateProfile(
  { username, avatar }: { username?: string; avatar?: string; }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (username && username.trim().length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const updates: { username?: string; avatar?: string } = {};
    if (username) updates.username = username.trim();
    if (avatar) updates.avatar = avatar;

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath('/admin/profile');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateProfile:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role === 'admin') {
      const adminClient = createAdminClient();
      const { count: adminCount } = await adminClient
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (adminCount && adminCount <= 1) {
        return { success: false, error: 'Cannot delete the last admin account' };
      }
    }

    const { error: banError } = await supabase
      .from('user_profiles')
      .update({ 
        is_banned: true,
        ban_reason: 'Account deleted by user',
        banned_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (banError) {
      return { success: false, error: 'Failed to delete account' };
    }

    await supabase.auth.signOut();
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteAccount:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in logoutUser:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get admin profile data
 */
export async function getAdminProfile() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, avatar')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      username: user.email?.split('@')[0] || 'User',
      role: profile?.role || 'user',
      avatar: profile?.avatar,
      created_at: user.created_at,
      email_verified: user.email_confirmed_at !== null,
      last_login: user.last_sign_in_at || undefined,
    };
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return null;
  }
}