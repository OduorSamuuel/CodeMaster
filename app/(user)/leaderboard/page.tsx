import React from 'react';

import { createClient } from '@/lib/supabase/server';
import LeaderboardClient from '@/components/leaderboard-client';


// Fetch different leaderboard types
async function fetchLeaderboards() {
  const supabase = await createClient();
  

   const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  const currentUserId = user?.id;

  // Fetch daily leaderboard
  const { data: dailyData } = await supabase
    .from('leaderboard_snapshots')
    .select('*')
    .eq('period_type', 'daily')
    .eq('period_date', new Date().toISOString().split('T')[0])
    .order('rank', { ascending: true })
    .limit(50);

  // Fetch weekly leaderboard
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  const { data: weeklyData } = await supabase
    .from('leaderboard_snapshots')
    .select('*')
    .eq('period_type', 'weekly')
    .gte('period_date', startOfWeek.toISOString().split('T')[0])
    .order('rank', { ascending: true })
    .limit(50);

  // Fetch all-time leaderboard
  const { data: allTimeData } = await supabase
    .from('user_profiles')
    .select('user_id, avatar, total_points, total_solved')
    .order('total_points', { ascending: false })
    .limit(50);

  // Get usernames for all-time
  const allTimeWithUsernames = await Promise.all(
    (allTimeData || []).map(async (entry, index) => {
      const { data: userData } = await supabase.auth.admin.getUserById(entry.user_id);
      return {
        rank: index + 1,
        username: userData?.user?.email?.split('@')[0] || 'Anonymous',
        avatar: entry.avatar || '👤',
        points: entry.total_points,
        solvedToday: entry.total_solved,
        isCurrentUser: entry.user_id === currentUserId,
      };
    })
  );

  const formatLeaderboard = (data: any[]) => 
    (data || []).map((entry: any) => ({
      rank: entry.rank,
      username: entry.username || 'Anonymous',
      avatar: entry.avatar || '👤',
      points: entry.points,
      solvedToday: entry.challenges_solved,
      isCurrentUser: entry.user_id === currentUserId,
    }));

  return {
    daily: formatLeaderboard(dailyData || []),
    weekly: formatLeaderboard(weeklyData || []),
    allTime: allTimeWithUsernames,
  };
}

export default async function LeaderboardPage() {
  const leaderboards = await fetchLeaderboards();

  return <LeaderboardClient leaderboards={leaderboards} />;
}