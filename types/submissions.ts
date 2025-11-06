export interface SubmitSolutionParams {
  exerciseId: string;
  code: string;
  testsPassed: number;
  testsTotal: number;
  timeElapsed: number;
  hintsUsed: number;
  isPerfectSolve: boolean;
}

export interface SubmitSolutionResult {
  success: boolean;
  pointsEarned: number;
  totalPoints: number;
  error?: string;
}
