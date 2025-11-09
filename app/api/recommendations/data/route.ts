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

    if (solvedError) {
      console.error('Error fetching solved problems:', solvedError);
      return NextResponse.json({ error: 'Failed to fetch solved problems' }, { status: 500 });
    }

    const solvedProblems = (solvedData || []).map((solution: any) => ({
      name: solution.exercises?.name || '',
      rank: solution.exercises?.rank || 1,
      tags: solution.exercises?.exercise_tags?.map((t: any) => t.tag) || [],
      description: sanitizeDescription(solution.exercises?.description || ''),
      passed: solution.status === 'completed'
    }));

    // 2. Fetch candidate problems
    const solvedExerciseIds = (solvedData || []).map((s: any) => s.exercise_id);

    const { data: candidateData, error: candidateError } = await supabase
      .from('exercises_full')
      .select('*')
      .not('id', 'in', `(${solvedExerciseIds.join(',') || '0'})`)
      .eq('is_locked', false)
      .order('rank', { ascending: true })
      .limit(50);

    if (candidateError) {
      console.error('Error fetching candidate problems:', candidateError);
      return NextResponse.json({ error: 'Failed to fetch candidate problems' }, { status: 500 });
    }

    const candidateProblems = (candidateData || []).map((exercise: any) => ({
      name: exercise.name,
      rank: exercise.rank,
      rank_name: exercise.rank_name,
      tags: exercise.tags || [],
      description: sanitizeDescription(exercise.description || '')
    }));

    // 3. Fetch all challenge details for potential recommendations
    const { data: challengeDetails, error: detailsError } = await supabase
      .from('exercises_full')
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