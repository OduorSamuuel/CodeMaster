// app/admin/challenges/[id]/page.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Lock,
  Unlock,
  Clock,
  Trophy,
  Users,
  Calendar,
  Tag,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import AdminChallengeDetailClient from '@/components/AdminChallengeDetailClient';
import { fetchChallengeById } from '@/actions/client';
import { getTestCases } from '@/actions';
import {  Challenge, TestCase } from '@/types';


interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminChallengeDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch challenge and test cases in parallel
  const [challenge, testCases] = await Promise.all([
    fetchChallengeById(id),
    getTestCases(id)
  ]) as [Challenge | null, TestCase[] | null];

  if (!challenge) {
    notFound();
  }

  const getDifficultyColor = (rank: string): string => {
    const map: Record<string, string> = {
      '8 kyu': 'bg-green-500/10 text-green-600 border-green-500/20',
      '7 kyu': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      '6 kyu': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      '5 kyu': 'bg-red-500/10 text-red-600 border-red-500/20',
      '4 kyu': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      '3 kyu': 'bg-pink-500/10 text-pink-600 border-pink-500/20',
      '2 kyu': 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      '1 kyu': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    };
    return map[rank] || 'bg-muted text-muted-foreground border-muted';
  };

  return (
    <div className="space-y-6 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/challenges">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{challenge.name}</h1>
            <p className="text-muted-foreground">Challenge Details</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin/challenges/${challenge.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <AdminChallengeDetailClient challengeId={challenge.id} challengeName={challenge.name} />
        </div>
      </div>

      {/* Status and Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={challenge.is_locked ? 'secondary' : 'default'}
                  className={
                    !challenge.is_locked
                      ? 'bg-green-500/10 text-green-600 border border-green-500/20 mt-2'
                      : 'mt-2'
                  }
                >
                  {challenge.is_locked ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 mr-1" />
                      Active
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-bold flex items-center gap-2 mt-1">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  {challenge.points}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solved Count</p>
                <p className="text-2xl font-bold flex items-center gap-2 mt-1">
                  <Users className="w-5 h-5 text-blue-500" />
                  {challenge.solved_count ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Limit</p>
                <p className="text-2xl font-bold flex items-center gap-2 mt-1">
                  <Clock className="w-5 h-5 text-orange-500" />
                  {challenge.time_limit ? `${challenge.time_limit}s` : 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Challenge Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: challenge.description }}
              />
            </CardContent>
          </Card>

          {/* Solution Code */}
          {challenge.solutions && (
            <Card>
              <CardHeader>
                <CardTitle>Example Solution</CardTitle>
                <CardDescription>Reference solution for this challenge</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono">{challenge.solutions}</code>
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Test Cases */}
          <Card>
            <CardHeader>
              <CardTitle>Test Cases</CardTitle>
              <CardDescription>
                {testCases?.length ?? 0} test case(s) defined
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {testCases && testCases.length > 0 ? (
                testCases.map((testCase: TestCase, index: number) => (
                  <div key={testCase.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Test Case {index + 1}</span>
                        {testCase.is_hidden && (
                          <Badge variant="secondary" className="text-xs">
                            Hidden
                          </Badge>
                        )}
                      </div>
                      {testCase.is_hidden ? (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>

                    {testCase.description && (
                      <p className="text-sm text-muted-foreground">{testCase.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Input</p>
                        <pre className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
                          {testCase.input}
                        </pre>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Expected Output</p>
                        <pre className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
                          {testCase.expected_output}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No test cases defined
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Challenge Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                <Badge className={getDifficultyColor(challenge.rank_name)}>
                  {challenge.rank_name}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <Badge variant="outline" className="capitalize">
                  {challenge.category}
                </Badge>
              </div>

              <Separator />

              {challenge.required_level && (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Required Level</p>
                    <p className="text-lg font-semibold">Level {challenge.required_level}</p>
                  </div>
                  <Separator />
                </>
              )}

              {challenge.estimated_time && (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Estimated Time</p>
                    <p className="text-lg font-semibold">{challenge.estimated_time} minutes</p>
                  </div>
                  <Separator />
                </>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created
                </p>
                <p className="text-sm">
                  {new Date(challenge.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {challenge.tags && challenge.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {challenge.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}