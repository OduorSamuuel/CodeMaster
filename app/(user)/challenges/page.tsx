'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChallengeCard } from '@/components/ChallengeCard';
import { RecommendedChallengeCard } from '@/components/RecommendedChallengeCard';
import { AlertCircle, Sparkles, Info, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Challenge } from '@/types/challenge';
import { useRecommendations } from '@/hooks/useRecommendations';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { createClient } from '@/lib/supabase/client';
import { fetchChallengesPaginated } from '@/actions/client';

// Constants for pagination
const ITEMS_PER_PAGE = 9;

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Get user ID from auth
  useEffect(() => {
    async function getUserId() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id ?? null);
      } catch (err) {
        console.error('Error getting user:', err);
      }
    }
    getUserId();
  }, []);

  // Fetch paginated challenges
  useEffect(() => {
    async function loadChallenges() {
      try {
        setIsLoadingChallenges(true);
        const { data, totalCount: count } = await fetchChallengesPaginated(currentPage, ITEMS_PER_PAGE);
        console.log('Fetched challenges:', data);
        setChallenges(data);
        setTotalCount(count);
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      } catch (err) {
        console.error('Challenge fetch error:', err);
        setError('Failed to load challenges. Please try again later.');
      } finally {
        setIsLoadingChallenges(false);
      }
    }
    loadChallenges();
  }, [currentPage]);

  const { 
    recommendations, 
    isLoading: isLoadingRecommendations, 
    error: recommendationsError 
  } = useRecommendations(userId || '', 3);

  const recommendedChallenges = recommendations?.recommendations || [];

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Show loading for recommended section during pagination
    setIsLoadingRecommended(true);
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Hide loading after a short delay (simulates loading state)
    setTimeout(() => {
      setIsLoadingRecommended(false);
    }, 500);
  };

  // Show loading state for initial page load
  if (isLoadingChallenges && currentPage === 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Browse Challenges</h1>
          <p className="text-muted-foreground">Choose your next coding adventure</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                All
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                Fundamentals
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                Algorithms
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                Data Structures
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                Bug Fixes
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                Easy (8-7 kyu)
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                Medium (6-5 kyu)
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                Hard (4-1 kyu)
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Challenges Section */}
        {userId && (
          <>
            {isLoadingRecommendations && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <h2 className="text-2xl font-bold">Getting personalized recommendations...</h2>
                </div>
                <Card className="p-6">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground">Analyzing your progress and finding the best challenges for you...</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {recommendationsError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load recommendations: {recommendationsError}
                </AlertDescription>
              </Alert>
            )}

            {!isLoadingRecommendations && recommendedChallenges.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                    <h2 className="text-2xl font-bold">Recommended For You</h2>
                    {isLoadingRecommended && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />
                    )}
                  </div>
                </div>
                
                {/* Show loading overlay for recommended section during pagination */}
                {isLoadingRecommended ? (
                  <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                      {recommendedChallenges.map((rec) => {
                        const challenge = rec.challengeDetails;
                        if (!challenge) return null;

                        return (
                          <RecommendedChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            score={rec.score}
                            reasons={rec.reasons}
                            topic={rec.topic}
                            details={rec.details}
                          />
                        );
                      })}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Updating recommendations...</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* User Profile Info */}
                    {recommendations?.userProfile && (
                      <Alert className="mb-4 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span>Level: <strong className="capitalize">{recommendations.userProfile.experience_level}</strong></span>
                            <span>•</span>
                            <span>Success Rate: <strong>{(recommendations.userProfile.success_rate * 100).toFixed(0)}%</strong></span>
                            <span>•</span>
                            <span>Solved: <strong>{recommendations.userProfile.total_solved}</strong></span>
                            {recommendations.userProfile.top_topics.length > 0 && (
                              <>
                                <span>•</span>
                                <span>Top Topics: <strong>{recommendations.userProfile.top_topics.slice(0, 3).join(', ')}</strong></span>
                              </>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <Alert className="mb-4 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                      <Info className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                        These challenges are personalized based on your solving history, difficulty level, 
                        and learning patterns.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendedChallenges.map((rec) => {
                        const challenge = rec.challengeDetails;
                        if (!challenge) return null;

                        return (
                          <RecommendedChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            score={rec.score}
                            reasons={rec.reasons}
                            topic={rec.topic}
                            details={rec.details}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* All Challenges Section */}
        <div>
          {recommendedChallenges.length > 0 && (
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">All Challenges</h2>
                <p className="text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} challenges
                </p>
              </div>
            </div>
          )}

          {challenges.length === 0 && recommendedChallenges.length === 0 && !error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No challenges available yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back soon for new coding challenges!
              </p>
            </div>
          ) : (
            <>
              {/* Loading state for challenges grid */}
              {isLoadingChallenges ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {Array.from({ length: ITEMS_PER_PAGE }, (_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-full mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
                        <div className="flex gap-2 mb-4">
                          <div className="h-6 bg-muted rounded w-16"></div>
                          <div className="h-6 bg-muted rounded w-20"></div>
                        </div>
                        <div className="h-10 bg-muted rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {challenges.map((challenge) => (
                    <ChallengeCard 
                      key={challenge.id} 
                      challenge={challenge}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                      href="#" 
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                          e.preventDefault();
                          handlePageChange(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext 
                      href="#"
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}