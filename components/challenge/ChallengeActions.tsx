"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Trophy, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
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
  submissionError
}) => {
  return (
    <div className="border-t border-border bg-card">
      {submissionError && (
        <Alert variant="destructive" className="m-4 mb-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submissionError}</AlertDescription>
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
            Back
          </Button>

          <div className="flex items-center gap-3">
            {testsTotal > 0 && (
              <Badge 
                variant={testsPassed === testsTotal ? 'default' : 'secondary'}
                className={testsPassed === testsTotal ? 'bg-green-500' : ''}
              >
                {testsPassed}/{testsTotal} Tests Passed
              </Badge>
            )}
            
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
          </div>
        </div>
      </div>
    </div>
  );
};