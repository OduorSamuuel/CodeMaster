// types/challenge.ts

// --- Core Domain Types (Frontend) ---

export type ChallengeCategory =
  | 'reference'
  | 'bug_fixes'
  | 'algorithms'
  | 'data_structures';

export type ChallengeStatus = 'in_progress' | 'completed' | 'skipped';


export interface Challenge {
  id: string;
  name: string;
  category: ChallengeCategory;
  description: string;
  tags: string[];
  points: number;
  time_limit?: number;
  solved_count: number;
  is_locked: boolean;
  required_level?: number;
  rank: number;
  rank_name: string;
  solutions?: string;
  estimated_time?: number;
  created_at: string;
  updated_at: string;
  test_count: number;
}

// --- Supporting Types ---

export interface TestCase {
  id: string;
  challenge_id: string;
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
  challenge: {
    name: string;
    rank: number;
    category: string;
  }; 
};

export interface CreateChallengeInput {
  name: string;
  category: 'reference' | 'bug_fixes' | 'algorithms' | 'data_structures';
  description: string;
  rank_name: string;
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



export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  total?: number;
}

export interface TestResult {
  testId: string;
  passed: boolean;
  message: string;
  output: string;
  expected: string;
  executionTime: number;
  error?: string;
}