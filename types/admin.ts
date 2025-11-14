// types/admin.ts

export type UserRole = 'user' | 'admin' | 'moderator';

export type ReportType = 
  | 'spam' 
  | 'harassment' 
  | 'inappropriate_content' 
  | 'cheating' 
  | 'bug' 
  | 'other';

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface AdminStats {
  activeUsers: number;
  todaySubmissions: number;
  totalUsers: number;
  totalChallenges: number;
  pendingReports: number;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  role: UserRole;
  level: number;
  total_points: number;
  total_solved: number;
  current_streak: number;
  is_banned?: boolean;
  last_login?: string;
}

export interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  reported_exercise_id?: string;
  report_type: ReportType;
  description: string;
  status: ReportStatus;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  reporter?: {
    email: string;
    username: string;
  };
  reported_user?: {
    email: string;
    username: string;
  };
  reported_exercise?: {
    id: string;
    name: string;
  };
}

export interface AdminDashboardData {
  stats: AdminStats;
  recentUsers: AdminUser[];
  recentReports: UserReport[];
  recentChallenges: {
    id: string;
    name: string;
    category: string;
    created_at: string;
    total_attempts: number;
    completion_rate: number;
  }[];
}

export interface AdminUserFilters {
  search?: string;
  role?: UserRole;
  banned?: boolean;
  minLevel?: number;
  maxLevel?: number;
  sortBy?: 'created_at' | 'level' | 'total_points' | 'total_solved';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminReportFilters {
  type?: ReportType;
  status?: ReportStatus;
  reporterId?: string;
  reportedUserId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

// Analytics types


export interface ChallengeAnalytics {
  challengeId: string;
  challengeName: string;
  totalAttempts: number;
  uniqueUsers: number;
  completionRate: number;
  averageTime: number;
  difficultyRating: number;
}

export interface SystemHealth {
  database: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
  };
  api: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
  };
  storage: {
    status: 'healthy' | 'degraded' | 'down';
    usedSpace: number;
    totalSpace: number;
  };
}
export interface DashboardStats {
  totalUsers: number;
  activeToday: number;
  totalChallenges: number;
  completionRate: number;
  avgSessionTime: string;
  totalSubmissions: number;
  userGrowth: number; // percentage
  activeTodayGrowth: number;
  challengesAddedThisWeek: number;
  completionRateGrowth: number;
}

export interface WeeklyActivity {
  day: string;
  users: number;
  submissions: number;
  completions: number;
}

export interface DifficultyDistribution {
  name: string;
  value: number;
  color: string;
 [key: string]: string | number;
}
export interface TopChallenge {
  id: number;
  title: string;
  completions: number;
  avgTime: string;
  rating: number;
}
export interface SystemReportsSummary {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  totalChallenges: number;
  totalSubmissions: number;
  avgCompletionRate: number;
  avgSessionTime: string;
  topPerformers: number;
}

export interface UserGrowthData {
  month: string;
  users: number;
  active: number;
  newSignups: number;
}

export interface PerformanceByLevel {
  level: string;
  users: number;
  avgXP: number;
  completionRate: number;
}

export interface UserDistribution {
  name: string;
  value: number;
  color: string;
}

export interface EngagementMetric {
  metric: string;
  value: string | number;
  trend: string;
  status: 'up' | 'down';
}

export interface TopPerformer {
  rank: number;
  username: string;
  email: string;
  level: number;
  xp: number;
  challengesCompleted: number;
  streak: number;
}

export interface ChallengePerformance {
  difficulty: string; // This will be the actual kyu rank like "8 kyu", "7 kyu", etc.
  attempted: number;
  completed: number;
  avgTime: string;
  successRate: number;
  avgTestPassRate?: number;
  perfectSolves?: number;
  totalChallenges?: number;
  popularity?: number;
}
