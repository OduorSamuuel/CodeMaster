// types/challenge.ts

// --- Core Domain Types (Frontend) ---

export type ChallengeCategory =
  | 'reference'
  | 'bug_fixes'
  | 'algorithms'
  | 'data_structures';

export type ChallengeStatus = 'in_progress' | 'completed' | 'skipped';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Challenge {
  id: string;
  title: string;
  difficulty: string; // alias for rank_name
  category: ChallengeCategory;
  description: string;
  tags: string[];
  points: number;
  timeLimit?: number;
  solvedCount: number;
  locked: boolean;
  requiredLevel?: number;
  rank: number;
  rank_name: string;
}

// --- Backend (Database) Representation ---

export interface Exercise {
  id: string;
  name: string;
  category: ChallengeCategory;
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

// Extended “view” of exercise with relations
export interface ExerciseFull extends Exercise {
  tags: string[] | null;
  test_count: number;
}

// --- Supporting Types ---

export interface TestCase {
  id: string;
  exercise_id: string;
  input: string;
  expected_output: string;
  description: string;
  order_index: number;
  is_hidden: boolean;
}

export type UserSolution = {
  status: string;
  completion_time: number;
  hints_used: number;
  is_perfect_solve: boolean;
  completed_at: string;
  points_earned: number;
  exercises: {
    name: string;
    rank: number;
    category: string;
  }; 
};
export interface TestCase {
  input: string;
  expected_output: string;
  description: string;
  is_hidden: boolean;
  //order_index?: number;
}

export interface CreateChallengeInput {
  name: string;
  category: 'reference' | 'bug_fixes' | 'algorithms' | 'data_structures';
  description: string;
  difficulty: 'easy' | 'medium' | 'hard'; // Maps to rank
  solutions: string;
  tags: string[];
  test_cases: TestCase[];
  time_limit?: number;
  estimated_time?: number;
  required_level?: number;
  is_daily_challenge?: boolean;
  daily_bonus_points?: number;
}



// --- Progress & Leaderboard ---

export interface ChallengeProgress {
  timeElapsed: number;
  hintsUsed: number;
  attemptsCount: number;
  isCompleted: boolean;
  testsPassed: number;
  testsTotal: number;
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

// --- Conversion Helper ---

export function transformExerciseToChallenge(exercise: ExerciseFull): Challenge {
  return {
    id: exercise.id.toString(),
    title: exercise.name || 'Untitled Challenge',
    difficulty: exercise.rank_name || '8 kyu',
    category: exercise.category || 'reference',
    description: exercise.description || '',
    tags: exercise.tags || [],
    points: exercise.points || 0,
    timeLimit: exercise.time_limit ?? undefined,
    solvedCount: exercise.solved_count ?? 0,
    locked: exercise.is_locked ?? false,
    requiredLevel: exercise.required_level ?? undefined,
    rank: exercise.rank ?? 0,
    rank_name: exercise.rank_name || '8 kyu',
  };
}
export interface ChallengeData {
  id: string;
  name: string;
  category: 'reference' | 'bug_fixes' | 'algorithms' | 'data_structures';
  description: string;
  difficulty: 'easy' | 'medium' | 'hard'; // Maps to rank_name in DB
  rank_name?: string; // For backward compatibility with exercises_full
  points?: number; // Reward points for solving
  solved_count?: number; // Number of users who solved it
  solutions?: string; // Optional sample solution(s)
  tags?: string[]; // Keywords to improve search/recommendations

  // Optional metadata
  time_limit?: number; // Max execution time for code
  estimated_time?: number; // Average time expected to solve
  required_level?: number; // Restrict access by level or rank

  // Daily or special challenge info
  is_daily_challenge?: boolean;
  daily_bonus_points?: number;

  // System fields (timestamps, etc.)
  created_at?: string;
  updated_at?: string;
}
