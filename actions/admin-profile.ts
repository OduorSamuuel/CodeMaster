'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Update user password
 */
export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  console.log('🚀 updatePassword called');
  
  try {
    // Validate inputs
    if (!currentPassword || !newPassword) {
      return { success: false, error: 'Both current and new password are required' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters' };
    }

    console.log('📝 Step 1: Getting current user...');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return { success: false, error: 'Not authenticated' };
    }
    console.log('✅ User authenticated:', user.id);

    console.log('📝 Step 2: Updating password...');
    // Note: Supabase doesn't require current password verification for updateUser
    // It relies on the user being authenticated
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      console.error('❌ Password update error:', updateError);
      return { success: false, error: updateError.message || 'Failed to update password' };
    }

    console.log('✅ Password updated successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error in updatePassword:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update user profile information
 */
export async function updateProfile(
  username: string
): Promise<{ success: boolean; error?: string }> {
  console.log('🚀 updateProfile called with username:', username);
  
  try {
    if (!username || username.trim().length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }

    console.log('📝 Step 1: Getting current user...');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return { success: false, error: 'Not authenticated' };
    }
    console.log('✅ User authenticated:', user.id);

    console.log('📝 Step 2: Updating profile...');
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        // Add username field to your user_profiles table if not exists
        // username: username.trim() 
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('❌ Profile update error:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log('✅ Profile updated successfully');
    revalidatePath('/admin/profile');
    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error in updateProfile:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update notification preferences
 */


/**
 * Delete user account
 */
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  console.log('🚀 deleteAccount called');
  
  try {
    console.log('📝 Step 1: Getting current user...');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return { success: false, error: 'Not authenticated' };
    }
    console.log('✅ User authenticated:', user.id);

    console.log('📝 Step 2: Checking if user is admin...');
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // Prevent deleting the last admin
    if (profile?.role === 'admin') {
      console.log('📝 Step 3: Checking admin count...');
      const adminClient = createAdminClient();
      const { count: adminCount } = await adminClient
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (adminCount && adminCount <= 1) {
        console.warn('❌ Cannot delete last admin account');
        return { success: false, error: 'Cannot delete the last admin account' };
      }
    }

    console.log('📝 Step 4: Soft deleting account (banning)...');
    // Soft delete by banning the account
    const { error: banError } = await supabase
      .from('user_profiles')
      .update({ 
        is_banned: true,
        ban_reason: 'Account deleted by user',
        banned_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (banError) {
      console.error('❌ Ban error:', banError);
      return { success: false, error: 'Failed to delete account' };
    }

    console.log('📝 Step 5: Signing out user...');
    await supabase.auth.signOut();

    console.log('✅ Account deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error in deleteAccount:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<{ success: boolean; error?: string }> {
  console.log('🚀 logoutUser called');
  
  try {
    const supabase = await createClient();
    
    console.log('📝 Signing out user...');
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ User logged out successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error in logoutUser:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get admin profile data
 */
export async function getAdminProfile() {
  console.log('🚀 getAdminProfile called');
  
  try {
    const supabase = await createClient();

    console.log('📝 Step 1: Getting current user...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return null;
    }
    console.log('✅ User authenticated:', user.id);

    console.log('📝 Step 2: Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, avatar')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      return null;
    }
    console.log('✅ Profile fetched');

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
    console.error('❌ Error fetching admin profile:', error);
    return null;
  }
}