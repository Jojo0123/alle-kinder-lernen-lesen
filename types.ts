export interface WordLevel {
  id: string;
  word: string; // The correct word, e.g., "SONNE"
  image: string; // URL to the image
  sound: string; // URL to the sound file
  scramble?: string[]; // Optional preset scrambled letters, otherwise auto-scrambled
  color?: string; // Optional background color hint
}

export interface LetterTile {
  id: string; // Unique ID for React keys
  char: string;
  colorClass: string; // Tailwind class for background
}

export type GameView = 'start' | 'modeSelect' | 'game' | 'letterGame' | 'lauteGame' | 'tierSpiel' | 'strandSpiel' | 'success' | 'congratulations' | 'parents';

export type GameMode = 'words' | 'letters' | 'laute';

export interface UserProgress {
  wordsLearned: number;
  badges: number;
  streak: number;
  completedLevels: string[];
}