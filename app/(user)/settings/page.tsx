import React from 'react';

import { redirect } from 'next/navigation';
import { fetchUserProfile } from '@/actions/profile';
import SettingsClient from '@/components/settings-client';

export default async function SettingsPage() {
  const profile = await fetchUserProfile();

  if (!profile) {
    redirect('/login');
  }

  return <SettingsClient profile={profile} />;
}