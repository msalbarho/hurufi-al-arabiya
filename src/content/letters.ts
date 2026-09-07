/**
 * Static letter content. In the final app this is generated from
 * assets/content/letters.json; kept as typed TS here for zero-cost loading.
 */
export type Haraka = "fatha" | "damma" | "kasra" | "sukun";

export interface LetterForms {
  isolated: string;
  initial: string;
  medial: string;
  final: string;
}

export interface Letter {
  id: string;
  char: string;
  nameAr: string;
  order: number;
  forms: LetterForms;
  /** Letters that never connect to the following letter */
  nonConnecting?: boolean;
  example: { text: string; diacritized: string; emoji: string };
  similar?: string[];
}

export const HARAKAT: { id: Haraka; nameAr: string; mark: string }[] = [
  { id: "fatha", nameAr: "فَتْحَة", mark: "\u064E" },
  { id: "damma", nameAr: "ضَمَّة", mark: "\u064F" },
  { id: "kasra", nameAr: "كَسْرَة", mark: "\u0650" },
  { id: "sukun", nameAr: "سُكُون", mark: "\u0652" },
];

const T = "\u0640"; // tatweel

function forms(c: string, nonConnecting = false): LetterForms {
  return nonConnecting
    ? { isolated: c, initial: c, medial: T + c, final: T + c }
    : { isolated: c, initial: c + T, medial: T + c + T, final: T + c };
}

export const LETTERS: Letter[] = [
  { id: "alif", char: "ا", nameAr: "أَلِف", order: 1, forms: forms("ا", true), nonConnecting: true, example: { text: "أرنب", diacritized: "أَرْنَب", emoji: "🐰" } },
  { id: "ba", char: "ب", nameAr: "بَاء", order: 2, forms: forms("ب"), example: { text: "بطة", diacritized: "بَطَّة", emoji: "🦆" }, similar: ["ta", "tha"] },
  { id: "ta", char: "ت", nameAr: "تَاء", order: 3, forms: forms("ت"), example: { text: "تفاح", diacritized: "تُفَّاح", emoji: "🍎" }, similar: ["ba", "tha"] },
  { id: "tha", char: "ث", nameAr: "ثَاء", order: 4, forms: forms("ث"), example: { text: "ثعلب", diacritized: "ثَعْلَب", emoji: "🦊" }, similar: ["ba", "ta"] },
  { id: "jim", char: "ج", nameAr: "جِيم", order: 5, forms: forms("ج"), example: { text: "جمل", diacritized: "جَمَل", emoji: "🐪" }, similar: ["ha", "kha"] },
  { id: "ha", char: "ح", nameAr: "حَاء", order: 6, forms: forms("ح"), example: { text: "حصان", diacritized: "حِصَان", emoji: "🐴" }, similar: ["jim", "kha"] },
  { id: "kha", char: "خ", nameAr: "خَاء", order: 7, forms: forms("خ"), example: { text: "خروف", diacritized: "خَرُوف", emoji: "🐑" }, similar: ["jim", "ha"] },
  { id: "dal", char: "د", nameAr: "دَال", order: 8, forms: forms("د", true), nonConnecting: true, example: { text: "دب", diacritized: "دُبّ", emoji: "🐻" }, similar: ["thal"] },
  { id: "thal", char: "ذ", nameAr: "ذَال", order: 9, forms: forms("ذ", true), nonConnecting: true, example: { text: "ذرة", diacritized: "ذُرَة", emoji: "🌽" }, similar: ["dal"] },
  { id: "ra", char: "ر", nameAr: "رَاء", order: 10, forms: forms("ر", true), nonConnecting: true, example: { text: "رمان", diacritized: "رُمَّان", emoji: "🍒" }, similar: ["zay"] },
  { id: "zay", char: "ز", nameAr: "زَاي", order: 11, forms: forms("ز", true), nonConnecting: true, example: { text: "زرافة", diacritized: "زَرَافَة", emoji: "🦒" }, similar: ["ra"] },
  { id: "sin", char: "س", nameAr: "سِين", order: 12, forms: forms("س"), example: { text: "سمكة", diacritized: "سَمَكَة", emoji: "🐟" }, similar: ["shin"] },
  { id: "shin", char: "ش", nameAr: "شِين", order: 13, forms: forms("ش"), example: { text: "شمس", diacritized: "شَمْس", emoji: "☀️" }, similar: ["sin"] },
  { id: "sad", char: "ص", nameAr: "صَاد", order: 14, forms: forms("ص"), example: { text: "صقر", diacritized: "صَقْر", emoji: "🦅" }, similar: ["dad"] },
  { id: "dad", char: "ض", nameAr: "ضَاد", order: 15, forms: forms("ض"), example: { text: "ضفدع", diacritized: "ضِفْدَع", emoji: "🐸" }, similar: ["sad"] },
  { id: "tah", char: "ط", nameAr: "طَاء", order: 16, forms: forms("ط"), example: { text: "طائر", diacritized: "طَائِر", emoji: "🐦" }, similar: ["zah"] },
  { id: "zah", char: "ظ", nameAr: "ظَاء", order: 17, forms: forms("ظ"), example: { text: "ظرف", diacritized: "ظَرْف", emoji: "✉️" }, similar: ["tah"] },
  { id: "ain", char: "ع", nameAr: "عَيْن", order: 18, forms: forms("ع"), example: { text: "عنب", diacritized: "عِنَب", emoji: "🍇" }, similar: ["ghain"] },
  { id: "ghain", char: "غ", nameAr: "غَيْن", order: 19, forms: forms("غ"), example: { text: "غزال", diacritized: "غَزَال", emoji: "🦌" }, similar: ["ain"] },
  { id: "fa", char: "ف", nameAr: "فَاء", order: 20, forms: forms("ف"), example: { text: "فيل", diacritized: "فِيل", emoji: "🐘" }, similar: ["qaf"] },
  { id: "qaf", char: "ق", nameAr: "قَاف", order: 21, forms: forms("ق"), example: { text: "قطة", diacritized: "قِطَّة", emoji: "🐱" }, similar: ["fa"] },
  { id: "kaf", char: "ك", nameAr: "كَاف", order: 22, forms: forms("ك"), example: { text: "كلب", diacritized: "كَلْب", emoji: "🐶" } },
  { id: "lam", char: "ل", nameAr: "لَام", order: 23, forms: forms("ل"), example: { text: "ليمون", diacritized: "لَيْمُون", emoji: "🍋" } },
  { id: "mim", char: "م", nameAr: "مِيم", order: 24, forms: forms("م"), example: { text: "موز", diacritized: "مَوْز", emoji: "🍌" } },
  { id: "nun", char: "ن", nameAr: "نُون", order: 25, forms: forms("ن"), example: { text: "نحلة", diacritized: "نَحْلَة", emoji: "🐝" } },
  { id: "haa", char: "ه", nameAr: "هَاء", order: 26, forms: forms("ه"), example: { text: "هلال", diacritized: "هِلَال", emoji: "🌙" } },
  { id: "waw", char: "و", nameAr: "وَاو", order: 27, forms: forms("و", true), nonConnecting: true, example: { text: "وردة", diacritized: "وَرْدَة", emoji: "🌹" } },
  { id: "ya", char: "ي", nameAr: "يَاء", order: 28, forms: forms("ي"), example: { text: "يد", diacritized: "يَد", emoji: "✋" } },
];

export const getLetter = (id: string) => LETTERS.find((l) => l.id === id);
export const getLetterByOrder = (order: number) => LETTERS.find((l) => l.order === order);

/** Letter + haraka, e.g. بَ */
export const withHaraka = (char: string, h: Haraka) =>
  char + (HARAKAT.find((x) => x.id === h)?.mark ?? "");
