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
  CheckCircle2,
  Plus,
  Save,
  Trash2,
  X,
  Bold,
  Italic,
  Code,
} from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

import { CreateChallengeInput, TestCase } from "@/types/challenge";
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

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { createChallenge } from "@/actions";

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

type CategoryType = "reference" | "bug_fixes" | "algorithms" | "data_structures";

// Simplified toolbar - BlockNote has built-in formatting via slash commands
const EditorToolbar = () => {
  return (
    <div className="flex items-center gap-2 p-2 border-b bg-muted/50 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Bold className="w-3 h-3" />
        <span className="text-xs">Bold</span>
      </div>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-1">
        <Italic className="w-3 h-3" />
        <span className="text-xs">Italic</span>
      </div>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-1">
        <Code className="w-3 h-3" />
        <span className="text-xs">Code</span>
      </div>
      <div className="flex-1" />
      <span className="text-xs">Type <code>/</code> for commands</span>
    </div>
  );
};

export default function CreateChallengeClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<CreateChallengeInput>({
    name: "",
    rank_name: "easy",
    category: "algorithms",
    description: "",
    solutions: "",
    tags: [],
    test_cases: [
      { id: "", challenge_id: "", order_index: 0, input: "", expected_output: "", description: "", is_hidden: false },
    ],
    time_limit: undefined,
    estimated_time: undefined,
    required_level: undefined,
    is_daily_challenge: false,
    daily_bonus_points: 50,
  });

  const [selectedRank, setSelectedRank] = useState<number>(1);
  const [currentTag, setCurrentTag] = useState("");

  // Create BlockNote editor
  const editor = useCreateBlockNote();

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
          id: "",
          challenge_id: "",
          order_index: formData.test_cases.length,
          input: "",
          expected_output: "",
          description: "",
          is_hidden: false,
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
    field: keyof TestCase,
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
      let simplified: "easy" | "medium" | "hard" = "easy";
      if (rank >= 4 && rank <= 5) simplified = "medium";
      else if (rank >= 6) simplified = "hard";
      setFormData({ ...formData, rank_name: simplified });
    }
  };

  const handleSubmit = async (publish: boolean) => {
    if (!formData.name.trim()) {
      toast.error("Validation Error", { description: "Challenge title is required" });
      return;
    }

    const html = editor ? await editor.blocksToHTMLLossy(editor.document) : "";
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

      const result = await createChallenge({
        ...formData,
        description: html,
        points: selectedDifficulty?.points || 10,
      });

      if (result.success) {
        toast.success("Success!", {
          description: `Challenge "${formData.name}" has been ${
            publish ? "published" : "saved as draft"
          }`,
        });
        router.push("/admin/challenges/manage");
      } else {
        toast.error("Error", { description: result.error || "Failed to create challenge" });
      }
    });
  };

  const selectedDifficulty = DIFFICULTY_LEVELS.find((d) => d.rank === selectedRank);

  return (
    <div className="space-y-6 max-w-5xl p-6">
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
                onValueChange={(value: CategoryType) =>
                  setFormData({ ...formData, category: value })
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
                {selectedDifficulty?.points} pts)
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

          {/* Time & Level */}
          <div className="grid grid-cols-3 gap-4">
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
              <Label htmlFor="estimated">Est. Time (min)</Label>
              <Input
                id="estimated"
                type="number"
                placeholder="Optional"
                value={formData.estimated_time || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimated_time: e.target.value ? parseInt(e.target.value) : undefined,
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
                <TabsTrigger value="preview">Preview</TabsTrigger>
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
                <p className="text-xs text-muted-foreground mt-2">
                  Use <code>Ctrl+B</code> for bold, <code>Ctrl+I</code> for italic, or type <code>/</code> for all commands.
                </p>
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
                      Nothing to preview yet. Start writing in the Write tab.
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
              placeholder={`def solution(nums):
    # Your solution here
    return sum(nums)`}
            />
          </div>

          {/* Daily Challenge */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="daily">Daily Challenge</Label>
              <p className="text-sm text-muted-foreground">
                Mark as today&apos;s daily challenge (bonus points)
              </p>
            </div>
            <div className="flex items-center gap-4">
              {formData.is_daily_challenge && (
                <Input
                  type="number"
                  placeholder="Bonus"
                  className="w-24"
                  value={formData.daily_bonus_points}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      daily_bonus_points: parseInt(e.target.value) || 50,
                    })
                  }
                />
              )}
              <Switch
                id="daily"
                checked={formData.is_daily_challenge}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_daily_challenge: checked })
                }
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
              <CardDescription>
                Define input/output test cases (minimum 1 required)
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
            <div key={index} className="p-4 border rounded-lg space-y-3">
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

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button
          className="flex-1"
          variant="outline"
          onClick={() => handleSubmit(false)}
          disabled={isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {isPending ? "Saving..." : "Save as Draft"}
        </Button>
        <Button
          className="flex-1"
          onClick={() => handleSubmit(true)}
          disabled={isPending}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {isPending ? "Publishing..." : "Publish Challenge"}
        </Button>
      </div>
    </div>
  );
}