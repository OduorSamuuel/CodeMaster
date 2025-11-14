// app/api/recommendations/data/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Type definitions
interface ChallengeTag {
  tag: string;
}

interface Challenge {
  name: string;
  rank: number;
  description: string;
  challenge_tags?: ChallengeTag[];
}

interface UserSolution {
  challenge_id: string;
  status: string;
  passed: boolean | null;
  tests_passed: number;
  tests_total: number;
  last_attempted: string;
  challenges: Challenge | Challenge[];
}

interface ProcessedProblem {
  name: string;
  rank: number;
  tags: string[];
  description: string;
  passed: boolean;
}

interface CandidateChallenge {
  name: string;
  rank: number;
  rank_name: string;
  tags: string[];
  description: string;
  is_locked: boolean;
}

interface CandidateProblem {
  name: string;
  rank: number;
  rank_name: string;
  tags: string[];
  description: string;
}

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    console.log('Fetching recommendation data for user:', userId);

    // 1. Fetch solved problems with proper grouping
    const { data: solvedData, error: solvedError } = await supabase
      .from('user_solutions')
      .select(`
        challenge_id,
        status,
        passed,
        tests_passed,
        tests_total,
        last_attempted,
        challenges (
          name,
          rank,
          description,
          challenge_tags ( tag )
        )
      `)
      .eq('user_id', userId)
      .in('status', ['completed', 'failed'])
      .order('last_attempted', { ascending: false });

    if (solvedError) {
      console.error('Error fetching solved problems:', solvedError);
      return NextResponse.json({ error: 'Failed to fetch solved problems' }, { status: 500 });
    }

    // Process solved problems - use the most recent attempt for each challenge
    const uniqueSolvedProblems = new Map<string, ProcessedProblem>();
    
    (solvedData || []).forEach((solution: UserSolution) => {
      const challenge = Array.isArray(solution.challenges) ? solution.challenges[0] : solution.challenges;
      if (!challenge?.name) return;

      // Only keep the most recent attempt for each challenge
      if (!uniqueSolvedProblems.has(challenge.name)) {
        uniqueSolvedProblems.set(challenge.name, {
          name: challenge.name,
          rank: challenge.rank || 1,
          tags: challenge.challenge_tags?.map((t: ChallengeTag) => t.tag) || [],
          description: sanitizeDescription(challenge.description || ''),
          passed: solution.passed !== null ? solution.passed : (solution.status === 'completed' && solution.tests_passed === solution.tests_total)
        });
      }
    });

    const solvedProblems = Array.from(uniqueSolvedProblems.values());

    console.log('Processed solved problems:', solvedProblems.length);

    // 2. Fetch candidate problems (problems user hasn't successfully completed)
    const { data: candidateData, error: candidateError } = await supabase
      .from('challenges_full')
      .select('*')
      .eq('is_locked', false)
      .order('rank', { ascending: true })
      .limit(50);

    if (candidateError) {
      console.error('Error fetching candidate problems:', candidateError);
      return NextResponse.json({ error: 'Failed to fetch candidate problems' }, { status: 500 });
    }

    // Filter out problems the user has already passed
    const passedChallengeNames = new Set(
      solvedProblems.filter(p => p.passed).map(p => p.name)
    );

    const candidateProblems: CandidateProblem[] = (candidateData || [])
      .filter((challenge: CandidateChallenge) => !passedChallengeNames.has(challenge.name))
      .map((challenge: CandidateChallenge) => ({
        name: challenge.name,
        rank: challenge.rank,
        rank_name: challenge.rank_name,
        tags: challenge.tags || [],
        description: sanitizeDescription(challenge.description || '')
      }));

    console.log('Processed candidate problems:', candidateProblems.length);

    // 3. Fetch all challenge details for potential recommendations
    const candidateNames = candidateProblems.map((c: CandidateProblem) => c.name);
    const { data: challengeDetails, error: detailsError } = await supabase
      .from('challenges_full')
      .select('*')
      .in('name', candidateNames.length > 0 ? candidateNames : ['']);

    if (detailsError) {
      console.error('Error fetching challenge details:', detailsError);
    }

    console.log('Successfully fetched data:', {
      solvedCount: solvedProblems.length,
      candidateCount: candidateProblems.length,
      detailsCount: challengeDetails?.length || 0
    });

    return NextResponse.json({
      solvedProblems,
      candidateProblems,
      challengeDetails: challengeDetails || []
    });

  } catch (error) {
    console.error('Error in recommendations data API:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}