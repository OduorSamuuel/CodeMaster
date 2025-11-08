'use server';

import { createClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/actions/admin';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export interface UserManagementData {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  level: number;
  xp: number;
  total_points: number;
  streak: number;
  total_solved: number;
  joined: string;
  lastActive: string;
  status: 'active' | 'inactive';
  is_banned: boolean;
  avatar?: string;
}

export interface UserManagementStats {
  totalUsers: number;
  activeUsers: number;
  newThisWeek: number;
  bannedUsers: number;
}

/**
 * Get user management statistics (UPDATED to use admin client)
 */
export async function getUserManagementStats(): Promise<UserManagementStats | null> {
  console.log('🚀 getUserManagementStats called');
  
  try {
    console.log('📝 Step 1: Checking admin role...');
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.warn('❌ User is not admin');
      return null;
    }
    console.log('✅ Admin role verified');

    console.log('📝 Step 2: Creating admin client...');
    const adminClient = createAdminClient();
    console.log('✅ Admin client created');

    // Total users
    console.log('📝 Step 3: Fetching total users...');
    const { count: totalUsers } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
    console.log('  → Total users:', totalUsers);

    // Active users (logged in within last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    console.log('📝 Step 4: Fetching active users...');
    
    const { count: activeUsers } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', weekAgo.toISOString());
    console.log('  → Active users:', activeUsers);

    // New users this week
    console.log('📝 Step 5: Fetching new users...');
    const { count: newThisWeek } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());
    console.log('  → New this week:', newThisWeek);

    // Banned users
    console.log('📝 Step 6: Fetching banned users...');
    const { count: bannedUsers } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', true);
    console.log('  → Banned users:', bannedUsers);

    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newThisWeek: newThisWeek || 0,
      bannedUsers: bannedUsers || 0
    };
    
    console.log('✅ User Management Stats:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error fetching user management stats:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Get all users with pagination and search (UPDATED to use admin client)
 */
export async function getUsers(
  page = 1,
  limit = 10,
  searchQuery?: string,
  roleFilter?: 'all' | 'user' | 'admin' | 'moderator',
  statusFilter?: 'all' | 'active' | 'inactive' | 'banned'
): Promise<{ users: UserManagementData[]; total: number; totalPages: number } | null> {
  console.log('🚀 getUsers called with params:', { page, limit, searchQuery, roleFilter, statusFilter });
  
  try {
    console.log('📝 Step 1: Checking admin role...');
    const isAdmin = await checkAdminRole();
    console.log('Admin check result:', isAdmin);
    if (!isAdmin) {
      console.warn('❌ User is not admin, returning null');
      return null;
    }
    console.log('✅ Admin role verified');

    console.log('📝 Step 2: Creating admin Supabase client (bypassing RLS)...');
    const adminClient = createAdminClient();
    console.log('✅ Admin client created');

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    console.log('📊 Pagination calculated:', { from, to, page, limit });

    // Build query for user_profiles using ADMIN client
    console.log('📝 Step 3: Building user_profiles query with admin client...');
    let query = adminClient
      .from('user_profiles')
      .select('*', { count: 'exact' });
    console.log('✅ Base query created (using admin client - RLS bypassed)');

    // Apply role filter
    if (roleFilter && roleFilter !== 'all') {
      console.log(`🔍 Applying role filter: ${roleFilter}`);
      query = query.eq('role', roleFilter);
    } else {
      console.log('ℹ️ No role filter applied');
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      console.log(`🔍 Applying status filter: ${statusFilter}`);
      if (statusFilter === 'banned') {
        console.log('  → Filtering for banned users');
        query = query.eq('is_banned', true);
      } else {
        console.log('  → Filtering for non-banned users');
        query = query.eq('is_banned', false);
        
        if (statusFilter === 'active') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          console.log(`  → Filtering for active users (last_login >= ${weekAgo.toISOString()})`);
          query = query.gte('last_login', weekAgo.toISOString());
        } else if (statusFilter === 'inactive') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          console.log(`  → Filtering for inactive users (last_login < ${weekAgo.toISOString()})`);
          query = query.lt('last_login', weekAgo.toISOString());
        }
      }
    } else {
      console.log('ℹ️ No status filter applied');
    }

    // Fetch user profiles
    console.log('📝 Step 4: Fetching user profiles from database...');
    const { data: profiles, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    console.log('Query execution result:', { 
      profilesCount: profiles?.length || 0, 
      totalCount: count,
      hasError: !!error 
    });

    if (error) {
      console.error('❌ Error fetching user profiles:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }
    console.log('✅ User profiles fetched successfully');

    if (!profiles || profiles.length === 0) {
      console.warn('⚠️ No profiles found, returning empty result');
      return { users: [], total: 0, totalPages: 0 };
    }
    console.log(`📦 Retrieved ${profiles.length} profiles`);

    // Get user emails from auth.users using admin client
    const userIds = profiles.map(p => p.user_id);
    console.log('📝 Step 5: Extracting user IDs:', userIds);
    
    let emailMap = new Map<string, { email: string; last_sign_in?: string }>();
    
    console.log('📝 Step 6: Fetching auth users with admin client...');
    try {
      console.log('  → User IDs to fetch:', userIds);
      
      const { data: { users: authUsers }, error: authError } = 
        await adminClient.auth.admin.listUsers();
      
      console.log('Auth users fetch result:', {
        totalAuthUsers: authUsers?.length || 0,
        hasError: !!authError
      });
      
      if (authError) {
        console.error('❌ Error fetching auth users:', authError);
        console.error('Auth error details:', JSON.stringify(authError, null, 2));
      } else {
        console.log('✅ Successfully fetched auth users:', authUsers?.length || 0);
        
        // Create map of user_id to email data
        const filteredAuthUsers = authUsers?.filter(u => userIds.includes(u.id)) || [];
        console.log(`📝 Step 7: Filtering auth users for our profile IDs...`);
        console.log(`  → Matched ${filteredAuthUsers.length} out of ${authUsers?.length || 0} auth users`);
        
        emailMap = new Map(
          filteredAuthUsers.map(u => {
            console.log(`  → Mapping user ${u.id}: ${u.email}`);
            return [
              u.id, 
              { 
                email: u.email || 'No email',
                last_sign_in: u.last_sign_in_at || undefined
              }
            ];
          })
        );
        
        console.log('✅ Email map created with', emailMap.size, 'entries');
      }
    } catch (authError) {
      console.error('❌ Exception while fetching auth users:', authError);
      console.error('Exception stack:', authError instanceof Error ? authError.stack : 'No stack trace');
      console.error('💡 Make sure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local');
    }

    // Determine active status threshold
    console.log('📝 Step 8: Processing user data...');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    console.log(`  → Active threshold: ${weekAgo.toISOString()}`);

    // Map profiles to UserManagementData with email information
    console.log('📝 Step 9: Mapping profiles to UserManagementData...');
    const users: UserManagementData[] = profiles.map((profile, index) => {
      const authData = emailMap.get(profile.user_id);
      const lastLogin = profile.last_login || authData?.last_sign_in || profile.created_at;
      const isActive = new Date(lastLogin) > weekAgo && !profile.is_banned;

      const userData = {
        id: profile.user_id,
        username: authData?.email?.split('@')[0] || `user_${profile.user_id.slice(0, 8)}`,
        email: authData?.email || 'Email not available',
        role: profile.role || 'user',
        level: profile.level || 1,
        xp: profile.current_xp || 0,
        total_points: profile.total_points || 0,
        streak: profile.current_streak || 0,
        total_solved: profile.total_solved || 0,
        joined: profile.created_at,
        lastActive: lastLogin,
        status: profile.is_banned ? 'inactive' : (isActive ? 'active' : 'inactive'),
        is_banned: profile.is_banned || false,
        avatar: profile.avatar
      };

      if (index === 0) {
        console.log('  → Sample mapped user:', userData);
      }

      return userData;
    });
    console.log(`✅ Mapped ${users.length} users`);

    // Apply search filter on processed data if search query exists
    let filteredUsers = users;
    if (searchQuery && searchQuery.trim()) {
      console.log('📝 Step 10: Applying search filter...');
      const query = searchQuery.toLowerCase();
      console.log(`  → Search query: "${query}"`);
      
      filteredUsers = users.filter(user => {
        const matches = user.username.toLowerCase().includes(query) ||
                       user.email.toLowerCase().includes(query) ||
                       user.id.toLowerCase().includes(query);
        return matches;
      });
      
      console.log(`  → Filtered from ${users.length} to ${filteredUsers.length} users`);
    } else {
      console.log('ℹ️ No search query applied');
    }

    // Return results
    const result = {
      users: filteredUsers,
      total: searchQuery ? filteredUsers.length : (count || 0),
      totalPages: Math.ceil((searchQuery ? filteredUsers.length : (count || 0)) / limit)
    };
    
    console.log('📝 Step 11: Preparing final result...');
    console.log('Final result summary:', {
      usersCount: result.users.length,
      total: result.total,
      totalPages: result.totalPages
    });
    console.log('✅ getUsers completed successfully');
    
    return result;
  } catch (error) {
    console.error('❌ Unexpected error in getUsers:', error);
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return null;
  }
}

/**
 * Get single user details (UPDATED to use admin client)
 */
export async function getUserDetails(userId: string): Promise<UserManagementData | null> {
  console.log('🚀 getUserDetails called for userId:', userId);
  
  try {
    console.log('📝 Step 1: Checking admin role...');
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.warn('❌ User is not admin');
      return null;
    }
    console.log('✅ Admin role verified');

    console.log('📝 Step 2: Creating admin client...');
    const adminClient = createAdminClient();
    console.log('✅ Admin client created');

    // Fetch user profile using admin client
    console.log('📝 Step 3: Fetching user profile...');
    const { data: profile, error } = await adminClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      console.error('❌ Error fetching user profile:', error);
      return null;
    }
    console.log('✅ User profile fetched');

    // Get email and auth data from auth.users using admin client
    let email = 'Email not available';
    let lastSignIn = profile.last_login;
    
    console.log('📝 Step 4: Fetching auth user data...');
    try {
      // Get specific user by ID
      const { data: { user: authUser }, error: authError } = 
        await adminClient.auth.admin.getUserById(userId);
      
      if (authError) {
        console.error('❌ Error fetching auth user:', authError);
      } else if (authUser) {
        email = authUser.email || email;
        lastSignIn = authUser.last_sign_in_at || lastSignIn;
        console.log('✅ Fetched email for user:', authUser.email);
      }
    } catch (authError) {
      console.error('❌ Failed to fetch auth user details:', authError);
    }

    // Calculate active status
    console.log('📝 Step 5: Calculating user status...');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const isActive = new Date(lastSignIn || profile.created_at) > weekAgo && !profile.is_banned;

    const userData = {
      id: profile.user_id,
      username: email.split('@')[0] || `user_${profile.user_id.slice(0, 8)}`,
      email,
      role: profile.role || 'user',
      level: profile.level || 1,
      xp: profile.current_xp || 0,
      total_points: profile.total_points || 0,
      streak: profile.current_streak || 0,
      total_solved: profile.total_solved || 0,
      joined: profile.created_at,
      lastActive: lastSignIn || profile.created_at,
      status: profile.is_banned ? 'inactive' : (isActive ? 'active' : 'inactive'),
      is_banned: profile.is_banned || false,
      avatar: profile.avatar
    };

    console.log('✅ getUserDetails completed:', userData);
    return userData;
  } catch (error) {
    console.error('❌ Unexpected error in getUserDetails:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Update user role (UPDATED to use admin client)
 */
export async function updateUserRole(
  userId: string,
  newRole: 'user' | 'admin' | 'moderator'
): Promise<{ success: boolean; error?: string }> {
  console.log('🚀 updateUserRole called:', { userId, newRole });
  
  try {
    console.log('📝 Step 1: Checking admin role...');
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.warn('❌ User is not admin');
      return { success: false, error: 'Unauthorized' };
    }
    console.log('✅ Admin role verified');

    // Get current user to prevent self-demotion
    console.log('📝 Step 2: Checking for self-demotion...');
    const regularClient = await createClient();
    const { data } = await regularClient.auth.getClaims();
    const currentUser = data?.claims;
    
    if (currentUser?.sub === userId && newRole !== 'admin') {
      console.warn('❌ Attempted self-demotion prevented');
      return { success: false, error: 'Cannot change your own admin role' };
    }
    console.log('✅ Not a self-demotion');

    console.log('📝 Step 3: Updating user role...');
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('user_profiles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error updating role:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ User role updated successfully');
    revalidatePath('/admin/users/all');
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

/**
 * Toggle user ban status (UPDATED to use admin client)
 */
export async function toggleUserBan(
  userId: string,
  banned: boolean,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  console.log('🚀 toggleUserBan called:', { userId, banned, reason });
  
  try {
    console.log('📝 Step 1: Checking admin role...');
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.warn('❌ User is not admin');
      return { success: false, error: 'Unauthorized' };
    }
    console.log('✅ Admin role verified');

    // Prevent self-ban
    console.log('📝 Step 2: Checking for self-ban...');
    const regularClient = await createClient();
    const { data } = await regularClient.auth.getClaims();
    const currentUser = data?.claims;
    
    if (currentUser?.sub === userId) {
      console.warn('❌ Attempted self-ban prevented');
      return { success: false, error: 'Cannot ban yourself' };
    }
    console.log('✅ Not a self-ban');

    console.log('📝 Step 3: Updating ban status...');
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('user_profiles')
      .update({ 
        is_banned: banned,
        ban_reason: reason || null,
        banned_at: banned ? new Date().toISOString() : null
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error updating ban status:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Ban status updated successfully');
    revalidatePath('/admin/users/all');
    return { success: true };
  } catch (error) {
    console.error('❌ Error toggling user ban:', error);
    return { success: false, error: 'Failed to update ban status' };
  }
}

/**
 * Delete user (soft delete - ban instead) (UPDATED to use admin client)
 */
export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  console.log('🚀 deleteUser called for userId:', userId);
  
  try {
    console.log('📝 Step 1: Checking admin role...');
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.warn('❌ User is not admin');
      return { success: false, error: 'Unauthorized' };
    }
    console.log('✅ Admin role verified');

    // Prevent self-deletion
    console.log('📝 Step 2: Checking for self-deletion...');
    const regularClient = await createClient();
    const { data } = await regularClient.auth.getClaims();
    const currentUser = data?.claims;
    
    if (currentUser?.sub === userId) {
      console.warn('❌ Attempted self-deletion prevented');
      return { success: false, error: 'Cannot delete yourself' };
    }
    console.log('✅ Not a self-deletion');

    console.log('📝 Step 3: Soft deleting user (banning)...');
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('user_profiles')
      .update({ 
        is_banned: true,
        ban_reason: 'Account deleted by admin',
        banned_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error deleting user:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ User soft deleted successfully');
    revalidatePath('/admin/users/all');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

/**
 * Format relative time (helper function)
 */
export async function formatRelativeTime(dateString: string): Promise<string> {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return diffMins <= 1 ? '1 minute ago' : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}