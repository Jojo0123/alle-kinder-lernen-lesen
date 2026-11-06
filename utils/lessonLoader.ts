import { WordLevel } from '../types';

export interface Lesson {
  id: string;
  name: string;
  levels: WordLevel[];
}

// Helper to extract filename without extension
const getBasename = (path: string) => {
  const parts = path.split('/');
  const filename = parts[parts.length - 1];
  return filename.substring(0, filename.lastIndexOf('.'));
};

// Helper to extract lesson ID from path
const getLessonId = (path: string) => {
  const parts = path.split('/');
  // Path structure: ../data/{lessonId}/images/{filename}
  // "data" is at index -3 relative to image file
  return parts[parts.length - 3];
};

// Helper: Fisher-Yates shuffle
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const getAvailableLessons = (): Lesson[] => {
  // Load all images and sounds eagerly
  const images = import.meta.glob('../data/*/images/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
  const sounds = import.meta.glob('../data/*/sounds/*.{mp3,wav,ogg}', { eager: true, query: '?url', import: 'default' });

  const lessonsMap: Record<string, WordLevel[]> = {};

  // Process images to build base levels
  for (const path in images) {
    const lessonId = getLessonId(path);
    const word = getBasename(path);
    const imageUrl = images[path];

    if (!lessonsMap[lessonId]) {
      lessonsMap[lessonId] = [];
    }

    // Find corresponding sound
    // Expected sound path pattern
    const soundPathKey = Object.keys(sounds).find(s => getLessonId(s) === lessonId && getBasename(s) === word);
    const soundUrl = soundPathKey ? sounds[soundPathKey] : '';

    lessonsMap[lessonId].push({
      id: `${lessonId}_${word}`,
      word: word, // Preserve exact filename case (e.g. "Affe", "Fuß", "Stuhl") for /WordAnimationen/<Wort>.mp4
      image: imageUrl,
      sound: soundUrl,
    });
  }

  // Convert map to array - return ALL levels, not just 12
  return Object.keys(lessonsMap).map(id => {
    const allLevels = lessonsMap[id];

    return {
      id,
      name: `Lektion ${id}`,
      levels: allLevels // Return all available levels
    };
  });
};
