"use client";

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Award, Brain, Check, Flame, GraduationCap, Users, Zap,
  Trophy, Target, Rocket, Star, Crown, Gem, Timer, Calendar, LucideIcon
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'skill' | 'speed' | 'social';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  reward: { type: 'xp' | 'coins' | 'badge'; amount: number };
  progress?: number;
  total?: number;
  unlockedAt?: string;
}

interface AchievementsClientProps {
  achievements: Achievement[];
}

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  'TARGET': Target,
  'ROCKET': Rocket,
  'FIRE': Flame,
  'HUNDRED': Trophy,
  'CROWN': Crown,
  'BOLT': Zap,
  'STAR': Star,
  'GEM': Gem,
  'BRAIN': Brain,
  'TIMER': Timer,
  'CALENDAR': Calendar,
};

export default function AchievementsClient({ achievements }: AchievementsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-orange-600 text-white';
      case 'silver': return 'bg-gray-400 text-white';
      case 'gold': return 'bg-yellow-500 text-white';
      case 'platinum': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'milestone': return <GraduationCap className="w-5 h-5" />;
      case 'streak': return <Flame className="w-5 h-5" />;
      case 'skill': return <Brain className="w-5 h-5" />;
      case 'speed': return <Zap className="w-5 h-5" />;
      case 'social': return <Users className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const groupedAchievements = achievements.reduce((acc, ach) => {
    if (!acc[ach.category]) acc[ach.category] = [];
    acc[ach.category].push(ach);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Achievements</h1>
          <p className="text-muted-foreground">
            Track your progress and unlock rewards
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-10 h-10 text-yellow-500" />
                <div>
                  <h3 className="text-2xl font-bold">{unlockedCount} / {totalCount}</h3>
                  <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-yellow-500">{Math.round(completionPercentage)}%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>
              All
            </TabsTrigger>
            <TabsTrigger value="milestone" onClick={() => setSelectedCategory('milestone')}>
              <GraduationCap className="w-4 h-4 mr-2" />
              Milestone
            </TabsTrigger>
            <TabsTrigger value="streak" onClick={() => setSelectedCategory('streak')}>
              <Flame className="w-4 h-4 mr-2" />
              Streak
            </TabsTrigger>
            <TabsTrigger value="skill" onClick={() => setSelectedCategory('skill')}>
              <Brain className="w-4 h-4 mr-2" />
              Skill
            </TabsTrigger>
            <TabsTrigger value="speed" onClick={() => setSelectedCategory('speed')}>
              <Zap className="w-4 h-4 mr-2" />
              Speed
            </TabsTrigger>
            <TabsTrigger value="social" onClick={() => setSelectedCategory('social')}>
              <Users className="w-4 h-4 mr-2" />
              Social
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {selectedCategory === 'all' ? (
              // Group by category when showing all
              <div className="space-y-8">
                {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
                  <div key={category}>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 capitalize">
                      {getCategoryIcon(category)}
                      {category} Achievements
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryAchievements.map(ach => (
                        <AchievementCard key={ach.id} achievement={ach} getTierColor={getTierColor} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show filtered achievements
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAchievements.map(ach => (
                  <AchievementCard key={ach.id} achievement={ach} getTierColor={getTierColor} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Achievement Card Component
function AchievementCard({ 
  achievement, 
  getTierColor 
}: { 
  achievement: Achievement; 
  getTierColor: (tier: string) => string;
}) {
  const isUnlocked = !!achievement.unlockedAt;
  const progressPercent = achievement.progress && achievement.total 
    ? (achievement.progress / achievement.total) * 100 
    : 0;

  const IconComponent = ICON_MAP[achievement.icon] || Trophy;
  
  // Safe access to reward properties
  const rewardAmount = achievement.reward?.amount ?? 0;
  const rewardType = achievement.reward?.type ?? 'xp';

  return (
    <Card className={`${isUnlocked ? 'border-primary' : 'opacity-60'} transition-all hover:scale-105`}>
      <CardContent className="p-6 space-y-3">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-full ${getTierColor(achievement.tier)} flex items-center justify-center`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <Badge variant="secondary" className="capitalize">
            {achievement.tier}
          </Badge>
        </div>

        <div>
          <h3 className="font-bold text-lg">{achievement.name}</h3>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
        </div>

        {achievement.total && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Progress</span>
              <span className="font-bold">{achievement.progress}/{achievement.total}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm">
            <span className="text-muted-foreground">Reward: </span>
            <span className="font-bold">
              +{rewardAmount} {rewardType.toUpperCase()}
            </span>
          </div>
          {isUnlocked && (
            <Badge className="bg-green-500">
              <Check className="w-3 h-3 mr-1" />
              Unlocked
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}