'use server';

import { createClient } from '@/lib/supabase/server';
import { Challenge } from '@/types/challenge';

export async function fetchDailyChallenge(): Promise<{ 
  challenge: Challenge | null; 
  bonusPoints: number;
  challengeDate: string;
}> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Get today's daily challenge
    const { data: dailyChallenge, error } = await supabase
      .from('daily_challenges')
      .select(`
        *,
        challenges:challenge_id (*)
      `)
      .eq('challenge_date', today)
      .single();

    if (error) {
      console.error('Error fetching daily challenge:', error);
      return { challenge: null, bonusPoints: 0, challengeDate: today };
    }

    if (!dailyChallenge || !dailyChallenge.challenges) {
      return { challenge: null, bonusPoints: 0, challengeDate: today };
    }

    return {
      challenge: dailyChallenge.challenges as Challenge,
      bonusPoints: dailyChallenge.bonus_points || 50,
      challengeDate: dailyChallenge.challenge_date
    };
  } catch (error) {
    console.error('Error in fetchDailyChallenge:', error);
    return { challenge: null, bonusPoints: 0, challengeDate: new Date().toISOString().split('T')[0] };
  }
}

export async function fetchDailyChallengeHistory(page: number = 1, pageSize: number = 10): Promise<{
  history: Array<{
    challenge_date: string;
    challenge: Challenge;
    bonus_points: number;
  }>;
  totalCount: number;
}> {
  try {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get total count
    const { count, error: countError } = await supabase
      .from('daily_challenges')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting daily challenges:', countError);
      throw countError;
    }

    // Get paginated history
    const { data: history, error } = await supabase
      .from('daily_challenges')
      .select(`
        challenge_date,
        bonus_points,
        challenges:challenge_id (*)
      `)
      .order('challenge_date', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching daily challenge history:', error);
      throw error;
    }

    const formattedHistory = history?.map(item => ({
      challenge_date: item.challenge_date,
      challenge: item.challenges as Challenge,
      bonus_points: item.bonus_points
    })) || [];

    return {
      history: formattedHistory,
      totalCount: count || 0
    };
  } catch (error) {
    console.error('Error in fetchDailyChallengeHistory:', error);
    return { history: [], totalCount: 0 };
  }
}