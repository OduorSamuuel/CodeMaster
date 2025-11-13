"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2,  Trophy,  Code,
  Flame, Star, Target, Zap, Award, TrendingUp,
  Gift,  Timer,  Volume2, VolumeX, Sparkles,
  Crown, Medal, Brain, Rocket, Heart, Gem, Calendar, LucideIcon,
} from 'lucide-react';
import { Achievement, ActiveMultiplier, MysteryBoxReward, UserProgress } from '@/actions';
import {  LeaderboardEntry } from '@/types';

// Icon mapping for achievement icons from database
const ICON_MAP: Record<string, LucideIcon> = {
  'TARGET': Target,
  'ROCKET': Rocket,
  'FIRE': Flame,
  'HUNDRED': Trophy, // No "hundred" icon, using Trophy
  'CROWN': Crown,
  'BOLT': Zap,
  'STAR': Star,
  'GEM': Gem,
  'BRAIN': Brain,
  'TIMER': Timer,
  'CALENDAR': Calendar,
  'FLAME': Flame,
  'TROPHY': Trophy,
  'MEDAL': Medal,
  'AWARD': Award,
  'HEART': Heart,
  'GIFT': Gift,
  'SPARKLES': Sparkles,
};

interface DashboardClientProps {
  initialProgress: UserProgress;
  initialAchievements: Achievement[];
  initialLeaderboard: LeaderboardEntry[];
  initialMultipliers: ActiveMultiplier[];
  initialMysteryBox: MysteryBoxReward | null;
}

// ============= STREAK INDICATOR =============
const StreakIndicator: React.FC<{ streak: number }> = ({ streak }) => (
  <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/20 p-2 rounded-full">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-500">{streak} Day Streak!</p>
            <p className="text-xs text-muted-foreground">Keep it going! 🔥</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Next milestone</p>
          <p className="text-sm font-semibold">{Math.ceil(streak / 7) * 7} days</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ============= XP PROGRESS BAR =============
const XPProgressBar: React.FC<{ progress: UserProgress }> = ({ progress }) => {
  const percentage = (progress.currentXP / progress.xpToNextLevel) * 100;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-lg">Level {progress.level}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {progress.currentXP} / {progress.xpToNextLevel} XP
            </span>
          </div>
          <Progress value={percentage} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {progress.xpToNextLevel - progress.currentXP} XP to level {progress.level + 1}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// ============= DAILY PROGRESS =============
const DailyProgress: React.FC<{ completed: number; goal: number }> = ({ completed, goal }) => {
  const percentage = Math.min((completed / goal) * 100, 100);
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Daily Goal</span>
            </div>
            <span className="text-sm font-bold">{completed}/{goal}</span>
          </div>
          <Progress value={percentage} className="h-2" />
          {completed >= goal && (
            <p className="text-xs text-green-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Goal completed! 🎉
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============= LEADERBOARD =============
const Leaderboard: React.FC<{ entries: LeaderboardEntry[] }> = ({ entries }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Today&apos;s Leaderboard
      </CardTitle>
      <CardDescription>Top performers in the last 24 hours</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No leaderboard data yet. Complete challenges to rank!
        </p>
      ) : (
        entries.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              entry.isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                entry.rank === 1 ? 'bg-yellow-500 text-white' :
                entry.rank === 2 ? 'bg-gray-400 text-white' :
                entry.rank === 3 ? 'bg-orange-600 text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {entry.rank <= 3 ? <Crown className="w-4 h-4" /> : entry.rank}
              </div>
              <div>
                <p className="font-semibold text-sm">{entry.username}</p>
                <p className="text-xs text-muted-foreground">{entry.solvedToday} solved today</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">{entry.points.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>
        ))
      )}
    </CardContent>
  </Card>
);

// ============= ACHIEVEMENT CARD =============
const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  // Get the icon component from the map, fallback to Trophy
  const IconComponent = ICON_MAP[achievement.icon] || Trophy;
  
  return (
    <div className={`p-3 rounded-lg border ${
      achievement.unlockedAt ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-border'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${
          achievement.unlockedAt 
            ? 'bg-primary/20 text-primary' 
            : 'bg-muted text-muted-foreground'
        }`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{achievement.name}</p>
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
          {achievement.progress !== undefined && achievement.total !== undefined && (
            <div className="mt-2">
              <Progress value={(achievement.progress / achievement.total) * 100} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">
                {achievement.progress}/{achievement.total}
              </p>
            </div>
          )}
          {achievement.unlockedAt && (
            <Badge variant="outline" className="mt-2 text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Unlocked
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

// ============= MULTIPLIER DISPLAY =============
const MultiplierDisplay: React.FC<{ multipliers: ActiveMultiplier[] }> = ({ multipliers }) => {
  if (multipliers.length === 0) return null;

  const totalMultiplier = multipliers.reduce((acc, m) => acc * m.value, 1);
  const nextExpiring = multipliers[0];

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
      <CardContent className="p-4">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="font-bold text-lg">{totalMultiplier.toFixed(1)}x XP Multiplier!</p>
          <p className="text-xs text-muted-foreground">
            Active for {nextExpiring.hoursRemaining.toFixed(1)} hours
          </p>
          {multipliers.length > 1 && (
            <div className="mt-3 p-2 bg-orange-500/10 rounded">
              <p className="text-xs">{multipliers.length} active multipliers!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============= MYSTERY BOX =============
const MysteryBoxCard: React.FC<{ mysteryBox: MysteryBoxReward | null }> = ({ mysteryBox }) => {
  if (!mysteryBox) return null;

  const percentage = (mysteryBox.progress / mysteryBox.total) * 100;
  const remaining = mysteryBox.total - mysteryBox.progress;

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-400">
          <Gift className="w-5 h-5" />
          Next Reward
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-center py-4">
            <p className="text-4xl mb-2">🎁</p>
            <p className="font-bold">Mystery Box</p>
            <p className="text-xs text-muted-foreground">
              {mysteryBox.isClaimed 
                ? 'Claimed! Complete more for next box' 
                : `Complete ${remaining} more challenge${remaining !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {mysteryBox.progress}/{mysteryBox.total} challenges
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// ============= MAIN DASHBOARD CLIENT =============
export default function DashboardClient({
  initialProgress,
  initialAchievements,
  initialLeaderboard,
  initialMultipliers,
  initialMysteryBox,
}: DashboardClientProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back! 👋</h1>
            <p className="text-muted-foreground">Ready to level up your skills?</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Streak and Daily Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StreakIndicator streak={initialProgress.streak} />
            <DailyProgress 
              completed={initialProgress.exercisesCompletedToday} 
              goal={initialProgress.dailyGoal} 
            />
          </div>

          <XPProgressBar progress={initialProgress} />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                className="h-auto py-4 flex-col gap-2" 
                onClick={() => { window.location.href = '/challenges'; }}
              >
                <Code className="w-6 h-6" />
                <span>Browse Challenges</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2" 
                onClick={() => { window.location.href = '/daily-challenge'; }}
              >
                <Brain className="w-6 h-6" />
                <span>Daily Challenge</span>
                <Badge variant="secondary" className="text-xs">2x XP</Badge>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Zap className="w-6 h-6" />
                <span>Speed Round</span>
                <Badge variant="secondary" className="text-xs">5 min</Badge>
              </Button>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Recent Achievements
              </CardTitle>
              <CardDescription>
                Unlock all achievements to earn exclusive rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {initialAchievements.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-2 text-center py-4">
                  Complete challenges to unlock achievements!
                </p>
              ) : (
                initialAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Leaderboard & Stats */}
        <div className="space-y-6">
          <Leaderboard entries={initialLeaderboard} />
          <MysteryBoxCard mysteryBox={initialMysteryBox} />
          <MultiplierDisplay multipliers={initialMultipliers} />
        </div>
      </div>
    </div>
  );
}