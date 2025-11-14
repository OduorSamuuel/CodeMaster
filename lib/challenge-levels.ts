// utils/challenge-levels.ts

export const CHALLENGE_LEVEL_REQUIREMENTS = {
  // Level 1 - Beginner fundamentals (8-6 kyu)
  1: ['8 kyu', '7 kyu', '6 kyu'],
  
  // Level 2 - Building confidence
  2: ['8 kyu', '7 kyu', '6 kyu', '5 kyu'],
  
  // Level 3 - Developing core skills
  3: ['7 kyu', '6 kyu', '5 kyu', '4 kyu'],
  
  // Level 4 - Intermediate challenges
  4: ['6 kyu', '5 kyu', '4 kyu', '3 kyu'],
  
  // Level 5 - Advanced fundamentals
  5: ['5 kyu', '4 kyu', '3 kyu', '2 kyu'],
  
  // Level 6 - Complex problem solving
  6: ['4 kyu', '3 kyu', '2 kyu', '1 kyu'],
  
  // Level 7 - Expert level
  7: ['3 kyu', '2 kyu', '1 kyu'],
  
  // Level 8 - Master challenges
  8: ['2 kyu', '1 kyu'],
  
  // Level 9 - Elite level
  9: ['1 kyu'],
  
  // Level 10 - Grandmaster
  10: ['1 kyu'],
};

export const getAvailableDifficulties = (userLevel: number): string[] => {
  return CHALLENGE_LEVEL_REQUIREMENTS[userLevel as keyof typeof CHALLENGE_LEVEL_REQUIREMENTS] || 
         CHALLENGE_LEVEL_REQUIREMENTS[10]; // Default to max level
};

export const isChallengeUnlocked = (challengeRank: string, userLevel: number): boolean => {
  const availableDifficulties = getAvailableDifficulties(userLevel);
  return availableDifficulties.includes(challengeRank);
};

export const getRequiredLevelForChallenge = (challengeRank: string): number => {
  for (const [level, difficulties] of Object.entries(CHALLENGE_LEVEL_REQUIREMENTS)) {
    if (difficulties.includes(challengeRank)) {
      return parseInt(level);
    }
  }
  return 1; // Default to level 1
};

// Get the next level and what it unlocks
export const getNextLevelUnlocks = (currentLevel: number): { level: number; unlocks: string[] } | null => {
  const nextLevel = currentLevel + 1;
  const nextLevelDifficulties = CHALLENGE_LEVEL_REQUIREMENTS[nextLevel as keyof typeof CHALLENGE_LEVEL_REQUIREMENTS];
  
  if (!nextLevelDifficulties || nextLevel > 10) return null;
  
  const currentDifficulties = getAvailableDifficulties(currentLevel);
  const newUnlocks = nextLevelDifficulties.filter(diff => !currentDifficulties.includes(diff));
  
  return {
    level: nextLevel,
    unlocks: newUnlocks
  };
};

// Get level progression description
export const getLevelDescription = (level: number): string => {
  const descriptions: Record<number, string> = {
    1: "Beginner - Start with fundamentals (8-6 kyu)",
    2: "Beginner - Building confidence with basic algorithms",
    3: "Intermediate - Developing core programming skills",
    4: "Intermediate - Tackling more complex problems",
    5: "Advanced - Solving challenging algorithms",
    6: "Advanced - Handling complex data structures",
    7: "Expert - Mastering difficult challenges",
    8: "Expert - Solving master-level problems",
    9: "Master - Elite coding challenges",
    10: "Grandmaster - The pinnacle of coding excellence"
  };
  
  return descriptions[level] || "Continue your coding journey";
};

// Get the maximum level
export const MAX_LEVEL = 10;

// Get level tier (for styling)
export const getLevelTier = (level: number): string => {
  if (level <= 2) return "beginner";
  if (level <= 4) return "intermediate";
  if (level <= 6) return "advanced";
  if (level <= 8) return "expert";
  return "master";
};

// Get tier color
export const getTierColor = (tier: string): string => {
  const colors = {
    beginner: "bg-green-500",
    intermediate: "bg-blue-500",
    advanced: "bg-purple-500",
    expert: "bg-orange-500",
    master: "bg-red-500"
  };
  return colors[tier as keyof typeof colors] || "bg-gray-500";
};