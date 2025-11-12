"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Lightbulb,  Zap } from 'lucide-react';

interface ProgressTrackerProps {
  timeElapsed: number;
  hintsUsed: number;
  testsPassed: number;
  testsTotal: number;
  attemptsCount: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  timeElapsed,
  hintsUsed,
  testsPassed,
  testsTotal,
  attemptsCount
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = testsTotal > 0 ? (testsPassed / testsTotal) * 100 : 0;

  return (
    <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-bold">{testsPassed}/{testsTotal} Tests</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-semibold">{formatTime(timeElapsed)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Hints</p>
                <p className="font-semibold">{hintsUsed}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Attempts</p>
                <p className="font-semibold">{attemptsCount}</p>
              </div>
            </div>
          </div>

          {/* Perfect Solve Bonus */}
          {attemptsCount === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2 text-center">
              <p className="text-xs text-yellow-500 font-medium">
                ⚡ Perfect Solve Bonus Available! (+50 XP)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
