import { Challenge } from "./types/challenge";

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Rock Paper Scissors',
    difficulty: '8 kyu',
    category: 'Fundamentals',
    description: 'Implement the classic game logic',
    tags: ['Logic', 'Conditionals'],
    points: 100,
    solvedCount: 15234,
    locked: false
  },
  {
    id: '2',
    title: 'FizzBuzz Challenge',
    difficulty: '7 kyu',
    category: 'Algorithms',
    description: 'The classic interview question',
    tags: ['Loops', 'Logic'],
    points: 150,
    timeLimit: 300,
    solvedCount: 12456,
    locked: false
  },
  {
    id: '3',
    title: 'Binary Search Tree',
    difficulty: '5 kyu',
    category: 'Data Structures',
    description: 'Implement BST operations',
    tags: ['Trees', 'Recursion'],
    points: 500,
    solvedCount: 3421,
    locked: true,
    requiredLevel: 15
  },
];
