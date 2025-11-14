import React from 'react';
import { notFound } from 'next/navigation';

import { ChallengeClient } from '@/components/challenge/challengeClient';

import { fetchChallengeById, fetchTestCases } from '@/actions/client';


interface PageProps {
  params: Promise<{ id: string }>; // Change this to Promise
}

export default async function ChallengePage({ params }: PageProps) {
  const { id } = await params; // Await params first
  
  const challenge = await fetchChallengeById(id);
  console.log('Fetched challenge:', challenge);
  
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