// app/admin/challenges/[id]/edit/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import { getChallengeById, getTestCases } from '@/actions/admin-challenges';
import EditChallengeClient from '@/components/edit-challenge-client';


interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChallengeEditPage({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch challenge and test cases
  const [challenge, testCases] = await Promise.all([
    getChallengeById(id),
    getTestCases(id)
  ]);

  if (!challenge) {
    notFound();
  }

  return <EditChallengeClient challenge={challenge} testCases={testCases || []} />;
}

