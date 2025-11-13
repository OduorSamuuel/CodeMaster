"use client";
import { Challenge } from "@/types/challenge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Timer, Users, ChevronRight, Lock, Trophy } from "lucide-react";
import { Button } from "./ui/button";
import { useMemo } from "react";
import DOMPurify from "dompurify";

export const ChallengeCard: React.FC<{ challenge: Challenge }> = ({ challenge }) => {
  const getDifficultyColor = (rank_name: string) => {
    if (rank_name.includes('8 kyu') || rank_name.includes('7 kyu')) return 'bg-green-500';
    if (rank_name.includes('6 kyu') || rank_name.includes('5 kyu')) return 'bg-yellow-500';
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
    if (!challenge.is_locked) {
      window.location.href = `/challenges/${challenge.id}`;

    }
  };

  return (
    <Card className={`flex flex-col hover:shadow-lg transition-all cursor-pointer ${challenge.is_locked ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${getDifficultyColor(challenge.rank_name)} text-white`}>
                {challenge.rank_name}
              </Badge>
              <Badge variant="outline">{challenge.category}</Badge>
            </div>
            <CardTitle className="text-lg flex items-center gap-2">
              {challenge.is_locked && <Lock className="w-4 h-4" />}
              {challenge.name}
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
      <CardContent className="flex flex-col flex-1">
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
              {(challenge.solved_count ?? 0).toLocaleString()} solved
            </div>
            {challenge.time_limit && (
              <div className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {challenge.time_limit / 60} min
              </div>
            )}
          </div>
        </div>
        {/* Action Button */}
        <Button 
          onClick={attemptChallenge} 
          disabled={challenge.is_locked}
          className="mt-auto w-full"
        >
          {challenge.is_locked ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Locked (Level {challenge.required_level})
            </>
          ) : (
            <>
              Start Challenge
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};