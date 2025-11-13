import React from 'react';
import { redirect } from 'next/navigation';

import ProfileClient from '@/components/profile-card';
import { fetchDetailedStats, fetchUserProfile } from '@/actions';

export default async function ProfilePage() {
  // Fetch profile and stats in parallel
  const [profile, stats] = await Promise.all([
    fetchUserProfile(),
    fetchDetailedStats(),
  ]);

  // Redirect if no profile
  if (!profile) {
    
    redirect('/auth/login');
  }

  return <ProfileClient profile={profile} stats={stats} />;
}