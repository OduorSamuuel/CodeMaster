"use client";
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Users } from 'lucide-react';
import { Challenge } from '@/types/challenge';

interface ChallengeHeaderProps {
  challenge: Challenge;
}

export const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({ challenge }) => {
  const getDifficultyColor = (rank_name: string) => {
    if (rank_name.includes('8 kyu') || rank_name.includes('7 kyu')) return 'bg-green-500';
    if (rank_name.includes('6 kyu') || rank_name.includes('5 kyu')) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug_fixes': return '🐛';
      case 'algorithms': return '🧮';
      case 'data_structures': return '📊';
      default: return '📝';
    }
  };

  return (
    <div className="border-b border-border bg-card p-6">
      <div className="space-y-4">
        {/* Top Row - Badges and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={`${getDifficultyColor(challenge.rank_name)} text-white`}>
              {challenge.rank_name}
            </Badge>
            <Badge variant="outline" className="gap-1">
              {getCategoryIcon(challenge.category)}
              {challenge.category.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-yellow-500 font-bold">
              <Trophy className="w-4 h-4" />
              <span>{challenge.points} XP</span>
            </div>
            {challenge.time_limit && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{challenge.time_limit / 60}m</span>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold">{challenge.name}</h1>

        {/* Tags and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {challenge.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{challenge.solved_count.toLocaleString()} solved</span>
          </div>
        </div>
      </div>
    </div>
  );
};