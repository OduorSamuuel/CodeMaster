export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export interface LayoutUserData {
  name: string;
  avatar: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  streak: number;
  rank: string;

  totalSolved: number;
}
export interface DetailedStats {
  totalAttempts: number;
  successRate: number;
  averageTime: number;
  perfectSolves: number;
  hintsUsed: number;
  challengesByDifficulty: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  activityByDay: { date: string; challenges: number }[];
  topCategories: { name: string; count: number; percentage: number }[];
  recentActivity: {
    date: string;
    challengeName: string;
    points: number;
    status: 'completed' | 'attempted';
  }[];
}
export interface UserProfile {
  level: number;
   currentXP: number;
  xpToNextLevel: number;
 longestStreak: number;
  experienceLevel: ExperienceLevel;
   totalXP: number;
  avatar: string;
  username: string;
  user_id?: string;

   totalChallengesSolved: number;
  streak: number;
  joinedDate: string;
 
}