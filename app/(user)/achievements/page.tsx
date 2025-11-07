import React from 'react';
import { redirect } from 'next/navigation';


import { createClient } from '@/lib/supabase/server';
import AchievementsClient from '@/components/achievement-client';

// Fetch all achievements with user progress
async function fetchAllAchievementsWithProgress() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('achievements')
    .select(`
      *,
      user_achievements!left (
        user_id,
        progress,
        earned_at
      )
    `)
    .order('tier', { ascending: true });

  if (error || !data) return [];

  return data.map((ach: any) => {
    const userAch = ach.user_achievements?.find((ua: any) => ua.user_id === user.id);
    
    return {
      id: ach.id,
      name: ach.name,
      description: ach.description,
      icon: ach.icon,
      category: ach.category,
      tier: ach.tier,
      reward: {
        type: ach.reward_type,
        amount: ach.reward_amount,
      },
      progress: userAch?.progress || 0,
      total: ach.requirement_total,
      unlockedAt: userAch?.earned_at,
    };
  });
}

export default async function AchievementsPage() {
  const achievements = await fetchAllAchievementsWithProgress();

  if (achievements.length === 0) {
    redirect('/login');
  }

  return <AchievementsClient achievements={achievements} />;
}