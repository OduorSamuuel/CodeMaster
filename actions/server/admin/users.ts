'use server';

import { createClient } from '@/lib/supabase/server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkAdminRole } from './analytics';

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
 
  
  try {
    
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.warn('❌ User is not admin');
      return null;
    }
   


    const adminClient = createAdminClient();
 


    const { count: totalUsers } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
 

    // Active users (logged in within last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
   
    
    const { count: activeUsers } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', weekAgo.toISOString());
 

    // New users this week
  
    const { count: newThisWeek } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());
 


    const { count: bannedUsers } = await adminClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', true);
  

    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newThisWeek: newThisWeek || 0,
      bannedUsers: bannedUsers || 0
    };
    

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

  try {
 const isAdmin = await checkAdminRole();
  if (!isAdmin) {
      console.warn(' User is not admin, returning null');
      return null;
    }
  
  const adminClient = createAdminClient();
 
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query for user_profiles using ADMIN client
  let query = adminClient
      .from('user_profiles')
      .select('*', { count: 'exact' });
 
    // Apply role filter
    if (roleFilter && roleFilter !== 'all') {
   query = query.eq('role', roleFilter);
    } else {
  }

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
  if (statusFilter === 'banned') {
    query = query.eq('is_banned', true);
      } else {
      query = query.eq('is_banned', false);
        
        if (statusFilter === 'active') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
       query = query.gte('last_login', weekAgo.toISOString());
        } else if (statusFilter === 'inactive') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
            query = query.lt('last_login', weekAgo.toISOString());
        }
      }
    } else {
 }

    // Fetch user profiles
  const { data: profiles, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });



    if (error) {
      console.error(' Error fetching user profiles:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }
  if (!profiles || profiles.length === 0) {
      console.warn(' No profiles found, returning empty result');
      return { users: [], total: 0, totalPages: 0 };
    }
  
    // Get user emails from auth.users using admin client
    const userIds = profiles.map(p => p.user_id);
  
    let emailMap = new Map<string, { email: string; last_sign_in?: string }>();
    
  try {
      const { data: { users: authUsers }, error: authError } =
        await adminClient.auth.admin.listUsers();
      
   
      
      if (authError) {
        console.error(' Error fetching auth users:', authError);
        console.error('Auth error details:', JSON.stringify(authError, null, 2));
      } else {
    
        // Create map of user_id to email data
        const filteredAuthUsers = authUsers?.filter(u => userIds.includes(u.id)) || [];
    
        emailMap = new Map(
          filteredAuthUsers.map(u => {
            return [
              u.id, 
              { 
                email: u.email || 'No email',
                last_sign_in: u.last_sign_in_at || undefined
              }
            ];
          })
        );
        
      }
    } catch (authError) {
      console.error('❌ Exception while fetching auth users:', authError);
      console.error('Exception stack:', authError instanceof Error ? authError.stack : 'No stack trace');
      console.error('💡 Make sure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local');
    }

    // Determine active status threshold
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Map profiles to UserManagementData with email information
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
        status: profile.is_banned ? 'inactive' : (isActive ? 'active' : 'inactive') as 'active' | 'inactive',
        is_banned: profile.is_banned || false,
        avatar: profile.avatar
      };

      if (index === 0) {
        
      }

      return userData;
    });
 
    // Apply search filter on processed data if search query exists
    let filteredUsers = users;
    if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    
      filteredUsers = users.filter(user => {
        const matches = user.username.toLowerCase().includes(query) ||
                       user.email.toLowerCase().includes(query) ||
                       user.id.toLowerCase().includes(query);
        return matches;
      });
      
  } else {
   }

    // Return results
    const result = {
      users: filteredUsers,
      total: searchQuery ? filteredUsers.length : (count || 0),
      totalPages: Math.ceil((searchQuery ? filteredUsers.length : (count || 0)) / limit)
    };
    

    return result;
  } catch (error) {
    console.error('Unexpected error in getUsers:', error);
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
 
  try {
  const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.warn(' User is not admin');
      return null;
    }

   const adminClient = createAdminClient();

    // Fetch user profile using admin client
  const { data: profile, error } = await adminClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      console.error('❌ Error fetching user profile:', error);
      return null;
    }
 
    // Get email and auth data from auth.users using admin client
    let email = 'Email not available';
    let lastSignIn = profile.last_login;
    
try {
      // Get specific user by ID
      const { data: { user: authUser }, error: authError } = 
        await adminClient.auth.admin.getUserById(userId);
      
      if (authError) {
        console.error('❌ Error fetching auth user:', authError);
      } else if (authUser) {
        email = authUser.email || email;
        lastSignIn = authUser.last_sign_in_at || lastSignIn;
   }
    } catch (authError) {
      console.error('❌ Failed to fetch auth user details:', authError);
    }

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
      status: (profile.is_banned ? 'inactive' : (isActive ? 'active' : 'inactive')) as 'active' | 'inactive',
      is_banned: profile.is_banned || false,
      avatar: profile.avatar
    };

    return userData;
  } catch (error) {
    console.error('Unexpected error in getUserDetails:', error);
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

  try {
  const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.warn(' User is not admin');
      return { success: false, error: 'Unauthorized' };
    }

const regularClient = await createClient();
    const { data } = await regularClient.auth.getClaims();
    const currentUser = data?.claims;
    
    if (currentUser?.sub === userId && newRole !== 'admin') {
      console.warn(' Attempted self-demotion prevented');
      return { success: false, error: 'Cannot change your own admin role' };
    }
const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('user_profiles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      console.error(' Error updating role:', error);
      return { success: false, error: error.message };
    }

  revalidatePath('/admin/users/all');
    return { success: true };
  } catch (error) {
    console.error(' Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

/**
 * Toggle user ban status (UPDATED to use admin client)
 */
export async function toggleUserBan(
  userId: string,
  banned: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.warn('⚠️ User is not admin');
      return { success: false, error: 'Unauthorized' };
    }

    // Prevent self-ban
    const regularClient = await createClient();
    const { data } = await regularClient.auth.getClaims();
    const currentUser = data?.claims;
    
    if (currentUser?.sub === userId) {
      console.warn('❌ Attempted self-ban prevented');
      return { success: false, error: 'Cannot ban yourself' };
    }

    const adminClient = createAdminClient();
    
    // Use Supabase Auth Admin API to ban/unban user
    if (banned) {
      // Ban the user with a very long duration (876000h = 100 years)
      const { error } = await adminClient.auth.admin.updateUserById(
        userId,
        { ban_duration: '876000h',
          
         } // Effectively permanent

      );

      if (error) {
        console.error(' Error banning user:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Unban by setting duration to none (removes the ban)
      const { error } = await adminClient.auth.admin.updateUserById(
        userId,
        { ban_duration: 'none' }
      );

      if (error) {
        console.error(' Error unbanning user:', error);
        return { success: false, error: error.message };
      }
    }

   
    const { error: profileError } = await adminClient
  .from('user_profiles')
  .update({
    is_banned: banned,
    banned_at: banned ? new Date().toISOString() : null
  })
  .eq('user_id', userId);

if (profileError) {
  console.error("PROFILE UPDATE ERROR:", profileError);
}


    revalidatePath('/admin/users/all');
    return { success: true };
  } catch (error) {
    console.error(' Error toggling user ban:', error);
    return { success: false, error: 'Failed to update ban status' };
  }
}
/**
 * Delete user (soft delete - ban instead) (UPDATED to use admin client)
 */
export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
 
  try {
   const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.warn('❌ User is not admin');
      return { success: false, error: 'Unauthorized' };
    }
 
    // Prevent self-deletion
    const regularClient = await createClient();
    const { data } = await regularClient.auth.getClaims();
    const currentUser = data?.claims;
    
    if (currentUser?.sub === userId) {
      console.warn(' Attempted self-deletion prevented');
      return { success: false, error: 'Cannot delete yourself' };
    }
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
      console.error(' Error deleting user:', error);
      return { success: false, error: error.message };
    }

  revalidatePath('/admin/users/all');
    return { success: true };
  } catch (error) {
    console.error(' Error deleting user:', error);
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