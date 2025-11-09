"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Edit2, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

const challengesData = [
  { id: 1, title: 'Two Sum', difficulty: 'easy', category: 'Arrays', submissions: 892, completion: 78, avgTime: '12m', status: 'active', isDailyChallenge: false, dateCreated: '2024-01-10' },
  { id: 2, title: 'Binary Search Tree', difficulty: 'hard', category: 'Trees', submissions: 234, completion: 42, avgTime: '28m', status: 'active', isDailyChallenge: true, dateCreated: '2024-02-15' },
  { id: 3, title: 'Valid Parentheses', difficulty: 'medium', category: 'Strings', submissions: 698, completion: 65, avgTime: '15m', status: 'active', isDailyChallenge: false, dateCreated: '2024-01-20' },
  { id: 4, title: 'Merge Sort', difficulty: 'medium', category: 'Sorting', submissions: 445, completion: 58, avgTime: '18m', status: 'draft', isDailyChallenge: false, dateCreated: '2024-03-01' },
  { id: 5, title: 'Graph Traversal', difficulty: 'hard', category: 'Graphs', submissions: 156, completion: 38, avgTime: '32m', status: 'active', isDailyChallenge: false, dateCreated: '2024-02-28' },
  { id: 6, title: 'Reverse Linked List', difficulty: 'easy', category: 'Linked Lists', submissions: 723, completion: 72, avgTime: '10m', status: 'active', isDailyChallenge: false, dateCreated: '2024-01-25' },
  { id: 7, title: 'Dynamic Programming - Knapsack', difficulty: 'hard', category: 'DP', submissions: 189, completion: 35, avgTime: '35m', status: 'active', isDailyChallenge: false, dateCreated: '2024-02-05' },
  { id: 8, title: 'Binary Search', difficulty: 'easy', category: 'Search', submissions: 654, completion: 81, avgTime: '9m', status: 'active', isDailyChallenge: false, dateCreated: '2024-01-18' }
];
export default function ManageChallengesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Manage Challenges</h2>
          <p className="text-muted-foreground">View and edit all coding challenges</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Challenge
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search challenges..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {challengesData.map((challenge) => (
              <div key={challenge.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{challenge.title}</h3>
                      {challenge.isDailyChallenge && (
                        <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                          <Calendar className="w-3 h-3 mr-1" />
                          Daily
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{challenge.category}</span>
                      <span>•</span>
                      <Badge variant="outline" className={
                        challenge.difficulty === 'easy' ? 'border-green-500/20 text-green-500' :
                        challenge.difficulty === 'medium' ? 'border-yellow-500/20 text-yellow-500' :
                        'border-red-500/20 text-red-500'
                      }>
                        {challenge.difficulty}
                      </Badge>
                      <span>•</span>
                      <span>{challenge.submissions} submissions</span>
                      <span>•</span>
                      <span>{challenge.completion}% completion</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={challenge.status === 'active' ? 'default' : 'secondary'}>
                    {challenge.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
