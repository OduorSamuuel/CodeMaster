"use client";
import { Challenge } from "@/types/challenge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Timer,  Users , ChevronRight, Lock, Trophy } from "lucide-react";
import { Button } from "./ui/button";

export const ChallengeCard: React.FC<{ challenge: Challenge }> = ({ challenge }) => {
  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('8 kyu') || difficulty.includes('7 kyu')) return 'bg-green-500';
    if (difficulty.includes('6 kyu') || difficulty.includes('5 kyu')) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const attemptChallenge = () => {
    if (!challenge.locked) {
      // Logic to start the challenge
      window.location.href = `/challenges/${challenge.id}`;
      console.log(`Starting challenge: ${challenge.title}`);
    }
  }
  return (
    <Card className={`hover:shadow-lg transition-all cursor-pointer ${challenge.locked ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                {challenge.difficulty}
              </Badge>
              <Badge variant="outline">{challenge.category}</Badge>
            </div>
            <CardTitle className="text-lg flex items-center gap-2">
              {challenge.locked && <Lock className="w-4 h-4" />}
              {challenge.title}
            </CardTitle>
            <CardDescription className="mt-1">{challenge.description}</CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-500 font-bold">
              <Trophy className="w-4 h-4" />
              {challenge.points}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {challenge.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {challenge.solvedCount.toLocaleString()} solved
            </div>
            {challenge.timeLimit && (
              <div className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {challenge.timeLimit / 60} min
              </div>
            )}
          </div>
          <Button 
            onClick={attemptChallenge} 
            disabled={challenge.locked}
            className="w-full"
          >
            {challenge.locked ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Locked (Level {challenge.requiredLevel})
              </>
            ) : (
              <>
                Start Challenge
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
