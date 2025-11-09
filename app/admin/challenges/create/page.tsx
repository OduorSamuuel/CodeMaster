// app/admin/challenges/create/page.tsx (Server Component)
import CreateChallengeClient from "@/components/create-challenge-client";
import { Suspense } from "react";


export default function CreateChallengePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CreateChallengeClient />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6 max-w-5xl p-6">
      <div>
        <h2 className="text-3xl font-bold">Create New Challenge</h2>
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-lg" />
        <div className="h-48 bg-muted rounded-lg" />
      </div>
    </div>
  );
}