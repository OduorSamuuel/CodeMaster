"use client";
import { Challenge } from "@/types/challenge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Timer, Users, ChevronRight, Lock, Trophy } from "lucide-react";
import { Button } from "./ui/button";
import { useMemo } from "react";
import DOMPurify from "dompurify";

export const ChallengeCard: React.FC<{ challenge: Challenge }> = ({ challenge }) => {
  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('8 kyu') || difficulty.includes('7 kyu')) return 'bg-green-500';
    if (difficulty.includes('6 kyu') || difficulty.includes('5 kyu')) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Extract plain text preview from description (HTML or Markdown)
  const descriptionPreview = useMemo(() => {
    if (!challenge.description) return '';

    const isHTML = /^\s*<[a-z][\s\S]*>/i.test(challenge.description.trim());

    if (isHTML) {
      // Sanitize and strip HTML tags for preview
      const sanitized = DOMPurify.sanitize(challenge.description, {
        ALLOWED_TAGS: [],
        KEEP_CONTENT: true,
      });
      return sanitized.trim();
    } else {
      // Strip markdown syntax for preview
      return challenge.description
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`([^`]+)`/g, '$1') // Remove inline code
        .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.+?)\*/g, '$1') // Remove italic
        .replace(/^#+\s+/gm, '') // Remove headers
        .replace(/^\-\s+/gm, '') // Remove list markers
        .trim();
    }
  }, [challenge.description]);

  const attemptChallenge = () => {
    if (!challenge.locked) {
      window.location.href = `/challenges/${challenge.id}`;
      console.log(`Starting challenge: ${challenge.title}`);
    }
  };

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
            <CardDescription className="mt-1 line-clamp-2">
              {descriptionPreview}
            </CardDescription>
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
          {/* Tags */}
          {challenge.tags && challenge.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {challenge.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {(challenge.solvedCount ?? 0).toLocaleString()} solved
            </div>
            {challenge.timeLimit && (
              <div className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {challenge.timeLimit / 60} min
              </div>
            )}
          </div>
          {/* Action Button */}
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