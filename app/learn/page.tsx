import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, CheckCircle2, XCircle, Trophy, Loader2, SkipForward, BookOpen, Code } from 'lucide-react';

interface CodewarsExercise {
  id: string;
  name: string;
  url: string;
  category: 'reference' | 'bug_fixes' | 'algorithms' | 'data_structures';
  description: string;
  tags: string[];
  rank_name: string;
  solutions: string;
}

interface Exercise {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  tags: string[];
  exampleSolution: string;
  starterCode: string;
  points: number;
  testCases: TestCase[];
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description: string;
}

interface TestResult {
  testId: string;
  passed: boolean;
  message: string;
  output?: string;
  expected?: string;
  error?: string;
}

const Learn: React.FC = () => {
  // Simulated data from your CSV - in production, this comes from API
  const codewarsData: CodewarsExercise = {
    id: '5672a98bdbdd995fad00000f',
    name: 'Rock Paper Scissors!',
    url: 'https://www.codewars.com/kata/5672a98bdbdd995fad00000f',
    category: 'reference',
    description: `# Rock Paper Scissors

Let's play! You have to return which player won! In case of a draw return Draw!.

**Examples(Input1, Input2 --> Output):**

\`\`\`
"scissors", "paper" --> "Player 1 won!"
"scissors", "rock" --> "Player 2 won!"
"paper", "paper" --> "Draw!"
\`\`\``,
    tags: ['Fundamentals'],
    rank_name: '8 kyu',
    solutions: `def rps(p1, p2):
    beats = {'rock': 'scissors', 'scissors': 'paper', 'paper': 'rock'}
    if beats[p1] == p2:
        return "Player 1 won!"
    if beats[p2] == p1:
        return "Player 2 won!"
    return "Draw!"`
  };

  // Transform Codewars data to Exercise format
  const transformExercise = (data: CodewarsExercise): Exercise => {
    const difficultyMap: Record<string, number> = {
      '8 kyu': 10,
      '7 kyu': 20,
      '6 kyu': 30,
      '5 kyu': 50,
      '4 kyu': 80,
      '3 kyu': 120,
      '2 kyu': 180,
      '1 kyu': 250
    };

    // Generate test cases based on description
    const testCases: TestCase[] = [
      {
        id: 'test_1',
        input: 'rps("scissors", "paper")',
        expectedOutput: '"Player 1 won!"',
        description: 'Scissors beats paper'
      },
      {
        id: 'test_2',
        input: 'rps("scissors", "rock")',
        expectedOutput: '"Player 2 won!"',
        description: 'Rock beats scissors'
      },
      {
        id: 'test_3',
        input: 'rps("paper", "paper")',
        expectedOutput: '"Draw!"',
        description: 'Same choice results in draw'
      },
      {
        id: 'test_4',
        input: 'rps("rock", "scissors")',
        expectedOutput: '"Player 1 won!"',
        description: 'Rock beats scissors'
      }
    ];

    return {
      id: data.id,
      title: data.name,
      difficulty: data.rank_name,
      category: data.category,
      description: data.description,
      tags: data.tags,
      exampleSolution: data.solutions,
      starterCode: `def rps(p1, p2):
    # Write your solution here
    pass

# Test your function
print(rps("rock", "scissors"))`,
      points: difficultyMap[data.rank_name] || 10,
      testCases
    };
  };

  const [exercise] = useState<Exercise>(transformExercise(codewarsData));
  const [code, setCode] = useState<string>(exercise.starterCode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const getDifficultyColor = (difficulty: string): string => {
    if (difficulty.includes('8 kyu') || difficulty.includes('7 kyu')) {
      return 'bg-success text-success-foreground';
    } else if (difficulty.includes('6 kyu') || difficulty.includes('5 kyu')) {
      return 'bg-warning text-warning-foreground';
    } else {
      return 'bg-danger text-danger-foreground';
    }
  };

  const getCategoryIcon = (category: string): React.ReactNode => {
    switch (category) {
      case 'bug_fixes':
        return '🐛';
      case 'algorithms':
        return '🧮';
      case 'data_structures':
        return '📊';
      default:
        return '📝';
    }
  };

  // Simulate code execution - In production, send to backend API
  const executeCode = async (userCode: string, testCase: TestCase): Promise<TestResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // This is a simulation - real implementation would call your backend
        try {
          // Parse the test case input to extract function name and arguments
          const match = testCase.input.match(/(\w+)\((.*)\)/);
          if (!match) {
            resolve({
              testId: testCase.id,
              passed: false,
              message: testCase.description,
              error: 'Invalid test case format'
            });
            return;
          }

          // Simulate execution result (in real app, backend executes Python code)
          const isCorrect = Math.random() > 0.3; // Simulate 70% pass rate for demo
          
          if (isCorrect) {
            resolve({
              testId: testCase.id,
              passed: true,
              message: testCase.description,
              output: testCase.expectedOutput,
              expected: testCase.expectedOutput
            });
          } else {
            resolve({
              testId: testCase.id,
              passed: false,
              message: testCase.description,
              output: '"Player 2 won!"',
              expected: testCase.expectedOutput
            });
          }
        } catch (error) {
          resolve({
            testId: testCase.id,
            passed: false,
            message: testCase.description,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }, 500);
    });
  };

  const handleRunCode = async (): Promise<void> => {
    setIsRunning(true);
    setTestResults([]);

    // Run all test cases
    const results: TestResult[] = [];
    for (const testCase of exercise.testCases) {
      const result = await executeCode(code, testCase);
      results.push(result);
    }

    setTestResults(results);
    const allPassed = results.every(r => r.passed);
    setIsCompleted(allPassed);
    setIsRunning(false);
  };

  const handleSubmit = async (): Promise<void> => {
    if (isCompleted) {
      // Send to backend API to record completion and award points
      try {
        // await fetch('/api/exercises/submit', {
        //   method: 'POST',
        //   body: JSON.stringify({
        //     exerciseId: exercise.id,
        //     code: code,
        //     points: exercise.points
        //   })
        // });
        
        alert(`🎉 Congratulations! You earned ${exercise.points} points!\n\nYour solution has been saved.`);
        // Navigate to next exercise or dashboard
      } catch (error) {
        console.error('Submission error:', error);
      }
    }
  };

  const handleSkip = (): void => {
    // Load next recommended exercise
    alert('Loading next exercise...');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Exercise Description */}
      <div className="w-1/2 overflow-y-auto border-r border-border">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(exercise.difficulty)}>
                  {exercise.difficulty}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  {getCategoryIcon(exercise.category)}
                  {exercise.category.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-warning">
                <Trophy className="w-4 h-4" />
                <span>{exercise.points} pts</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">{exercise.title}</h1>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {exercise.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tabs for Description and Hints */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Description
              </TabsTrigger>
              <TabsTrigger value="hints" className="gap-2">
                <Code className="w-4 h-4" />
                Hints
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: exercise.description
                        .replace(/\n/g, '<br />')
                        .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
                    }}
                  />
                </CardContent>
              </Card>

              {/* Test Cases */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Cases</CardTitle>
                  <CardDescription>Your solution will be tested against these cases</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {exercise.testCases.map((testCase, index) => (
                    <div key={testCase.id} className="bg-muted p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Test {index + 1}: {testCase.description}</p>
                      <p className="text-sm font-mono text-foreground">
                        <span className="text-info">{testCase.input}</span>
                        <span className="text-muted-foreground mx-2">→</span>
                        <span className="text-success">{testCase.expectedOutput}</span>
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hints" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Hints & Approach</CardTitle>
                  <CardDescription>Click to reveal hints if you're stuck</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowHint(!showHint)}
                    className="w-full"
                  >
                    {showHint ? 'Hide' : 'Show'} Hint
                  </Button>
                  
                  {showHint && (
                    <Alert>
                      <AlertDescription>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Create a dictionary that maps each choice to what it beats</li>
                          <li>Check if player 1's choice beats player 2's choice</li>
                          <li>Check if player 2's choice beats player 1's choice</li>
                          <li>Otherwise, it's a draw</li>
                        </ol>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-2">Example Solution Available</p>
                    <p className="text-xs text-muted-foreground">
                      Complete the challenge to unlock the example solution and compare approaches.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  {testResults.filter(r => r.passed).length} / {testResults.length} tests passed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {testResults.map((result) => (
                  <Alert
                    key={result.testId}
                    className={result.passed ? 'border-success bg-success/5' : 'border-danger bg-danger/5'}
                  >
                    <div className="flex items-start gap-3">
                      {result.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <AlertDescription>
                          <p className="font-medium text-sm">{result.message}</p>
                          {result.output && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs">
                                <span className="text-muted-foreground">Output:</span>{' '}
                                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{result.output}</code>
                              </p>
                              {!result.passed && result.expected && (
                                <p className="text-xs">
                                  <span className="text-muted-foreground">Expected:</span>{' '}
                                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{result.expected}</code>
                                </p>
                              )}
                            </div>
                          )}
                          {result.error && (
                            <p className="text-xs text-danger mt-1">Error: {result.error}</p>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {isCompleted && (
            <Alert className="border-success bg-success/10">
              <Trophy className="w-5 h-5 text-success" />
              <AlertDescription className="ml-2">
                <p className="font-medium text-success">Perfect! All tests passed! 🎉</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Submit your solution to earn {exercise.points} points and unlock the next challenge.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-1/2 flex flex-col">
        {/* Editor Header */}
        <div className="border-b border-border px-4 py-3 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">solution.py</span>
            </div>
            <Badge variant="outline" className="text-xs">Python</Badge>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 overflow-hidden">
          <CodeMirror
            value={code}
            height="100%"
            extensions={[python()]}
            onChange={(value) => setCode(value)}
            theme="dark"
            className="h-full text-sm"
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightActiveLine: true,
              foldGutter: true,
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="border-t border-border p-4 bg-card">
          <div className="flex items-center justify-between gap-3">
            <Button
              onClick={handleSkip}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </Button>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleRunCode}
                disabled={isRunning}
                variant="outline"
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Tests
                  </>
                )}
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={!isCompleted}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Trophy className="w-4 h-4" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;