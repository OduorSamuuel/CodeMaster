"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Plus, Save, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";


import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CreateChallengeInput } from "@/actions/challenge";
import { TestCase } from "@/types/challenge";
import { toast } from "sonner";
import { createChallenge } from "@/actions/admin-challenges";

export default function CreateChallengePage() {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  
  const [formData, setFormData] = useState<CreateChallengeInput>({
    name: '',
    difficulty: 'easy',
    category: 'algorithms',
    description: '',
    solutions: '',
    tags: [],
    test_cases: [{ input: '', expected_output: '', description: '', is_hidden: false }],
    time_limit: undefined,
    estimated_time: undefined,
    required_level: undefined,
    is_daily_challenge: false,
    daily_bonus_points: 50,
  });

  const [currentTag, setCurrentTag] = useState('');

  const addTestCase = () => {
    setFormData({
      ...formData,
      test_cases: [...formData.test_cases, { input: '', expected_output: '', description: '', is_hidden: false }]
    });
  };

  const removeTestCase = (index: number) => {
    if (formData.test_cases.length > 1) {
      const newTestCases = formData.test_cases.filter((_, i) => i !== index);
      setFormData({ ...formData, test_cases: newTestCases });
    }
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean) => {
    const newTestCases = [...formData.test_cases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setFormData({ ...formData, test_cases: newTestCases });
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim().toLowerCase()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (publish: boolean) => {
    // Validation
    if (!formData.name.trim()) {
      toast.error( "Validation Error", {
    
        description: "Challenge title is required",
      
      });
      return;
    }

    if (!formData.description.trim()) {
      toast.error( "Validation Error", {
        
        description: "Challenge description is required",
      
      });
      return;
    }

    if (!formData.solutions.trim()) {
      toast.error( "Validation Error", {
        description: "Solution code is required",
      });
      return;
    }

    // Validate test cases
    const invalidTestCase = formData.test_cases.find(tc => 
      !tc.input.trim() || !tc.expected_output.trim()
    );

    if (invalidTestCase) {
      toast.error( "Validation Error", {
        description: "All test cases must have input and expected output",
      });
      return;
    }

    startTransition(async () => {
      const result = await createChallenge(formData);

      if (result.success) {
        toast.success( "Success!", {
          description: `Challenge "${formData.name}" has been ${publish ? 'published' : 'saved as draft'}`,
        });
        
        // Redirect to challenges management page
        router.push('/admin/challenges/manage');
      } else {
        toast.error( "Error", {
          description: result.error || "Failed to create challenge",
        });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold">Create New Challenge</h2>
        <p className="text-muted-foreground">Add a new coding challenge to the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Challenge Details</CardTitle>
          <CardDescription>Basic information about the challenge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Challenge Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Two Sum Problem"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reference">Reference</SelectItem>
                  <SelectItem value="algorithms">Algorithms</SelectItem>
                  <SelectItem value="data_structures">Data Structures</SelectItem>
                  <SelectItem value="bug_fixes">Bug Fixes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Difficulty, Time, and Level */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (8 kyu)</SelectItem>
                  <SelectItem value="medium">Medium (5 kyu)</SelectItem>
                  <SelectItem value="hard">Hard (2 kyu)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (sec)</Label>
              <Input
                id="timeLimit"
                type="number"
                placeholder="Optional"
                value={formData.time_limit || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  time_limit: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated">Est. Time (min)</Label>
              <Input
                id="estimated"
                type="number"
                placeholder="Optional"
                value={formData.estimated_time || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  estimated_time: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">Required Level</Label>
              <Input
                id="level"
                type="number"
                placeholder="1"
                value={formData.required_level || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  required_level: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
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

          {/* Solution */}
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

          {/* Daily Challenge */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="daily">Daily Challenge</Label>
              <p className="text-sm text-muted-foreground">Mark as today's daily challenge (bonus points)</p>
            </div>
            <div className="flex items-center gap-4">
              {formData.is_daily_challenge && (
                <Input
                  type="number"
                  placeholder="Bonus"
                  className="w-24"
                  value={formData.daily_bonus_points}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    daily_bonus_points: parseInt(e.target.value) || 50 
                  })}
                />
              )}
              <Switch
                id="daily"
                checked={formData.is_daily_challenge}
                onCheckedChange={(checked) => setFormData({ ...formData, is_daily_challenge: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Test Cases</CardTitle>
              <CardDescription>Define input/output test cases for validation (minimum 1 required)</CardDescription>
            </div>
            <Button onClick={addTestCase} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Test Case
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.test_cases.map((testCase, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label>Test Case {index + 1}</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`hidden-${index}`} className="text-sm">Hidden</Label>
                  <Switch 
                    id={`hidden-${index}`} 
                    checked={testCase.is_hidden}
                    onCheckedChange={(checked) => updateTestCase(index, 'is_hidden', checked)}
                  />
                  {formData.test_cases.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTestCase(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Input *</Label>
                  <Textarea 
                    placeholder='e.g., [2, 7, 11, 15]\n9' 
                    className="font-mono text-sm min-h-[80px]"
                    value={testCase.input}
                    onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Expected Output *</Label>
                  <Textarea 
                    placeholder='e.g., [0, 1]' 
                    className="font-mono text-sm min-h-[80px]"
                    value={testCase.expected_output}
                    onChange={(e) => updateTestCase(index, 'expected_output', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Input 
                  placeholder="Explain what this test case validates" 
                  className="text-sm"
                  value={testCase.description}
                  onChange={(e) => updateTestCase(index, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button 
          className="flex-1" 
          variant="outline"
          onClick={() => handleSubmit(false)}
          disabled={isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {isPending ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button 
          className="flex-1" 
          variant="default"
          onClick={() => handleSubmit(true)}
          disabled={isPending}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {isPending ? 'Publishing...' : 'Publish Challenge'}
        </Button>
      </div>
    </div>
  );
}