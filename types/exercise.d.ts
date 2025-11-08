// types.d.ts

export type ExerciseCategory = 'reference' | 'bug_fixes' | 'algorithms' | 'data_structures';
export type ExerciseStatus = 'in_progress' | 'completed' | 'skipped';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Exercise {
  id: string;
  name: string;
  url: string;
  category: ExerciseCategory;
  description: string;
  rank: number; // 1-8
  rank_name: string; // '8 kyu', '7 kyu', etc.
  solutions: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface ExerciseTag {
  id: number;
  exercise_id: string;
  tag: string;
  created_at: string;
}

export interface TestCase {
  id: string;
  exercise_id: string;
  input: string;
  expected_output: string;
  description: string;
  order_index: number;
  is_hidden: boolean;
  created_at: string;
}

export interface UserSolution {
  id: number;
  user_id: string;
  exercise_id: string;
  code: string;
  status: ExerciseStatus;
  tests_passed: number;
  tests_total: number;
  points_earned: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
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
  coins: number;
}

export interface UserTopic {
  id: number;
  user_id: string;
  topic: string;
  solved_count: number;
  success_rate: number;
  last_attempted: string | null;
  created_at: string;
  updated_at: string;
}

// Form types for creating/editing exercises
export interface CreateExerciseInput {
  id: string;
  name: string;
  url: string;
  category: ExerciseCategory;
  description: string;
  rank: number;
  rank_name: string;
  solutions: string;
  tags: string[];
  test_cases: Omit<TestCase, 'id' | 'exercise_id' | 'created_at'>[];
}

export interface UpdateExerciseInput extends Partial<CreateExerciseInput> {
  id: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface ExerciseWithRelations extends Exercise {
  tags: string[];
  test_cases: TestCase[];
}

// Database types
export interface Database {
  public: {
    Tables: {
      exercises: {
        Row: Exercise;
        Insert: Omit<Exercise, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Exercise, 'id' | 'created_at' | 'updated_at'>>;
      };
      exercise_tags: {
        Row: ExerciseTag;
        Insert: Omit<ExerciseTag, 'id' | 'created_at'>;
        Update: Partial<Omit<ExerciseTag, 'id' | 'created_at'>>;
      };
      test_cases: {
        Row: TestCase;
        Insert: Omit<TestCase, 'created_at'>;
        Update: Partial<Omit<TestCase, 'id' | 'created_at'>>;
      };
      user_solutions: {
        Row: UserSolution;
        Insert: Omit<UserSolution, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSolution, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'user_id' | 'created_at' | 'updated_at'>>;
      };
      user_topics: {
        Row: UserTopic;
        Insert: Omit<UserTopic, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserTopic, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}