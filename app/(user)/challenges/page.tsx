
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Challenge} from '@/types/challenge';
import { MOCK_CHALLENGES } from '@/constants';
import { ChallengeCard } from '@/components/ChallengeCard';



function ChallengesPage () {




    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
      
            <h1 className="text-3xl font-bold mb-2">Browse Challenges</h1>
            <p className="text-muted-foreground">Choose your next coding adventure</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">All</Badge>
                <Badge variant="outline" className="cursor-pointer">Fundamentals</Badge>
                <Badge variant="outline" className="cursor-pointer">Algorithms</Badge>
                <Badge variant="outline" className="cursor-pointer">Data Structures</Badge>
                <Badge variant="outline" className="cursor-pointer">Easy</Badge>
                <Badge variant="outline" className="cursor-pointer">Medium</Badge>
                <Badge variant="outline" className="cursor-pointer">Hard</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Challenge Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_CHALLENGES.map((challenge) => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge}
             
              />
            ))}
          </div>
        </div>
      </div>
    );
  

};

export default ChallengesPage;