import type { CategoryId, Word } from "./types";
import { animals, food, family, body, colors, numbers } from "./part1";
import { home, school, clothes, nature, transport } from "./part2";
import { jobs, fruits, vegetables, birds, sea, sky } from "./part3";
import { verbs, adjectives } from "./part4";

export type { CategoryId, Word } from "./types";

export interface Category {
  id: CategoryId;
  nameAr: string;
  emoji: string;
  tone: "coral" | "sun" | "sea" | "berry" | "lilac";
  words: Word[];
}

export const CATEGORIES: Category[] = [
  { id: "animals", nameAr: "حيوانات", emoji: "🦁", tone: "sun", words: animals },
  { id: "food", nameAr: "طعام", emoji: "🍞", tone: "coral", words: food },
  { id: "fruits", nameAr: "فواكه", emoji: "🍎", tone: "berry", words: fruits },
  { id: "vegetables", nameAr: "خضار", emoji: "🥕", tone: "sea", words: vegetables },
  { id: "family", nameAr: "عائلتي", emoji: "👨‍👩‍👧", tone: "lilac", words: family },
  { id: "body", nameAr: "جسمي", emoji: "✋", tone: "coral", words: body },
  { id: "colors", nameAr: "ألوان", emoji: "🌈", tone: "berry", words: colors },
  { id: "numbers", nameAr: "أرقام", emoji: "🔢", tone: "sea", words: numbers },
  { id: "home", nameAr: "في البيت", emoji: "🏠", tone: "sun", words: home },
  { id: "school", nameAr: "المدرسة", emoji: "🏫", tone: "lilac", words: school },
  { id: "clothes", nameAr: "ملابس", emoji: "👕", tone: "berry", words: clothes },
  { id: "nature", nameAr: "الطبيعة", emoji: "🌳", tone: "sea", words: nature },
  { id: "transport", nameAr: "مواصلات", emoji: "🚗", tone: "coral", words: transport },
  { id: "jobs", nameAr: "مهن", emoji: "👩‍⚕️", tone: "lilac", words: jobs },
  { id: "birds", nameAr: "طيور وحشرات", emoji: "🦋", tone: "sun", words: birds },
  { id: "sea", nameAr: "البحر", emoji: "🐬", tone: "sea", words: sea },
  { id: "sky", nameAr: "السماء", emoji: "⭐", tone: "lilac", words: sky },
  { id: "verbs", nameAr: "أفعال", emoji: "🏃", tone: "coral", words: verbs },
  { id: "adjectives", nameAr: "صفات", emoji: "😀", tone: "berry", words: adjectives },
];

export const ALL_WORDS: Word[] = CATEGORIES.flatMap((c) => c.words);

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
