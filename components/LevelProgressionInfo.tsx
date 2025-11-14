

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Crown } from "lucide-react";
import { getAvailableDifficulties } from "@/lib/challenge-levels";

interface LevelProgressionInfoProps {
  currentLevel: number;
}

export function LevelProgressionInfo({ currentLevel }: LevelProgressionInfoProps) {
  const availableDifficulties = getAvailableDifficulties(currentLevel);

  return (
    <Card className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Level Progression
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Current Level */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default" className="bg-blue-500">
              Level {currentLevel}
            </Badge>
            <span className="text-sm text-muted-foreground">Available difficulties:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {availableDifficulties.map((difficulty) => (
              <Badge 
                key={difficulty} 
                variant="secondary" 
                className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-300"
              >
                {difficulty}
              </Badge>
            ))}
          </div>
        </div>

      
       
      </CardContent>
    </Card>
  );
}