// hooks/useRecommendations.ts
'use client';

import { useState, useEffect } from 'react';

interface SolvedProblem {
  name: string;
  rank: number;
  tags: string[];
  description: string;
  passed: boolean;
}

interface CandidateProblem {
  name: string;
  rank: number;
  rank_name: string;
  tags: string[];
  description: string;
}

interface RecommendationDetails {
  difficulty_score: number;
  topic_score: number;
  learning_score: number;
  semantic_score: number;
  progression_score: number;
  target_difficulty: number;
}

interface RecommendedChallenge {
  name: string;
  rank: number;
  rank_name: string;
  score: number;
  topic: string;
  description: string;
  reasons: string[];
  details: RecommendationDetails;
  challengeDetails?: any;
}

interface UserProfile {
  avg_difficulty: number;
  success_rate: number;
  experience_level: string;
  total_solved: number;
  top_topics: string[];
}

interface RecommendationResponse {
  recommendations: RecommendedChallenge[];
  userProfile: UserProfile;
  metadata: {
    model_version: string;
    timestamp: string;
    processing_time_ms: number;
    n_candidates: number;
    n_recommendations: number;
    semantic_similarity_enabled: boolean;
  };
}

const RECOMMENDATION_API = 'https://sam12555-codemaster-v4.hf.space/recommend';

/**
 * Sanitize HTML from description text
 */
function sanitizeDescription(description: string): string {
  if (!description) return '';
  
  let text = description.replace(/<[^>]*>/g, '');
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Call recommendation API directly from client
 */
async function callRecommendationAPI(
  solvedProblems: SolvedProblem[],
  candidateProblems: CandidateProblem[],
  topN: number = 3
): Promise<RecommendationResponse | null> {
  try {
    const requestBody = {
      solved_problems: solvedProblems.map(p => ({
        ...p,
        description: sanitizeDescription(p.description)
      })),
      candidate_problems: candidateProblems.map(p => ({
        ...p,
        description: sanitizeDescription(p.description)
      })),
      top_n: topN
    };

 

    const response = await fetch(RECOMMENDATION_API, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();

    return data;
    
  } catch (error) {
    console.error('Error calling recommendation API:', error);
    return null;
  }
}

/**
 * React hook for fetching recommendations
 */
export function useRecommendations(userId: string, topN: number = 3) {
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch data from your API route
        const response = await fetch(`/api/recommendations/data?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendation data');
        }

        const { solvedProblems, candidateProblems, challengeDetails } = await response.json();

        // If no solved problems, skip recommendations
        if (!solvedProblems || solvedProblems.length === 0) {

          setRecommendations(null);
          setIsLoading(false);
          return;
        }

        // Call recommendation API from client
        const apiResponse = await callRecommendationAPI(
          solvedProblems,
          candidateProblems,
          topN
        );

        if (!apiResponse) {
          setError('Failed to get recommendations');
          setIsLoading(false);
          return;
        }

        // Enrich with full challenge details and transform to Challenge type
        const enrichedRecommendations = apiResponse.recommendations.map(rec => {
          const dbChallenge = challengeDetails.find((c: any) => c.name === rec.name);
          
          // Transform database format to Challenge type
          const transformedChallenge = dbChallenge ? {
            id: dbChallenge.id.toString(),
            title: dbChallenge.name || 'Untitled Challenge',
            difficulty: dbChallenge.rank_name || '8 kyu',
            category: dbChallenge.category || 'reference',
            description: dbChallenge.description || '',
            tags: dbChallenge.tags || [],
            points: dbChallenge.points || 0,
            timeLimit: dbChallenge.time_limit ?? undefined,
            solvedCount: dbChallenge.solved_count ?? 0,
            locked: dbChallenge.is_locked ?? false,
            requiredLevel: dbChallenge.required_level ?? undefined,
          } : null;
          
          return {
            ...rec,
            challengeDetails: transformedChallenge
          };
        });

        setRecommendations({
          ...apiResponse,
          recommendations: enrichedRecommendations
        });
        
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId, topN]);

  return { recommendations, isLoading, error };
}