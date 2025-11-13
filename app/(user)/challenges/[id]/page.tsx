import React from 'react';
import { notFound } from 'next/navigation';

import { ChallengeClient } from '@/components/challenge/challengeClient';

import { fetchChallengeById, fetchTestCases } from '@/actions/client';


interface PageProps {
  params: Promise<{ id: string }>; // params is now a Promise
}

export default async function ChallengePage({ params }: PageProps) {
  const { id } = await params; // Await the params
  
  const challenge = await fetchChallengeById(id);
  
  if (!challenge) {
    notFound();
  }

  const testCases = await fetchTestCases(id);

  return (
    <ChallengeClient 
      challenge={challenge} 
      testCases={testCases}
    />
  );
}