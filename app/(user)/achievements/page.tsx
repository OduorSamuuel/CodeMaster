

import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AchievementsClient from '@/components/achievement-client';


type RewardType = 'xp' | 'coins' | 'badge';
type Category = 'milestone' | 'streak' | 'skill' | 'speed' | 'social';
type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface AchievementRow {
  id: string;
  name: string;
  description: string;
  icon: string;               
  category: Category;
  tier: Tier;
  reward_type: RewardType;
  reward_amount: number;
  requirement_total: number;
  user_achievements?: UserAchievementRow[];
}

interface UserAchievementRow {
  user_id: string;
  progress: number;
  earned_at: string | null; 
}


export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: Category;
  tier: Tier;
  reward: { type: RewardType; amount: number };
  progress?: number;
  total?: number;
  unlockedAt?: string;
}


async function fetchAllAchievementsWithProgress(): Promise<Achievement[]> {
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

  return data.map((ach: AchievementRow): Achievement => {
    const userAch = ach.user_achievements?.find(
      (ua: UserAchievementRow) => ua.user_id === user.id
    );

    const isUnlocked = !!userAch?.earned_at;
    const hasProgress = ach.requirement_total > 0;

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

      ...(hasProgress && {
        progress: userAch?.progress ?? 0,
        total: ach.requirement_total,
      }),
      ...(isUnlocked && { unlockedAt: userAch!.earned_at! }),
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