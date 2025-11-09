import { createClient } from "@/lib/supabase/server";

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

interface RecommendationRequest {
  solved_problems: SolvedProblem[];
  candidate_problems: CandidateProblem[];
  top_n: number;
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
  user_profile: UserProfile;
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
  
  // Remove HTML tags
  let text = description.replace(/<[^>]*>/g, '');
  
  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Trim and normalize whitespace
  text = text.trim().replace(/\s+/g, ' ');
  
  return text;
}

/**
 * Fetch user's solved problems from database
 */
async function fetchUserSolvedProblems(userId: string): Promise<SolvedProblem[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_solutions')
    .select(`
      exercise_id,
      status,
      exercises (
        name,
        rank,
        description,
        exercise_tags ( tag )
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'completed');

  if (error) {
    console.error('Error fetching solved problems:', error);
    return [];
  }

  return (data || []).map((solution: any) => ({
    name: solution.exercises?.name || '',
    rank: solution.exercises?.rank || 1,
    tags: solution.exercises?.exercise_tags?.map((t: any) => t.tag) || [],
    description: sanitizeDescription(solution.exercises?.description || ''),
    passed: solution.status === 'completed'
  }));
}

/**
 * Fetch candidate problems (unsolved challenges)
 */
async function fetchCandidateProblems(userId: string): Promise<CandidateProblem[]> {
  const supabase = await createClient();
  
  // Get IDs of solved exercises
  const { data: solvedIds } = await supabase
    .from('user_solutions')
    .select('exercise_id')
    .eq('user_id', userId)
    .eq('status', 'completed');

  const solvedExerciseIds = (solvedIds || []).map(s => s.exercise_id);

  // Fetch unsolved exercises
  const { data, error } = await supabase
    .from('exercises_full')
    .select('*')
    .not('id', 'in', `(${solvedExerciseIds.join(',') || '0'})`)
    .eq('is_locked', false)
    .order('rank', { ascending: true })
    .limit(50); // Limit candidates for API

  if (error) {
    console.error('Error fetching candidate problems:', error);
    return [];
  }

  return (data || []).map((exercise: any) => ({
    name: exercise.name,
    rank: exercise.rank,
    rank_name: exercise.rank_name,
    tags: exercise.tags || [],
    description: sanitizeDescription(exercise.description || '')
  }));
}

/**
 * Call recommendation API with timeout and retry logic
 */
async function callRecommendationAPI(
  solvedProblems: SolvedProblem[],
  candidateProblems: CandidateProblem[],
  topN: number = 3,
  retryCount: number = 0
): Promise<RecommendationResponse | null> {
  const MAX_RETRIES = 2;
  
  try {
    const requestBody: RecommendationRequest = {
      solved_problems: solvedProblems,
      candidate_problems: candidateProblems,
      top_n: topN
    };

    console.log("📤 Sending payload to API (attempt", retryCount + 1, "):", JSON.stringify(requestBody, null, 2).slice(0, 500) + "...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

    const response = await fetch(RECOMMENDATION_API, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'CodeMaster-App/1.0',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
      // Add keep-alive and connection settings
      keepalive: true,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Recommendation API error:', response.status, response.statusText, errorText);
      return null;
    }

    const data = await response.json();
    console.log("✅ API response received successfully");
    return data;
    
  } catch (error) {
    const isTimeout = error instanceof Error && 
      (error.name === 'AbortError' || 
       error.message.includes('timeout') || 
       error.message.includes('ETIMEDOUT') ||
       error.message.includes('ECONNREFUSED'));
    
    if (isTimeout && retryCount < MAX_RETRIES) {
      console.warn(`⚠️ Timeout on attempt ${retryCount + 1}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
      return callRecommendationAPI(solvedProblems, candidateProblems, topN, retryCount + 1);
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('❌ Recommendation API timeout after 45 seconds');
      } else {
        console.error('❌ Error calling recommendation API:', error.message, error.cause);
      }
    } else {
      console.error('❌ Error calling recommendation API:', error);
    }
    return null;
  }
}

/**
 * Fetch full challenge details for recommended problems
 */
async function fetchRecommendedChallengeDetails(recommendedNames: string[]) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('exercises_full')
    .select('*')
    .in('name', recommendedNames);

  if (error) {
    console.error('Error fetching recommended challenge details:', error);
    return [];
  }

  return data || [];
}

/**
 * Main function to get personalized recommendations
 */
export async function getPersonalizedRecommendations(userId: string, topN: number = 3) {
  console.log("🧩 [getPersonalizedRecommendations] Started for user:", userId, "with topN:", topN);

  try {
    // 1. Fetch user's solved problems
    console.log("📥 Fetching solved problems...");
    const solvedProblems = await fetchUserSolvedProblems(userId);
    console.log("✅ Solved problems fetched:", solvedProblems.length, "items");
    console.debug("🧠 Solved problems sample:", solvedProblems.slice(0, 2));

    // If user hasn't solved anything, return null (show all challenges)
    if (solvedProblems.length === 0) {
      console.warn("⚠️ No solved problems found for user:", userId);
      return null;
    }

    // 2. Fetch candidate problems
    console.log("📥 Fetching candidate problems...");
    const candidateProblems = await fetchCandidateProblems(userId);
    console.log("✅ Candidate problems fetched:", candidateProblems.length, "items");
    console.debug("🧠 Candidate problems sample:", candidateProblems.slice(0, 2));

    if (candidateProblems.length === 0) {
      console.warn("⚠️ No candidate problems found for user:", userId);
      return null;
    }

    // 3. Call recommendation API
    console.log("🧮 Calling recommendation API with payload:", {
      solved_count: solvedProblems.length,
      candidate_count: candidateProblems.length,
      topN
    });
    const recommendations = await callRecommendationAPI(
      solvedProblems,
      candidateProblems,
      topN
    );

    if (!recommendations) {
      console.error("❌ Recommendation API returned null/undefined");
      return null;
    }

    console.log("✅ Recommendation API responded:", recommendations.recommendations?.length || 0, "recommendations");
    console.debug("🧠 Recommendation sample:", recommendations.recommendations?.slice(0, 2));

    // 4. Fetch full details for recommended challenges
    const recommendedNames = recommendations.recommendations.map(r => r.name);
    console.log("📥 Fetching details for recommended challenges:", recommendedNames);
    const challengeDetails = await fetchRecommendedChallengeDetails(recommendedNames);
    console.log("✅ Challenge details fetched:", challengeDetails.length);

    // 5. Merge recommendation data with full challenge details
    console.log("🔗 Merging recommendations with challenge details...");
    const enrichedRecommendations = recommendations.recommendations.map(rec => {
      const details = challengeDetails.find(c => c.name === rec.name);
      return {
        ...rec,
        challengeDetails: details || null
      };
    });

    console.log("🎯 Final enriched recommendations:", enrichedRecommendations.length);
    console.debug("🧩 Enriched sample:", enrichedRecommendations.slice(0, 2));

    const result = {
      recommendations: enrichedRecommendations,
      userProfile: recommendations.user_profile,
      metadata: recommendations.metadata
    };

    console.log("✅ [getPersonalizedRecommendations] Completed successfully.");
    return result;

  } catch (error) {
    console.error("💥 Error getting personalized recommendations:", error);
    return null;
  }
}

/**
 * Get recommendation reasons as formatted text
 */
export function formatRecommendationReasons(reasons: string[]): string {
  return reasons.join(' • ');
}