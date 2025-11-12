import AdminLayoutClient from '@/components/AdminLayoutClient';

import { redirect } from 'next/navigation';
import React from 'react';
import { Toaster } from '@/components/ui/sonner';
import { checkAdminRole, getAdminStats, getAdminUserInfo } from '@/actions';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Check if user is admin
  const isAdmin = await checkAdminRole();
  
  if (!isAdmin) {
    // Redirect non-admin users
    redirect('/dashboard');
  }

  // Fetch initial data for the admin layout
  const [stats, userInfo] = await Promise.all([
    getAdminStats(),
    getAdminUserInfo()
  ]);

  return (
    <div className="min-h-screen bg-background">
      <AdminLayoutClient 
        initialStats={stats} 
        initialUserInfo={userInfo}
      />
      <div 
        id="admin-main-content"
        className="pt-16 md:pl-64 transition-[padding] duration-300 ease-in-out"
      >
        <main className="w-full">
          <div className="container mx-auto p-6">
            {children}
             <Toaster />
          </div>
        </main>
      </div>
    </div>
  );
}