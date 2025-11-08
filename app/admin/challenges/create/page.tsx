"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Plus, Save } from "lucide-react";
import { useState } from "react";


export default function CreateChallengePage() {
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'easy',
    category: '',
    description: '',
    solutions: '',
    testCases: [{ input: '', output: '', description: '', isHidden: false }],
    points: 100,
    xpReward: 50,
    isDailyChallenge: false
  });

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: '', output: '', description: '', isHidden: false }]
    });
  };

  return (
    <div className="space-y-6 p-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold">Create New Challenge</h2>
        <p className="text-muted-foreground">Add a new coding challenge to the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Challenge Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Challenge Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Two Sum Problem"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                placeholder="e.g., Arrays, Strings"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="xp">XP Reward</Label>
              <Input
                id="xp"
                type="number"
                value={formData.xpReward}
                onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Write the challenge description in Markdown...

## Problem
Describe the problem here...

## Example
```python
input: [1, 2, 3]
output: 6
```

## Constraints
- List constraints here"
              className="min-h-[200px] font-mono text-sm"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Supports Markdown formatting</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="solutions">Example Solution (Python) *</Label>
            <Textarea
              id="solutions"
              placeholder="def solution(nums):
    # Your solution here
    result = sum(nums)
    return result"
              className="min-h-[150px] font-mono text-sm"
              value={formData.solutions}
              onChange={(e) => setFormData({ ...formData, solutions: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="daily">Daily Challenge</Label>
              <p className="text-sm text-muted-foreground">Mark as today's daily challenge (2x XP)</p>
            </div>
            <Switch
              id="daily"
              checked={formData.isDailyChallenge}
              onCheckedChange={(checked) => setFormData({ ...formData, isDailyChallenge: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Test Cases</CardTitle>
              <CardDescription>Define input/output test cases for validation</CardDescription>
            </div>
            <Button onClick={addTestCase} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Test Case
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.testCases.map((testCase, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label>Test Case {index + 1}</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`hidden-${index}`} className="text-sm">Hidden</Label>
                  <Switch id={`hidden-${index}`} checked={testCase.isHidden} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Input</Label>
                  <Input placeholder='e.g., [2, 7, 11, 15], 9' className="font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Expected Output</Label>
                  <Input placeholder='e.g., [0, 1]' className="font-mono text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Input placeholder="Explain what this test case validates" className="text-sm" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button className="flex-1" variant="outline">
          <Save className="w-4 h-4 mr-2" />
          Save as Draft
        </Button>
        <Button className="flex-1" variant="default">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Publish Challenge
        </Button>
      </div>
    </div>
  );
}