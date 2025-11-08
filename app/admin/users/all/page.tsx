import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Download, TrendingUp, Users, Shield, Crown, User as UserIcon } from "lucide-react";
import { getUserManagementStats, getUsers } from '@/actions/admin-users';
import UsersFilters from '@/components/UsersFilters';
import UsersList from '@/components/UsersList';


interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: 'all' | 'user' | 'admin' | 'moderator';
    status?: 'all' | 'active' | 'inactive' | 'banned';
  }>;
}

export default async function ManageUsersPage({ searchParams }: PageProps) {
  // Await searchParams in Next.js 15
  const params = await searchParams;
  
  const page = parseInt(params.page || '1');
  const searchQuery = params.search || '';
  const roleFilter = params.role || 'all';
  const statusFilter = params.status || 'all';

  // Fetch data in parallel
  const [stats, usersData] = await Promise.all([
    getUserManagementStats(),
    getUsers(page, 10, searchQuery, roleFilter, statusFilter)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Manage Users</h2>
          <p className="text-muted-foreground">View and manage platform users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">
                  {stats?.totalUsers.toLocaleString() || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {stats?.activeUsers.toLocaleString() || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last 7 days
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Week</p>
                <p className="text-2xl font-bold">
                  {stats?.newThisWeek || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Banned Users</p>
                <p className="text-2xl font-bold">
                  {stats?.bannedUsers || 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Users List */}
      <Card>
        <CardContent className="p-6">
          <UsersFilters 
            initialSearch={searchQuery}
            initialRole={roleFilter}
            initialStatus={statusFilter}
          />

          {usersData && usersData.users.length > 0 ? (
            <UsersList 
              users={usersData.users}
              currentPage={page}
              totalPages={usersData.totalPages}
              total={usersData.total}
            />
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-semibold mb-2">No users found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search or filters' : 'No users available'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}