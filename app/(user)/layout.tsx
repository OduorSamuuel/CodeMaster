import React from 'react';
import { redirect } from 'next/navigation';
import UserLayoutClient from '@/components/user-layout-client';
import { fetchLayoutUserData, getInProgressCount } from '@/actions';



type LayoutProps = {
  children: React.ReactNode;
};

export default async function UserLayout({ children }: LayoutProps) {
  // Fetch user data and in-progress count in parallel
  const [userData, inProgressCount] = await Promise.all([
    fetchLayoutUserData(),
    getInProgressCount(),
  ]);

  // Redirect to login if no user data
  if (!userData) {
    redirect('/login');
  }

  return (
    <UserLayoutClient
      userData={userData} 
      inProgressCount={inProgressCount}
    >
      {children}
    </UserLayoutClient>
  );
}