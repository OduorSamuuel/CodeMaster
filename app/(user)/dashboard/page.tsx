import React from 'react';

import {
  fetchUserProgress,
  fetchUserAchievements,
  fetchTodayLeaderboard,
  fetchActiveMultipliers,
  fetchMysteryBoxProgress,
} from '@/actions';
import DashboardClient from '@/components/dashboard-client';

export default async function DashboardPage() {
  // Fetch all data in parallel on the server
  const [
    userProgress,
    achievements,
    leaderboard,
    multipliers,
    mysteryBox,
  ] = await Promise.all([
    fetchUserProgress(),
    fetchUserAchievements(),
    fetchTodayLeaderboard(),
    fetchActiveMultipliers(),
    fetchMysteryBoxProgress(),
  ]);

  // If user is not authenticated, redirect or show login
  if (!userProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h1>
          <a href="/login" className="text-primary hover:underline">
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <DashboardClient
      initialProgress={userProgress}
      initialAchievements={achievements}
      initialLeaderboard={leaderboard}
      initialMultipliers={multipliers}
      initialMysteryBox={mysteryBox}
    />
  );
}