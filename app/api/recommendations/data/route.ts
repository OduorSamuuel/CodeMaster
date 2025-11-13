// app/api/recommendations/data/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

// Type definitions for Supabase query results
interface challengeTag {
  tag: string;
}

interface challenge {
  name: string;
  rank: number;
  description: string;
  challenge_tags?: challengeTag[];
}

interface UserSolutionData {
  challenge_id: string;
  status: string;
  challenges?: challenge | challenge[];
}

interface challengeFull {
  id: string;
  name: string;
  rank: number;
  rank_name: string;
  tags: string[];
  description: string;
  is_locked: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch solved problems
    const { data: solvedData, error: solvedError } = await supabase
      .from('user_solutions')
      .select(`
        challenge_id,
        status,
        challenges (
          name,
          rank,
          description,
          challenge_tags ( tag )
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (solvedError) {
      console.error('Error fetching solved problems:', solvedError);
      return NextResponse.json({ error: 'Failed to fetch solved problems' }, { status: 500 });
    }

    const solvedProblems = ((solvedData as UserSolutionData[] || [])).map((solution) => {
      const challenge = Array.isArray(solution.challenges) ? solution.challenges[0] : solution.challenges;
      return {
        name: challenge?.name || '',
        rank: challenge?.rank || 1,
        tags: challenge?.challenge_tags?.map((t: challengeTag) => t.tag) || [],
        description: sanitizeDescription(challenge?.description || ''),
        passed: solution.status === 'completed'
      };
    });

    // 2. Fetch candidate problems
    const solvedchallengeIds = (Array.isArray(solvedData) ? solvedData : []).map((s: UserSolutionData) => s.challenge_id);

    const { data: candidateData, error: candidateError } = await supabase
      .from('challenges_full')
      .select('*')
      .not('id', 'in', `(${solvedchallengeIds.join(',') || '0'})`)
      .eq('is_locked', false)
      .order('rank', { ascending: true })
      .limit(50);

    if (candidateError) {
      console.error('Error fetching candidate problems:', candidateError);
      return NextResponse.json({ error: 'Failed to fetch candidate problems' }, { status: 500 });
    }

    const candidateProblems = (candidateData as challengeFull[] || []).map((challenge) => ({
      name: challenge.name,
      rank: challenge.rank,
      rank_name: challenge.rank_name,
      tags: challenge.tags || [],
      description: sanitizeDescription(challenge.description || '')
    }));

    // 3. Fetch all challenge details for potential recommendations
    const { data: challengeDetails, error: detailsError } = await supabase
      .from('challenges_full')
      .select('*')
      .in('name', candidateProblems.map(c => c.name));

    if (detailsError) {
      console.error('Error fetching challenge details:', detailsError);
    }

    return NextResponse.json({
      solvedProblems,
      candidateProblems,
      challengeDetails: challengeDetails || []
    });

  } catch (error) {
    console.error('Error in recommendations data API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}