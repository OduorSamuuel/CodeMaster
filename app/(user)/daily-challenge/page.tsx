'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChallengeCard } from '@/components/ChallengeCard';
import { 
  Calendar, 
  Crown, 
  Sparkles, 
  Trophy, 
  Clock, 
  Users,
  AlertCircle,
  Loader2,
  Star
} from 'lucide-react';
import { Challenge } from '@/types/challenge';
import { fetchDailyChallenge, fetchDailyChallengeHistory } from '@/actions';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Constants for pagination
const HISTORY_ITEMS_PER_PAGE = 6;

export default function DailyChallengePage() {
  const [todayChallenge, setTodayChallenge] = useState<Challenge | null>(null);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [challengeDate, setChallengeDate] = useState('');
  const [history, setHistory] = useState<Array<{
    challenge_date: string;
    challenge: Challenge;
    bonus_points: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state for history
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load today's challenge and initial history
  useEffect(() => {
    async function loadDailyChallenge() {
      try {
        setIsLoading(true);
        const { challenge, bonusPoints, challengeDate } = await fetchDailyChallenge();
        
        setTodayChallenge(challenge);
        setBonusPoints(bonusPoints);
        setChallengeDate(challengeDate);

        if (!challenge) {
          setError('No daily challenge available for today. Check back tomorrow!');
        }
      } catch (err) {
        console.error('Error loading daily challenge:', err);
        setError('Failed to load daily challenge. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    loadDailyChallenge();
  }, []);

  // Load history when page changes
  useEffect(() => {
    async function loadHistory() {
      try {
        setIsLoadingHistory(true);
        const { history, totalCount } = await fetchDailyChallengeHistory(currentPage, HISTORY_ITEMS_PER_PAGE);
        
        setHistory(history);
        setTotalCount(totalCount);
        setTotalPages(Math.ceil(totalCount / HISTORY_ITEMS_PER_PAGE));
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    }

    loadHistory();
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading daily challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Daily Challenge
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Solve today's special challenge to earn bonus points and keep your streak going!
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Today's Challenge Section */}
        {todayChallenge && (
          <div className="mb-12">
            {/* Challenge Header */}
            <Card className="mb-6 border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                      <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Today's Challenge</h2>
                      <p className="text-muted-foreground">{formatDate(challengeDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-yellow-500 text-white px-3 py-1 text-sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {bonusPoints} Bonus Points
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 text-sm">
                      <Trophy className="w-3 h-3 mr-1" />
                      Daily Special
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Challenge Card with Daily Badge */}
            <div className="max-w-4xl mx-auto relative">
              {/* Daily Challenge Badge */}
              <div className="absolute -top-4 -right-4 z-10">
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                  <Sparkles className="w-4 h-4 mr-1" />
                  DAILY CHALLENGE
                </Badge>
              </div>
              
              {/* Use the existing ChallengeCard component as-is */}
              <ChallengeCard challenge={todayChallenge} />
              
              {/* Bonus Points Info */}
              <Card className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold">Bonus Points Available:</span>
                    </div>
                    <Badge className="bg-yellow-500 text-white px-3 py-1">
                      +{bonusPoints} points
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete this challenge today to earn {bonusPoints} bonus points on top of the regular {todayChallenge.points} points!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Daily Challenge Info */}
            <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <Trophy className="w-8 h-8 text-yellow-600 mb-2" />
                    <h3 className="font-semibold text-sm">Bonus Points</h3>
                    <p className="text-2xl font-bold text-yellow-600">{bonusPoints}</p>
                    <p className="text-xs text-muted-foreground">Extra points for today only</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <Clock className="w-8 h-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold text-sm">Time Limited</h3>
                    <p className="text-2xl font-bold text-blue-600">24h</p>
                    <p className="text-xs text-muted-foreground">Available until midnight</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <Users className="w-8 h-8 text-green-600 mb-2" />
                    <h3 className="font-semibold text-sm">Global Challenge</h3>
                    <p className="text-2xl font-bold text-green-600">Everyone</p>
                    <p className="text-xs text-muted-foreground">Solve with the community</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Previous Challenges Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Previous Daily Challenges</h2>
          </div>

          {isLoadingHistory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: HISTORY_ITEMS_PER_PAGE }, (_, i) => (
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
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : history.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {history.map((item) => (
                  <Card key={item.challenge_date} className="hover:shadow-lg transition-shadow relative">
                    {/* Historical Badge */}
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge variant="outline" className="bg-white dark:bg-gray-900 text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Past Daily
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          +{item.bonus_points} BP
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.challenge_date).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        {item.challenge.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {item.challenge.rank_name}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {item.challenge.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {item.challenge.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={`/challenges/${item.challenge.id}`}>
                          View Challenge
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination for History */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
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
                        onClick={(e) => {
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
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Previous Challenges</h3>
                <p className="text-muted-foreground">
                  Daily challenge history will appear here as you participate in more challenges.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Section */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              About Daily Challenges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium mb-2">How it works</h4>
                <ul className="space-y-1">
                  <li>• A new challenge is available every day at midnight UTC</li>
                  <li>• Complete it to earn bonus points</li>
                  <li>• Challenges are available for 24 hours only</li>
                  <li>• Perfect for maintaining your daily streak</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Bonus Points</h4>
                <ul className="space-y-1">
                  <li>• Base bonus: 50 points</li>
                  <li>• Streak multiplier: +10 points per active streak day</li>
                  <li>• Perfect solve: Additional 25% bonus</li>
                  <li>• Points are added to your total immediately</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}