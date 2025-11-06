"use client";
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Clock, Lightbulb, Star, Share2, Coins } from 'lucide-react';
import { Challenge } from '@/types/challenge';
import confetti from 'canvas-confetti';
import type { RewardBreakdown } from '@/actions/submissions';

interface SuccessModalProps {
  challenge: Challenge;
  timeElapsed: number;
  hintsUsed: number;
  attemptsCount: number;
  rewards?: RewardBreakdown;
  coinsEarned?: number;
  onSubmit: () => void;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  challenge,
  timeElapsed,
  hintsUsed,
  attemptsCount,
  rewards,
  coinsEarned = 0,
  onSubmit,
  onClose
}) => {
  const [open, setOpen] = useState(true);
  
  useEffect(() => {
    // Trigger confetti on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const isPerfect = attemptsCount === 1 && hintsUsed === 0;
  const totalXP = rewards?.totalXP || challenge.points;
  const coins = rewards?.coins || coinsEarned;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <DialogTitle className="text-center text-2xl">
            {isPerfect ? '🎉 Perfect Solve! 🎉' : '✨ Challenge Complete! ✨'}
          </DialogTitle>
          
          <DialogDescription className="text-center">
            You successfully solved <strong>{challenge.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Rewards Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold text-yellow-500">+{totalXP}</p>
              <p className="text-xs text-muted-foreground">XP Earned</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
              <Coins className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-600">+{coins}</p>
              <p className="text-xs text-muted-foreground">Coins Earned</p>
            </div>
          </div>

          {/* XP Breakdown */}
          {rewards && (
            <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Base XP</span>
                <span className="font-semibold">+{rewards.baseXP}</span>
              </div>
              
              {rewards.bonuses.length > 0 && (
                <>
                  <div className="border-t border-border/50 pt-2 space-y-2">
                    {rewards.bonuses.map((bonus, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          {bonus.type === 'perfect' && <Zap className="w-3 h-3 text-green-400" />}
                          {bonus.type === 'no_hints' && <Lightbulb className="w-3 h-3 text-blue-400" />}
                          {bonus.type === 'speed' && <Clock className="w-3 h-3 text-yellow-400" />}
                          <span className="text-muted-foreground">{bonus.name}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          {bonus.xp && <span className="text-purple-400 font-semibold">+{bonus.xp} XP</span>}
                          {bonus.coins && <span className="text-yellow-600 font-semibold">+{bonus.coins} coins</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
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
              <Zap className="w-5 h-5 mx-auto mb-1 text-orange-500" />
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
            <Button
              onClick={onSubmit}
              className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Trophy className="w-4 h-4" />
              Claim Rewards
            </Button>
            
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
                  `I just solved "${challenge.title}" and earned ${totalXP} XP + ${coins} coins! 🎉`
                );
              }}
              variant="outline"
              size="icon"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};