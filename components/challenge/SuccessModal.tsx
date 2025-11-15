import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Clock, Target, Sparkles, Crown, Lightbulb } from 'lucide-react';
import { Challenge } from '@/types/challenge';
import { useConfetti } from '@/contexts/confetti-context';
import Lottie from 'lottie-react';
import trophyAnimation from '@/lottie/trophy.json'; 

interface Bonus {
  type: string;
  name: string;
  xp?: number;
}

interface RewardBreakdown {
  baseXP: number;
  totalXP: number;
  bonuses: Bonus[];
  multiplier?: number;
}

interface SuccessModalProps {
  challenge: Challenge;
  timeElapsed: number;
  hintsUsed: number;
  attemptsCount: number;
  submissionResult?: {
    pointsEarned: number;
    xpGained: number;
    leveledUp: boolean;
    newLevel?: number;
  };
  rewards?: RewardBreakdown;
  onClaim: () => void;
  onClose: () => void;
  allTestsPassed?: boolean;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  challenge,
  timeElapsed,
  hintsUsed,
  attemptsCount,
  submissionResult,
  rewards,
  onClaim,
  onClose,
  allTestsPassed = true
}) => {
  const [open, setOpen] = useState(true);
  const { perfectSolve, levelUp, celebrate } = useConfetti();

  useEffect(() => {
    // Determine which confetti animation to trigger
    const isPerfect = attemptsCount === 1 && hintsUsed === 0 && allTestsPassed;
    
    if (submissionResult?.leveledUp) {
      // Level up gets special continuous confetti
      levelUp();
    } else if (isPerfect) {
      // Perfect solve gets elegant side cannons
      perfectSolve();
    } else {
      // Regular celebration for normal solves
      celebrate();
    }
  }, [attemptsCount, hintsUsed, allTestsPassed, submissionResult?.leveledUp, perfectSolve, levelUp, celebrate]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const isPerfect = attemptsCount === 1 && hintsUsed === 0 && allTestsPassed;
  
  // Use rewards if available, otherwise fall back to submissionResult
  const totalXP = rewards?.totalXP || submissionResult?.xpGained || challenge.points;
  const baseXP = rewards?.baseXP || submissionResult?.pointsEarned || challenge.points;

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleClaimRewards = () => {
    // Trigger extra confetti burst when claiming if leveled up
    if (submissionResult?.leveledUp) {
      setTimeout(() => {
        celebrate();
      }, 200);
    }
    onClaim();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="relative w-24 h-24">
              {submissionResult?.leveledUp ? (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <Crown className="w-10 h-10 text-white" />
                </div>
              ) : (
                <Lottie
                  animationData={trophyAnimation}
                  loop={false}
                  autoplay={true}
                  className="w-full h-full"
                />
              )}
              {(isPerfect || submissionResult?.leveledUp) && (
                <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              )}
              {submissionResult?.leveledUp && (
                <div className="absolute -top-1 -left-1 w-26 h-26 rounded-full border-4 border-yellow-400 animate-ping opacity-75" />
              )}
            </div>
          </div>
          
          <DialogTitle className="text-center text-xl">
            {submissionResult?.leveledUp ? (
              <span className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                <Crown className="w-5 h-5 text-yellow-500" />
                Level {submissionResult.newLevel}!
                <Crown className="w-5 h-5 text-yellow-500" />
              </span>
            ) : isPerfect ? (
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                🎯 Perfect Solve! 🎯
              </span>
            ) : (
              '✨ All Tests Passed! ✨'
            )}
          </DialogTitle>
          
          <DialogDescription className="text-center text-sm">
            {submissionResult?.leveledUp 
              ? (
                <span className="space-y-1">
                  <span className="block font-semibold text-purple-600 dark:text-purple-400">
                    🎊 Congratulations! 🎊
                  </span>
                  <span className="block text-xs">
                    New challenges and features unlocked!
                  </span>
                </span>
              )
              : `You successfully solved`
            }
            <strong className="block mt-1 text-foreground">{challenge.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {/* Level Up Special Banner */}
          {submissionResult?.leveledUp && (
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-lg p-3 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 text-white font-bold text-sm mb-1">
                <Star className="w-4 h-4 animate-spin" />
                <span>LEVEL UP!</span>
                <Star className="w-4 h-4 animate-spin" />
              </div>
              <p className="text-white/90 text-xs">
                You're now Level {submissionResult.newLevel}! Keep up the amazing work!
              </p>
            </div>
          )}

          {/* XP Reward */}
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
            <Star className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
            <p className="text-2xl font-bold text-yellow-500">+{totalXP} XP</p>
            <p className="text-xs text-muted-foreground">Total XP Earned</p>
          </div>

          {/* XP Breakdown */}
          <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Base XP</span>
              <span className="font-semibold">+{baseXP}</span>
            </div>
            
            {rewards?.bonuses && rewards.bonuses.length > 0 && (
              <div className="border-t border-border/50 pt-2 space-y-2">
                {rewards.bonuses.map((bonus, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      {bonus.type === 'perfect' && <Zap className="w-3 h-3 text-green-400" />}
                      {bonus.type === 'no_hints' && <Lightbulb className="w-3 h-3 text-blue-400" />}
                      {bonus.type === 'speed' && <Clock className="w-3 h-3 text-yellow-400" />}
                      {bonus.type === 'multiplier' && <Sparkles className="w-3 h-3 text-purple-400" />}
                      <span className="text-muted-foreground">{bonus.name}</span>
                    </span>
                    {bonus.xp && <span className="text-purple-400 font-semibold">+{bonus.xp} XP</span>}
                  </div>
                ))}
              </div>
            )}

            {rewards?.multiplier && rewards.multiplier > 1 && (
              <div className="border-t border-border/50 pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-muted-foreground">Active Multiplier</span>
                  </span>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                    {rewards.multiplier}x
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Perfect Solve Badge */}
          {isPerfect && !submissionResult?.leveledUp && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-lg p-2 text-center">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-1 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Perfect Solve!
              </Badge>
              <p className="text-xs text-muted-foreground">
                First attempt with no hints - bonus rewards awarded!
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              <Clock className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="text-sm font-semibold">{formatTime(timeElapsed)}</p>
            </div>
            
            <div className="text-center p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              <Target className="w-4 h-4 mx-auto mb-1 text-green-500" />
              <p className="text-xs text-muted-foreground">Attempts</p>
              <p className="text-sm font-semibold">{attemptsCount}</p>
            </div>
            
            <div className="text-center p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              <Lightbulb className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
              <p className="text-xs text-muted-foreground">Hints</p>
              <p className="text-sm font-semibold">{hintsUsed}</p>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleClaimRewards}
            className={`w-full gap-2 ${
              submissionResult?.leveledUp
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600'
                : isPerfect
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
            }`}
          >
            <Trophy className="w-4 h-4" />
            {submissionResult?.leveledUp ? 'Claim Level Up Rewards!' : 'Claim Rewards'}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            After claiming, click Submit Solution to save your progress
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};