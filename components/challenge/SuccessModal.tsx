import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Clock, Target, Sparkles, Crown, Lightbulb, Coins, Share2 } from 'lucide-react';
import { Challenge } from '@/types/challenge';
import confetti from 'canvas-confetti';

interface Bonus {
  type: string;
  name: string;
  xp?: number;
  coins?: number;
}

interface RewardBreakdown {
  baseXP: number;
  totalXP: number;
  coins: number;
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
  coinsEarned?: number;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  challenge,
  timeElapsed,
  hintsUsed,
  attemptsCount,
  submissionResult,
  rewards,
  coinsEarned = 0,
  onSubmit,
  onClose,
  isSubmitting = false
}) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const isPerfect = attemptsCount === 1 && hintsUsed === 0;
  
  // Use rewards if available, otherwise fall back to submissionResult
  const totalXP = rewards?.totalXP || submissionResult?.xpGained || challenge.points;
  const coins = rewards?.coins || coinsEarned || 0;
  const baseXP = rewards?.baseXP || submissionResult?.pointsEarned || challenge.points;

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleShare = () => {
    const text = `I just solved "${challenge.name}" (${challenge.rank_name}) and earned ${totalXP} XP + ${coins} coins! 🎉`;
    if (navigator.share) {
      navigator.share({
        title: 'Challenge Completed!',
        text: text,
      }).catch(() => {
        navigator.clipboard.writeText(text);
      });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-bounce">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              {(isPerfect || submissionResult?.leveledUp) && (
                <Sparkles className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
              )}
              {submissionResult?.leveledUp && (
                <Crown className="w-8 h-8 text-yellow-500 absolute -top-2 -left-2 animate-pulse" />
              )}
            </div>
          </div>
          
          <DialogTitle className="text-center text-2xl">
            {submissionResult?.leveledUp ? (
              <span className="flex items-center justify-center gap-2 text-yellow-500">
                <Crown className="w-6 h-6" />
                Level {submissionResult.newLevel}!
              </span>
            ) : isPerfect ? (
              '🎉 Perfect Solve! 🎉'
            ) : (
              '✨ Challenge Complete! ✨'
            )}
          </DialogTitle>
          
          <DialogDescription className="text-center text-base">
            {submissionResult?.leveledUp 
              ? `Congratulations! You've leveled up!`
              : `You successfully solved`
            }
            <strong className="block mt-1">{challenge.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Rewards Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4 text-center hover:scale-105 transition-transform">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold text-yellow-500">+{totalXP}</p>
              <p className="text-xs text-muted-foreground">XP Earned</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 text-center hover:scale-105 transition-transform">
              <Coins className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-600">+{coins}</p>
              <p className="text-xs text-muted-foreground">Coins Earned</p>
            </div>
          </div>

          {/* XP Breakdown */}
          <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
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
                    <div className="flex items-center gap-2">
                      {bonus.xp && <span className="text-purple-400 font-semibold">+{bonus.xp} XP</span>}
                      {bonus.coins && <span className="text-yellow-600 font-semibold">+{bonus.coins} coins</span>}
                    </div>
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
          {isPerfect && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-2">
                <Sparkles className="w-3 h-3 mr-1" />
                Perfect Solve!
              </Badge>
              <p className="text-xs text-muted-foreground">
                First attempt with no hints - bonus rewards awarded!
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="text-sm font-semibold">{formatTime(timeElapsed)}</p>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <Target className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <p className="text-xs text-muted-foreground">Attempts</p>
              <p className="text-sm font-semibold">{attemptsCount}</p>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <Lightbulb className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
              <p className="text-xs text-muted-foreground">Hints</p>
              <p className="text-sm font-semibold">{hintsUsed}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!submissionResult && (
              <Button
                onClick={onSubmit}
                className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4" />
                    Claim Rewards
                  </>
                )}
              </Button>
            )}
            
            {submissionResult && (
              <Button
                onClick={handleClose}
                className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Trophy className="w-4 h-4" />
                Continue
              </Button>
            )}
            
            <Button
              onClick={handleShare}
              variant="outline"
              size="icon"
              title="Share your achievement"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};