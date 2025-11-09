// src/components/RecommendedChallengeCard.tsx
"use client";
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Timer, Users, ChevronRight, Lock, Trophy, Sparkles, TrendingUp } from "lucide-react";
import { Challenge } from "@/types/challenge";
import DOMPurify from "dompurify";

interface RecommendedChallengeCardProps {
  challenge: Challenge;
  score: number;
  reasons: string[];
  topic: string;
  details?: {
    difficulty_score: number;
    topic_score: number;
    learning_score: number;
    progression_score: number;
  };
}

export const RecommendedChallengeCard: React.FC<RecommendedChallengeCardProps> = ({ 
  challenge, 
  score, 
  reasons,
  topic,
  details 
}) => {


  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('8 kyu') || difficulty.includes('7 kyu')) return 'bg-green-500';
    if (difficulty.includes('6 kyu') || difficulty.includes('5 kyu')) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-orange-600';
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

  const handleStartChallenge = () => {
    if (!challenge.locked) {
      window.location.href = `/challenges/${challenge.id}`;
    }
  };

  return (
    <Card className={`flex flex-col hover:shadow-lg transition-all cursor-pointer ${challenge.locked ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                {challenge.difficulty}
              </Badge>
              <Badge variant="outline">{challenge.category}</Badge>

              <Badge className="bg-primary text-white shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                Recommended
              </Badge>
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
      <CardContent className="flex flex-col flex-1">
        <div className="space-y-3">
      

          {/* Why Recommended */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Why recommended:</span>
            </div>
            <ul className="space-y-1 ml-6 text-xs text-muted-foreground">
              {reasons.slice(0, 3).map((reason, idx) => (
                <li key={idx} className="list-disc">
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Score Breakdown (Optional) */}
          {details && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
                <span className="font-medium">{Math.round(details.difficulty_score * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Topic Match:</span>
                <span className="font-medium">{Math.round(details.topic_score * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Learning:</span>
                <span className="font-medium">{Math.round(details.learning_score * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Progression:</span>
                <span className="font-medium">{Math.round(details.progression_score * 100)}%</span>
              </div>
            </div>
          )}

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
        </div>
        {/* Action Button */}
        <Button 
          onClick={handleStartChallenge} 
          disabled={challenge.locked}
          className="mt-auto w-full"
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
      </CardContent>
    </Card>
  );
};