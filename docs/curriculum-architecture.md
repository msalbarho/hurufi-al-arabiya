# Hurufi Al Arabiya — Curriculum and Content Architecture

**Status:** architecture / analysis only (revision 2). No source, dataset, UI, or progress files were modified in this pass.  
**Companion audit:** `docs/word-curriculum-audit.md`  
**Language policy:** العربية الفصحى المعاصرة الواضحة والمناسبة للأطفال  
**Prototype:** React 19 + TypeScript + TanStack Start (fast iteration).  
**Primary destination:** native Android (Kotlin + Jetpack Compose).

Educational content must be **platform-neutral structured data**. React components, CSS, Zustand, and routes are presentation. They must not be the source of truth for the curriculum.

The product is not judged by how many games it has. It is judged by **what measurable literacy skill each activity teaches**. Every meaningful activity must eventually declare a learning objective. Stars motivate; evidence determines progress.

---

## How to read this document

This is the permanent learning architecture for حُرُوفِي العَرَبِيَّة. It answers:

1. What a child learns, in what order, and why.
2. How content (letters, skills, words, sentences, stories, informational texts, exercises) should be stored so it can later export to Kotlin with almost no rewriting.
3. What the current repository already provides, and what to keep vs extend vs replace later.

Two different “level” systems are used on purpose:

| System | Meaning | Count |
| --- | --- | --- |
| **Learner levels 1–8** | The child’s journey through the app (islands / map) | 8 |
| **Vocabulary bands A–D** | How large and hard the word list is | 4 bands, growing toward 750–1000+ |
| **Skill graph** | Educational engine underneath the map | ~20 domains with prerequisites |

Do not confuse them. A learner can be on **Level 5** (sentences) while still adding **Band A** words and reviewing **letter-sound** skills.

### Decisions that stay unless evidence forces a change

- Approximately **8** mastery-based learner levels, **not** strictly age-locked
- Band A / foundational vocabulary **120–150** words (**v1 approved: 135** — `docs/band-a-vocabulary-plan.md`); catalog grows toward **750–1000+**
- Portable curriculum; long-term canonical form is **JSON + JSON Schema**
- React is the reference prototype; Kotlin + Jetpack Compose is the Android target
- Offline-first core curriculum
- Extend existing letters, mastery rules, progress store, and AudioManager asset ids
- Tracing stays; stroke-order is a later engine upgrade
- MSA-first; decode before memorize; 720 audited words are an inventory to incorporate, not a dictionary to dump

### Contents

0. Current foundations  
1. Learning journey (stages)  
1b. Skill graph  
2. Eight learner levels  
3. Word curriculum, frequency, recycling  
4. Letter model  
5. Phonics model  
6. Sentence model  
7. Story model  
7b. Informational / nonfiction texts  
7c. Grammar through usage  
8. Exercise architecture and learning objectives  
9. Mastery, three assessments, smart review  
10. Session engine  
10b. Child-facing learning map  
11. Writing as a real skill  
12. Assets  
13. Parent skill map  
14. Future school compatibility  
15. Offline-first  
16. Kotlin portability  
16b. Content relationships and validation  
17. Gap analysis  
18. Roadmap (NOW / NEXT / LATER / FUTURE)  
19. Product principles  
20. Competitive-inspiration register  
21. Final architecture check

---

## 0. What already exists (foundations to reuse)

Inspected: `src/content`, `src/content/words`, `src/routes/{letters,words,diacritics,sentences,stories,parents}`, `src/lib/progress`, `src/lib/audio`, `src/lib/rules`, `src/components/kids`.

### Reusable foundations (do not throw away)

| Foundation | Where | Why it matters |
| --- | --- | --- |
| 28-letter model with forms, order, similar letters, example word | `src/content/letters.ts` | Already close to a portable Letter entity. Comment even says the final form is `letters.json`. |
| Word records: `id`, `text`, `diacritized`, `emoji`, `category` | `src/content/words` | 720-item inventory to **level and repair**, not discard. |
| Pure mastery rules | `src/lib/rules/mastery.ts` | Explicitly “no React, no storage; port 1:1 to Kotlin”. |
| Progress store: seen/attempt, stars, daily minutes, streak, profile | `src/lib/progress/store.ts` | Offline IndexedDB; item key `${type}:${id}`. |
| Audio ID registry + TTS fallback | `src/lib/audio/AudioManager.ts` | `register(id → url)` is already portable. |
| Tracing canvas | `src/components/kids/TracingCanvas.tsx` | Proof of writing interaction (glyph coverage, not stroke order yet). |
| Parent gate + dashboard shell | `src/routes/parents` | Arithmetic gate; letters mastered, time, stars, streak. |
| Island home + unlock threshold | `src/routes/index.tsx` | `UNLOCK_THRESHOLD = 0.7` on letters; “حرف اليوم”. |
| Kids UI primitives | `PageShell`, `SectionCard`, `Character` | Presentation only; keep for the React prototype. |

### What the app is not yet

- Not a **journey**. Words are a 720-card catalog by semantic category. Letters are a 28-tile grid in abjad order. Diacritics, sentences, and stories are `ComingSoon`.
- Not **phonics-first**. The letter screen shows fatha, damma, kasra, and sukun together immediately.
- Not **gated** except diacritics behind 70% letter mastery. Words island is fully open.
- Not **offline audio-complete**. Speech synthesis is the default; bundled files are designed but not the corpus.
- Tracing is freehand over a font glyph, not guided stroke paths.
- Parent view is vanity-adjacent (stars, streak) plus one real skill count (letters mastered).

The architecture below keeps those foundations and turns the product into a **structured literacy path**.

---

# Part 1 — Learning journey (macro stages)

Stages are skills. Levels (Part 2) are how the app packages those skills. Stages **overlap**; a child should not wait to “finish Arabic” before meeting a vowel.

```
STAGE 0  Readiness
STAGE 1  Letters
STAGE 2  Short vowels (fatha, kasra, damma)
STAGE 3  Phonics expansion (sukun, madd, tanween, shadda)
STAGE 4  Syllables and decoding
STAGE 5  Vocabulary (controlled, not a dictionary)
STAGE 6  Sentence reading
STAGE 7  Sentence construction
STAGE 8  Writing and dictation
STAGE 9  Comprehension
STAGE 10 Stories → independent reading/writing
STAGE 11 Informational / nonfiction reading
```

## STAGE 0 — Readiness

**Goal:** The child can use the app in Arabic RTL, tap large targets, listen, and tell two pictures/sounds apart.

**Skills:** RTL page flow; “listen then tap”; visual discrimination (same/different letter-like shapes); audio discrimination (same/different phonemes); short attention routines.

**Overlap:** A 1–2 minute warm-up at the start of early sessions. Not a long locked island.

## STAGE 1 — Arabic letters

**Goal:** Recognize, name, hear, and begin writing the 28 letters; notice similar letters; meet connected forms.

**Teach in waves, not only أ→ي.** Traditional abjad order (`letters.ts` `order` 1–28) remains a valid **index**. Teaching sequence should group:

1. High-frequency, high-contrast letters (e.g. ا ب م ل و ي ت ن).
2. Shape families (ب ت ث، ج ح خ، د ذ، ر ز، س ش، ص ض، ط ظ، ع غ، ف ق).
3. Remaining letters, hamza-on-alif as a related skill (current `alif` uses `ا` but example `أَرْنَب`).
4. Tāʾ marbūṭa and alif maqṣūra as **follow-on graphemes**, not extra abjad letters.

**Forms:** isolated first; initial/medial/final as soon as two connecting letters are known — not after all 28.

**Overlap:** After ~6–8 letters, begin Stage 2 on *those* letters. Do not preview all four harakat on day one (current letter screen does).

## STAGE 2 — Short vowels / harakat

**Goal:** فَتْحَة، كَسْرَة، ضَمَّة change the sound of a known letter.

**Order:** fatha → kasra → damma (fatha is easiest to hear and write for most beginners).

**Overlap:** Practise only on mastered letters. Keep sukun out until CV is stable.

## STAGE 3 — Phonics expansion

**Goal:** Join consonants (sukun), long vowels/madd (ا و ي as length), tanween, shadda.

**Order:** sukun (CVC) → madd → shadda → tanween.

**Overlap:** First CVC words (`بَبْ`, then real words like `بَيْت`) can start as soon as sukun + a few letters exist. Tanween can wait until citation-form words are taught with a consistent policy (the word audit found mixed tanween).

## STAGE 4 — Syllables and decoding

**Goal:** Blend CV and CVC; decode new words made of known letters + known harakat.

**Progression:** CV (`بَ`) → CVC (`بَاب` after madd/alif) → two-syllable (`قَلَم`) → three-syllable.

**Overlap:** Vocabulary (Stage 5) is mostly *decoded* words, not sight-only cards. A few high-frequency sight supports (e.g. `هَذَا`) may be introduced later, sparingly.

## STAGE 5 — Vocabulary

**Goal:** A small, useful, fully vocalized MSA lexicon the child can say, match to a picture, and later read in sentences.

**Not:** 720 equally weighted emoji cards.

**Overlap:** First words appear as soon as their letters and harakat are known. Semantic categories (حيوانات، طعام) are **filters**, not the teaching order.

## STAGE 6 — Sentence reading

**Goal:** Read 2-word then 3- then 4–5-word fully vocalized sentences built from known words.

**Overlap:** Construction (Stage 7) begins with the same 2-word patterns the child just read.

## STAGE 7 — Sentence construction

**Goal:** Order words, complete a blank, match picture → sentence. Grammar through use (this is a boy / this is a girl; adjective after noun in simple MSA) without terminology.

## STAGE 8 — Writing and dictation

**Goal:** From tracing a letter to writing a heard word and then a short sentence.

**Overlap:** Tracing starts in Stage 1. Dictation waits until decoding is real. Copying bridges them.

## STAGE 9 — Reading comprehension

**Goal:** The child shows meaning: picture match, who/what/where, sequence of 3 pictures.

**Overlap:** Starts with 2-word captions; grows with stories.

## STAGE 10 — Stories

**Goal:** Short controlled MSA stories that recycle known vocabulary, then slightly stretch it.

**Overlap:** Every story is also a comprehension + listening + (optional) copy-the-sentence activity.

## STAGE 11 — Informational reading (after stories, not instead)

**Goal:** Very short nonfiction (animals, weather, body, transport, daily life) that recycles known words. Stories are not the end of reading.

**Overlap:** Same sentence table and word ids as stories; different `genre` and comprehension goals (facts, labels, “what is this?”).

---

# Part 1b — Skill graph (educational engine)

Levels are the **child-friendly journey**. The skill graph is the **engine underneath**.

The child sees islands and a path. The app schedules items by skill ids, prerequisites, and evidence. The child never needs percentages, DAG edges, or educational jargon.

## Why both exist

| | Levels 1–8 | Skill graph |
| --- | --- | --- |
| Audience | Child, parent (simple) | Curriculum engine, later teachers |
| Question | “Where am I on the map?” | “What evidence do we have for this literacy skill?” |
| Change cadence | Slow, stable | Can add a skill without inventing Level 9 |
| Unlock | A level *recommends* a set of skills | A skill unlocks when prereqs have evidence |

A child can sit on Level 4 (first word bank) while the engine still reviews `skill.similar.ba_ta_tha` and introduces `skill.decode.cvc`.

## Skill domains (minimum)

Stable ids. Each skill has `prereqSkillIds`, `learnerLevelHint`, and evidence rules (reading vs writing can split — see Part 11).

| Domain | Example skill ids |
| --- | --- |
| Letter recognition | `skill.letter.{id}.recognize` |
| Letter sounds | `skill.letter.{id}.phoneme` |
| Similar-letter discrimination | `skill.similar.ba_ta_tha` |
| Letter forms / positions | `skill.letter.{id}.forms` |
| Handwriting | `skill.write.letter.{id}`, later `skill.write.word` |
| Short vowels | `skill.fatha`, `skill.kasra`, `skill.damma` |
| Long vowels / madd | `skill.madd.alif`, `skill.madd.waw`, `skill.madd.ya` |
| Sukun | `skill.sukun` |
| Tanween | `skill.tanween` |
| Shadda | `skill.shadda` |
| Syllable blending | `skill.blend.cv`, `skill.blend.cvc` |
| Word decoding | `skill.decode.word` |
| Vocabulary comprehension | `skill.vocab.meaning` (picture/audio meaning, not sight-shape) |
| Spelling | `skill.spell.word` (distinct from reading) |
| Sentence reading | `skill.read.sentence` |
| Sentence construction | `skill.build.sentence` |
| Listening comprehension | `skill.listen.word`, `skill.listen.sentence` |
| Reading comprehension | `skill.comprehension.wh` |
| Story comprehension | `skill.comprehension.story` |
| Independent reading | `skill.read.independent` |
| Informational reading | `skill.read.informational` |

```
short vowels
    → syllable blending
        → simple word decoding
            → vocabulary meaning (with decoding, not instead of it)
                → sentence reading
                    → sentence construction
                        → story / informational comprehension
handwriting ──────────► spelling / dictation (parallel, not a substitute for reading)
listening ─────────────► (feeds every stage; never only a game channel)
```

## Skill record (portable)

```json
{
  "id": "skill.blend.cvc",
  "domain": "syllable_blending",
  "nameAr": "دَمْجُ الْمَقَاطِع",
  "childLabelAr": "نِرَكِّبُ الْأَصْوَات",
  "prereqSkillIds": ["skill.fatha", "skill.sukun"],
  "learnerLevelHint": 3,
  "modality": ["listen", "read"],
  "successRule": "3_correct_in_session_and_streak_2"
}
```

`childLabelAr` is what the map/parent may show. `nameAr` is internal/teacher. Formal grammar terms stay out of early `childLabelAr`.

Hard gates remain **skill-sized** (can decode CVC with known letters), not “finished all 28 letters.”

---

# Part 2 — Eight learner levels

Progression is **mastery-based**. Age ~4 informs UI (large tap targets, 8–12 minute sessions) but does not lock content.

Unlock rule (extend current `UNLOCK_THRESHOLD`): a skill unlocks when **~70% of its prerequisite items are `practicing` or better** (current mastery ≥ 2), not when everything is gold.

## Level 1 — Letters I can see, hear, and trace

| | |
| --- | --- |
| **Objective** | Know ~8–12 letters: name, phoneme, isolated form, first traces. |
| **Prerequisite** | Stage 0 only (can tap and listen). |
| **Letters / phonics** | Wave 1 letters; no required harakat. |
| **Vocabulary** | 0 as a bank. One example word per letter is *exposure*, not mastery. |
| **Sentences** | None. |
| **Reading** | Point to the named letter among 2–3 choices. |
| **Writing** | Guided tracing, isolated form. |
| **Activities** | Recognition, letter↔sound, similar-letter (if in wave), trace. |
| **Mastery** | Each letter: heard + 2 consecutive correct IDs; trace coverage at current threshold. |
| **Volume** | 8–12 letters; 0 sentences; 0 stories. |

## Level 2 — Forms and short vowels

| | |
| --- | --- |
| **Objective** | Connected forms of known letters; fatha then kasra then damma on those letters. |
| **Prerequisite** | Level 1 wave stable. |
| **Letters / phonics** | Waves 1–2 (~16–20 letters). Fatha/kasra/damma. |
| **Vocabulary** | 0–15 CV “proto-words” and a few real CV/CV-open words. |
| **Sentences** | None. |
| **Reading** | Read `بَ / بِ / بُ`. |
| **Writing** | Trace + copy isolated and simple connected pairs. |
| **Activities** | Form matching, haraka listen-and-choose, discrimination. |
| **Mastery** | 70% of taught letters at practicing; fatha items practicing. |
| **Volume** | ~20 letters; ~20 phonics items. |

## Level 3 — I can blend

| | |
| --- | --- |
| **Objective** | Sukun and long vowels; decode CVC and simple two-letter-with-madd words. |
| **Prerequisite** | Short vowels on a useful letter set. |
| **Letters / phonics** | Remaining letters introduced; sukun; madd ا و ي. |
| **Vocabulary** | ~20–40 decodeable concrete words (باب، بيت، أم، أب، ماء — as letters allow). |
| **Sentences** | Optional 2-word captions. |
| **Reading** | Sound out CVC slowly then fluently. |
| **Writing** | Copy CV/CVC; reduced trace guides. |
| **Activities** | Syllable blend, missing haraka, audio→word. |
| **Mastery** | Decode 8/10 held-out CVC items built from known letters. |
| **Volume** | 28 letters complete as *introduced*; ~40 words; 0–10 captions. |

## Level 4 — First real word bank

| | |
| --- | --- |
| **Objective** | Shadda + tanween as needed; **Band A** words taught as meaning + reading. |
| **Prerequisite** | Can decode simple patterns. |
| **Letters / phonics** | Review + shadda; tanween in a later unit. |
| **Vocabulary** | Build toward **120–150 Band A** words (see Part 3). Teach in packs of 5–8, not 720. |
| **Sentences** | 2-word: هذا باب، أمي هنا (only with taught words). |
| **Reading** | Word cards + captions. |
| **Writing** | Copy words; picture→write first letters. |
| **Activities** | Picture↔word, audio↔word, missing letter. |
| **Mastery** | 70% of introduced Band A pack at practicing. |
| **Volume** | 40–80 words live; ~20 two-word sentences. |

## Level 5 — Words I can use

| | |
| --- | --- |
| **Objective** | Finish Band A; 3-word sentences; light construction. |
| **Prerequisite** | Level 4 packs stable. |
| **Vocabulary** | Band A complete (120–150). Start Band B everyday words. |
| **Sentences** | 3 words: الولد يأكل تفاحاً (controlled). |
| **Reading** | Short lines with full tashkīl. |
| **Writing** | Word from picture; word from audio (easy dictation). |
| **Activities** | Word order (2–3), completion, comprehension picture match. |
| **Mastery** | Band A 70% practicing; 15 sentences read. |
| **Volume** | 150 words; ~40 sentences; 3–5 micro-stories (5 sentences). |

## Level 6 — Everyday language

| | |
| --- | --- |
| **Objective** | Band B; 4–5 word sentences; construction without grammar labels. |
| **Prerequisite** | Band A + 3-word reading. |
| **Vocabulary** | +150–200 Band B (school, clothes, food, actions). |
| **Sentences** | 4–5 words; adjective after noun in simple MSA. |
| **Reading** | Fluency on known words; still fully vocalized. |
| **Writing** | Sentence copy; 3-word dictation. |
| **Activities** | Sentence order, dictation, who/what questions. |
| **Mastery** | Band B packs 70%; 40 sentences; 8 stories started. |
| **Volume** | ~300–350 words cumulative; ~80 sentences; ~10 stories. |

## Level 7 — I understand what I read

| | |
| --- | --- |
| **Objective** | Comprehension and writing become equal partners; Band C expansion. |
| **Prerequisite** | 4–5 word reading. |
| **Vocabulary** | Band C (jobs, nature detail, transport, valid regional MSA like كسكس at this band, not Band A). |
| **Sentences** | Longer controlled sentences; still vocalized. |
| **Reading** | Answer simple questions; sequence 3 events. |
| **Writing** | Sentence dictation; write a caption from a picture. |
| **Activities** | Comprehension, sequencing, dictation. |
| **Mastery** | Comprehension ≥ 70% on level texts; writing accuracy on known words. |
| **Volume** | ~500 words cumulative; ~120 sentences; ~18 stories. |

## Level 8 — Stories and independence

| | |
| --- | --- |
| **Objective** | 10–15 sentence stories; Band D enrichment; more independent reading/writing. |
| **Prerequisite** | Level 7 comprehension. |
| **Vocabulary** | Band D (enrichment, zoo, astronomy). Path toward 750–1000+. |
| **Sentences** | Recycled in stories; some new glue words taught explicitly. |
| **Reading** | Short stories with audio support optional, not required. |
| **Writing** | Short original caption; sentence dictation. |
| **Activities** | Story listen+read, questions, sequence, optional retell with word bank. |
| **Mastery** | Completes a story with comprehension; review queue stays small. |
| **Volume** | 720 repaired + additions; 120–150 sentences; 25–30 stories; first informational texts. |

---

# Part 3 — Word curriculum

The 720-word dataset is an **inventory**, not a course. Full linguistic findings live in `docs/word-curriculum-audit.md`. This section only defines how vocabulary should eventually be organized.

## Band vs teaching order

**A vocabulary band is scope, not a lesson list.** Band A membership means the concept belongs to the first production lexicon. A child may still be unable to *decode* that word until letters, harakat, and related skills are mastered (`مَاء` stays in Band A while hamza/madd lock decoding).

Do not drop a high-value Band A concept only to fit the earliest phonics wave. Unlock with `letterIds` / `requiredSkillIds` / `phonicsSkillIds`.

Indicative clusters A1–A4 in the Band A plan are packing hints, not gates.

## Teaching form (nouns, verbs, article)

- **Nouns:** pause/citation form without tanween on the card (`كِتَاب`, not `كِتَابٌ`). Sentence iʿrāb is display in sentences, not a second lemma.
- **Verbs:** child-facing card is imperfect, 3rd person masculine singular, fully vocalized (`يَأْكُلُ`). Feminine/plural/past are usage, not extra word ids. Schema field `teachingForm` may differ from `lemma`.
- **Article:** lemmas do not include `ال`. Definiteness is sentence/grammar later.

## Numbers (two domains)

Numbers are **both** a skill domain (digits, quantity, matching — may start before the child can read `ثَلَاثَة`) **and** vocabulary when the written word is taught. Band A v1 literacy words: واحد، ثلاثة، أربعة، خمسة. `اثنان` is not in the Band A word allocation; it remains for the numbers curriculum / later literacy.

## Teaching order (not category-first)

A word is scheduled when most of these are true:

1. **Useful** for a child (frequency + daily life).
2. **Concrete** and illustratable.
3. **MSA-appropriate** (audit statuses: prefer `STANDARD_MSA` / `LOANWORD_ACCEPTED`; delay `KEEP_ADVANCED`).
4. **Letters already taught** (or the word is held until they are).
5. **Harakat already taught** (no sukun words before sukun).
6. **Syllable pattern is in range** (CVC before three-syllable loans).
7. **Morphology is light** (avoid iḍāfa and dual until later).
8. **Reusable** in upcoming sentences and stories.

Semantic category is a **tag** for browsing (حيوانات) after the word is unlocked.

## Vocabulary bands (from the audit, adapted)

| Band | Role | Target size | Learner levels |
| --- | --- | --- | --- |
| **A** | Foundational | **120–150** | 3–5 |
| **B** | Everyday | +150–200 | 5–6 |
| **C** | Expanded | +150–200 | 7 |
| **D** | Enrichment | remaining valid 720 + new items toward 750–1000+ | 8 |

Band A v1 is **135** approved lemmas (`docs/band-a-vocabulary-plan.md`). It includes the audit gaps **بنت، ولد، قطة**, time words, toys, places, and verbs يذهب/يأتي/يرى/يقول. **يريد** is postponed to Band B (pattern, not meaning).

Do **not** put كسكس in Band A. It is valid MSA (`REGIONAL_STANDARD`) and belongs in Band C as cultural literacy.

Exact duplicates (`تمر`, `ذرة`, `معلم`) should become **one lemma** referenced from multiple categories.

## Word packs

Teach 5–8 words per pack, one pack per few sessions:

- Pack id: `pack.bandA.family.01`
- Words: أم، أب، أخ، أخت، بيت (example)
- Required skills: listed letter IDs + `fatha` + …
- Follow-on sentence ids

## Production Word schema (platform-neutral)

Stable IDs must **not** be `category-17` (index in a file). Use semantic ids: `word.umm`, `word.bab`.

```json
{
  "id": "word.umm",
  "lemma": "أم",
  "diacritized": "أُمّ",
  "teachingForm": "أُمّ",
  "pos": "noun",
  "gender": "f",
  "number": "sg",
  "category": "family",
  "categories": ["family"],
  "vocabBand": "A",
  "learnerLevel": 4,
  "difficulty": 1,
  "concreteness": "concrete",
  "msaStatus": "STANDARD_MSA",
  "curriculumAction": "KEEP",
  "syllableCount": 1,
  "syllablePattern": "CVC",
  "syllables": ["أُمّ"],
  "letterIds": ["alif", "mim"],
  "requiredSkillIds": ["skill.damma", "skill.shadda"],
  "phonicsSkillIds": ["skill.damma", "skill.shadda"],
  "packId": "pack.bandA.family.01",
  "frequencyBand": "core",
  "highFrequency": true,
  "reviewPriority": 3,
  "imageAssetId": "img.word.umm",
  "audioAssetIds": {
    "citation": "audio.word.umm",
    "slow": "audio.word.umm.slow"
  },
  "tags": ["family", "band-a"],
  "homographGroup": null,
  "status": "active"
}
```

| Field | Purpose |
| --- | --- |
| `id` | Stable across React and Kotlin. Never reuse. |
| `lemma` / `diacritized` / `teachingForm` | Lexical key; vocalized string; optional child-facing card (`كِتَاب`, `يَأْكُلُ`). If `teachingForm` is omitted, `diacritized` is the card. |
| `pos` / `gender` / `number` | Construction and agreement later; hide from the child. |
| `vocabBand` / `learnerLevel` / `difficulty` | Scheduling. |
| `letterIds` / `requiredSkillIds` / `phonicsSkillIds` | Unlock logic; phonics skills are the harakat/shadda/sukun subset of required skills. |
| `imageAssetId` / `audioAssetIds` | Portable asset keys (Part 12). Emoji may remain `legacyEmoji` during prototype. |
| `homographGroup` | e.g. `waraqa` for ورقة paper vs leaf. |
| `frequencyBand` | `core` \| `common` \| `topic` \| `rare` — how often the word should recycle. |
| `highFrequency` | Extra exposure in review, sentences, stories, fluency — **not** a sight-word skip of decoding. |
| `reviewPriority` | 1–5 scheduling weight when the review engine picks among due items. |
| `status` | `active` \| `deprecated` \| `needs_review` — do not delete rows silently; the audit’s REMOVE/REPLACE items become `deprecated` or `needs_review`. |

**Prototype note:** keep current `build()` tuples until a migration phase copies them into this schema. Do not edit `part1.ts`–`part4.ts` in this design pass.

## High-frequency vocabulary (decode first, recycle more)

Do **not** build a pure sight-word system. Arabic literacy here is phonics and decoding. Some words, however, appear constantly in children’s reading (`في`, `هذا`, `أم`, `بيت`, `قال`, function words, family, body, school). Those words get **more encounters**, not a license to skip sounding out.

| Metadata | Use |
| --- | --- |
| `frequencyBand: core` | Glue words and everyday nouns/verbs; appear in many sentences and stories. |
| `highFrequency: true` | Eligible for extra review slots and fluency lines. |
| `reviewPriority` | Ties with skill importance when the session engine picks review. |

**How extra exposure works**

- Review: core words appear more often in warm-ups **as decode/listen/picture items**, not as “memorize this shape.”
- Sentences: authors prefer `wordIds` that are `highFrequency` once those ids are known.
- Stories and informational texts: recycle core words as the spine; new words stay 0–3 per text.
- Fluency: repeated oral reading of a short line that the child can already decode.

If a child answers a high-frequency word by guessing the picture only, that evidence counts for `skill.vocab.meaning`, not for `skill.decode.word`. Reading mastery still requires decoding evidence.

## Vocabulary recycling lifecycle

A word must not be taught once and disappear. The 750–1000 word catalog is valuable only if words **return** in new jobs.

Conceptual lifecycle (stored as evidence flags or derived from item attempts — not as a child-facing checklist):

```
introduced
  → recognized (letter/word form)
  → heard (audio → picture / audio → word)
  → decoded (sound-out)
  → matched to image (meaning)
  → used in a sentence
  → written (copy, then dictation)
  → encountered in a story
  → encountered in informational text
  → reviewed later
```

Example: `word.arnab` (`أَرْنَب`)

1. Picture/word pack in Level 4.
2. Listening: hear أَرْنَب، tap the rabbit.
3. Decoding: أَرْ + نَبْ with known letters and harakat.
4. Sentence: `الأَرْنَبُ صَغِيرٌ` (`wordIds` include `word.arnab`).
5. Writing: copy then picture-to-write.
6. Story page reuses the same `sentenceId` / `wordIds`.
7. Weeks later: `review_due` probe.

Sentences, stories, and informational texts **must** reference known `wordIds`. That is the mechanical guarantee of recycling. The catalog of 720–1000 lemmas is then a **reusable lexicon**, not a stack of forgotten flashcards.

Progress may store per-word evidence such as `seen`, `heard`, `decoded`, `meaning`, `inSentence`, `written`, `inStory` so the session engine can pick the next missing step instead of repeating only picture matching.

---

# Part 4 — Letter content model

Current `Letter` in `src/content/letters.ts` already has `id`, `char`, `nameAr`, `order`, `forms`, `nonConnecting`, `example`, `similar`. Extend it; do not invent a parallel alphabet.

```json
{
  "id": "ba",
  "char": "ب",
  "nameAr": "بَاء",
  "phonemeIpa": "b",
  "phonemeNoteAr": "صوت الباء",
  "abjadOrder": 2,
  "wave": 1,
  "teachOrder": 2,
  "forms": {
    "isolated": "ب",
    "initial": "بـ",
    "medial": "ـبـ",
    "final": "ـب"
  },
  "nonConnecting": false,
  "similarLetterIds": ["ta", "tha"],
  "exampleWordIds": ["word.batta"],
  "audioAssetIds": {
    "name": "audio.letter.ba.name",
    "phoneme": "audio.letter.ba.phoneme",
    "withFatha": "audio.letter.ba.fatha"
  },
  "traceAssetIds": {
    "isolated": "trace.letter.ba.isolated"
  },
  "requiredSkillIds": [],
  "unlocksSkillIds": ["skill.letter.ba"]
}
```

**Hamza / tāʾ marbūṭa / alif maqṣūra:** separate skill records (`skill.hamza.alif`, `skill.taa_marbuta`) linked to letters, not fake 29th–31st alphabet tiles.

### Letter → word unlocking

A word unlocks when:

- every `letterIds` member has letter skill ≥ `practicing`, and
- every `requiredSkillIds` member (harakat, shadda, …) is ≥ `introduced` (or `practicing` for sukun/shadda).

The 720-word island should **filter** to unlocked words. Category browsing comes after unlock. That is how the app stops behaving like a dictionary.

---

# Part 5 — Phonics / diacritics model

Do not ship seven static pages. Ship **skills** with examples and mastery.

Current `HARAKAT` only lists fatha, damma, kasra, sukun. Add madd, tanween, shadda as skills.

```json
{
  "id": "skill.fatha",
  "kind": "haraka",
  "nameAr": "فَتْحَة",
  "mark": "\u064E",
  "teachOrder": 1,
  "learnerLevel": 2,
  "prereqSkillIds": ["skill.letter.wave1"],
  "exampleIds": ["ex.fatha.ba", "ex.fatha.ta"],
  "exerciseTemplateIds": ["ex.audio_to_haraka", "ex.haraka_on_letter"],
  "audioAssetId": "audio.skill.fatha"
}
```

**Unit sequence**

1. `skill.fatha`
2. `skill.kasra`
3. `skill.damma`
4. `skill.sukun`
5. `skill.madd.alif` / `waw` / `ya` (can split)
6. `skill.shadda`
7. `skill.tanween.fath` / `kasr` / `damm` (late; align with word-citation policy)

Each skill lesson: hear contrast → identify → produce (say) → attach to a known letter → decode a mini-word → 3-item check.

The current letter page that plays all four marks at once becomes a **sandbox after** the skill is taught, not the introduction.

---

# Part 6 — Sentence model

**Initial corpus:** 120–150 curated, fully vocalized MSA sentences.

**Progression:** 2 words → 3 → 4–5 → slightly longer controlled sentences.

**Constraint:** ≥ 90% of tokens must be already-taught word ids. New glue words (`هَذَا`, `فِي`, `عَلَى`) are taught as tiny packs before they appear.

```json
{
  "id": "sent.l5.001",
  "text": "هذا باب",
  "diacritized": "هَذَا بَابٌ",
  "wordIds": ["word.hadha", "word.bab"],
  "wordCount": 2,
  "learnerLevel": 5,
  "difficulty": 1,
  "targetSkillIds": ["skill.decode.cvc", "skill.read.2word"],
  "imageAssetId": "img.sent.l5.001",
  "audioAssetId": "audio.sent.l5.001",
  "comprehension": {
    "type": "picture_match",
    "promptAr": "أَيْنَ الْبَاب؟",
    "choiceAssetIds": ["img.sent.l5.001", "img.word.maa"],
    "correctAssetId": "img.sent.l5.001"
  },
  "construction": {
    "type": "order_words",
    "tokenIds": ["word.hadha", "word.bab"]
  }
}
```

No React layout fields. Highlighting in the UI is derived from `wordIds` + audio timestamps later (`audio.sent.l5.001.align.json` optional).

---

# Part 7 — Story model

**Initial corpus:** 25–30 stories.

| Tier | Sentences | Learner level | Count (approx.) |
| --- | --- | --- | --- |
| Early | 5–6 | 5 | 8–10 |
| Middle | 8–10 | 6–7 | 10–12 |
| Advanced | 10–15 | 8 | 8–10 |

Stories recycle Band A/B words; each story may introduce **0–3** new words, listed explicitly.

```json
{
  "id": "story.l5.bab",
  "titleAr": "الْبَاب",
  "learnerLevel": 5,
  "difficulty": 1,
  "targetSkillIds": ["skill.read.caption", "skill.comprehension.who"],
  "newWordIds": [],
  "recycledWordIds": ["word.bab", "word.umm", "word.walad"],
  "vocabularyWordIds": ["word.bab", "word.umm", "word.walad"],
  "coverAssetId": "img.story.l5.bab.cover",
  "audioAssetId": "audio.story.l5.bab",
  "pages": [
    {
      "id": "p1",
      "sentenceId": "sent.l5.001",
      "imageAssetId": "img.story.l5.bab.p1",
      "audioAssetId": "audio.story.l5.bab.p1"
    }
  ],
  "comprehension": [
    {
      "type": "wh_picture",
      "promptAr": "مَنْ فِي الصُّورَة؟",
      "choiceWordIds": ["word.umm", "word.qitt"],
      "correctWordId": "word.umm"
    },
    {
      "type": "sequence",
      "pageIds": ["p1", "p2", "p3"]
    }
  ]
}
```

Pages may reference existing `sentenceId`s so sentences and stories share one sentence table (no duplicated vocalization).

Stories are **not** the last reading genre. After a child can read short stories, informational texts reuse the same sentence table with a different purpose (Part 7b).

---

# Part 7b — Informational / nonfiction texts

Stories remain important. They are not the end of the reading curriculum.

**Purpose:** Controlled nonfiction that recycles known words and builds toward school-like reading (labels, facts, “what is this?”) without a new illustration style that copies any competitor.

**Topics (examples, original Hurufi wording later):** animals, nature, weather, space, the human body, plants, transportation, daily life, simple science.

**Progression:** 2–4 very short sentences → a short “page” of 5–8 sentences → slightly denser texts at Level 8. Vocabulary is almost entirely recycled `wordIds`; 0–2 new topic words per text, taught first.

**Reuse the Story-like model** with `genre: "informational"`. Do not invent a second page engine. Differences are metadata and comprehension goals, not a new runtime.

```json
{
  "id": "info.l7.qamar",
  "genre": "informational",
  "titleAr": "الْقَمَر",
  "topic": "space",
  "learnerLevel": 7,
  "targetSkillIds": ["skill.read.informational", "skill.comprehension.fact"],
  "vocabularyWordIds": ["word.qamar", "word.sama", "word.kabir"],
  "newWordIds": [],
  "pages": [
    { "id": "p1", "sentenceId": "sent.l7.qamar.01", "imageAssetId": "img.info.l7.qamar.p1" }
  ],
  "comprehension": [
    {
      "type": "fact_picture",
      "promptAr": "أَيْنَ الْقَمَر؟",
      "choiceAssetIds": ["img.info.l7.qamar.p1", "img.word.bab"],
      "correctAssetId": "img.info.l7.qamar.p1"
    }
  ]
}
```

Asset ids follow the same convention (`img.info.{id}`, `audio.info.{id}`). Android and React share one reader.

---

# Part 7c — Grammar through usage

Do not turn Hurufi into a traditional grammar textbook for young children. Children **experience patterns** first. Formal terms (`مُذَكَّر`, `فِعْل`) appear only in later levels, mainly for parents/teachers or Level 7–8 labels.

**Potential concepts (as skills, not chapters):** masculine/feminine; singular/plural; adjective agreement; pronouns; demonstratives; simple question words; basic verb patterns in useful sentences; prepositions; simple possession.

**How it is taught**

| Instead of | Use |
| --- | --- |
| Memorize “this is feminine” | Picture choice: `وَلَد كَبِير` vs `بِنْت كَبِيرَة` |
| Conjugation tables | Repeated sentence frames: `أَنَا أَكُلُ …` / `هُوَ يَأْكُلُ …` |
| Terminology quizzes | Matching, completion, word order, contrasts |

Grammar skills sit on the graph (`skill.grammar.gender`, `skill.grammar.plural`, …) with prerequisites such as `skill.read.sentence`. Sentences already carry `gender` / `number` on words so construction templates can check agreement without a separate grammar CMS.

---

# Part 8 — Exercise architecture and learning objectives

**Separate templates from content.** Do not build one React component per word. An activity is never merely a “game.” It declares a skill, content, difficulty, success, and what evidence it writes.

### ExerciseTemplate (code — React now, Compose later)

A small set of portable engines. Each template id is stable across platforms.

| Template id | Interaction | Typical skills |
| --- | --- | --- |
| `letter_recognition` | See glyph, tap matching among n | letter recognition |
| `sound_to_letter` | Hear phoneme/name, tap letter | letter sounds |
| `letter_to_sound` | See letter, tap/play correct audio | letter sounds |
| `similar_letter` | ب/ت/ث style | similar-letter discrimination + phoneme |
| `trace_glyph` | Current tracing canvas | handwriting |
| `copy_glyph` | Reduced ghost | handwriting |
| `picture_to_word` | | vocab meaning |
| `word_to_picture` | | vocab meaning |
| `audio_to_word` | | listening + decoding |
| `audio_to_picture` | | listening comprehension |
| `audio_to_sentence` | | listening |
| `listen_and_order` | | listening + sentence |
| `listen_and_answer` | | listening comprehension |
| `missing_letter` | | decoding / spelling |
| `missing_haraka` | | short vowels |
| `blend_syllable` | | syllable blending |
| `order_words` | | sentence construction |
| `order_sentence` | | sentence construction |
| `dictation_word` | | writing / spelling |
| `dictation_sentence` | | writing |
| `comprehension_choice` | | reading comprehension |
| `story_sequence` | | story comprehension |

Example: showing ب / ت / ث and playing a sound trains **`skill.similar.ba_ta_tha` + phoneme recognition**, not “a matching game.”

Each template: prompt slot, n choices, correct key, optional stem audio/image, success/fail, **skillIds written on success**.

Difficulty (`easy|normal|hard` already on `Profile`) only changes **n choices** and time-to-hint — as `mastery.ts` already intends.

### ExerciseDefinition (data — portable to Kotlin)

```json
{
  "id": "ex.similar.ba_ta_tha.01",
  "templateId": "similar_letter",
  "skillIds": ["skill.similar.ba_ta_tha", "skill.letter.ba.phoneme"],
  "contentIds": ["letter.ba", "letter.ta", "letter.tha"],
  "prereqSkillIds": ["skill.letter.ba.recognize"],
  "difficulty": "normal",
  "success": {
    "type": "correct_choice",
    "correctChoiceId": "ba"
  },
  "masteryEvidence": {
    "reading": ["skill.similar.ba_ta_tha"],
    "writing": []
  },
  "promptAssetId": "audio.letter.ba.phoneme",
  "choices": [
    { "id": "ba", "label": "ب" },
    { "id": "ta", "label": "ت" },
    { "id": "tha", "label": "ث" }
  ]
}
```

| Field | Purpose |
| --- | --- |
| `skillIds` | What literacy skills this item trains |
| `contentIds` | Letters/words/sentences/stories used |
| `difficulty` | Distinct from child profile difficulty |
| `prereqSkillIds` | Skip or lock until ready |
| `success` | What counts as a correct attempt |
| `masteryEvidence` | Which reading vs writing scores this attempt may raise |

The React letter `ListenMode` already is this template with choices generated at runtime. **Keep runtime generation for letters** (cheap). **Author JSON for words/sentences/stories** so quality stays controlled.

A `Lesson` is an ordered list of exercise ids + one new concept id + a success beat.

### Listening and speaking (skill domain, not a cloud feature)

Listening is its own graph domain: audio→picture, audio→word, audio→sentence, listen-and-order, listen-and-answer.

Speaking/pronunciation should be **architecturally possible** later (optional `spokenAttempt` on progress, local or on-device models). **Do not require speech recognition for the initial offline product.** Cloud ASR is never a core dependency. The child can complete the whole literacy path by tapping, tracing, and listening.

---

# Part 9 — Mastery, three assessments, smart review

Stars and rewards **are not proof of mastery**. They motivate. Evidence (correct attempts on skill-tagged exercises, over time) determines progress.

### Current (KEEP and extend)

From `src/lib/rules/mastery.ts`:

| Numeric | Meaning today |
| --- | --- |
| 0 | Never seen |
| 1 | Seen and heard |
| 2 | Two consecutive correct |
| 3 | Correct on 3 different days |

`ItemType`: `letter` \| `word` \| `sentence` \| `story` \| `diacritic`.  
Keys: `letter:ba`. Unlock: 70% of letters at ≥ 2.

This is simple, child-safe, and already Kotlin-shaped. **Do not replace with ML.** Extend keys later with `skill:` and split **reading** vs **writing** mastery on the same content id when needed (`word.umm` can be `read:3` and `write:1`).

### Display / review states (map onto 0–3; do not fork storage yet)

| Engine state | Numeric / flag | Child-facing |
| --- | --- | --- |
| `new` | 0 | not shown or locked |
| `learning` | 1–2 | friendly practice |
| `mastered` | 3 | solid, still recycles lightly |
| `review_due` | 2 or 3 + stale | warm-up, no shame |
| `struggling` | repeated misses | extra support, still kind |

Young children are **never punished visually** for forgetting. Forgetting only creates another friendly review opportunity (“نتمرّن معاً”).

### Three types of assessment

**A. Diagnostic (placement) — where should the learner begin?**

Optional, skippable by the parent. Short, playful, adaptive where practical. **Not** a school exam. **Does not permanently lock content.** It only **recommends** a starting level / skill wave.

Useful for: older beginners; children who already know letters; children returning after previous Arabic instruction.

Possible probes (few items each, stop early if clearly weak or clearly strong):

- letter recognition
- letter sounds
- harakat
- simple decoding
- basic words
- simple sentence reading

Output: recommended Level 1–8 and a set of `skillIds` already likely known. The child can still open easier islands. Parents can skip and start at Level 1.

**B. Formative — what is the learner understanding during normal lessons?**

Every exercise attempt is formative evidence. The session engine uses it to choose the next item, drop n choices, or switch to a known warm-up. Formative data should not feel like a test; it is the lesson.

**C. Mastery — has the learner retained the skill strongly enough to progress?**

Mastery checks are short (3–5 items, including one slightly held-out example). They use the existing 0–3 ladder plus the 70% unlock rule. A child who collected stars in a game but cannot decode on a cold probe does **not** advance that skill.

How they interact with progress:

```
Diagnostic → suggested entry node on the skill graph / level map
Formative  → updates item attempts during sessions
Mastery    → raises skill state; unlocks next recommended skills
Review     → keeps mastered skills from silently decaying
```

### What constitutes mastery (reading vs writing)

- **Letter (read):** identified from audio **and** from look-alikes.
- **Letter (write):** trace/copy evidence — **does not** grant reading 3 by itself.
- **Phonics skill:** contrast + attach to 3 letters.
- **Word (read):** decode evidence + meaning; picture-only success is meaning, not decoding.
- **Word (write):** copy then dictation; independent of reading score.
- **Sentence:** read sequence + one comprehension tap.
- **Story / informational:** pages + comprehension ≥ 70%.

A child may read `أَرْنَب` at mastery 3 and still be `learning` at writing it.

### Mistakes

- Incorrect: streak → 0 (already). Do **not** drop mastery 3 to 0 in one miss.
- After mastery 3, two misses in a session set `review_due` / `struggling` (keep mastery 3 internally). Kind for a 4-year-old.

### Smart review (simple, deterministic — not a research SRS)

Do not over-engineer spaced repetition initially. A small rule set is enough:

Review priority (higher first) considers:

1. `struggling` items
2. Time since last **successful** use
3. Repeated correct answers (lower priority)
4. Skill importance (prerequisites and decoding beat enrichment)
5. High-frequency vocabulary (`reviewPriority`, `highFrequency`)
6. Prerequisite skills that are blocking new work

Rules of thumb:

- If `lastSuccess` > 3 days and state is `learning` → queue 1 review item.
- If `lastSuccess` > 7 days and state is `mastered` → one warm-up probe.
- Session cap: review queue ≤ 6 items so new learning still happens.
- `new` items are not mixed into review until introduced.

Passing a probe clears `review_due`. Failing keeps the child in a supportive loop without locking or scolding.

### Repeated success

Unchanged ladder 1→2→3. Extra correct answers add stars modestly (already in `recordAttempt`) but **star inflation should be tuned later** so the app is not a slot machine. Stars never substitute for mastery evidence.

---

# Part 10 — Child session engine

The app should eventually **assemble** a short session from curriculum data rather than only offering a menu of islands.

**Length:** 8–12 minutes typical; hard stop at ~15. Current `addMinutes` (1/min while visible) is a decent parent metric if the tab/app is actually in a lesson.

**Typical session shape**

1. Friendly warm-up
2. Review items (`review_due`, `struggling`, high-frequency decode)
3. One small new concept (max **3–5 new items**)
4. Guided practice (new mixed with known)
5. Application / one game-like template that still has a learning objective
6. Quick mastery evidence (2–3 cold items)
7. Success ending (specific praise, not firework spam)

**How the engine selects**

| Source | Rule |
| --- | --- |
| `review_due` skills | Fill warm-up first, cap 6 |
| `struggling` items | Prefer supportive templates (fewer choices, audio first) |
| Known vocabulary | Mix into practice so recycling happens |
| New skills | Only if prerequisites have evidence; one new skill per session |
| High-frequency words | Prefer among equally due review items |

Avoid endless-play and addictive reward loops. When the session is done, the child is done. Islands remain for optional extra practice, not infinite currency grinding.

**Stop when:** time cap, or 3 consecutive errors on the new concept (switch to easier known items, then end kindly).

**Repeated mistakes:** after 2 misses, show the correct form with audio; after 3, drop n choices (use `easy`). Never lock the child in a fail loop.

Motivation: stars already exist — keep them small. Prefer **visible skill growth** (“5 حروف”) over infinite currency.

---

# Part 10b — Child-facing learning map

The skill graph is hidden. The child sees a **simple journey** compatible with the current island/world identity (home islands, character, chunky buttons).

| Underneath | On the map |
| --- | --- |
| Skill ids, prerequisites, percentages | Named islands / paths (“حُرُوف”, “كَلِمَات”, “قِصَص”) |
| `review_due` | A friendly “نراجع” stop, not a red fail badge |
| Diagnostic recommendation | Starting island highlighted |
| Band A 73/135 | “كَلِمَات جَدِيدَة” pack, not a spreadsheet |

The child does not need to understand percentages, DAG edges, or educational terminology. Completing an island corresponds to a **bundle of skills** reaching `practicing`, not to “finished Arabic.”

Keep the existing playful island metaphor if it still matches visual identity. Add a **today’s session** entry so the child is not lost in 720 tiles.

---

# Part 11 — Writing as a real skill

Handwriting is not reduced to tracing. Tracing remains important; stroke-order SVG paths are a later engine upgrade (`REPLACE_LATER` for the engine, keep the activity).

**Progression**

| Step | Stage / level | Mastery signal |
| --- | --- | --- |
| Trace | L1 | coverage ≥ current ~0.55 |
| Reduced tracing guide | L2 | coverage + start region (later: start-point hint) |
| Copy | L3–4 | match / parent-optional skip |
| Complete missing letter | L4 | correct grapheme in a known word |
| Write from picture | L4–5 | letters of a known word |
| Write from audio | L5–6 | `dictation_word` |
| Word dictation | L6 | no picture |
| Sentence copying | L6–7 | |
| Sentence dictation | L7–8 | |

The mastery system **distinguishes reading mastery from writing mastery**. A child may read a word without being able to write it. Session engines should not skip writing because reading is gold.

Do not block literacy on perfect handwriting. Tracing success today calls `recordAttempt(..., true)` only — never false. Later, offer retry without penalty; only log a miss if the child submits a clearly empty board.

---

# Part 12 — Content assets

**Rule:** content objects store **asset ids**, never `/audio/foo.m4a` or Compose `R.drawable` ids.

### ID convention

```
audio.letter.{letterId}.name
audio.letter.{letterId}.phoneme
audio.letter.{letterId}.{haraka}
audio.word.{wordId}
audio.word.{wordId}.slow
audio.sent.{sentenceId}
audio.story.{storyId}
audio.story.{storyId}.{pageId}
audio.info.{textId}

img.word.{wordId}
img.sent.{sentenceId}
img.story.{storyId}.cover
img.story.{storyId}.{pageId}
img.info.{textId}.{pageId}

trace.letter.{letterId}.{form}
```

### Folder layout (same names in web `public/` and Android `assets/`)

```
content/
  letters.json
  skills.json
  words.json
  packs.json
  sentences.json
  stories.json
  informational.json
  exercises.json
audio/
  letter/
  word/
  sentence/
  story/
  info/
  skill/
images/
  word/
  sentence/
  story/
  info/
illustrations/
  character/          # hurufi mascot, not curriculum
tracing/
  letter/
```

A tiny **manifest** maps id → relative path:

```json
{ "audio.letter.ba.name": "audio/letter/ba_name.m4a" }
```

React: `AudioManager.register(manifest)` (already the API).  
Kotlin: same JSON, load from `assets`.

Offline-first: **all Band A audio + all letter phonemes + all Level 5–6 stories** ship in the APK. TTS remains fallback only (web prototype today).

Emoji may stay as `legacyEmoji` until illustrations exist. The audit showed many misleading emoji — illustrations must follow meaning, not Unicode convenience.

---

# Part 13 — Parent skill map

Parents need **meaningful progress**, not only stars. Exact percentages are optional. Do not pretend educational precision the evidence cannot support (e.g. “reading age 6.2”).

**Future dashboard domains (Arabic labels for parents):**

| Domain | Example qualitative state |
| --- | --- |
| الحروف | متقن |
| الأصوات | جيد |
| الحركات | جيد |
| قراءة الكلمات | قيد التطور |
| المفردات | جيد |
| قراءة الجمل | قيد التطور |
| الكتابة | تحتاج مراجعة |
| الاستماع | جيد |
| الفهم القرائي | قيد التطور |

States are derived from the skill graph (e.g. majority of letter skills `mastered` → الحروف متقن). If evidence is thin, say “بداية” rather than invent a score.

**Also show**

- Current learner level and “what we’re learning this week” in one sentence.
- Band A progress (e.g. 40/135), not 720/720.
- Last story / informational text title.
- Time this week (from `daily.minutes`) — cap display so a forgotten open tab is not “genius”.
- Review list: 3 items to gently practise.
- Placement was skipped or last recommended start (not a grade).

**Do not emphasize:** lifetime stars, streak as morality, world ranking.

**Keep:** parent gate (`parentGate.ts`), sound/dark, reset with confirmation.

Current dashboard stats (stars, streak, minutes, letters mastered) are a **seed**. Replace stars-as-headline with the skill map above.

---

# Part 14 — Future school compatibility (do not build now)

School functionality is **FUTURE-ONLY**. Do not implement networking, authentication, or a school backend now. Architecture only needs **stable ids** and a progress document that a later server could aggregate.

Future entities (names, not tables to create today):

| Entity | Role |
| --- | --- |
| Teacher | owns classes |
| Class | group of students; default curriculum level |
| Student | same progress document as the child app |
| Assignment | work to do |
| CurriculumUnit | level, pack, or lesson bundle |
| Skill | graph node already in content |
| Progress | item + skill evidence |
| Report | aggregates for families/schools |

A teacher should eventually assign:

- a curriculum level (1–8)
- specific skills
- lessons / sessions
- reading (sentences)
- stories and informational texts
- review work

```
Assignment = {
  target: level | skillIds | lessonIds | storyIds | reviewPolicy,
  due: optional
}
```

The child APK stays offline-first. Sync is optional. **No classroom UX in the current implementation.** Future school support must not complicate today’s React prototype.

---

# Part 15 — Offline-first

**Must be local on Android (and cached in the web PWA if possible):**

- All curriculum JSON
- Core audio (letters, skills, Band A, current-level sentences/stories)
- Images for unlocked content
- Progress database
- Exercise engines
- Stories for the child’s level

**Optional online later:** extra Band D packs, new story seasons, school sync, parent cloud backup, alternative voices.

TTS is **not** an acceptable sole production voice for phonemes. It is acceptable as web-dev fallback (current `AudioManager`).

---

# Part 16 — Portability to Kotlin

### Canonical storage recommendation

**Canonical educational content = JSON (UTF-8) + JSON Schema.**

| Option | Verdict |
| --- | --- |
| **Hand-written TypeScript arrays** (today) | Fine for the prototype. Bad as the long-term source (720–1000 words, 150 sentences, 30 stories). |
| **JSON in `content/`** | One source for web fetch/import **and** Android `assets`. |
| **Generate JSON from TS** | Acceptable bridge: author in TS with types, `npm run export-content` writes JSON. Kotlin never reads TS. |
| **Only Kotlin** | Too early; would freeze the React prototype. |

**Recommended path:**

1. Keep TS as authoring for letters/words **until** schema is stable.
2. Add JSON Schema matching Part 3–7 models.
3. Export script → `content/*.json` (CI-checked).
4. React loads JSON (or generated TS types from JSON).
5. Kotlin `kotlinx.serialization` data classes **named the same** as the schema.

`mastery.ts` should remain a **pure function module**. Port by translating file-for-file; do not bury rules in Compose.

Asset ids stay; only the loader changes.

Avoid rewriting 1000 words by never making Compose the authoring environment.

### Model mapping sketch

| JSON | Kotlin |
| --- | --- |
| `Letter` | `@Serializable data class Letter` |
| `Word` | `data class Word` |
| `Skill` | `data class PhonicsSkill` |
| `Sentence` | `data class Sentence` |
| `Story` | `data class Story` |
| `InformationalText` | `data class InformationalText` (or `Story` with `genre`) |
| `ExerciseDefinition` | `data class ExerciseDefinition` |
| `ItemProgress` | `data class ItemProgress` (already matches) |

Zustand/IndexedDB → DataStore / Room. Same fields.

---

# Part 16b — Content relationships and validation

## Relationships by stable IDs

Content must reference other content by ids, never by asset file paths or React imports.

| Entity | References |
| --- | --- |
| Word | `requiredSkillIds`, `letterIds`, `phonicsSkillIds` (or `requiredSkillIds`), `packId`, asset ids |
| Sentence | `wordIds`, `targetSkillIds` |
| Story | page `sentenceId`s, `vocabularyWordIds` / `recycledWordIds`, `targetSkillIds` |
| InformationalText | `vocabularyWordIds`, `targetSkillIds`, `sentenceId`s |
| ExerciseDefinition | `contentIds`, `skillIds`, `prereqSkillIds` |

Broken paths (`/src/assets/foo.png`) must not appear in educational JSON. Only asset ids; the manifest maps ids to files per platform.

## Content validation strategy (design only — do not implement now)

At 1000+ words, 150+ sentences, 30+ stories, many phonics examples and exercises, humans will miss errors. A future automatable validator (CI script) should detect:

- duplicate IDs
- broken references (unknown word/skill/letter/sentence ids)
- missing audio assets (id in content, not in manifest or file missing)
- missing image assets
- sentence `wordIds` that do not exist
- impossible prerequisites (cycles, unknown skill ids)
- invalid curriculum levels (not 1–8)
- missing diacritics where `diacritized` is required
- malformed exercise definitions (no `success`, empty `skillIds`, unknown `templateId`)

The validator is a **later tool**. Canonical JSON + schema is the prerequisite. Do not build it in this pass.

---

# Part 17 — Gap analysis (current repo vs this architecture)

| System | Verdict | Notes |
| --- | --- | --- |
| **Letters content** | **EXTEND** | Strong 28-letter model. Add waves, teachOrder, phoneme audio ids, hamza/tāʾ marbūṭa skills. Stop teaching all harakat on first visit. |
| **Letters UI** | **EXTEND** | Learn / write / listen is the right trio. Generate listen items from templates. |
| **Words content** | **REFACTOR_LATER** | Keep 720 inventory; later migrate to semantic ids, bands, frequency, recycling evidence. Do not treat as the course. Audit first (already done). |
| **Words UI** | **REPLACE_LATER** | Category dictionary. Replace with packs + unlocked filter; keep category as a parent/browse mode. |
| **Diacritics island** | **NOT_IMPLEMENTED** | `ComingSoon`. Implement as skill units (Part 5), not four buttons on the letter card. |
| **Sentences** | **NOT_IMPLEMENTED** | Design 120–150 JSON sentences with `wordIds` before UI. |
| **Stories** | **NOT_IMPLEMENTED** | 25–30 JSON stories sharing sentence ids. |
| **Informational texts** | **NOT_IMPLEMENTED** | Reuse story/page model; after stories, not instead. |
| **Skill graph** | **NOT_IMPLEMENTED** | Levels exist as islands; no skill ids or prerequisites yet. |
| **Placement assessment** | **NOT_IMPLEMENTED** | Optional; skippable; must not lock content. |
| **Audio** | **EXTEND** | Keep `AudioManager` + id registry. Add manifest + bundled m4a for letters/Band A. Reduce TTS dependence. |
| **Progress / mastery** | **KEEP** + **EXTEND** | Keep 0–3 ladder, item keys, 70% threshold. Add `review_due`, split reading/writing, skill types, real word attempts (not only `markSeen`). |
| **Unlock graph** | **EXTEND** | `SECTION_PREREQ` exists but home only locks diacritics. Gate words by letters+phonics; gate sentences by words. |
| **Writing / tracing** | **EXTEND** then **REPLACE_LATER** engine | Keep activity; later stroke-order; distinguish writing mastery. |
| **Parent area** | **EXTEND** | Keep gate. Replace headline stats with qualitative skill map. |
| **Content storage** | **REFACTOR_LATER** | TS → JSON export (letters.ts already predicted this). |
| **Exercise system** | **NOT_IMPLEMENTED** as a platform | ListenMode is a one-off. Extract templates with learning objectives. |
| **Session engine** | **NOT_IMPLEMENTED** | Home is a menu of islands, not a guided 10-minute lesson. |
| **Content validator** | **NOT_IMPLEMENTED** | Design only (Part 16b). |
| **School layer** | **FUTURE** | Stable ids only; no backend now. |
| **Kids chrome** | **KEEP** | PageShell, islands metaphor, character, chunky buttons. |
| **Fonts / theme / routes** | **KEEP** | Out of scope for curriculum data. |

---

# Part 18 — Implementation roadmap (NOW / NEXT / LATER / FUTURE)

Incremental and Cursor-friendly. **Do not start implementing all of these systems.** Each phase stays small, preserves a working app, and is sized for a focused session.

Recommended principle:

- **NOW:** stabilize curriculum/content foundations
- **NEXT:** finish the core literacy journey
- **LATER:** advanced reading, smart review, richer parent experience
- **FUTURE:** school services, accounts/cloud, optional speaking technology

Former P0–P22 items are grouped below so work stays sequenced.

### NOW — foundations

| Phase | Objective | Depends on | Test |
| --- | --- | --- | --- |
| **P0** | This file + word audit remain sources of truth | — | 8 levels + Band A 120–150 agreed |
| **P1** | Extract exercise template from letter ListenMode (same UX) | — | Letter quiz still works |
| **P2** | Letter waves + teachOrder in data (still 28 letters) | P0 | Grid can sort by wave without dropping letters |
| **P3** | JSON Schema for Letter, Skill, Word (subset) + export script stub | P0 | `letters.json` round-trips |
| **P4** | Phonics skills as data; letter page hides untaught harakat | P2, P3 | New user sees fatha only after unlock |
| **P5** | Diacritics island: fatha unit (not ComingSoon) | P4, P1 | Completing unit raises `diacritic:fatha` |
| **P6** | Optional word fields on existing 720 (band, letters) without changing lemmas | P3, audit | App still shows 720; Band A filterable in debug |

### NEXT — core literacy journey

| Phase | Objective | Depends on | Test |
| --- | --- | --- | --- |
| **P7** | Unlock filter on words island (known letters only) | P6, mastery EXTEND | Words with unknown letters hidden |
| **P8** | First 40 Band A packs as data (no lemma edits unless a later content phase) | P6 | Pack lesson lists 5 words |
| **P9** | Guided session prototype: warm-up + 1 new concept + evidence + success | P1, P2 | 8–12 minute path from home |
| **P10** | Parent dashboard seed: letters by state + Band A count | P7 | Parents see 12/28 not only stars |
| **P11** | Audio manifest + 28 letter name files | P3 | Play without TTS when file present |
| **P12** | Sentence JSON (first 20 two-word) + reader UI | P8 | Sentence uses only unlocked `wordIds` |
| **P13** | Construction: `order_words` on those sentences | P12 | |
| **P16** | Writing ladder: copy word after trace (reading ≠ writing scores) | P9 | |
| **P19** | Content repair phase (audit REPLACE/REMOVE) — **separate** from architecture | audit | Dataset changes isolated |
| **P20** | Full Band A 120–150 including new lemmas (بنت، ولد، …) | P19 | |

### LATER — depth

| Phase | Objective | Depends on | Test |
| --- | --- | --- | --- |
| **P14** | Story JSON (3 early stories) reusing sentences | P12 | |
| **P15** | Comprehension templates | P14 | |
| **P17** | Deterministic review queue (`review_due`, `struggling`) | mastery EXTEND | Stale items in warm-up; no shame UX |
| **P18** | Expand sentences to ~80, stories to ~12 | P12–P15 | |
| **P21** | Export JSON as canonical; React reads JSON | P3, P20 | No TS tuples required at runtime |
| — | Skill-graph ids on exercises; frequency/recycling metadata | P3, P21 | Session can pick `review_due` + high-frequency |
| — | Optional playful placement (skip ok; does not lock) | P9 | Older beginner can start mid-map |
| — | Parent qualitative skill map (الحروف، الكتابة، …) | P10, skill graph | No fake precision |
| — | Informational texts (reuse story model) | P14 | First nonfiction page recycles Band A |
| — | Grammar-through-usage patterns in sentences | P13 | Gender contrast without terminology |
| — | Content validator (CI) | P21 | Broken `wordIds` fail the build |
| — | Stroke-order tracing engine | P16 | Tracing still works if assets missing |
| — | Band B–D, ~150 sentences, 25–30 stories | P18, P20 | 1000-word catalog still portable |

### FUTURE — platforms and services

| Phase | Objective | Depends on | Test |
| --- | --- | --- | --- |
| **P22** | Android spike: kotlinx.serialization of `letters.json` + mastery port | P21 | Kotlin unit tests for `applyAttempt` |
| — | Native Android app consumes the same JSON | P22 | No content rewrite |
| — | School: Teacher, Class, Student, Assignment, Report | stable ids only | Child app unchanged if offline |
| — | Accounts / cloud backup | optional | Core curriculum still offline |
| — | Optional on-device or future speaking tools | never required | Full path completable without ASR |

---

# Part 19 — Hurufi Al Arabiya Product Principles

Hurufi Al Arabiya has its own identity. Successful Arabic-learning products inspire **patterns**, not content, exercises, wording, illustrations, characters, UI, or curriculum copied verbatim.

1. **MSA-first**  
   العربية الفصحى المعاصرة الواضحة والمناسبة للأطفال.

2. **Decode before memorize**  
   Phonics and decoding remain central. High-frequency words get more encounters; they are not a sight-word substitute for sounding out.

3. **Learn → use → encounter again**  
   Knowledge is intentionally recycled through pictures, listening, decoding, sentences, writing, stories, informational texts, and later review.

4. **Reading AND writing**  
   Writing is a first-class skill with its own evidence. Tracing is a step, not the whole path.

5. **Mastery before vanity metrics**  
   Stars motivate; evidence determines progress. Completing a game is not mastery.

6. **Offline-first core**  
   A child can learn letters, phonics, Band A, and current-level reading without permanent internet access.

7. **Short purposeful activities**  
   Every exercise has an educational reason (skill + content + success + evidence). The product is not judged by how many games it has.

8. **Child simplicity / educational depth**  
   The interface feels simple (islands, short sessions). The underlying curriculum is a skill graph with prerequisites.

9. **Portable curriculum**  
   Educational content belongs to the product, not to React. JSON + schema travel to Kotlin.

10. **Culturally broad Arabic**  
    Vocabulary and contexts understandable across Arab countries, while still allowing culturally valuable regional concepts at appropriate levels (e.g. كسكس in Band C, not Band A).

11. **Progressive independence**  
    The ultimate objective is not completing games; it is reading and writing Arabic increasingly independently — including informational texts, not only stories.

---

# Part 20 — Competitive-inspiration register

This register is for **future product research**. It is not a brief to copy competitors. Do not store copyrighted competitor content, wording, art, characters, or lesson sequences here.

For every useful external idea later, record:

| Field | Meaning |
| --- | --- |
| Idea / pattern | Neutral description (e.g. “short mixed session”) |
| Educational problem | What learner need it addresses |
| Hurufi coverage | Already covered / partial / missing |
| Decision | Adopt / adapt / reject |
| How we differ | MSA, decoding, recycling, offline, original identity |
| Priority | NOW / NEXT / LATER / FUTURE |

**Seed entries (patterns only — not competitor assets):**

| Idea / pattern | Problem it solves | Hurufi | Decision | How we differ | Priority |
| --- | --- | --- | --- | --- | --- |
| Skill graph under a simple child map | Games without literacy goals | Partial (islands, no graph) | **Adapt** | Child never sees prerequisites; parents see qualitative skills | NOW (design), NEXT (ids) |
| High-frequency recycling, not sight-word-only | Words taught once and forgotten | Missing metadata | **Adapt** | Decode evidence required; extra exposure in sentences/stories | NEXT |
| Optional playful placement | Older beginners forced to letter 1 | Missing | **Adapt** | Skippable; never locks content | LATER |
| Deterministic spaced review | Forgetting with no shame | Lightweight notes only | **Adapt** | No punishment UX; not a research SRS | LATER |
| Informational / nonfiction after stories | Reading = only fiction | Missing | **Adapt** | Same sentence table; MSA; recycled `wordIds` | LATER |
| Grammar as usage patterns | Textbook metalanguage too early | Missing | **Adapt** | Matching/order/contrasts; terms late | LATER |
| Guided short session engine | Endless island menu / addictive loops | Missing | **Adapt** | One new concept; evidence; stop | NEXT |
| Separate reading vs writing mastery | Trace stars ≠ can spell | Trace bundled into attempts | **Adapt** | Parallel scores on same word id | NEXT |
| Parent skill report not star dump | Parents cannot see literacy | Stars/streak headline | **Adapt** | Qualitative Arabic domains; no fake precision | LATER |
| School assignable units | Classrooms need the same curriculum | Ids only | **Adopt later** | Offline child app unchanged | FUTURE |

New research updates this table. It must not randomly rewrite the product.

---

# Part 21 — Final architecture check

The intended learner journey is now:

```
readiness
  → letters
  → phonics
  → syllables
  → words
  → sentences
  → writing (parallel, independently scored)
  → comprehension
  → stories
  → informational reading
  → increasingly independent literacy
```

Review and vocabulary recycling run **throughout**, not only at the end.

| Check | Result |
| --- | --- |
| Curriculum not tied to React | Canonical JSON + schema; React is the prototype |
| Android will not require rewriting educational content | Same ids, mastery functions, asset ids, AudioManager concept |
| MSA policy preserved | Audit statuses; Band placement; culturally broad Arabic |
| 720 audited words can be incorporated progressively | Inventory + bands + packs; not dumped as a dictionary |
| Future 1000+ vocabulary remains feasible | Rows in JSON; validator later; recycling makes the catalog useful |
| Assessment is mastery-based | Diagnostic / formative / mastery; stars ≠ proof |
| Reading and writing independently measurable | Split evidence on the same content ids |
| Offline learning remains possible | Core JSON + audio + progress local; no cloud ASR |
| Future school support does not complicate now | Entities documented; no auth/network in current implementation |
| ~8 mastery-based levels remain | Yes; not age-locked |
| Band A remains 120–150 | Yes; growth toward 750–1000+ |
| Existing letters / mastery / progress / tracing extended | Yes; not discarded |

---

*End of architecture (revision 2). Only `docs/curriculum-architecture.md` was modified. Source files, datasets, routes, UI, progress, audio, dependencies, and the word audit were not modified.*
