import React from 'react';
import { notFound } from 'next/navigation';

import { ChallengeClient } from '@/components/challenge/challengeClient';

import { fetchChallengeById, fetchTestCases } from '@/actions/client';


interface PageProps {
  params: { id: string };
}

export default async function ChallengePage({ params }: PageProps) {
  const challenge = await fetchChallengeById(params.id);
  
  if (!challenge) {
    notFound();
  }

  const testCases = await fetchTestCases(params.id);

  return (
    <ChallengeClient 
      challenge={challenge} 
      testCases={testCases}
    />
  );
}