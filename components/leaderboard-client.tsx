"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, Medal, Calendar, TrendingUp, Flame } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  points: number;
  solvedToday: number;
  isCurrentUser?: boolean;
}

interface LeaderboardsData {
  daily: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
}

interface LeaderboardClientProps {
  leaderboards: LeaderboardsData;
}

export default function LeaderboardClient({ leaderboards }: LeaderboardClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'allTime'>('daily');
console.log(leaderboards);
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
          <Crown className="w-6 h-6 text-white" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg">
          <Medal className="w-6 h-6 text-white" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
          <Trophy className="w-6 h-6 text-white" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold text-lg">
        {rank}
      </div>
    );
  };

  const currentLeaderboard = leaderboards[selectedPeriod];
  const userEntry = currentLeaderboard.find(e => e.isCurrentUser);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-primary" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Compete with other coders and climb to the top!
          </p>
        </div>

        {/* User's Current Rank Card */}
        {userEntry && (
          <Card className="mb-6 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
<div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl shadow-md overflow-hidden">
  {userEntry.avatar.startsWith('http') ? (
    <img 
      src={userEntry.avatar} 
      alt={userEntry.username}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
      }}
    />
  ) : null}
  <div 
    className="w-full h-full flex items-center justify-center text-white font-bold"
    style={{ display: userEntry.avatar.startsWith('http') ? 'none' : 'flex' }}
  >
    {userEntry.avatar.startsWith('http') ? userEntry.username.charAt(0).toUpperCase() : userEntry.avatar}
  </div>
</div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Rank</p>
                    <h3 className="text-3xl font-bold">#{userEntry.rank}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-3xl font-bold text-primary">{userEntry.points.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" onClick={() => setSelectedPeriod('daily')}>
              <Flame className="w-4 h-4 mr-2" />
              Today
            </TabsTrigger>
            <TabsTrigger value="weekly" onClick={() => setSelectedPeriod('weekly')}>
              <Calendar className="w-4 h-4 mr-2" />
              This Week
            </TabsTrigger>
            <TabsTrigger value="allTime" onClick={() => setSelectedPeriod('allTime')}>
              <Trophy className="w-4 h-4 mr-2" />
              All Time
            </TabsTrigger>
          </TabsList>

          {/* Daily Leaderboard */}
          <TabsContent value="daily" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s Top Performers</CardTitle>
                <CardDescription>Rankings reset daily at midnight</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardList entries={leaderboards.daily} getRankBadge={getRankBadge} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Leaderboard */}
          <TabsContent value="weekly" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>This Week&apos;s Leaders</CardTitle>
                <CardDescription>Rankings reset every Monday</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardList entries={leaderboards.weekly} getRankBadge={getRankBadge} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* All-Time Leaderboard */}
          <TabsContent value="allTime" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Hall of Fame</CardTitle>
                <CardDescription>The greatest coders of all time</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardList entries={leaderboards.allTime} getRankBadge={getRankBadge} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Leaderboard List Component
function LeaderboardList({ 
  entries, 
  getRankBadge 
}: { 
  entries: LeaderboardEntry[];
  getRankBadge: (rank: number) => React.ReactElement;
}) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p>No rankings yet. Start solving challenges to appear on the leaderboard!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={`${entry.rank}-${entry.username}`}
          className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
            entry.isCurrentUser
              ? 'bg-primary/10 border-2 border-primary shadow-lg scale-105'
              : entry.rank <= 3
              ? 'bg-muted/50'
              : 'bg-muted/30 hover:bg-muted/50'
          }`}
        >
          {/* Rank Badge */}
          <div className="flex-shrink-0">
            {getRankBadge(entry.rank)}
          </div>

          {/* Avatar */}
       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl shadow-md overflow-hidden">
            {entry.avatar.startsWith('http') ? (
              <img 
                src={entry.avatar} 
                alt={entry.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-full h-full flex items-center justify-center text-white font-bold"
              style={{ display: entry.avatar.startsWith('http') ? 'none' : 'flex' }}
            >
              {entry.avatar.startsWith('http') ? entry.username.charAt(0).toUpperCase() : entry.avatar}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg truncate">{entry.username}</p>
              {entry.isCurrentUser && (
                <Badge variant="default" className="text-xs">You</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {entry.solvedToday} challenges completed
            </p>
          </div>

          {/* Points */}
          <div className="text-right">
            <p className="text-2xl font-bold">{entry.points.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">points</p>
          </div>
        </div>
      ))}
    </div>
  );
}