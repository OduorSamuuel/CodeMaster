"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Challenge, TestCase, TestResult } from '@/types/challenge';
import { ChallengeHeader } from './ChallengeHeader';
import { ChallengeDescription } from './ChallengeDescription';
import { CodeEditor } from './CodeEditor';
import { TestResultsPanel } from './TestResultsPanel';
import { ChallengeActions } from './ChallengeActions';
import { ProgressTracker } from './ProgressTracker';
import { SuccessModal } from './SuccessModal';
import { useTimer } from '@/hooks/useTimer';
import { RewardBreakdown, submitSolution } from '@/actions/server/challenges/submit';

interface ChallengeClientProps {
  challenge: Challenge;
  testCases: TestCase[];
}

export const ChallengeClient: React.FC<ChallengeClientProps> = ({
  challenge,
  testCases
}) => {
  const router = useRouter();
  const { time, startTimer, pauseTimer } = useTimer();
  const [code, setCode] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [submissionError, setSubmissionError] = useState<string>();
  const [submissionResult, setSubmissionResult] = useState<{
    pointsEarned: number;
    xpGained: number;
    leveledUp: boolean;
    newLevel?: number;
    rewards: RewardBreakdown;
  }>();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [rewardsClaimed, setRewardsClaimed] = useState(false);
  
  useEffect(() => {
    const template = generateMinimalTemplate(challenge);
    setCode(template);
    startTimer();

    return () => pauseTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.id]);

  const generateMinimalTemplate = (challenge: Challenge): string => {
    const lines: string[] = ['# Write your code here'];

    if (challenge.solutions) {
      const solutionLines = challenge.solutions.split('\n');
      const defLine = solutionLines.find(line => line.trim().startsWith('def '));
      
      if (defLine) {
        const match = defLine.match(/def\s+(\w+)\s*\(/);
        if (match) {
          const funcName = match[1];
          lines.push(`\ndef ${funcName}():`);
          lines.push(`    """Return the correct output for the given input."""`);
          lines.push(`    # Your code here`);
          lines.push(`    pass`);
          lines.push(``);
          lines.push(`# Test your function`);
          lines.push(`if __name__ == "__main__":`);
          lines.push(`    print(${funcName}())`);
          return lines.join('\n');
        }
      }
    }

    lines.push(`\n# Your solution starts below\n`);
    return lines.join('\n');
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setSubmissionError(undefined);
    
    try {
      const visibleTests = testCases.filter(tc => !tc.is_hidden);
      
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: 'python',
          testCases: visibleTests.map(tc => ({
            id: tc.id,
            input: tc.input,
            expected_output: tc.expected_output,
            description: tc.description
          }))
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute code');
      }
      
      const { results } = await response.json();
      setTestResults(results);
      
      const passed = results.filter((r: TestResult) => r.passed).length;
      setAttemptsCount(prev => prev + 1);
      
      // Check if all tests passed
      const allPassed = passed === results.length;
      setAllTestsPassed(allPassed);
      
      // Show success modal only if all tests passed
      if (allPassed) {
        setShowSuccess(true);
        pauseTimer();
      }
    } catch (error) {
      console.error('Test execution error:', error);
      setTestResults([{
        testId: 'error',
        passed: false,
        message: 'Execution Error',
        output: '',
        expected: '',
        executionTime: 0,
        error: error instanceof Error ? error.message : 'Failed to execute code'
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    // Allow submission even if not all tests passed
    if (testResults.length === 0) {
      setSubmissionError('Please run tests before submitting');
      return;
    }
    
    // If all tests passed and rewards haven't been claimed, show success modal first
    if (allTestsPassed && !rewardsClaimed) {
      setSubmissionError('Please claim your rewards first by clicking the button in the success modal');
      return;
    }
    
    setIsSubmitting(true);
    setSubmissionError(undefined);
    
    try {
      const isPerfectSolve = attemptsCount === 1 && hintsUsed === 0 && allTestsPassed;
      const testsPassed = testResults.filter(r => r.passed).length;
      
      const result = await submitSolution({
        challengeId: parseInt(challenge.id),
        code,
        testsPassed,
        testsTotal: testResults.length,
        timeElapsed: time,
        hintsUsed,
        isPerfectSolve
      });
      
      if (!result.success) {
        setSubmissionError(result.error || 'Failed to submit solution');
        return;
      }
      
      if (result.data) {
        setSubmissionResult(result.data);
      }
      
      // Mark as submitted to show AI explainer
      setHasSubmitted(true);
      
      // Pause timer after submission
      pauseTimer();
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionError(
        error instanceof Error ? error.message : 'Failed to submit solution'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowHints = () => {
    setHintsUsed(prev => prev + 1);
  };

  const handleContinue = () => {
    // Check if user leveled up or unlocked achievements
    const leveledUp = submissionResult?.leveledUp;
    
    // Redirect with query params to trigger confetti
    if (leveledUp) {
      router.push('/challenges?levelup=true');
    } else {
      router.push('/challenges');
    }
    
    router.refresh();
  };

  const handleClaimRewards = () => {
    setRewardsClaimed(true);
    setShowSuccess(false);
  };

  const testsPassed = testResults.filter(r => r.passed).length;
  const testsTotal = testResults.length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Panel - Description */}
      <div className="w-1/2 flex flex-col border-r border-border">
        <ChallengeHeader challenge={challenge} />
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <ProgressTracker
              timeElapsed={time}
              hintsUsed={hintsUsed}
              testsPassed={testsPassed}
              testsTotal={testsTotal}
              attemptsCount={attemptsCount}
            />
            
            <ChallengeDescription
              description={challenge.description}
              testCases={testCases.filter(tc => !tc.is_hidden)}
              solutions={challenge.solutions}
              showHints={hintsUsed > 0}
              onShowHints={handleShowHints}
              challengeName={challenge.name}
              challengeTags={challenge.tags || []}
              userCode={code}
              hasSubmitted={hasSubmitted}
            />
            
            {testResults.length > 0 && (
              <TestResultsPanel results={testResults} />
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-1/2 flex flex-col">
        <CodeEditor
          value={code}
          onChange={setCode}
          language="python"
        />
        
        <ChallengeActions
          onRunTests={handleRunTests}
          onSubmit={handleSubmit}
          onSkip={handleContinue}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
          canSubmit={testResults.length > 0 && !hasSubmitted && (!allTestsPassed || rewardsClaimed)}
          testsPassed={testsPassed}
          testsTotal={testsTotal}
          submissionError={submissionError}
          hasSubmitted={hasSubmitted}
          rewardsClaimed={rewardsClaimed}
        />
      </div>

      {/* Success Modal - Only shows when ALL tests pass */}
      {showSuccess && !hasSubmitted && (
        <SuccessModal
          challenge={challenge}
          timeElapsed={time}
          hintsUsed={hintsUsed}
          attemptsCount={attemptsCount}
          submissionResult={submissionResult}
          rewards={submissionResult?.rewards}
          onClaim={handleClaimRewards}
          onClose={() => setShowSuccess(false)}
          allTestsPassed={allTestsPassed}
        />
      )}
    </div>
  );
};