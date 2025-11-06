import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

interface ExecuteCodeRequest {
  code: string;
  language: string;
  testCases: Array<{
    id: string | number;
    input: string;
    expected_output: string;
    description: string;
  }>;
}

interface GlotExecuteResponse {
  stdout: string;
  stderr: string;
  error: string;
}

interface TestResult {
  testId: string | number;
  passed: boolean;
  message: string;
  output: string;
  expected: string;
  executionTime: number;
  error?: string;
}

const GLOT_API_KEY = process.env.GLOT_API_KEY || 'dcf09f6f-f07b-45ef-aa83-0893e330b0f4';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function makeHttpsRequest(
  hostname: string,
  path: string,
  data: any,
  timeout: number = 20000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        'Authorization': `Token ${GLOT_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout,
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode === 200) {
            resolve({ success: true, data: parsed, statusCode: res.statusCode });
          } else {
            reject({ success: false, error: `HTTP ${res.statusCode}`, response: parsed, statusCode: res.statusCode });
          }
        } catch {
          reject({
            success: false,
            error: res.statusCode === 200 ? 'Failed to parse response' : `HTTP ${res.statusCode}: ${responseData}`,
            statusCode: res.statusCode,
          });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({ success: false, error: `Request timeout after ${timeout}ms`, errorType: 'TIMEOUT' });
    });

    req.on('error', (error) => {
      reject({ success: false, error: error.message, errorType: error.name, errorCode: (error as any).code });
    });

    req.write(postData);
    req.end();
  });
}

async function executeOnGlot(
  code: string,
  language: string,
  stdin: string = ''
): Promise<{
  success: boolean;
  data?: GlotExecuteResponse;
  error?: string;
}> {
  const glotLanguage = language === 'javascript' ? 'javascript' : 'python';
  const fileName = language === 'javascript' ? 'main.js' : 'main.py';
  const path = `/api/run/${glotLanguage}/latest`;

  const requestBody = {
    files: [{ name: fileName, content: code }],
    stdin,
  };

  try {
    const result = await makeHttpsRequest('glot.io', path, requestBody);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.error || 'Unknown error' };
  }
}

export async function POST(req: NextRequest) {
  const requestStartTime = Date.now();

  try {
    const body = await req.json();
    const { code, language, testCases }: ExecuteCodeRequest = body;

    // Validate input
    if (!code || !language || !testCases || testCases.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: code, language, or testCases' },
        { status: 400 }
      );
    }

    if (language !== 'javascript' && language !== 'python') {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    const results: TestResult[] = [];
    const usesRandomness = code.includes('random') || code.includes('Math.random');

    // Execute each test case
    for (const testCase of testCases) {
      const testStartTime = Date.now();

      let stdinInput = testCase.input;
      if (stdinInput && !stdinInput.endsWith('\n')) {
        stdinInput += '\n';
      }

      const result = await executeOnGlot(code, language, stdinInput);
      const executionTime = Date.now() - testStartTime;

      if (!result.success) {
        results.push({
          testId: testCase.id,
          passed: false,
          message: testCase.description,
          output: '',
          expected: testCase.expected_output,
          executionTime,
          error: result.error,
        });
        continue;
      }

      const data = result.data!;
      const errorOutput = data.stderr || data.error || '';

      if (errorOutput) {
        results.push({
          testId: testCase.id,
          passed: false,
          message: testCase.description,
          output: data.stdout?.trim() || '',
          expected: testCase.expected_output,
          executionTime,
          error: errorOutput.trim(),
        });
        continue;
      }

      const actualOutput = (data.stdout || '').trim();
      const expectedOutput = testCase.expected_output.trim();

      let passed: boolean;
      if (usesRandomness) {
        passed = matchesRandomOutput(actualOutput, expectedOutput);
      } else {
        passed = normalizeOutput(actualOutput) === normalizeOutput(expectedOutput);
      }

      results.push({
        testId: testCase.id,
        passed,
        message: testCase.description,
        output: actualOutput,
        expected: expectedOutput,
        executionTime,
      });
    }

    return NextResponse.json({ results });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to execute code', details: errorMessage },
      { status: 500 }
    );
  }
}

function matchesRandomOutput(actual: string, expected: string): boolean {
  const actualLower = actual.toLowerCase();
  const expectedLower = expected.toLowerCase();

  const expectedPhrases = ['choose', 'you chose', 'computer chose', 'score'];
  const hasAllPhrases = expectedPhrases.every(phrase => actualLower.includes(phrase));
  if (!hasAllPhrases) return false;

  const hasResult = actualLower.includes('win') || actualLower.includes('lose') || actualLower.includes('tie');
  if (!hasResult) return false;

  const actualLineCount = actual.split('\n').filter(l => l.trim()).length;
  const expectedLineCount = expected.split('\n').filter(l => l.trim()).length;
  const lineDifference = Math.abs(actualLineCount - expectedLineCount) / expectedLineCount;

  return lineDifference <= 0.5;
}

function normalizeOutput(output: string): string {
  return output
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}