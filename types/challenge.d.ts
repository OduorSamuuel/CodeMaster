export interface Challenge {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  tags: string[];
  points: number;
  timeLimit?: number;
  solvedCount: number;
  locked: boolean;
  requiredLevel?: number;
}
export interface UserProgress {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  streak: number;
  lastActiveDate: string;
  exercisesCompletedToday: number;
  dailyGoal: number;
}
export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  points: number;
  solvedToday: number;
  isCurrentUser?: boolean;
}
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  total?: number;
}

