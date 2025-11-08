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
  solutions?: string;
}
export interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  rank: number;
  rank_name: string;
  solutions: string;
  points: number;
  created_at: string;
  updated_at: string;
  solved_count: number | null;
  is_locked: boolean;
  required_level?: number | null;
  time_limit?: number | null;
  estimated_time?: number | null;
}

export interface ExerciseFull extends Exercise {
  tags: string[] | null;
  test_count: number;
}
export interface TestCase {
  id: string;
  exercise_id: string;
  input: string;
  expected_output: string;
  description: string;
  order_index: number;
  is_hidden: boolean;
}

export interface TestResult {
  testId: string;
  passed: boolean;
  message: string;
  output?: string;
  expected?: string;
  error?: string;
  executionTime?: number;
}

export interface ChallengeProgress {
  timeElapsed: number;
  hintsUsed: number;
  attemptsCount: number;
  isCompleted: boolean;
  testsPassed: number;
  testsTotal: number;
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

// types/challenge.ts

export interface Challenge {
  id: number;
  title: string;
  name?: string; // Alias for title
  difficulty: string; // e.g., "8 kyu", "5 kyu"
  category: 'reference' | 'bug_fixes' | 'algorithms' | 'data_structures';
  description: string;
  rank: number;
  rank_name: string;
  solutions: string;
  points: number;
  solvedCount?: number;
  solved_count?: number; // Database field
  locked?: boolean;
  is_locked?: boolean; // Database field
  requiredLevel?: number;
  required_level?: number; // Database field
  timeLimit?: number;
  time_limit?: number; // Database field
  estimatedTime?: number;
  estimated_time?: number; // Database field
  tags?: string[];
  test_cases?: TestCase[];
  created_at?: string;
  updated_at?: string;
}

export interface TestCase {
  id?: number;
  exercise_id?: number;
  input: string;
  expected_output: string;
  description: string;
  order_index?: number;
  is_hidden: boolean;
  created_at?: string;
}

export interface DailyChallenge {
  id: number;
  exercise_id: number;
  challenge_date: string;
  bonus_points: number;
  created_at: string;
  exercise?: Challenge;
}

// Helper function to normalize challenge data from database
export function normalizeChallenge(dbChallenge: any): Challenge {
  return {
    id: dbChallenge.id,
    title: dbChallenge.name || dbChallenge.title,
    name: dbChallenge.name,
    difficulty: dbChallenge.rank_name || `${dbChallenge.rank} kyu`,
    category: dbChallenge.category,
    description: dbChallenge.description,
    rank: dbChallenge.rank,
    rank_name: dbChallenge.rank_name,
    solutions: dbChallenge.solutions,
    points: dbChallenge.points,
    solvedCount: dbChallenge.solved_count || 0,
    solved_count: dbChallenge.solved_count,
    locked: dbChallenge.is_locked || false,
    is_locked: dbChallenge.is_locked,
    requiredLevel: dbChallenge.required_level,
    required_level: dbChallenge.required_level,
    timeLimit: dbChallenge.time_limit,
    time_limit: dbChallenge.time_limit,
    estimatedTime: dbChallenge.estimated_time,
    estimated_time: dbChallenge.estimated_time,
    tags: dbChallenge.tags || [],
    test_cases: dbChallenge.test_cases || [],
    created_at: dbChallenge.created_at,
    updated_at: dbChallenge.updated_at,
  };
}