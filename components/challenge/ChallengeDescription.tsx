"use client";
import React, { useMemo, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Lightbulb, Code } from 'lucide-react';
import { TestCase } from '@/types/challenge';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import DOMPurify from 'dompurify';

interface ChallengeDescriptionProps {
  description: string;
  testCases: TestCase[];
  solutions?: string;
  showHints: boolean;
  onShowHints: () => void;
}

export const ChallengeDescription: React.FC<ChallengeDescriptionProps> = ({
  description,
  testCases,
  solutions,
  showHints,
  onShowHints
}) => {
  const [isClient, setIsClient] = useState(false);

  // Only render on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Legacy markdown renderer for backward compatibility
  const renderMarkdown = (text: string): string => {
    let html = text;
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono">${code.trim()}</code></pre>`;
    });
    
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-8 mb-4 border-b border-border pb-2">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');
    
    // Bold and inline code
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-0.5 rounded text-sm font-mono text-primary border border-border">$1</code>');
    
    // Lists
    html = html.replace(/^\- (.+)$/gm, '<li class="ml-6 mb-2 list-disc">$1</li>');
    html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="space-y-1 my-4">$&</ul>');
    
    return html;
  };

  // Detect if content is HTML or Markdown and sanitize accordingly
  const sanitizedDescription = useMemo(() => {
    if (!description || !isClient) return '';

    // Check if it's HTML (starts with HTML tags)
    const isHTML = /^\s*<[a-z][\s\S]*>/i.test(description.trim());

    if (isHTML) {
      // Sanitize HTML with DOMPurify
      const sanitized = DOMPurify.sanitize(description, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li',
          'blockquote',
          'a', 'img',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'div', 'span'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
        ALLOW_DATA_ATTR: false,
      });
      return sanitized.toString();
    } else {
      // Legacy markdown rendering (backward compatibility)
      const renderedMarkdown = renderMarkdown(description);
      const sanitized = DOMPurify.sanitize(renderedMarkdown);
      return sanitized.toString();
    }
  }, [description, isClient]);

  if (!isClient) {
    return (
      <div className="w-full p-6">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="description">
          <BookOpen className="w-4 h-4 mr-2" />
          Description
        </TabsTrigger>
        <TabsTrigger value="tests">
          <Code className="w-4 h-4 mr-2" />
          Tests
        </TabsTrigger>
        <TabsTrigger value="hints">
          <Lightbulb className="w-4 h-4 mr-2" />
          Hints
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            {sanitizedDescription ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            ) : (
              <div className="text-sm text-muted-foreground">Loading description...</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tests" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Cases</CardTitle>
            <CardDescription>Your solution will be tested against these</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {testCases.filter(tc => !tc.is_hidden).map((tc, idx) => (
              <div key={tc.id} className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">
                  Test {idx + 1}{tc.description && `: ${tc.description}`}
                </p>
                <div className="font-mono text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">Input:</span>
                    <code className="ml-2 text-blue-400">{tc.input}</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected:</span>
                    <code className="ml-2 text-green-400">{tc.expected_output}</code>
                  </div>
                </div>
              </div>
            ))}
            {testCases.some(tc => tc.is_hidden) && (
              <div className="bg-muted/50 border border-dashed border-border p-3 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  + {testCases.filter(tc => tc.is_hidden).length} hidden test case(s)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hints" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Solution Hints</CardTitle>
            <CardDescription>
              {showHints ? 'Example solution revealed' : 'Click to reveal hints'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showHints ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Need help? View an example solution, but note that using hints will affect your bonus XP.
                </p>
                <Button onClick={onShowHints} variant="outline" className="w-full">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Show Solution (-10 XP)
                </Button>
              </>
            ) : solutions ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-3 py-2 text-sm font-medium">
                  Example Solution
                </div>
                <CodeMirror
                  value={solutions}
                  extensions={[python()]}
                  editable={false}
                  theme="dark"
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: false,
                  }}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No solution available</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};