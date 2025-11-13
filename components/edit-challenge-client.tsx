"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Save,
  Trash2,
  X,
  Plus,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Link from "next/link";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";

import { updateChallenge } from "@/actions";
import { ChallengeData, TestCase } from "@/types/challenge";

const DIFFICULTY_LEVELS = [
  { rank: 1, name: "8 kyu", label: "Beginner", points: 10 },
  { rank: 2, name: "7 kyu", label: "Easy", points: 15 },
  { rank: 3, name: "6 kyu", label: "Easy-Medium", points: 20 },
  { rank: 4, name: "5 kyu", label: "Medium", points: 30 },
  { rank: 5, name: "4 kyu", label: "Medium-Hard", points: 40 },
  { rank: 6, name: "3 kyu", label: "Hard", points: 50 },
  { rank: 7, name: "2 kyu", label: "Very Hard", points: 60 },
  { rank: 8, name: "1 kyu", label: "Expert", points: 80 },
];

// Simplified toolbar hint
const EditorToolbar = () => {
  return (
    <div className="flex items-center gap-2 p-2 border-b bg-muted/50 text-sm text-muted-foreground">
      <span className="text-xs">
        Use <code>Ctrl+B</code> for bold, <code>Ctrl+I</code> for italic, or type <code>/</code> for commands
      </span>
    </div>
  );
};

interface EditChallengeClientProps {
  challenge: ChallengeData;
  testCases: TestCase[];
}

export default function EditChallengeClient({ challenge, testCases }: EditChallengeClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: challenge.name || "",
    category: challenge.category || "algorithms",
    description: challenge.description || "",
    solutions: challenge.solutions || "",
    tags: challenge.tags || [],
    points: challenge.points || 10,
    time_limit: challenge.time_limit,
    estimated_time: undefined as number | undefined,
    required_level: challenge.required_level,
    is_locked: challenge.is_locked || false,
    test_cases: testCases.map(tc => ({
      id: tc.id,
      input: tc.input,
      expected_output: tc.expected_output,
      description: tc.description || "",
      is_hidden: tc.is_hidden,
    })),
  });
console.log("🚧 EditChallengeClient loaded with challenge:", challenge);
  const [selectedRank, setSelectedRank] = useState<number>(
    (() => {
      // Find the rank number from the rank_name string, or default to 1
      if (typeof challenge.rank_name === "string") {
        const found = DIFFICULTY_LEVELS.find(d => d.name === challenge.rank_name);
        return found ? found.rank : 1;
      }
      // If rank_name is already a number (unlikely), use it, else default to 1
      return typeof challenge.rank_name === "number" ? challenge.rank_name : 1;
    })()
  );
  const [currentTag, setCurrentTag] = useState("");

  // Create BlockNote editor
  const editor = useCreateBlockNote();

  // Load initial description into editor
  useEffect(() => {
    if (!editor) return;

    let blocks = [];
    if (challenge.description) {
      const trimmed = challenge.description.trim();
      const isHTML = /^\s*<[a-z][\s\S]*>/i.test(trimmed);

      if (isHTML) {
        blocks = editor.tryParseHTMLToBlocks(challenge.description);
      } else {
        blocks = editor.tryParseMarkdownToBlocks(challenge.description);
      }
    } else {
      blocks = [
        {
          type: "paragraph" as const,
          content: "",
        },
      ];
    }

    editor.replaceBlocks(editor.document, blocks);
  }, [editor, challenge.description]);

  const handleEditorChange = async () => {
    if (!editor) return;
    const html = await editor.blocksToHTMLLossy(editor.document);
    setFormData((prev) => ({ ...prev, description: html }));
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      test_cases: [
        ...formData.test_cases,
        { 
          id: `new-${Date.now()}`,
          input: "", 
          expected_output: "", 
          description: "", 
          is_hidden: false 
        },
      ],
    });
  };

  const removeTestCase = (index: number) => {
    if (formData.test_cases.length > 1) {
      setFormData({
        ...formData,
        test_cases: formData.test_cases.filter((_, i) => i !== index),
      });
    }
  };

  const updateTestCase = (
    index: number,
    field: keyof typeof formData.test_cases[0],
    value: string | boolean
  ) => {
    const newTestCases = [...formData.test_cases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setFormData({ ...formData, test_cases: newTestCases });
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim().toLowerCase()],
      });
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleRankChange = (rank: number) => {
    setSelectedRank(rank);
    const difficulty = DIFFICULTY_LEVELS.find((d) => d.rank === rank);
    if (difficulty) {
      setFormData({ ...formData, points: difficulty.points });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Validation Error", { description: "Challenge title is required" });
      return;
    }

    const html = editor ? await editor.blocksToHTMLLossy(editor.document) : formData.description;
    if (!html.trim() || html === "<p></p>") {
      toast.error("Validation Error", { description: "Challenge description is required" });
      return;
    }

    if (!formData.solutions.trim()) {
      toast.error("Validation Error", { description: "Solution code is required" });
      return;
    }

    const invalidTestCase = formData.test_cases.find(
      (tc) => !tc.input.trim() || !tc.expected_output.trim()
    );
    if (invalidTestCase) {
      toast.error("Validation Error", {
        description: "All test cases must have input and expected output",
      });
      return;
    }

    startTransition(async () => {
      const selectedDifficulty = DIFFICULTY_LEVELS.find((d) => d.rank === selectedRank);

      const result = await updateChallenge(challenge.id, {
        name: formData.name,
        category: formData.category,
        description: html,
        solutions: formData.solutions,
        tags: formData.tags,
        rank: selectedRank,
        rank_name: selectedDifficulty?.name || challenge.rank_name,
        points: formData.points,
        time_limit: formData.time_limit,
        required_level: formData.required_level,
        is_locked: formData.is_locked,
      });

      if (result.success) {
        toast.success("Success!", {
          description: `Challenge "${formData.name}" has been updated`,
        });
        router.push(`/admin/challenges/${challenge.id}`);
        router.refresh();
      } else {
        toast.error("Error", { description: result.error || "Failed to update challenge" });
      }
    });
  };

  const selectedDifficulty = DIFFICULTY_LEVELS.find((d) => d.rank === selectedRank);

  return (
    <div className="space-y-6 max-w-5xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/challenges/${challenge.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold">Edit Challenge</h2>
            <p className="text-muted-foreground">Update challenge details</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Challenge Details</CardTitle>
          <CardDescription>Update the challenge information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title & Category */}
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
                onValueChange={(value: string) =>
                  setFormData({ ...formData, category: value as "reference" | "bug_fixes" | "algorithms" | "data_structures" })
                }
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

          {/* Difficulty */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Difficulty Level (1-8) *</Label>
              <Badge variant="outline" className="text-base">
                {selectedDifficulty?.name} - {selectedDifficulty?.label} (
                {formData.points} pts)
              </Badge>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={selectedRank}
              onChange={(e) => handleRankChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              {DIFFICULTY_LEVELS.map((level) => (
                <span
                  key={level.rank}
                  className={selectedRank === level.rank ? "font-bold text-primary" : ""}
                >
                  {level.rank}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-8 gap-2 mt-2">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level.rank}
                  type="button"
                  onClick={() => handleRankChange(level.rank)}
                  className={`p-2 text-xs text-center rounded transition-colors ${
                    selectedRank === level.rank
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>

          {/* Points (editable) */}
          <div className="space-y-2">
            <Label htmlFor="points">Points *</Label>
            <Input
              id="points"
              type="number"
              value={formData.points}
              onChange={(e) =>
                setFormData({ ...formData, points: parseInt(e.target.value) || 10 })
              }
            />
          </div>

          {/* Time & Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (sec)</Label>
              <Input
                id="timeLimit"
                type="number"
                placeholder="Optional"
                value={formData.time_limit || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    time_limit: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Required Level</Label>
              <Input
                id="level"
                type="number"
                placeholder="1"
                value={formData.required_level || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    required_level: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
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
                  if (e.key === "Enter") {
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

          {/* BlockNote Editor */}
          <div className="space-y-2">
            <Label>Description *</Label>
            <Tabs defaultValue="write" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview HTML</TabsTrigger>
              </TabsList>

              <TabsContent value="write" className="space-y-0">
                <div className="border rounded-lg overflow-hidden bg-card">
                  <EditorToolbar />
                  <BlockNoteView
                    editor={editor}
                    onChange={handleEditorChange}
                    theme="light"
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div className="min-h-[350px] p-6 border rounded-lg bg-card">
                  {formData.description ? (
                    <div
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: formData.description }}
                    />
                  ) : (
                    <p className="text-muted-foreground italic">
                      Nothing to preview yet.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Solution Code */}
          <div className="space-y-2">
            <Label htmlFor="solutions">Example Solution (Python) *</Label>
            <CodeMirror
              value={formData.solutions}
              height="200px"
              theme={vscodeDark}
              extensions={[python()]}
              onChange={(value) => setFormData({ ...formData, solutions: value })}
              className="border rounded-lg overflow-hidden"
            />
          </div>

          {/* Lock Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="locked">Lock Challenge</Label>
              <p className="text-sm text-muted-foreground">
                Locked challenges require a certain level to access
              </p>
            </div>
            <Switch
              id="locked"
              checked={formData.is_locked}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_locked: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Test Cases</CardTitle>
              <CardDescription>
                Update test cases for this challenge
              </CardDescription>
            </div>
            <Button onClick={addTestCase} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Test Case
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.test_cases.map((testCase, index) => (
            <div key={testCase.id || index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label>Test Case {index + 1}</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`hidden-${index}`} className="text-sm">
                    Hidden
                  </Label>
                  <Switch
                    id={`hidden-${index}`}
                    checked={testCase.is_hidden}
                    onCheckedChange={(checked) =>
                      updateTestCase(index, "is_hidden", checked)
                    }
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
                    placeholder="e.g., [2, 7, 11, 15]\n9"
                    className="font-mono text-sm min-h-[80px]"
                    value={testCase.input}
                    onChange={(e) => updateTestCase(index, "input", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Expected Output *</Label>
                  <Textarea
                    placeholder="e.g., [0, 1]"
                    className="font-mono text-sm min-h-[80px]"
                    value={testCase.expected_output}
                    onChange={(e) =>
                      updateTestCase(index, "expected_output", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Input
                  placeholder="Explain what this test case validates"
                  className="text-sm"
                  value={testCase.description}
                  onChange={(e) => updateTestCase(index, "description", e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Link href={`/admin/challenges/${challenge.id}`} className="flex-1">
          <Button variant="outline" className="w-full" disabled={isPending}>
            Cancel
          </Button>
        </Link>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}