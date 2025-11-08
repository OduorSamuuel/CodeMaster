"use client";

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, Calendar, CheckCircle2, Coins, Flame, Loader2, 
  Settings, Share2, Star, Trophy, Edit
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useRouter } from 'next/navigation';

import { DetailedStats } from '@/actions/profile';
import { UserProfile } from '@/types/exercise';
import { createClient } from '@/lib/supabase/client';

interface ProfileClientProps {
  profile: UserProfile;
  stats: DetailedStats;
}

export const updateUserAvatar = async (avatar: string): Promise<boolean> => {
  try {
    const supabase =  createClient();
    
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;
    
    if (!user?.sub) return false;

    const { error } = await supabase
      .from('user_profiles')
      .update({ avatar })
      .eq('user_id', user.sub);

    return !error;
  } catch (error) {
    return false;
  }
}
const AVATAR_OPTIONS = ['👤', '🧙', '👨‍💻', '👩‍💻', '🦸', '🦹', '🤖', '👾', '🐱', '🐶', '🦊', '🐼'];

export default function ProfileClient({ profile, stats }: ProfileClientProps) {
  const router = useRouter();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);

  const levelPercentage = (profile.currentXP / profile.xpToNextLevel) * 100;
  const accountAge = Math.floor((Date.now() - new Date(profile.joinedDate).getTime()) / (1000 * 60 * 60 * 24));
  const maxDailyActivity = Math.max(...stats.activityByDay.map(d => d.challenges), 1);


  const handleAvatarUpdate = async (avatar: string) => {
    setSelectedAvatar(avatar);
    const success = await updateUserAvatar(avatar);
    if (success) {
      setIsEditingAvatar(false);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-5xl cursor-pointer">
                  {selectedAvatar}
                </div>
                <Dialog open={isEditingAvatar} onOpenChange={setIsEditingAvatar}>
                  <DialogTrigger asChild>
                    <Button 
                      size="icon" 
                      className="absolute bottom-0 right-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Choose Your Avatar</DialogTitle>
                      <DialogDescription>Select an avatar to represent your profile</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-6 gap-3 mt-4">
                      {AVATAR_OPTIONS.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => handleAvatarUpdate(avatar)}
                          className={`text-4xl p-3 rounded-lg hover:bg-muted transition-colors ${
                            selectedAvatar === avatar ? 'bg-primary/20 ring-2 ring-primary' : ''
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary">
                  Level {profile.level}
                </Badge>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{profile.username}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">

                  <Badge variant="outline" className="capitalize">{profile.experienceLevel}</Badge>
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {accountAge} days ago
                  </Badge>
                </div>

                {/* XP Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Level {profile.level}</span>
                    <span>{profile.currentXP} / {profile.xpToNextLevel} XP</span>
                  </div>
                  <Progress value={levelPercentage} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    {profile.xpToNextLevel - profile.currentXP} XP to level {profile.level + 1}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 md:w-auto w-full">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                    <p className="text-2xl font-bold">{profile.totalChallengesSolved}</p>
                    <p className="text-xs text-muted-foreground">Solved</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Flame className="w-6 h-6 mx-auto mb-1 text-orange-500" />
                    <p className="text-2xl font-bold">{profile.streak}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Coins className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                    <p className="text-2xl font-bold">{profile.coins}</p>
                    <p className="text-xs text-muted-foreground">Coins</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                    <p className="text-2xl font-bold">{profile.totalXP.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
            
              <Button variant="outline" onClick={() => router.push('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Stats */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Calendar className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-500">{stats.successRate}%</p>
                  <Progress value={stats.successRate} className="h-2 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Avg. Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{Math.floor(stats.averageTime / 60)}m</p>
                  <p className="text-xs text-muted-foreground">{stats.averageTime % 60}s</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Perfect Solves</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-500">{stats.perfectSolves}</p>
                  <p className="text-xs text-muted-foreground">First try</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalAttempts}</p>
                  <p className="text-xs text-muted-foreground">{stats.hintsUsed} hints</p>
                </CardContent>
              </Card>
            </div>

            {/* Challenges by Difficulty */}
            <Card>
              <CardHeader>
                <CardTitle>Challenges by Difficulty</CardTitle>
                <CardDescription>Your progress across skill levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.challengesByDifficulty).map(([difficulty, count]) => {
                  const total = Object.values(stats.challengesByDifficulty).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={difficulty}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{difficulty}</span>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>Your most practiced topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topCategories.map((category, index) => (
                    <div key={category.name} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-muted'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium flex-1 capitalize">{category.name}</span>
                      <span className="text-sm">{category.count} ({category.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Challenges completed per day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-32 gap-2">
                  {stats.activityByDay.map((day) => (
                    <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
                      <div 
                        className="w-full bg-primary rounded-t min-h-[8px]"
                        style={{ height: `${(day.challenges / maxDailyActivity) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-sm font-bold">{day.challenges}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest challenges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.recentActivity.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No recent activity. Start solving challenges!
                  </p>
                ) : (
                  stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {activity.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Loader2 className="w-5 h-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium">{activity.challengeName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                        +{activity.points} XP
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}