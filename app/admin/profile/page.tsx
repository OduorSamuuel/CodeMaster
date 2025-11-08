import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminProfile } from '@/actions/admin-profile';
import AdminProfileClient from '@/components/AdminProfileClient';

export default async function AdminProfilePage() {
  const profile = await getAdminProfile();

  // Redirect if no profile
  if (!profile) {
    redirect('/auth/login');
  }

  return <AdminProfileClient profile={profile} />;
}