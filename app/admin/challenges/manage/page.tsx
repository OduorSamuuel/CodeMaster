import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Plus, Target,  BookOpen } from 'lucide-react';


import Link from 'next/link';
import ChallengesListClient from '@/components/ChallengesListClient';
import { getAllChallenges, getChallengeStats } from '@/actions';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    difficulty?: string;
  }>;
}

export default async function AdminChallengesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const page = parseInt(params.page || '1');
  const searchQuery = params.search || '';
  const categoryFilter = params.category || 'all';
  const difficultyFilter = params.difficulty || 'all';



  // Fetch data in parallel
  const [challengesData, stats] = await Promise.all([
    getAllChallenges(page, 5, searchQuery, categoryFilter, difficultyFilter),
    getChallengeStats()
  ]);

  // If user is not admin or data fetch failed
  if (!challengesData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You don&apos;t have permission to manage challenges.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Manage Challenges</h2>
          <p className="text-muted-foreground">View, edit, and create coding challenges</p>
        </div>
        <Link href="/admin/challenges/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Challenge
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Challenges</p>
                  <p className="text-2xl font-bold">{stats.totalChallenges}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Easy</p>
                  <p className="text-2xl font-bold">{stats.byDifficulty['8 kyu'] || 0}</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Medium</p>
                  <p className="text-2xl font-bold">{stats.byDifficulty['7 kyu'] || 0}</p>
                </div>
                <Target className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hard</p>
                  <p className="text-2xl font-bold">{stats.byDifficulty['6 kyu'] || 0}</p>
                </div>
                <Target className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

  

      {/* Challenges List */}
      <Card>
        <CardContent className="p-6">
          <ChallengesListClient 
            challenges={challengesData.challenges}
            currentPage={page}
            totalPages={challengesData.totalPages}
            total={challengesData.total}
            initialSearch={searchQuery}
            initialCategory={categoryFilter}
            initialDifficulty={difficultyFilter}
          />
        </CardContent>
      </Card>
    </div>
  );
}