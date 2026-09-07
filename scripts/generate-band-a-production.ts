/**
 * Builds src/content/curriculum/data/production/band-a.json from the frozen
 * Band A v1 table. Not imported by the React app.
 *
 * Run: node --experimental-strip-types --no-warnings scripts/generate-band-a-production.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BAND_A_PRODUCTION_META_ID = "hurufi.production.band-a.v1";

const BAND_A_HIGH_FREQUENCY_LEMMAS = new Set([
  "أم",
  "أب",
  "بنت",
  "ولد",
  "بيت",
  "باب",
  "ماء",
  "يد",
  "كتاب",
  "قلم",
  "مدرسة",
  "كرة",
  "قط",
  "قطة",
  "كلب",
  "هذا",
  "هذه",
  "هو",
  "هي",
  "في",
  "على",
  "هنا",
  "نعم",
  "لا",
  "يأكل",
  "يشرب",
  "يلعب",
  "ينام",
  "يذهب",
  "يرى",
  "يقول",
  "كبير",
  "صغير",
  "سعيد",
]);

type Cluster = "A1" | "A2" | "A3" | "A4";
type Source = "EXISTING_720" | "NEW_REQUIRED";

interface Entry {
  slug: string;
  lemma: string;
  teachingForm: string;
  cluster: Cluster;
  source: Source;
  legacyId?: string;
  category: string;
}

const FATHA = "\u064E";
const DAMMA = "\u064F";
const KASRA = "\u0650";
const SUKUN = "\u0652";
const SHADDA = "\u0651";
const TANWEEN_FATHA = "\u064B";
const TANWEEN_DAMMA = "\u064C";
const TANWEEN_KASRA = "\u064D";
const TATWEEL = "\u0640";
const SUPER_ALEF = "\u0670";

const SKILL = {
  fatha: "skill.short_vowel.fatha",
  kasra: "skill.short_vowel.kasra",
  damma: "skill.short_vowel.damma",
  sukun: "skill.sukun.basic",
  madd: "skill.long_vowel.madd",
  shadda: "skill.shadda.basic",
  hamza: "skill.hamza.reading",
  taaMarbuta: "skill.taa_marbuta.reading",
  alifMaqsura: "skill.alif_maqsura.reading",
} as const;

const POS_BY_CATEGORY: Record<string, string> = {
  verbs: "verb",
  adjectives: "adjective",
  colors: "adjective",
  function: "function",
  numbers: "numeral",
};

const LOANWORD_LEMMAS = new Set(["شاي", "طاولة"]);

const ENTRIES: Entry[] = [
  { slug: "bab", lemma: "باب", teachingForm: "بَاب", cluster: "A1", source: "EXISTING_720", legacyId: "home-2", category: "home" },
  { slug: "bayt", lemma: "بيت", teachingForm: "بَيْت", cluster: "A1", source: "EXISTING_720", legacyId: "home-1", category: "home" },
  { slug: "yad", lemma: "يد", teachingForm: "يَد", cluster: "A1", source: "EXISTING_720", legacyId: "body-17", category: "body" },
  { slug: "ab", lemma: "أب", teachingForm: "أَب", cluster: "A1", source: "EXISTING_720", legacyId: "family-2", category: "family" },
  { slug: "maa", lemma: "ماء", teachingForm: "مَاء", cluster: "A1", source: "EXISTING_720", legacyId: "food-47", category: "food" },
  { slug: "kalb", lemma: "كلب", teachingForm: "كَلْب", cluster: "A1", source: "EXISTING_720", legacyId: "animals-2", category: "animals" },
  { slug: "qalam", lemma: "قلم", teachingForm: "قَلَم", cluster: "A1", source: "EXISTING_720", legacyId: "school-8", category: "school" },
  { slug: "shams", lemma: "شمس", teachingForm: "شَمْس", cluster: "A1", source: "EXISTING_720", legacyId: "sky-1", category: "nature" },
  { slug: "qamar", lemma: "قمر", teachingForm: "قَمَر", cluster: "A1", source: "EXISTING_720", legacyId: "sky-2", category: "nature" },
  { slug: "nar", lemma: "نار", teachingForm: "نَار", cluster: "A1", source: "EXISTING_720", legacyId: "nature-32", category: "nature" },
  { slug: "fam", lemma: "فم", teachingForm: "فَم", cluster: "A1", source: "EXISTING_720", legacyId: "body-7", category: "body" },
  { slug: "khubz", lemma: "خبز", teachingForm: "خُبْز", cluster: "A1", source: "EXISTING_720", legacyId: "food-1", category: "food" },
  { slug: "tamr", lemma: "تمر", teachingForm: "تَمْر", cluster: "A1", source: "EXISTING_720", legacyId: "food-54", category: "food" },
  { slug: "bayd", lemma: "بيض", teachingForm: "بَيْض", cluster: "A1", source: "EXISTING_720", legacyId: "food-6", category: "food" },
  { slug: "mawz", lemma: "موز", teachingForm: "مَوْز", cluster: "A1", source: "EXISTING_720", legacyId: "fruits-2", category: "food" },
  { slug: "asal", lemma: "عسل", teachingForm: "عَسَل", cluster: "A1", source: "EXISTING_720", legacyId: "food-19", category: "food" },
  { slug: "jamal", lemma: "جمل", teachingForm: "جَمَل", cluster: "A1", source: "EXISTING_720", legacyId: "animals-9", category: "animals" },
  { slug: "fil", lemma: "فيل", teachingForm: "فِيل", cluster: "A1", source: "EXISTING_720", legacyId: "animals-4", category: "animals" },
  { slug: "hajar", lemma: "حجر", teachingForm: "حَجَر", cluster: "A1", source: "EXISTING_720", legacyId: "nature-16", category: "nature" },
  { slug: "qadam", lemma: "قدم", teachingForm: "قَدَم", cluster: "A1", source: "EXISTING_720", legacyId: "body-27", category: "body" },
  { slug: "wajh", lemma: "وجه", teachingForm: "وَجْه", cluster: "A1", source: "EXISTING_720", legacyId: "body-3", category: "body" },
  { slug: "bahr", lemma: "بحر", teachingForm: "بَحْر", cluster: "A1", source: "EXISTING_720", legacyId: "sea-1", category: "nature" },
  { slug: "layl", lemma: "ليل", teachingForm: "لَيْل", cluster: "A1", source: "EXISTING_720", legacyId: "sky-17", category: "nature" },
  { slug: "nahr", lemma: "نهر", teachingForm: "نَهْر", cluster: "A1", source: "EXISTING_720", legacyId: "nature-18", category: "nature" },
  { slug: "samak", lemma: "سمك", teachingForm: "سَمَك", cluster: "A1", source: "EXISTING_720", legacyId: "food-9", category: "food" },
  { slug: "raml", lemma: "رمل", teachingForm: "رَمْل", cluster: "A1", source: "EXISTING_720", legacyId: "nature-15", category: "nature" },
  { slug: "kitab", lemma: "كتاب", teachingForm: "كِتَاب", cluster: "A1", source: "EXISTING_720", legacyId: "school-6", category: "school" },
  { slug: "asad", lemma: "أسد", teachingForm: "أَسَد", cluster: "A1", source: "EXISTING_720", legacyId: "animals-3", category: "animals" },
  { slug: "umm", lemma: "أم", teachingForm: "أُمّ", cluster: "A2", source: "EXISTING_720", legacyId: "family-1", category: "family" },
  { slug: "akh", lemma: "أخ", teachingForm: "أَخ", cluster: "A2", source: "EXISTING_720", legacyId: "family-3", category: "family" },
  { slug: "ukht", lemma: "أخت", teachingForm: "أُخْت", cluster: "A2", source: "EXISTING_720", legacyId: "family-4", category: "family" },
  { slug: "bint", lemma: "بنت", teachingForm: "بِنْت", cluster: "A2", source: "NEW_REQUIRED", category: "family" },
  { slug: "walad", lemma: "ولد", teachingForm: "وَلَد", cluster: "A2", source: "NEW_REQUIRED", category: "family" },
  { slug: "jadd", lemma: "جد", teachingForm: "جَدّ", cluster: "A2", source: "EXISTING_720", legacyId: "family-5", category: "family" },
  { slug: "jadda", lemma: "جدة", teachingForm: "جَدَّة", cluster: "A2", source: "EXISTING_720", legacyId: "family-6", category: "family" },
  { slug: "qitt", lemma: "قط", teachingForm: "قِطّ", cluster: "A2", source: "EXISTING_720", legacyId: "animals-1", category: "animals" },
  { slug: "qitta", lemma: "قطة", teachingForm: "قِطَّة", cluster: "A2", source: "NEW_REQUIRED", category: "animals" },
  { slug: "arnab", lemma: "أرنب", teachingForm: "أَرْنَب", cluster: "A2", source: "EXISTING_720", legacyId: "animals-10", category: "animals" },
  { slug: "baqara", lemma: "بقرة", teachingForm: "بَقَرَة", cluster: "A2", source: "EXISTING_720", legacyId: "animals-6", category: "animals" },
  { slug: "dajaja", lemma: "دجاجة", teachingForm: "دَجَاجَة", cluster: "A2", source: "EXISTING_720", legacyId: "birds-12", category: "animals" },
  { slug: "ayn", lemma: "عين", teachingForm: "عَيْن", cluster: "A2", source: "EXISTING_720", legacyId: "body-4", category: "body" },
  { slug: "anf", lemma: "أنف", teachingForm: "أَنْف", cluster: "A2", source: "EXISTING_720", legacyId: "body-6", category: "body" },
  { slug: "udhun", lemma: "أذن", teachingForm: "أُذُن", cluster: "A2", source: "EXISTING_720", legacyId: "body-5", category: "body" },
  { slug: "shaar", lemma: "شعر", teachingForm: "شَعْر", cluster: "A2", source: "EXISTING_720", legacyId: "body-2", category: "body" },
  { slug: "ghurfa", lemma: "غرفة", teachingForm: "غُرْفَة", cluster: "A2", source: "EXISTING_720", legacyId: "home-4", category: "home" },
  { slug: "sarir", lemma: "سرير", teachingForm: "سَرِير", cluster: "A2", source: "EXISTING_720", legacyId: "home-5", category: "home" },
  { slug: "tawila", lemma: "طاولة", teachingForm: "طَاوِلَة", cluster: "A2", source: "EXISTING_720", legacyId: "home-9", category: "home" },
  { slug: "kub", lemma: "كوب", teachingForm: "كُوب", cluster: "A2", source: "EXISTING_720", legacyId: "home-26", category: "home" },
  { slug: "halib", lemma: "حليب", teachingForm: "حَلِيب", cluster: "A2", source: "EXISTING_720", legacyId: "food-3", category: "food" },
  { slug: "tuffah", lemma: "تفاح", teachingForm: "تُفَّاح", cluster: "A2", source: "EXISTING_720", legacyId: "fruits-1", category: "food" },
  { slug: "dajaj", lemma: "دجاج", teachingForm: "دَجَاج", cluster: "A2", source: "EXISTING_720", legacyId: "food-8", category: "food" },
  { slug: "shajara", lemma: "شجرة", teachingForm: "شَجَرَة", cluster: "A2", source: "EXISTING_720", legacyId: "nature-1", category: "nature" },
  { slug: "matar", lemma: "مطر", teachingForm: "مَطَر", cluster: "A2", source: "EXISTING_720", legacyId: "nature-21", category: "nature" },
  { slug: "sama", lemma: "سماء", teachingForm: "سَمَاء", cluster: "A2", source: "EXISTING_720", legacyId: "sky-4", category: "nature" },
  { slug: "yakul", lemma: "يأكل", teachingForm: "يَأْكُلُ", cluster: "A2", source: "EXISTING_720", legacyId: "verbs-1", category: "verbs" },
  { slug: "yashrab", lemma: "يشرب", teachingForm: "يَشْرَبُ", cluster: "A2", source: "EXISTING_720", legacyId: "verbs-2", category: "verbs" },
  { slug: "yalab", lemma: "يلعب", teachingForm: "يَلْعَبُ", cluster: "A2", source: "EXISTING_720", legacyId: "verbs-5", category: "verbs" },
  { slug: "yanam", lemma: "ينام", teachingForm: "يَنَامُ", cluster: "A2", source: "EXISTING_720", legacyId: "verbs-3", category: "verbs" },
  { slug: "yajlis", lemma: "يجلس", teachingForm: "يَجْلِسُ", cluster: "A2", source: "EXISTING_720", legacyId: "verbs-9", category: "verbs" },
  { slug: "ahmar", lemma: "أحمر", teachingForm: "أَحْمَر", cluster: "A2", source: "EXISTING_720", legacyId: "colors-1", category: "colors" },
  { slug: "azraq", lemma: "أزرق", teachingForm: "أَزْرَق", cluster: "A2", source: "EXISTING_720", legacyId: "colors-2", category: "colors" },
  { slug: "asfar", lemma: "أصفر", teachingForm: "أَصْفَر", cluster: "A2", source: "EXISTING_720", legacyId: "colors-3", category: "colors" },
  { slug: "akhdar", lemma: "أخضر", teachingForm: "أَخْضَر", cluster: "A2", source: "EXISTING_720", legacyId: "colors-4", category: "colors" },
  { slug: "ras", lemma: "رأس", teachingForm: "رَأْس", cluster: "A3", source: "EXISTING_720", legacyId: "body-1", category: "body" },
  { slug: "jism", lemma: "جسم", teachingForm: "جِسْم", cluster: "A3", source: "EXISTING_720", legacyId: "body-40", category: "body" },
  { slug: "qalb", lemma: "قلب", teachingForm: "قَلْب", cluster: "A3", source: "EXISTING_720", legacyId: "body-29", category: "body" },
  { slug: "sinn", lemma: "سن", teachingForm: "سِنّ", cluster: "A3", source: "EXISTING_720", legacyId: "body-10", category: "body" },
  { slug: "madrasa", lemma: "مدرسة", teachingForm: "مَدْرَسَة", cluster: "A3", source: "EXISTING_720", legacyId: "school-1", category: "school" },
  { slug: "muallima", lemma: "معلمة", teachingForm: "مُعَلِّمَة", cluster: "A3", source: "EXISTING_720", legacyId: "school-3", category: "school" },
  { slug: "daftar", lemma: "دفتر", teachingForm: "دَفْتَر", cluster: "A3", source: "EXISTING_720", legacyId: "school-7", category: "school" },
  { slug: "harf", lemma: "حرف", teachingForm: "حَرْف", cluster: "A3", source: "EXISTING_720", legacyId: "school-24", category: "school" },
  { slug: "qissa", lemma: "قصة", teachingForm: "قِصَّة", cluster: "A3", source: "EXISTING_720", legacyId: "school-27", category: "school" },
  { slug: "qamis", lemma: "قميص", teachingForm: "قَمِيص", cluster: "A3", source: "EXISTING_720", legacyId: "clothes-1", category: "clothes" },
  { slug: "hidha", lemma: "حذاء", teachingForm: "حِذَاء", cluster: "A3", source: "EXISTING_720", legacyId: "clothes-9", category: "clothes" },
  { slug: "sayyara", lemma: "سيارة", teachingForm: "سَيَّارَة", cluster: "A3", source: "EXISTING_720", legacyId: "transport-1", category: "transport" },
  { slug: "hafila", lemma: "حافلة", teachingForm: "حَافِلَة", cluster: "A3", source: "EXISTING_720", legacyId: "transport-2", category: "transport" },
  { slug: "wahid", lemma: "واحد", teachingForm: "وَاحِد", cluster: "A3", source: "EXISTING_720", legacyId: "numbers-1", category: "numbers" },
  { slug: "thalatha", lemma: "ثلاثة", teachingForm: "ثَلَاثَة", cluster: "A3", source: "EXISTING_720", legacyId: "numbers-3", category: "numbers" },
  { slug: "kura", lemma: "كرة", teachingForm: "كُرَة", cluster: "A3", source: "NEW_REQUIRED", category: "toys" },
  { slug: "luba", lemma: "لعبة", teachingForm: "لُعْبَة", cluster: "A3", source: "NEW_REQUIRED", category: "toys" },
  { slug: "masjid", lemma: "مسجد", teachingForm: "مَسْجِد", cluster: "A3", source: "NEW_REQUIRED", category: "places" },
  { slug: "suq", lemma: "سوق", teachingForm: "سُوق", cluster: "A3", source: "NEW_REQUIRED", category: "places" },
  { slug: "yawm", lemma: "يوم", teachingForm: "يَوْم", cluster: "A3", source: "NEW_REQUIRED", category: "time" },
  { slug: "sabah", lemma: "صباح", teachingForm: "صَبَاح", cluster: "A3", source: "NEW_REQUIRED", category: "time" },
  { slug: "usfur", lemma: "عصفور", teachingForm: "عُصْفُور", cluster: "A3", source: "EXISTING_720", legacyId: "birds-1", category: "animals" },
  { slug: "hisan", lemma: "حصان", teachingForm: "حِصَان", cluster: "A3", source: "EXISTING_720", legacyId: "animals-5", category: "animals" },
  { slug: "inab", lemma: "عنب", teachingForm: "عِنَب", cluster: "A3", source: "EXISTING_720", legacyId: "fruits-4", category: "food" },
  { slug: "laymun", lemma: "ليمون", teachingForm: "لَيْمُون", cluster: "A3", source: "EXISTING_720", legacyId: "fruits-14", category: "food" },
  { slug: "warda", lemma: "وردة", teachingForm: "وَرْدَة", cluster: "A3", source: "EXISTING_720", legacyId: "nature-3", category: "nature" },
  { slug: "miftah", lemma: "مفتاح", teachingForm: "مِفْتَاح", cluster: "A3", source: "EXISTING_720", legacyId: "home-41", category: "home" },
  { slug: "yaktub", lemma: "يكتب", teachingForm: "يَكْتُبُ", cluster: "A3", source: "EXISTING_720", legacyId: "verbs-12", category: "verbs" },
  { slug: "yaqra", lemma: "يقرأ", teachingForm: "يَقْرَأُ", cluster: "A3", source: "EXISTING_720", legacyId: "verbs-11", category: "verbs" },
  { slug: "yaftah", lemma: "يفتح", teachingForm: "يَفْتَحُ", cluster: "A3", source: "EXISTING_720", legacyId: "verbs-24", category: "verbs" },
  { slug: "yadhhab", lemma: "يذهب", teachingForm: "يَذْهَبُ", cluster: "A3", source: "NEW_REQUIRED", category: "verbs" },
  { slug: "yara", lemma: "يرى", teachingForm: "يَرَى", cluster: "A3", source: "NEW_REQUIRED", category: "verbs" },
  { slug: "yamshi", lemma: "يمشي", teachingForm: "يَمْشِي", cluster: "A3", source: "EXISTING_720", legacyId: "verbs-7", category: "verbs" },
  { slug: "kabir", lemma: "كبير", teachingForm: "كَبِير", cluster: "A3", source: "EXISTING_720", legacyId: "adjectives-1", category: "adjectives" },
  { slug: "saghir", lemma: "صغير", teachingForm: "صَغِير", cluster: "A3", source: "EXISTING_720", legacyId: "adjectives-2", category: "adjectives" },
  { slug: "saeed", lemma: "سعيد", teachingForm: "سَعِيد", cluster: "A3", source: "EXISTING_720", legacyId: "adjectives-14", category: "adjectives" },
  { slug: "hazin", lemma: "حزين", teachingForm: "حَزِين", cluster: "A3", source: "EXISTING_720", legacyId: "adjectives-15", category: "adjectives" },
  { slug: "hadha", lemma: "هذا", teachingForm: "هَذَا", cluster: "A4", source: "NEW_REQUIRED", category: "function" },
  { slug: "hadhihi", lemma: "هذه", teachingForm: "هَذِهِ", cluster: "A4", source: "NEW_REQUIRED", category: "function" },
  { slug: "huwa", lemma: "هو", teachingForm: "هُوَ", cluster: "A4", source: "NEW_REQUIRED", category: "function" },
  { slug: "hiya", lemma: "هي", teachingForm: "هِيَ", cluster: "A4", source: "NEW_REQUIRED", category: "function" },
  { slug: "fi", lemma: "في", teachingForm: "فِي", cluster: "A4", source: "NEW_REQUIRED", category: "function" },
  { slug: "ala", lemma: "على", teachingForm: "عَلَى", cluster: "A4", source: "NEW_REQUIRED", category: "function" },
  { slug: "huna", lemma: "هنا", teachingForm: "هُنَا", cluster: "A4", source: "NEW_REQUIRED", category: "function" },
  { slug: "naam", lemma: "نعم", teachingForm: "نَعَم", cluster: "A4", source: "NEW_REQUIRED", category: "function" },
  { slug: "laa", lemma: "لا", teachingForm: "لَا", cluster: "A4", source: "NEW_REQUIRED", category: "function" },
  { slug: "arbaa", lemma: "أربعة", teachingForm: "أَرْبَعَة", cluster: "A4", source: "EXISTING_720", legacyId: "numbers-4", category: "numbers" },
  { slug: "khamsa", lemma: "خمسة", teachingForm: "خَمْسَة", cluster: "A4", source: "EXISTING_720", legacyId: "numbers-5", category: "numbers" },
  { slug: "aswad", lemma: "أسود", teachingForm: "أَسْوَد", cluster: "A4", source: "EXISTING_720", legacyId: "colors-9", category: "colors" },
  { slug: "abyad", lemma: "أبيض", teachingForm: "أَبْيَض", cluster: "A4", source: "EXISTING_720", legacyId: "colors-10", category: "colors" },
  { slug: "tawil", lemma: "طويل", teachingForm: "طَوِيل", cluster: "A4", source: "EXISTING_720", legacyId: "adjectives-3", category: "adjectives" },
  { slug: "qasir", lemma: "قصير", teachingForm: "قَصِير", cluster: "A4", source: "EXISTING_720", legacyId: "adjectives-4", category: "adjectives" },
  { slug: "harr", lemma: "حار", teachingForm: "حَارّ", cluster: "A4", source: "EXISTING_720", legacyId: "adjectives-21", category: "adjectives" },
  { slug: "barid", lemma: "بارد", teachingForm: "بَارِد", cluster: "A4", source: "EXISTING_720", legacyId: "adjectives-22", category: "adjectives" },
  { slug: "sari", lemma: "سريع", teachingForm: "سَرِيع", cluster: "A4", source: "EXISTING_720", legacyId: "adjectives-5", category: "adjectives" },
  { slug: "sadiq", lemma: "صديق", teachingForm: "صَدِيق", cluster: "A4", source: "EXISTING_720", legacyId: "family-20", category: "family" },
  { slug: "tabib", lemma: "طبيب", teachingForm: "طَبِيب", cluster: "A4", source: "EXISTING_720", legacyId: "jobs-1", category: "jobs" },
  { slug: "darraja", lemma: "دراجة", teachingForm: "دَرَّاجَة", cluster: "A4", source: "EXISTING_720", legacyId: "transport-3", category: "transport" },
  { slug: "qitar", lemma: "قطار", teachingForm: "قِطَار", cluster: "A4", source: "EXISTING_720", legacyId: "transport-5", category: "transport" },
  { slug: "matbakh", lemma: "مطبخ", teachingForm: "مَطْبَخ", cluster: "A4", source: "EXISTING_720", legacyId: "home-20", category: "home" },
  { slug: "hammam", lemma: "حمام", teachingForm: "حَمَّام", cluster: "A4", source: "EXISTING_720", legacyId: "home-21", category: "home" },
  { slug: "nafidha", lemma: "نافذة", teachingForm: "نَافِذَة", cluster: "A4", source: "EXISTING_720", legacyId: "home-3", category: "home" },
  { slug: "kursi", lemma: "كرسي", teachingForm: "كُرْسِيّ", cluster: "A4", source: "EXISTING_720", legacyId: "home-8", category: "home" },
  { slug: "nahla", lemma: "نحلة", teachingForm: "نَحْلَة", cluster: "A4", source: "EXISTING_720", legacyId: "birds-21", category: "animals" },
  { slug: "farasha", lemma: "فراشة", teachingForm: "فَرَاشَة", cluster: "A4", source: "EXISTING_720", legacyId: "birds-22", category: "animals" },
  { slug: "yaqul", lemma: "يقول", teachingForm: "يَقُولُ", cluster: "A4", source: "NEW_REQUIRED", category: "verbs" },
  { slug: "yati", lemma: "يأتي", teachingForm: "يَأْتِي", cluster: "A4", source: "NEW_REQUIRED", category: "verbs" },
  { slug: "yughliq", lemma: "يغلق", teachingForm: "يُغْلِقُ", cluster: "A4", source: "EXISTING_720", legacyId: "verbs-25", category: "verbs" },
  { slug: "yalbas", lemma: "يلبس", teachingForm: "يَلْبَسُ", cluster: "A4", source: "EXISTING_720", legacyId: "verbs-30", category: "verbs" },
  { slug: "yaghsil", lemma: "يغسل", teachingForm: "يَغْسِلُ", cluster: "A4", source: "EXISTING_720", legacyId: "verbs-29", category: "verbs" },
  { slug: "ladhidh", lemma: "لذيذ", teachingForm: "لَذِيذ", cluster: "A4", source: "EXISTING_720", legacyId: "adjectives-30", category: "adjectives" },
  { slug: "shay", lemma: "شاي", teachingForm: "شَاي", cluster: "A4", source: "EXISTING_720", legacyId: "food-48", category: "food" },
];

type LetterSeed = {
  id: string;
  char: string;
  nameAr: string;
  order: number;
  nonConnecting?: boolean;
  similar?: string[];
};

const LETTER_SEEDS: LetterSeed[] = [
  { id: "alif", char: "ا", nameAr: "أَلِف", order: 1, nonConnecting: true },
  { id: "ba", char: "ب", nameAr: "بَاء", order: 2, similar: ["ta", "tha"] },
  { id: "ta", char: "ت", nameAr: "تَاء", order: 3, similar: ["ba", "tha"] },
  { id: "tha", char: "ث", nameAr: "ثَاء", order: 4, similar: ["ba", "ta"] },
  { id: "jim", char: "ج", nameAr: "جِيم", order: 5, similar: ["ha", "kha"] },
  { id: "ha", char: "ح", nameAr: "حَاء", order: 6, similar: ["jim", "kha"] },
  { id: "kha", char: "خ", nameAr: "خَاء", order: 7, similar: ["jim", "ha"] },
  { id: "dal", char: "د", nameAr: "دَال", order: 8, nonConnecting: true, similar: ["thal"] },
  { id: "thal", char: "ذ", nameAr: "ذَال", order: 9, nonConnecting: true, similar: ["dal"] },
  { id: "ra", char: "ر", nameAr: "رَاء", order: 10, nonConnecting: true, similar: ["zay"] },
  { id: "zay", char: "ز", nameAr: "زَاي", order: 11, nonConnecting: true, similar: ["ra"] },
  { id: "sin", char: "س", nameAr: "سِين", order: 12, similar: ["shin"] },
  { id: "shin", char: "ش", nameAr: "شِين", order: 13, similar: ["sin"] },
  { id: "sad", char: "ص", nameAr: "صَاد", order: 14, similar: ["dad"] },
  { id: "dad", char: "ض", nameAr: "ضَاد", order: 15, similar: ["sad"] },
  { id: "tah", char: "ط", nameAr: "طَاء", order: 16, similar: ["zah"] },
  { id: "zah", char: "ظ", nameAr: "ظَاء", order: 17, similar: ["tah"] },
  { id: "ain", char: "ع", nameAr: "عَيْن", order: 18, similar: ["ghain"] },
  { id: "ghain", char: "غ", nameAr: "غَيْن", order: 19, similar: ["ain"] },
  { id: "fa", char: "ف", nameAr: "فَاء", order: 20, similar: ["qaf"] },
  { id: "qaf", char: "ق", nameAr: "قَاف", order: 21, similar: ["fa"] },
  { id: "kaf", char: "ك", nameAr: "كَاف", order: 22 },
  { id: "lam", char: "ل", nameAr: "لَام", order: 23 },
  { id: "mim", char: "م", nameAr: "مِيم", order: 24 },
  { id: "nun", char: "ن", nameAr: "نُون", order: 25 },
  { id: "haa", char: "ه", nameAr: "هَاء", order: 26 },
  { id: "waw", char: "و", nameAr: "وَاو", order: 27, nonConnecting: true },
  { id: "ya", char: "ي", nameAr: "يَاء", order: 28 },
];

function letterForms(char: string, nonConnecting = false) {
  return nonConnecting
    ? { isolated: char, initial: char, medial: TATWEEL + char, final: TATWEEL + char }
    : { isolated: char, initial: char + TATWEEL, medial: TATWEEL + char + TATWEEL, final: TATWEEL + char };
}

function isHarakaChar(ch: string): boolean {
  return (
    ch === FATHA ||
    ch === DAMMA ||
    ch === KASRA ||
    ch === SUKUN ||
    ch === SHADDA ||
    ch === TANWEEN_FATHA ||
    ch === TANWEEN_DAMMA ||
    ch === TANWEEN_KASRA ||
    ch === SUPER_ALEF ||
    ch === TATWEEL
  );
}

function analyzeTeachingForm(form: string): { letterIds: string[]; skillIds: string[] } {
  const letterIds: string[] = [];
  const addLetter = (id: string) => {
    if (!letterIds.includes(id)) letterIds.push(id);
  };
  const skills = new Set<string>();

  const addMarks = (marks: string, maddCandidate: boolean) => {
    if (marks.includes(FATHA)) skills.add(SKILL.fatha);
    if (marks.includes(KASRA)) skills.add(SKILL.kasra);
    if (marks.includes(DAMMA)) skills.add(SKILL.damma);
    if (marks.includes(SUKUN)) skills.add(SKILL.sukun);
    if (marks.includes(SHADDA)) skills.add(SKILL.shadda);
    const hasVowelOrSukun =
      marks.includes(FATHA) ||
      marks.includes(KASRA) ||
      marks.includes(DAMMA) ||
      marks.includes(SUKUN);
    if (maddCandidate && !hasVowelOrSukun) skills.add(SKILL.madd);
  };

  let i = 0;
  while (i < form.length) {
    const ch = form[i]!;
    if (isHarakaChar(ch)) {
      addMarks(ch, false);
      i += 1;
      continue;
    }
    let j = i + 1;
    let marks = "";
    while (j < form.length && isHarakaChar(form[j]!)) {
      marks += form[j];
      j += 1;
    }

    if (ch === "ء") {
      skills.add(SKILL.hamza);
      addMarks(marks, false);
    } else if (ch === "أ" || ch === "إ" || ch === "آ") {
      addLetter("letter.alif");
      skills.add(SKILL.hamza);
      if (ch === "آ") skills.add(SKILL.madd);
      addMarks(marks, false);
    } else if (ch === "ؤ") {
      addLetter("letter.waw");
      skills.add(SKILL.hamza);
      addMarks(marks, false);
    } else if (ch === "ئ") {
      addLetter("letter.ya");
      skills.add(SKILL.hamza);
      addMarks(marks, false);
    } else if (ch === "ة") {
      addLetter("letter.ta");
      skills.add(SKILL.taaMarbuta);
      addMarks(marks, false);
    } else if (ch === "ى") {
      addLetter("letter.ya");
      skills.add(SKILL.alifMaqsura);
      addMarks(marks, false);
    } else if (ch === "ا") {
      addLetter("letter.alif");
      skills.add(SKILL.madd);
      addMarks(marks, false);
    } else if (ch === "و") {
      addLetter("letter.waw");
      addMarks(marks, true);
    } else if (ch === "ي") {
      addLetter("letter.ya");
      addMarks(marks, true);
    } else {
      const seed = LETTER_SEEDS.find((s) => s.char === ch);
      if (!seed) {
        throw new Error(`Unmapped Arabic character U+${ch.codePointAt(0)!.toString(16)} in "${form}"`);
      }
      addLetter(`letter.${seed.id}`);
      addMarks(marks, false);
    }
    i = j;
  }

  const skillOrder = Object.values(SKILL);
  const skillIds = skillOrder.filter((id) => skills.has(id));
  return { letterIds, skillIds };
}

function skillRecord(
  id: string,
  domain: string,
  nameAr: string,
  nameEn: string,
  prereqSkillIds: string[],
) {
  return {
    id,
    domain,
    nameAr,
    nameEn,
    prereqSkillIds,
    vocabBandHint: "A",
    modality: ["listen", "read"],
  };
}

function main() {
  const slugs = ENTRIES.map((e) => e.slug);
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupes.length) throw new Error(`Duplicate slugs: ${dupes.join(", ")}`);
  if (ENTRIES.length !== 135) throw new Error(`Expected 135 entries, got ${ENTRIES.length}`);

  const skills = [
    skillRecord(SKILL.fatha, "short_vowels", "الْفَتْحَة", "Fatha", []),
    skillRecord(SKILL.kasra, "short_vowels", "الْكَسْرَة", "Kasra", [SKILL.fatha]),
    skillRecord(SKILL.damma, "short_vowels", "الضَّمَّة", "Damma", [SKILL.fatha]),
    skillRecord(SKILL.sukun, "sukun", "السُّكُون", "Sukun", [SKILL.fatha]),
    skillRecord(SKILL.madd, "long_vowels", "الْمَدّ", "Long vowel / madd", [SKILL.fatha]),
    skillRecord(SKILL.shadda, "shadda", "الشَّدَّة", "Shadda", [SKILL.sukun]),
    skillRecord(SKILL.hamza, "letter_sounds", "قِرَاءَةُ الْهَمْزَة", "Hamza reading", [SKILL.fatha]),
    skillRecord(SKILL.taaMarbuta, "letter_forms", "التَّاءُ الْمَرْبُوطَة", "Taa marbuta", [SKILL.fatha]),
    skillRecord(SKILL.alifMaqsura, "letter_forms", "الْأَلِفُ الْمَقْصُورَة", "Alif maqsura", [SKILL.madd]),
  ];

  const letters = LETTER_SEEDS.map((seed) => ({
    id: `letter.${seed.id}`,
    legacyId: seed.id,
    char: seed.char,
    nameAr: seed.nameAr,
    forms: letterForms(seed.char, seed.nonConnecting === true),
    nonConnecting: seed.nonConnecting === true ? true : undefined,
    abjadOrder: seed.order,
    similarLetterIds: seed.similar?.map((id) => `letter.${id}`),
  }));

  const words = ENTRIES.map((entry) => {
    const { letterIds, skillIds } = analyzeTeachingForm(entry.teachingForm);
    const highFrequency = BAND_A_HIGH_FREQUENCY_LEMMAS.has(entry.lemma);
    const word: Record<string, unknown> = {
      id: `word.${entry.slug}`,
      lemma: entry.lemma,
      diacritized: entry.teachingForm,
      teachingForm: entry.teachingForm,
      pos: POS_BY_CATEGORY[entry.category] ?? "noun",
      category: entry.category,
      vocabBand: "A",
      subBand: entry.cluster,
      msaStatus: LOANWORD_LEMMAS.has(entry.lemma) ? "LOANWORD_ACCEPTED" : "STANDARD_MSA",
      letterIds,
      requiredSkillIds: skillIds,
      phonicsSkillIds: skillIds,
      imageAssetId: `image.word.${entry.slug}`,
      audioAssetIds: { citation: `audio.word.${entry.slug}` },
      tags: ["band-a", `cluster-${entry.cluster.toLowerCase()}`],
      status: "active",
    };
    if (entry.legacyId) word["legacyId"] = entry.legacyId;
    if (highFrequency) {
      word["highFrequency"] = true;
      word["frequencyBand"] = "core";
    }
    return word;
  });

  const assets: { id: string; kind: "audio" | "image"; hint: string }[] = [];
  for (const entry of ENTRIES) {
    assets.push({
      id: `audio.word.${entry.slug}`,
      kind: "audio",
      hint: "Logical citation audio; no file shipped in this migration",
    });
    assets.push({
      id: `image.word.${entry.slug}`,
      kind: "image",
      hint: "Logical picture id; no file shipped in this migration",
    });
  }

  const bundle = {
    meta: {
      kind: "production",
      id: BAND_A_PRODUCTION_META_ID,
      title: "Band A v1 — foundational vocabulary",
      description:
        "Approved production Band A lexicon (135 words). Scope only; teaching order is letter/phonics/mastery gated. Not connected to the live React word browser.",
      notProductionCurriculum: false,
    },
    levels: [
      { id: 1, nameAr: "أَتَعَرَّفُ عَلَى الْحُرُوف", nameEn: "Letters I can see, hear, and trace" },
      { id: 2, nameAr: "أَشْكَالٌ وَحَرَكَات", nameEn: "Forms and short vowels" },
      { id: 3, nameAr: "أَدْمُجُ الْأَصْوَات", nameEn: "I can blend" },
      { id: 4, nameAr: "كَلِمَاتِي الْأُولَى", nameEn: "First real word bank" },
      { id: 5, nameAr: "أَسْتَعْمِلُ الْكَلِمَات", nameEn: "Words I can use" },
      { id: 6, nameAr: "لُغَةُ كُلِّ يَوْم", nameEn: "Everyday language" },
      { id: 7, nameAr: "أَفْهَمُ مَا أَقْرَأ", nameEn: "I understand what I read" },
      { id: 8, nameAr: "قِصَصٌ وَاسْتِقْلَال", nameEn: "Stories and independence" },
    ],
    skills,
    letters,
    words,
    sentences: [],
    stories: [],
    informationalTexts: [],
    exercises: [],
    assets,
  };

  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const outDir = join(root, "src/content/curriculum/data/production");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "band-a.json");
  writeFileSync(outPath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
  console.log(`Wrote ${words.length} words to ${outPath}`);
}

main();
