import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Target, TrendingUp, BookOpen } from 'lucide-react';
import { getAllChallenges, getChallengeStats } from '@/actions/admin-challenges';

import Link from 'next/link';
import ChallengesListClient from '@/components/ChallengesListClient';

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
    getAllChallenges(page, 20, searchQuery, categoryFilter, difficultyFilter),
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
              You don't have permission to manage challenges.
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

      {/* Most Solved Challenges */}
      {stats && stats.mostSolved.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Most Solved Challenges
            </h3>
            <div className="space-y-2">
              {stats.mostSolved.map((challenge, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-muted'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{challenge.name}</span>
                  </div>
                  <Badge variant="outline">{challenge.solved_count} solves</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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