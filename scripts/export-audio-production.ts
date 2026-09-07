/**
 * Canonical audio-production export for the 720-word bank.
 * Reads source vocabulary; does not modify it.
 *
 * Run: node --experimental-strip-types --no-warnings scripts/export-audio-production.ts
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LETTERS } from "../src/content/letters.ts";

interface Word {
  id: string;
  text: string;
  diacritized: string;
  emoji: string;
  category: string;
}

interface Category {
  id: string;
  nameAr: string;
  words: Word[];
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "audio-production");
const BAND_A_PATH = join(ROOT, "src/content/curriculum/data/production/band-a.json");

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
const HAMZA = "\u0621";
const ALEF = "\u0627";
const ALEF_MADDA = "\u0622";
const ALEF_HAMZA_ABOVE = "\u0623";
const WAW_HAMZA = "\u0624";
const ALEF_HAMZA_BELOW = "\u0625";
const YEH_HAMZA = "\u0626";
const TAA_MARBUTA = "\u0629";
const ALIF_MAQSURA = "\u0649";
const WAW = "\u0648";
const YEH = "\u064A";
const LAM = "\u0644";

const HARAKAT = new Set([
  FATHA,
  DAMMA,
  KASRA,
  SUKUN,
  SHADDA,
  TANWEEN_FATHA,
  TANWEEN_DAMMA,
  TANWEEN_KASRA,
  SUPER_ALEF,
  TATWEEL,
]);

/** Consonant map aligned with letters.ts ids (short ASCII, not baa/taa/jiim). */
const CONSONANT: Record<string, string> = {
  "\u0628": "b",
  "\u062A": "t",
  "\u062B": "th",
  "\u062C": "j",
  "\u062D": "h",
  "\u062E": "kh",
  "\u062F": "d",
  "\u0630": "dh",
  "\u0631": "r",
  "\u0632": "z",
  "\u0633": "s",
  "\u0634": "sh",
  "\u0635": "s",
  "\u0636": "d",
  "\u0637": "t",
  "\u0638": "z",
  "\u0639": "",
  "\u063A": "gh",
  "\u0641": "f",
  "\u0642": "q",
  "\u0643": "k",
  "\u0644": "l",
  "\u0645": "m",
  "\u0646": "n",
  "\u0647": "h",
  "\u0648": "w",
  "\u064A": "y",
};

interface BandAWord {
  id: string;
  lemma: string;
  diacritized: string;
  teachingForm?: string;
  legacyId?: string;
  audioAssetIds?: { citation?: string };
}

interface Row {
  index: number;
  content_id: string;
  legacy_id: string;
  arabic: string;
  diacritized: string;
  audio_asset_id: string;
  audio_basename: string;
  audio_filename: string;
  category: string;
  source: string;
  status: "existing" | "new" | "shared_duplicate";
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function csvLine(cells: Array<string | number>): string {
  return cells.map(csvCell).join(",");
}

function isFilenameSafe(basename: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(basename);
}

function vowelFromMarks(marks: string): string {
  if (marks.includes(FATHA) || marks.includes(TANWEEN_FATHA) || marks.includes(SUPER_ALEF)) return "a";
  if (marks.includes(DAMMA) || marks.includes(TANWEEN_DAMMA)) return "u";
  if (marks.includes(KASRA) || marks.includes(TANWEEN_KASRA)) return "i";
  return "";
}

/**
 * Technical filename slug from diacritized Arabic.
 * Not academic romanization. Vowels come from harakat; consonants follow letters.ts.
 */
function slugFromArabic(diacritized: string): string {
  const chars = [...diacritized.normalize("NFC")];
  let out = "";
  let i = 0;

  const takeMarks = (): string => {
    let marks = "";
    while (i < chars.length && HARAKAT.has(chars[i]!)) {
      if (chars[i] !== TATWEEL) marks += chars[i];
      i += 1;
    }
    return marks;
  };

  while (i < chars.length) {
    const ch = chars[i]!;
    if (ch === " " || ch === "\u00A0") {
      if (out.length && !out.endsWith("_")) out += "_";
      i += 1;
      continue;
    }
    if (HARAKAT.has(ch) || ch === TATWEEL) {
      i += 1;
      continue;
    }

    if (
      (ch === ALEF || ch === ALEF_HAMZA_ABOVE || ch === ALEF_HAMZA_BELOW) &&
      chars[i + 1] === LAM
    ) {
      const rest = chars.slice(i + 2).join("");
      if (out.endsWith("_") || out.length === 0) {
        out += "al";
        i += 2;
        continue;
      }
      void rest;
    }

    if (ch === TAA_MARBUTA) {
      i += 1;
      takeMarks();
      if (!out.endsWith("a")) out += "a";
      continue;
    }
    if (ch === ALIF_MAQSURA) {
      i += 1;
      takeMarks();
      if (!out.endsWith("a")) out += "a";
      continue;
    }

    if (ch === ALEF_MADDA) {
      i += 1;
      takeMarks();
      out += out.endsWith("a") ? "a" : "aa";
      continue;
    }

    if (ch === HAMZA || ch === ALEF || ch === ALEF_HAMZA_ABOVE || ch === ALEF_HAMZA_BELOW) {
      i += 1;
      const marks = takeMarks();
      const v = vowelFromMarks(marks);
      if (v) {
        if (ch === ALEF && v === "a" && out.endsWith("a")) out += "a";
        else if (!(v === "a" && out.endsWith("a") && ch === ALEF)) out += v;
        else out += "a";
      } else if (ch === ALEF && out.endsWith("a")) {
        out += "a";
      } else if (out.length === 0) {
        out += v || "a";
      }
      continue;
    }

    if (ch === WAW_HAMZA) {
      i += 1;
      const marks = takeMarks();
      out += "w" + vowelFromMarks(marks);
      continue;
    }
    if (ch === YEH_HAMZA) {
      i += 1;
      const marks = takeMarks();
      out += "y" + vowelFromMarks(marks);
      continue;
    }

    if (ch === WAW || ch === YEH) {
      const cons = ch === WAW ? "w" : "y";
      i += 1;
      const marks = takeMarks();
      const v = vowelFromMarks(marks);
      const doubled = marks.includes(SHADDA);
      if (!v && (out.endsWith("u") && ch === WAW || out.endsWith("i") && ch === YEH)) {
        continue;
      }
      if (!v && !doubled) {
        if (ch === WAW && (out.endsWith("u") || out.length === 0)) {
          if (!out.endsWith("u")) out += "u";
          continue;
        }
        if (ch === YEH && (out.endsWith("i") || out.length === 0)) {
          if (!out.endsWith("i")) out += "i";
          continue;
        }
      }
      let piece = cons;
      if (doubled) piece += cons;
      piece += v;
      out += piece;
      continue;
    }

    const cons = CONSONANT[ch];
    if (cons === undefined) {
      i += 1;
      continue;
    }
    i += 1;
    const marks = takeMarks();
    let piece = cons;
    if (marks.includes(SHADDA) && cons) piece += cons;
    const v = vowelFromMarks(marks);
    if (cons === "" && v) {
      if (v === "a" && out.endsWith("a")) out += "a";
      else out += v;
    } else {
      out += piece + v;
    }
  }

  out = out.replace(/_+/g, "_").replace(/^_|_$/g, "").replace(/aa+/g, "aa");
  if (!out) out = "item";
  if (!/^[a-z]/.test(out)) out = `w_${out}`;
  return out;
}

/** Same strip as src/content/words/types.ts — duplicated so we never import the barrel. */
const STRIP_HARAKAT = /[\u064B-\u0652\u0670\u0640]/g;

function stripLemma(s: string): string {
  return s.replace(STRIP_HARAKAT, "");
}

function loadWordBank(): { categories: Category[]; all: Word[] } {
  const indexSrc = readFileSync(join(ROOT, "src/content/words/index.ts"), "utf8");
  const order: Array<{ id: string; nameAr: string }> = [];
  const catRe = /\{\s*id:\s*"([a-z]+)",\s*nameAr:\s*"([^"]+)"/g;
  for (const m of indexSrc.matchAll(catRe)) {
    order.push({ id: m[1]!, nameAr: m[2]! });
  }
  if (order.length === 0) throw new Error("Could not parse CATEGORIES from src/content/words/index.ts");

  const byId = new Map<string, Word[]>();
  for (const part of ["part1.ts", "part2.ts", "part3.ts", "part4.ts"]) {
    const src = readFileSync(join(ROOT, "src/content/words", part), "utf8");
    const blockRe = /build\("([a-z]+)",\s*\[([\s\S]*?)\]\)/g;
    for (const m of src.matchAll(blockRe)) {
      const category = m[1]!;
      const body = m[2]!;
      const words: Word[] = [];
      const rowRe = /\["([^"]+)"\s*,\s*"([^"]*)"\]/g;
      for (const row of body.matchAll(rowRe)) {
        const diacritized = row[1]!;
        words.push({
          id: `${category}-${words.length + 1}`,
          text: stripLemma(diacritized),
          diacritized,
          emoji: row[2]!,
          category,
        });
      }
      if (words.length === 0) throw new Error(`No words parsed for ${category} in ${part}`);
      byId.set(category, words);
    }
  }

  const categories: Category[] = order.map((c) => {
    const words = byId.get(c.id);
    if (!words) throw new Error(`Category ${c.id} listed in index.ts but not found in part files`);
    return { id: c.id, nameAr: c.nameAr, words };
  });
  for (const id of byId.keys()) {
    if (!order.some((c) => c.id === id)) {
      throw new Error(`Category ${id} exists in part files but not in index.ts CATEGORIES`);
    }
  }
  return { categories, all: categories.flatMap((c) => c.words) };
}

function lemmasCompatible(word: Word, band: BandAWord): boolean {
  const wordLemma = stripLemma(word.text);
  const bandLemma = stripLemma(band.lemma);
  if (wordLemma === bandLemma) return true;
  const teaching = band.teachingForm ?? band.diacritized;
  if (word.diacritized === teaching || word.diacritized === band.diacritized) return true;
  return stripLemma(teaching) === wordLemma;
}

function loadBandA(): BandAWord[] {
  const raw = JSON.parse(readFileSync(BAND_A_PATH, "utf8")) as { words: BandAWord[] };
  return raw.words;
}

function writeUtf8(path: string, body: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body.endsWith("\n") ? body : `${body}\n`, "utf8");
}

function main(): void {
  const { categories: CATEGORIES, all: ALL_WORDS } = loadWordBank();
  const bandA = loadBandA();
  const byLegacy = new Map<string, BandAWord>();
  const byLemma = new Map<string, BandAWord[]>();
  for (const w of bandA) {
    if (w.legacyId) byLegacy.set(w.legacyId, w);
    const list = byLemma.get(w.lemma) ?? [];
    list.push(w);
    byLemma.set(w.lemma, list);
  }

  if (ALL_WORDS.length !== 720) {
    console.warn(`Source word count is ${ALL_WORDS.length}, not 720.`);
  }
  if (CATEGORIES.length !== 19) {
    console.warn(`Source category count is ${CATEGORIES.length}, not 19.`);
  }

  const rows: Row[] = [];
  const review: string[] = [];
  const note = (line: string): void => {
    if (!review.includes(line)) review.push(line);
  };
  const duplicateGroups = new Map<string, string[]>();

  const resolveIdentity = (word: Word): { content_id: string; audio_asset_id: string; basename: string; source: string; status: Row["status"] } => {
    const band = byLegacy.get(word.id);
    const legacyCompatible = band ? lemmasCompatible(word, band) : false;
    if (band && !legacyCompatible) {
      note(
        `stale Band A legacyId: ${word.id} points to ${band.id} (${band.lemma}) but 720 row is ${word.text}; ignored; identity resolved by lemma/slug`,
      );
    }
    if (band && legacyCompatible) {
      const slug = band.id.replace(/^word\./, "");
      return {
        content_id: band.id,
        audio_asset_id: band.audioAssetIds?.citation ?? `audio.${band.id}`,
        basename: slug,
        source: "band-a+720",
        status: "existing",
      };
    }
    const lemmaHits = byLemma.get(word.text) ?? [];
    const exactHits = lemmaHits.filter((w) => (w.teachingForm ?? w.diacritized) === word.diacritized);
    const exact = exactHits.length === 1 ? exactHits[0] : undefined;
    const unique = lemmaHits.length === 1 ? lemmaHits[0] : undefined;
    const sameLemma720 = ALL_WORDS.filter((w) => w.text === word.text);
    const allSameVocalization = sameLemma720.every(
      (w) => w.diacritized.normalize("NFC") === word.diacritized.normalize("NFC"),
    );
    const bandMatch = exact ?? (unique && allSameVocalization ? unique : undefined);
    if (bandMatch) {
      if (unique && !exact) {
        note(
          `${word.id} lemma "${word.text}" uniquely matches Band A ${bandMatch.id} but teaching form differs (720=${word.diacritized} band-a=${bandMatch.teachingForm ?? bandMatch.diacritized}); identity preserved, TTS uses 720 text`,
        );
      }
      const slug = bandMatch.id.replace(/^word\./, "");
      return {
        content_id: bandMatch.id,
        audio_asset_id: bandMatch.audioAssetIds?.citation ?? `audio.${bandMatch.id}`,
        basename: slug,
        source: exact ? "band-a-lemma" : "band-a-lemma-diacritic-mismatch",
        status: "existing",
      };
    }
    if (lemmaHits.length > 1 && exactHits.length !== 1) {
      note(`${word.id} lemma "${word.text}" matches multiple Band A rows; no unique/exact teaching-form match`);
    }
    if (unique && !allSameVocalization && !exact) {
      note(
        `${word.id} lemma "${word.text}" has multiple 720 vocalizations; not auto-bound to Band A ${unique.id}`,
      );
    }
    let basename = slugFromArabic(word.diacritized);
    const content_id = `word.${basename}`;
    return {
      content_id,
      audio_asset_id: `audio.word.${basename}`,
      basename,
      source: "720",
      status: "new",
    };
  };

  for (const word of ALL_WORDS) {
    const key = word.diacritized.normalize("NFC");
    const list = duplicateGroups.get(key) ?? [];
    list.push(word.id);
    duplicateGroups.set(key, list);
  }

  const basenameOwners = new Map<string, string>();
  const assetByDiacritics = new Map<string, { content_id: string; audio_asset_id: string; audio_basename: string; source: string }>();

  const finalizeBasename = (
    word: Word,
    identity: { content_id: string; audio_asset_id: string; basename: string; source: string; status: Row["status"] },
  ) => {
    let basename = identity.basename;
    if (!isFilenameSafe(basename)) {
      basename = basename.replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_");
      if (!/^[a-z]/.test(basename)) basename = `w_${basename}`;
      review.push(`${word.id} slug sanitized to ${basename}`);
    }
    const ownerLemma = basenameOwners.get(basename);
    if (ownerLemma && ownerLemma !== word.text) {
      let n = 2;
      let candidate = `${basename}_${n}`;
      while (basenameOwners.has(candidate)) {
        n += 1;
        candidate = `${basename}_${n}`;
      }
      review.push(`filename collision: ${basename} for "${ownerLemma}" vs "${word.text}" → ${candidate}`);
      basename = candidate;
    }
    basenameOwners.set(basename, word.text);
    return {
      content_id: identity.status === "existing" ? identity.content_id : `word.${basename}`,
      audio_asset_id: identity.status === "existing" ? identity.audio_asset_id : `audio.word.${basename}`,
      audio_basename: basename,
      source: identity.source,
    };
  };

  const ownerLegacyByDiacritics = new Map<string, string>();
  for (const word of ALL_WORDS) {
    const key = word.diacritized.normalize("NFC");
    if (assetByDiacritics.has(key)) continue;
    const group = ALL_WORDS.filter((w) => w.diacritized.normalize("NFC") === key);
    const preferred =
      group.find((w) => {
        const b = byLegacy.get(w.id);
        return Boolean(b && lemmasCompatible(w, b));
      }) ??
      group.find((w) => (byLemma.get(w.text) ?? []).some((b) => lemmasCompatible(w, b))) ??
      group[0]!;
    ownerLegacyByDiacritics.set(key, preferred.id);
    assetByDiacritics.set(key, finalizeBasename(preferred, resolveIdentity(preferred)));
  }

  for (const word of ALL_WORDS) {
    const key = word.diacritized.normalize("NFC");
    const shared = assetByDiacritics.get(key)!;
    const own = resolveIdentity(word);
    const ownerLegacy = ownerLegacyByDiacritics.get(key);
    const status: Row["status"] =
      word.id === ownerLegacy ? (own.status === "existing" ? "existing" : "new") : "shared_duplicate";

    rows.push({
      index: 0,
      content_id: shared.content_id,
      legacy_id: word.id,
      arabic: word.text,
      diacritized: word.diacritized,
      audio_asset_id: shared.audio_asset_id,
      audio_basename: shared.audio_basename,
      audio_filename: `${shared.audio_basename}.mp3`,
      category: word.category,
      source: own.source,
      status,
    });
  }

  rmSync(join(OUT, "words"), { recursive: true, force: true });
  mkdirSync(join(OUT, "naming"), { recursive: true });
  mkdirSync(join(OUT, "words"), { recursive: true });

  const wordHeader = [
    "index",
    "content_id",
    "legacy_id",
    "arabic",
    "diacritized",
    "audio_asset_id",
    "audio_basename",
    "audio_filename",
    "category",
  ];
  const namingHeader = ["content_type", ...wordHeader, "source", "status"];

  const masterLines = [csvLine(wordHeader)];
  const namingLines = [csvLine(namingHeader)];
  const partIndex: Array<{
    part: string;
    categoryId: string;
    nameAr: string;
    count: number;
    tts: string;
    manifest: string;
  }> = [];

  let globalIndex = 0;
  CATEGORIES.forEach((cat, partNo) => {
    const partNum = String(partNo + 1).padStart(2, "0");
    const folder = `part-${partNum}-${cat.id}`;
    const dir = join(OUT, "words", folder);
    mkdirSync(dir, { recursive: true });
    const partRows = rows.filter((r) => r.category === cat.id);
    if (partRows.length !== cat.words.length) {
      throw new Error(`Category ${cat.id}: ${partRows.length} rows vs ${cat.words.length} source words`);
    }

    const manifestLines = [csvLine(wordHeader)];
    const spoken: string[] = [];
    partRows.forEach((row, i) => {
      globalIndex += 1;
      row.index = i + 1;
      const numbered = { ...row, index: i + 1 };
      const wordCells = [
        numbered.index,
        numbered.content_id,
        numbered.legacy_id,
        numbered.arabic,
        numbered.diacritized,
        numbered.audio_asset_id,
        numbered.audio_basename,
        numbered.audio_filename,
        numbered.category,
      ];
      manifestLines.push(csvLine(wordCells));
      masterLines.push(
        csvLine([
          globalIndex,
          numbered.content_id,
          numbered.legacy_id,
          numbered.arabic,
          numbered.diacritized,
          numbered.audio_asset_id,
          numbered.audio_basename,
          numbered.audio_filename,
          numbered.category,
        ]),
      );
      namingLines.push(
        csvLine([
          "word",
          globalIndex,
          numbered.content_id,
          numbered.legacy_id,
          numbered.arabic,
          numbered.diacritized,
          numbered.audio_asset_id,
          numbered.audio_basename,
          numbered.audio_filename,
          numbered.category,
          numbered.source,
          numbered.status,
        ]),
      );
      spoken.push(numbered.diacritized);
    });

    const tts = spoken.join("\n[silence]\n");
    const silences = spoken.length <= 1 ? 0 : spoken.length - 1;
    const silenceCount = (tts.match(/\[silence\]/g) ?? []).length;
    if (silenceCount !== silences) {
      throw new Error(`${folder}: silence count ${silenceCount} != ${silences}`);
    }
    if (spoken.length > 0 && tts.endsWith("[silence]")) {
      throw new Error(`${folder}: trailing [silence]`);
    }
    const ttsSpoken = tts.split("\n[silence]\n");
    if (ttsSpoken.length !== spoken.length || ttsSpoken.some((s, i) => s !== spoken[i])) {
      throw new Error(`${folder}: tts.txt order != manifest order`);
    }

    writeUtf8(join(dir, "manifest.csv"), manifestLines.join("\n"));
    writeUtf8(join(dir, "tts.txt"), tts);
    partIndex.push({
      part: folder,
      categoryId: cat.id,
      nameAr: cat.nameAr,
      count: partRows.length,
      tts: `audio-production/words/${folder}/tts.txt`,
      manifest: `audio-production/words/${folder}/manifest.csv`,
    });
  });

  writeUtf8(join(OUT, "words", "manifest-all.csv"), masterLines.join("\n"));
  writeUtf8(join(OUT, "naming", "audio-naming-contract.csv"), namingLines.join("\n"));

  for (const p of partIndex) {
    const ttsBody = readFileSync(join(ROOT, p.tts), "utf8").replace(/\n$/, "");
    const manBody = readFileSync(join(ROOT, p.manifest), "utf8").trimEnd().split(/\r?\n/);
    const manRows = manBody.slice(1);
    const spoken = ttsBody.length === 0 ? [] : ttsBody.split("\n[silence]\n");
    if (spoken.length !== manRows.length) {
      throw new Error(`${p.part}: on-disk tts items ${spoken.length} != manifest rows ${manRows.length}`);
    }
    manRows.forEach((line, i) => {
      const cols = parseCsvLine(line);
      const dia = cols[4];
      if (spoken[i] !== dia) {
        throw new Error(`${p.part} row ${i + 1}: tts "${spoken[i]}" != manifest diacritized "${dia}"`);
      }
    });
    const silences = (ttsBody.match(/\[silence\]/g) ?? []).length;
    if (silences !== Math.max(0, spoken.length - 1)) {
      throw new Error(`${p.part}: on-disk silence count ${silences} != ${spoken.length - 1}`);
    }
  }

  const dupLines = ["diacritized,count,legacy_ids,audio_asset_id,decision"];
  for (const [dia, ids] of [...duplicateGroups.entries()].sort((a, b) => b[1].length - a[1].length)) {
    if (ids.length < 2) continue;
    dupLines.push(
      csvLine([
        dia,
        ids.length,
        ids.join("|"),
        assetByDiacritics.get(dia)?.audio_asset_id ?? "",
        "same pronunciation — one canonical audio asset; later rows status=shared_duplicate. Distinct teaching senses (if any) still share this citation recording.",
      ]),
    );
  }
  writeUtf8(join(OUT, "naming", "duplicate-decisions.csv"), dupLines.join("\n"));

  const letterLines = [
    csvLine(["index", "letter_id", "arabic", "audio_asset_id", "audio_basename", "audio_filename"]),
  ];
  let letterIndex = 0;
  for (const letter of LETTERS) {
    for (const variant of ["name", "sound"] as const) {
      letterIndex += 1;
      const basename = `${letter.id}_${variant}`;
      letterLines.push(
        csvLine([
          letterIndex,
          letter.id,
          letter.char,
          `audio.letter.${letter.id}.${variant}`,
          basename,
          `${basename}.mp3`,
        ]),
      );
    }
  }
  writeUtf8(join(OUT, "naming", "letters-audio-manifest.csv"), letterLines.join("\n"));

  writeNamingReadme();
  writeWordsReadme(partIndex, rows, duplicateGroups);
  writeTransliterationAppendix();

  validate(rows, partIndex, catList(CATEGORIES), ALL_WORDS.length, review);

  const senseNotes = [
    "sense check (shared audio): زَوْج family-25 husband vs numbers-20 pair/even — identical citation form zawj.mp3",
    "sense check (shared audio): قَرِيب family-37 relative vs adjectives-39 nearby — identical citation form qarib.mp3",
    "sense check (shared audio): وَرَقَة school-17 paper vs nature-4 leaf — identical citation form waraqa.mp3",
  ];
  for (const line of senseNotes) note(line);

  console.log(`Exported ${rows.length} words in ${CATEGORIES.length} parts.`);
  console.log(`Shared duplicate groups: ${[...duplicateGroups.values()].filter((x) => x.length > 1).length}`);
  console.log(`Human-review notes: ${review.length}`);
  if (review.length) {
    writeUtf8(join(OUT, "naming", "human-review.txt"), review.join("\n"));
    for (const line of review) console.log("REVIEW:", line);
  }
}

function catList(cats: Category[]): Map<string, number> {
  return new Map(cats.map((c) => [c.id, c.words.length]));
}

function validate(
  rows: Row[],
  parts: Array<{ categoryId: string; count: number; part: string }>,
  sourceCounts: Map<string, number>,
  sourceTotal: number,
  review: string[],
): void {
  if (rows.length !== sourceTotal) {
    throw new Error(`export ${rows.length} != source ${sourceTotal}`);
  }
  for (const [id, n] of sourceCounts) {
    const got = rows.filter((r) => r.category === id).length;
    if (got !== n) throw new Error(`category ${id}: export ${got} != source ${n}`);
  }
  const partsSeen = new Set<string>();
  for (const p of parts) {
    if (partsSeen.has(p.part)) throw new Error(`duplicate part ${p.part}`);
    partsSeen.add(p.part);
  }
  const uniqueLegacy = new Set(rows.map((r) => r.legacy_id));
  if (uniqueLegacy.size !== rows.length) throw new Error("duplicate legacy_id in export");
  for (const row of rows) {
    if (!isFilenameSafe(row.audio_basename)) {
      throw new Error(`unsafe basename ${row.audio_basename} (${row.legacy_id})`);
    }
    if (row.audio_filename !== `${row.audio_basename}.mp3`) {
      throw new Error(`filename mismatch ${row.audio_filename}`);
    }
    if (!row.audio_asset_id.startsWith("audio.word.")) {
      throw new Error(`bad asset id ${row.audio_asset_id}`);
    }
    if (/[^\u0000-\u007F]/.test(row.audio_filename)) {
      throw new Error(`non-ASCII filename ${row.audio_filename}`);
    }
  }
  const firstFile = new Map<string, string>();
  const diaToFile = new Map<string, string>();
  for (const row of rows) {
    const prev = firstFile.get(row.audio_filename);
    if (prev && prev !== row.diacritized) {
      throw new Error(`filename ${row.audio_filename} used for different diacritized forms`);
    }
    if (!prev) firstFile.set(row.audio_filename, row.diacritized);
    const dia = row.diacritized.normalize("NFC");
    const mapped = diaToFile.get(dia);
    if (mapped && mapped !== row.audio_filename) {
      throw new Error(`diacritized ${row.diacritized} mapped to both ${mapped} and ${row.audio_filename}`);
    }
    diaToFile.set(dia, row.audio_filename);
  }
  void review;
}

function writeNamingReadme(): void {
  writeUtf8(
    join(OUT, "naming", "README.md"),
    `# Audio naming contract

Authoritative filenames for Hurufi Al Arabiya word (and letter) audio.
When a long TTS file is split, every clip **must** use \`audio_filename\` from the matching manifest row. Do not rename afterward.

## Identities

| Identity | Example | Stable when |
| --- | --- | --- |
| Content ID | \`word.qalam\` or 720-only \`word.himar\` | Lexical item, not array index |
| Legacy ID | \`school-8\` | Prototype 720-bank positional id (\`category-n\`) |
| Logical audio ID | \`audio.word.qalam\` | Same slug as content id after \`word.\` |
| Physical file | \`qalam.mp3\` | \`audio_basename\` + distribution extension |

A reorder of \`src/content/words\` must not change an already published \`audio_filename\`. This folder is the freeze.

## Distribution format

- \`audio_filename\` ends in **\`.mp3\`** (offline app asset).
- \`audio_basename\` has no extension (\`qalam\`).
- A WAV master is the same basename: \`qalam.wav\`.
- No \`.mp3\` / \`.wav\` / \`.m4a\` files ship in the repo today. Docs mention \`.m4a\` only as an \`AudioManager.register\` *example*. This contract adopts **MP3** for distribution names.

## Filename rules

- lowercase ASCII \`[a-z][a-z0-9_]*\`
- no Arabic, spaces, or punctuation other than underscore
- Android-asset-safe (no leading digits)
- derived from Band A slugs when the 720 row maps to Band A; otherwise from the technical slugger (see below)

## Letter IDs (existing prototype — do not “fix” to baa/taa/jiim)

From \`src/content/letters.ts\`:

\`alif ba ta tha jim ha kha dal thal ra zay sin shin sad dad tah zah ain ghain fa qaf kaf lam mim nun haa waw ya\`

ح = \`ha\`, ه = \`haa\`. ج = \`jim\` (not jeem/jiim). ب = \`ba\` (not baa).

Letter files (not produced in this word export):

- \`audio.letter.ba.name\` → \`ba_name.mp3\`
- \`audio.letter.ba.sound\` → \`ba_sound.mp3\`

Wave 1 uses \`.sound\` (not architecture \`.phoneme\`). This contract follows the live Wave 1 id. Do not mass-rename; there are **no** physical letter files yet.

## Word slugger (720 rows not in Band A)

Not academic romanization. Harakat → \`a i u\`; sukun → no vowel; shadda → doubled consonant; ة/ى → \`a\`; ذ → \`dh\`; ث → \`th\`; خ → \`kh\`; غ → \`gh\`; ع → omitted (vowel only); ص/س → \`s\`; ض/د → \`d\`; ط/ت → \`t\`; ظ/ز → \`z\`. See \`transliteration.md\`.

Band A slugs already assigned (\`qalam\`, \`qitt\`, \`maa\`, \`udhun\`, …) **win** over the slugger when the 720 row matches that lexical item.

Do **not** trust a Band A \`legacyId\` if the 720 row at that positional id is a different lemma (the 720 \`category-n\` ids shift if the array is edited). Match by lemma / teaching form instead. Positional \`legacyId\` is used only when it still names the same word.

## Duplicates

Same **exact diacritized** string → one \`audio_asset_id\` / \`audio_filename\`. Later 720 rows get \`status=shared_duplicate\`. They still appear in that category’s \`tts.txt\` so spoken order = manifest order. After splitting, keep the first produced file for that \`audio_filename\`; later identical filenames reuse it.

Different diacritics on the same undiacritized lemma → different assets.

## Splitting invariant

When a long TTS recording is produced from:

\`audio-production/words/part-XX-<category>/tts.txt\`

the recording must be split according to:

\`audio-production/words/part-XX-<category>/manifest.csv\`

If N spoken segments are detected:

N MUST equal the number of manifest data rows.

If the counts differ: **STOP**.

- Do not guess filenames.
- Do not shift assignments.
- Do not silently discard a segment.

Spoken segment 1 = manifest row \`index\` 1 = that row’s \`audio_filename\`.
Spoken segment 2 = manifest row \`index\` 2 = that row’s \`audio_filename\`.

Manifests are authoritative during splitting.
`,
  );
}

function writeTransliterationAppendix(): void {
  writeUtf8(
    join(OUT, "naming", "transliteration.md"),
    `# Technical filename transliteration

Used only when a 720-word row has no Band A slug. Output is a basename, not a linguistic transcription.

## Consonants (letters.ts short forms)

| Arabic | Basename letters |
| --- | --- |
| ا أ إ آ ء | vowel / madd only (no \`alif\` in the middle of a word slug) |
| ب | b |
| ت | t |
| ث | th |
| ج | j |
| ح | h |
| خ | kh |
| د | d |
| ذ | dh |
| ر | r |
| ز | z |
| س | s |
| ش | sh |
| ص | s |
| ض | d |
| ط | t |
| ظ | z |
| ع | (omit; keep the haraka vowel, \`aa\` if it follows \`a\`) |
| غ | gh |
| ف | f |
| ق | q |
| ك | k |
| ل | l |
| م | m |
| ن | n |
| ه | h |
| و | w (or madd \`u\` after damma) |
| ي | y (or madd \`i\` after kasra) |
| ة ى | a |
| ؤ | w + vowel |
| ئ | y + vowel |
| ال (word-initial after space or start) | al |

## Vowels

| Mark | Latin |
| --- | --- |
| fatha / tanween fatha | a |
| kasra / tanween kasra | i |
| damma / tanween damma | u |
| sukun | (none) |
| shadda | double the consonant |

Diacritics never appear in filenames.

## Collisions

If two **different** undiacritized lemmas slug to the same basename, the later lemma in \`CATEGORIES\` order gets \`_2\`, \`_3\`, … That assignment is frozen in \`audio-naming-contract.csv\`.
`,
  );
}

function writeWordsReadme(
  parts: Array<{ part: string; categoryId: string; nameAr: string; count: number; tts: string; manifest: string }>,
  rows: Row[],
  duplicateGroups: Map<string, string[]>,
): void {
  const lines = [
    "# Word TTS batches",
    "",
    "Part order = \`CATEGORIES\` in \`src/content/words/index.ts\` (live app order). Do not merge categories.",
    "",
    "| Part | Category ID | Arabic name | Items | TTS | Manifest |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const p of parts) {
    lines.push(`| ${p.part} | ${p.categoryId} | ${p.nameAr} | ${p.count} | \`${p.tts}\` | \`${p.manifest}\` |`);
  }
  const dupGroups = [...duplicateGroups.values()].filter((x) => x.length > 1);
  lines.push("");
  lines.push(`**Total items:** ${rows.length}`);
  lines.push(`**Parts:** ${parts.length}`);
  lines.push(`**Shared-pronunciation groups:** ${dupGroups.length}`);
  lines.push("");
  lines.push("Master lookup: \`audio-production/words/manifest-all.csv\` (production order = all parts concatenated).");
  lines.push("");
  lines.push("## Split rule");
  lines.push("");
  lines.push("When a long TTS recording is produced from `part-XX-category/tts.txt`, split it using `part-XX-category/manifest.csv` only.");
  lines.push("");
  lines.push("If N spoken segments are detected, N MUST equal the number of manifest data rows.");
  lines.push("");
  lines.push("If the counts differ: STOP. Do not guess filenames. Do not shift assignments. Do not silently discard a segment.");
  lines.push("");
  lines.push("Spoken segment 1 = manifest row 1 = that row’s `audio_filename`.");
  writeUtf8(join(OUT, "words", "README.md"), lines.join("\n"));
}

main();
