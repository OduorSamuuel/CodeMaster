"use client";
import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { Badge } from '@/components/ui/badge';
import { Code, Lightbulb } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'python' | 'javascript';
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'python'
}) => {
  const getLanguageExtension = () => {
    switch (language) {
      case 'javascript':
        return javascript();
      case 'python':
      default:
        return python();
    }
  };

  const getDefaultTemplate = () => {
    if (language === 'python') {
      return `def solve():\n    # Write your solution here\n    \n\nsolve()`;
    } else {
      return `function solve() {\n    // Write your solution here\n    \n}\n\nsolve();`;
    }
  };

  // Check if the current value is the old template and replace it
  const getInitialValue = () => {
    if (!value) return getDefaultTemplate();
    
    // If value contains the old template patterns, replace it with new template
    const oldTemplatePatterns = [
      '"""Return the correct output for the given input."""',
      '# Test your function',
      'if __name__ == "__main__":',
      'print(solve())',
      '# Your code here',
      'pass'
    ];
    
    const isOldTemplate = oldTemplatePatterns.some(pattern => value.includes(pattern));
    
    if (isOldTemplate) {
      return getDefaultTemplate();
    }
    
    return value;
  };

  const handleEditorChange = (newValue: string) => {
    onChange(newValue);
  };


  const resetToTemplate = () => {
    onChange(getDefaultTemplate());
  };

  return (
    <>
      {/* Editor Header */}
      <div className="border-b border-border px-4 py-3 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              solution.{language === 'python' ? 'py' : 'js'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToTemplate}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset template
            </button>
            <Badge variant="outline" className="text-xs capitalize">
              {language}
            </Badge>
          </div>
        </div>
      </div>

      {/* Editor Help Bar */}
      <div className="border-b border-border px-4 py-2 bg-muted/20">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Lightbulb className="w-3 h-3" />
              <span>Use the solve() function template</span>
            </div>
         
          </div>
          <div className="text-muted-foreground">
            {language === 'python' ? 'Read input with input()' : 'Read input with readline()'}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={getInitialValue()}
          height="100%"
          extensions={[getLanguageExtension()]}
          onChange={handleEditorChange}
          theme="dark"
          className="h-full text-sm"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            highlightSelectionMatches: true,
            autocompletion: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
          }}
        />
      </div>

      {/* Editor Footer */}
      <div className="border-t border-border px-4 py-2 bg-card">
        <div className="text-xs text-muted-foreground">
          <strong>Note:</strong> Your solution must include a <code className="px-1 bg-muted rounded">solve()</code> function that reads input and produces output.
        </div>
      </div>
    </>
  );
};