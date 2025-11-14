"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Trophy, Loader2, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChallengeActionsProps {
  onRunTests: () => void;
  onSubmit: () => void;
  onSkip: () => void;
  isRunning: boolean;
  isSubmitting?: boolean;
  canSubmit: boolean;
  testsPassed: number;
  testsTotal: number;
  submissionError?: string;
  hasSubmitted?: boolean;
  rewardsClaimed?: boolean;
}

export const ChallengeActions: React.FC<ChallengeActionsProps> = ({
  onRunTests,
  onSubmit,
  onSkip,
  isRunning,
  isSubmitting = false,
  canSubmit,
  testsPassed,
  testsTotal,
  submissionError,
  hasSubmitted = false,
  rewardsClaimed = false
}) => {
  const allTestsPassed = testsPassed === testsTotal;
  
  return (
    <div className="border-t border-border bg-card">
      {submissionError && (
        <Alert variant="destructive" className="m-4 mb-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submissionError}</AlertDescription>
        </Alert>
      )}
      
      {hasSubmitted && (
        <Alert className="m-4 mb-0 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Solution submitted! You can also review with our AI Concept Explainer.
          </AlertDescription>
        </Alert>
      )}

      {rewardsClaimed && !hasSubmitted && (
        <Alert className="m-4 mb-0 bg-blue-50 border-blue-200">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Rewards claimed! Now click Submit to save your progress.
          </AlertDescription>
        </Alert>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <Button
            onClick={onSkip}
            variant="ghost"
            size="sm"
            className="gap-2"
            disabled={isRunning || isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
            {hasSubmitted ? 'Continue' : 'Back'}
          </Button>

          <div className="flex items-center gap-3">
            {testsTotal > 0 && (
              <Badge 
                variant={allTestsPassed ? 'default' : testsPassed > 0 ? 'secondary' : 'destructive'}
                className={allTestsPassed ? 'bg-green-500' : testsPassed > 0 ? 'bg-yellow-500' : ''}
              >
                {testsPassed}/{testsTotal} Tests Passed
                {!allTestsPassed && testsPassed > 0 && ' (Partial)'}
              </Badge>
            )}

            {!hasSubmitted && (
              <>
                <Button
                  onClick={onRunTests}
                  disabled={isRunning || isSubmitting}
                  variant="outline"
                  className="gap-2"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Tests
                    </>
                  )}
                </Button>

                <Button
                  onClick={onSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4" />
                      Submit Solution
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {!hasSubmitted && testsTotal > 0 && !allTestsPassed && !rewardsClaimed && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            You can submit even if not all tests pass
          </p>
        )}

        {!hasSubmitted && allTestsPassed && !rewardsClaimed && (
          <p className="text-xs text-yellow-600 font-medium mt-2 text-center">
            ⚡ All tests passed! Claim rewards first, then submit.
          </p>
        )}

        {!hasSubmitted && rewardsClaimed && (
          <p className="text-xs text-green-600 font-medium mt-2 text-center">
            ✓ Rewards claimed! Ready to submit.
          </p>
        )}
      </div>
    </div>
  );
};