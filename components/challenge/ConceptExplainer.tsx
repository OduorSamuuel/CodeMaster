import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {  Loader2, BookOpen, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ConceptExplainerProps {
  challengeName: string;
  challengeDescription: string;
  challengeTags: string[];
  userCode: string;
}

const useOpenRouter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getExplanation = async (
    challengeName: string,
    challengeDescription: string,
    tags: string[],
    userCode: string,
    onChunk: (text: string) => void
  ) => {
    setLoading(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_OPENROUTER_URL;
      const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

      if (!API_URL || !API_KEY) {
        throw new Error("OpenRouter configuration is missing. Please check your environment variables.");
      }

      const prompt = `You are a helpful coding mentor. A student just completed a coding challenge and wants to learn more about the concepts involved.

Challenge: ${challengeName}
Description: ${challengeDescription}
Concepts/Tags: ${tags.join(', ')}

Student's Solution:
\`\`\`python
${userCode}
\`\`\`

Provide a comprehensive but concise explanation covering:
1. **Key Concepts**: Explain the main programming concepts used in this challenge (${tags.slice(0, 3).join(', ')})
2. **Solution Approach**: Briefly analyze the student's approach and highlight good practices
3. **Time & Space Complexity**: Explain the algorithmic complexity in simple terms
4. **Real-World Applications**: Where are these concepts used in real software development?
5. **Further Learning**: Suggest 2-3 related topics or challenges to explore next

Keep explanations clear, encouraging, and educational. Use markdown formatting with headers and bullet points.`;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                fullText += content;
                onChunk(fullText);
              }
            } catch (e: unknown) {
                console.error("Error parsing chunk:", e);
              continue;
            }
          }
        }
      }

      return fullText;
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || "Failed to get explanation";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { getExplanation, loading, error };
};

const parseMarkdown = (text: string) => {
  let html = text;
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-3"><code>$2</code></pre>');
  
  // Headers
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-800 mt-5 mb-3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mt-6 mb-3">$1</h2>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm">$1</code>');
  
  // Bullet points
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>');
  html = html.replace(/(<li[\s\S]*<\/li>)/, '<ul class="list-disc list-inside space-y-1 mb-3">$1</ul>');
  
  // Numbered lists
  html = html.replace(/^\d+\.\s(.*$)/gim, '<li class="ml-4 mb-1">$1</li>');
  
  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (!para.match(/^<[h2-4]|^<ul|^<li|^<pre/)) {
      return `<p class="text-gray-700 mb-3 leading-relaxed">${para}</p>`;
    }
    return para;
  }).join('\n');
  
  return html;
};

export default function ConceptExplainer({ 
  challengeName, 
  challengeDescription, 
  challengeTags, 
  userCode 
}: ConceptExplainerProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { getExplanation, loading, error } = useOpenRouter();

  const handleGetExplanation = async () => {
    setExplanation("");
    setIsExpanded(true);
    
    try {
      await getExplanation(
        challengeName,
        challengeDescription,
        challengeTags,
        userCode,
        (text) => {
          setExplanation(text);
        }
      );
    } catch (err) {
      console.error("Error getting explanation:", err);
    }
  };

  return (
    <Card className="shadow-xl border border-gray-200 bg-white rounded-xl overflow-hidden">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between text-gray-800">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <span>Learn More About This Challenge</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          <p className="text-sm text-gray-600">
            Want to deepen your understanding? Get an AI-powered explanation of the concepts, 
            complexity analysis, and suggestions for what to learn next.
          </p>

          {!explanation && !loading && (
            <Button
              onClick={handleGetExplanation}
              className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm text-white"
            >
             
              Get AI Explanation
            </Button>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-600">Generating detailed explanation...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {explanation && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm max-h-[600px] overflow-y-auto">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(explanation) }}
                />
              </div>
              
              {!loading && (
                <Button
                  onClick={handleGetExplanation}
                  variant="outline"
                  className="w-full border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                >
               
                  Regenerate Explanation
                </Button>
              )}
            </div>
          )}

      
        </CardContent>
      )}
    </Card>
  );
}