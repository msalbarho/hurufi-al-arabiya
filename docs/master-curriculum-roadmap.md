# Hurufi Al Arabiya — Master Curriculum Roadmap

**Status:** **RE-FROZEN v1 — FINAL WAVE = 22**  
**Audience:** planning / curriculum architecture only  
**This freeze:** compress the numbered Wave phase; migrate remaining objectives into post-wave Modules / Chapters  
**Does not implement:** Wave 20, Wave 21, Wave 22, any Module, schema changes, Band A JSON, audio production, runtime  

**Companion docs:** `docs/curriculum-architecture.md`, `docs/band-a-vocabulary-plan.md`, `docs/content-contract.md`  
**Wave reports:** `docs/literacy-wave-1-report.md` … `docs/literacy-wave-19-report.md`  
**Language policy:** clear child-appropriate Modern Standard Arabic  
**Portability:** JSON + stable IDs. React is the prototype. Kotlin + Jetpack Compose is the later client. Routes are not the curriculum.

---

## FINAL WAVE COUNT = 22

The literacy **Wave** phase ends permanently at **Wave 22**.

There will be **no Wave 23, Wave 24, …, Wave 36**.

The previous roadmap that extended numbered waves to approximately Wave 36 is **superseded**. The old Wave 23–36 **numbering is retired**.

Educational objectives formerly assigned to Waves 23–36 are **not deleted**. They continue after Wave 22 as **Modules / Chapters**, in pedagogical order, with the same dependencies.

| Band | Status |
| --- | --- |
| Waves **1–19** | **Implemented. FROZEN v1.** Do not rewrite, renumber, merge, or edit. |
| Wave **20** | **Planned only.** Approved 1-unit word decoding of `يَلْعَبُ`. Do not redesign. Do not implement in this freeze. |
| Wave **21** | **Planned only.** Article ال + first contextual sentence `الْوَلَدُ يَلْعَبُ`. |
| Wave **22** | **Planned only. FINAL WAVE.** Foundation consolidation + handoff into Modules. |
| After Wave 22 | **No more Waves.** Curriculum continues through Modules / Chapters. |

---

## 0. Freeze notice

This is the single canonical Master Curriculum Roadmap after the Wave-phase compression.

It supersedes the prior FROZEN v1 text wherever they disagree, especially:

- “final numbered phonics wave: 36”
- any active plan that treats Waves 23–36 as future Waves

Binding Policy A corrections remain:

- dual-layer vocalization
- first real sentence is `الْوَلَدُ يَلْعَبُ`
- ال immediately after the damma / `يَلْعَبُ` arc
- `ـٌ` is taught **alone**, after the first definite sentence, **not** as Wave 22 by default
- `ـٍ` and `ـً` stay late
- `مَعَ` does not need damma
- Wave 17 was a language spark, not a sentence wave (implemented)

**Rejected as canonical fully vocalized sentences** (mention only as illegal examples):

- `وَلَد يَلْعَبُ`
- `هِيَ بِنْت`
- `هَذَا كِتَاب`
- `هَذِهِ بِنْت`
- `هُوَ وَلَد`

---

## 1. Product-wide vocalization contract (Policy A)

Hurufi uses **two layers**. They are not interchangeable.

| Layer | What it is | Example | Where it lives |
| --- | --- | --- | --- |
| Lexical lemma | Unvocalized dictionary key; no `ال` | `ولد` | `word.walad.lemma` |
| Standalone teaching / citation form | Child-facing word card; nouns pause without tanween | `وَلَد` | `word.teachingForm` / card `diacritized` |
| Contextual sentence surface form | Fully vocalized MSA in a sentence or story | `وَلَدٌ` or `الْوَلَدُ` | sentence `diacritized` (authoritative) |

**Hard rule:** `word.teachingForm !==` sentence token surface form.

### 1.1 Cards

Standalone **noun** cards stay pause/citation **without tanween**:

- `وَلَد`
- `بِنْت`
- `كِتَاب`

Standalone **verb** cards stay Band A imperfect 3ms, including final ḍamma:

- `يَلْعَبُ`

Do not create a second word id for `الْوَلَدُ` or `وَلَدٌ`.

### 1.2 Sentences and stories

Canonical sentences and stories use **fully vocalized contextual MSA**.

Legal examples:

- `الْوَلَدُ يَلْعَبُ`
- `وَلَدٌ يَلْعَبُ`
- `هِيَ الْبِنْتُ`
- `هِيَ بِنْتٌ`
- `هَذَا الْكِتَابُ`
- `هَذَا كِتَابٌ`

Sentence `diacritized` is the source of truth.

Authors **curate** those strings. There is **no** runtime morphology generator, iʿrāb engine, NLP parser, or automatic case assigner.

### 1.3 What the child is taught

The child **reads the visible mark**.

The child is **not** taught:

- مبتدأ مرفوع
- خبر مرفوع
- فاعل
- اسم مجرور
- معرفة / نكرة as school terms

Internal skills may still be precise (`language.article.al`, `skill.tanween.damm`).

### 1.4 Waqf

Last-word **waqf** may affect **spoken** narration of the final word.

It does **not** change the early **written** contract. Do not spell `هَذَا كِتَاب` as the teaching sentence because pause drops /n/.

### 1.5 Minimum sentence data contract (planning only)

Do not implement this now. Do not change schemas in this freeze.

```
id
diacritized          // authoritative contextual MSA
text?                // optional unvocalized
wordIds[]            // lexical ids; must not require teachingForm equality
requiredSkillIds[]
audioAssetId         // sentence-level asset, not concatenated word clips
imageAssetId?
```

Optional `tokens[]` later only if tap-highlight / alignment needs them. Authored `surfaceDiacritized` would then be allowed to differ from `teachingForm`.

---

## 2. Verified learner state after Wave 19

**Final implemented unit:** `unit.literacy.wave19.bul_closed`

Waves 1–19 are immutable historical curriculum. See their literacy-wave reports. This section only records the exit state.

### Taught consonants (17)

م ل ق د و ج ي ر ب ف ح ك ت س ش ع ن

`letter.ha` is **حاء** (Wave 3), not هاء.

ا is taught as a **madd carrier** (Wave 10), not as a new consonant.

ي and و are already consonants. Madd-yaa and madd-waw are new *uses* of known letters.

### Productive phonics

- fatha, kasra, damma
- sukun
- open CV, closed CVC, longer CVCC
- madd-alif
- generic CV / CVC engines
- kasra carriers including كِ عِ جِ بِ
- damma carriers بُ كُ
- closed-class proofs: fatha `رَمْ`, kasra `جِسْ`, damma `بُلْ`

### Decoded words and utterances (implemented)

قلم، قدم، ولد، جمل، يد، قمر، جبل، فم، حجر، حمل، رمل، قلب، كلب، بحر، تمر، دفتر، سمك، شمس، عسل، باب، دجاج، نار، كتاب، عنب، جسم، بنت  
plus Wave 17 utterances `نَعَم` `لَا`, joiner `وَ`, phrase `وَلَد وَبِنْت`

`يَلْعَبُ` is **not** yet a decoded word. Wave 20 owns it.

### Shared skills that exist but are not yet Wave-phase classes

`skill.shadda.basic`, `skill.hamza.reading`, `skill.taa_marbuta.reading`, `skill.alif_maqsura.reading`

Damma is now productive (Waves 18–19). Madd exists for ـَا only. No `skill.tanween.*` or article skill in shared-skills yet (add when implementing the relevant Wave/Module, not in this freeze).

### Band A lexical policy (unchanged)

Nouns: pause/citation without tanween.  
Verbs: imperfect 3ms including final ḍamma.  
Lemmas exclude ال.  
Band A v1 = 135 words. Band ≠ teaching order. **Do not modify Band A JSON in this freeze.**

### Band A function words in catalog

هذا، هذه، هو، هي، في، على، هنا، نعم، لا

---

## 3. Remaining consonants

**10 untaught:** ث خ ذ ز ص ض ط ظ غ ه (`letter.haa`)

**Introduction order (payoff, not abjad) — now Module 2 (implemented):**

1. ه
2. ذ
3. ز
4. خ
5. ث
6. ص then ض
7. غ
8. ط
9. ظ

ص is taught before ض. غ is taught after ص/ض so `صَغِير` is legal. ظ is last. These are **not** future Waves.

---

## 4. Remaining phonics inventory

After Wave 19, still remaining (Wave 21 owns #2; everything after Wave 22 is Modules):

1. ال (article skill — letters already known) — **Wave 21**
2. Tanween damm `ـٌ` (reading) — **Module 1**
3. Madd-yaa — **Module 1**
4. Madd-waw — **Module 1**
5. Remaining consonants — **Module 2**
6. Shadda — **Module 2**
7. Hamza — **Module 2**
8. ة — **Module 2**
9. ى — **Module 2**
10. Tanween `ـٍ` then `ـً` when a real context exists — **later Modules (not Module 1, not Module 2)**
11. Sun/moon **SHOW-only** after shadda — **Module 2 Unit 7** (`الشَّمْس` vs known moon `الْوَلَدُ`). No classification table. No `article:sun_assimilation.*` mastery key.

Do not add iʿrāb tables or full conjugation.

---

## 5. High-level stages

| Stage | Name | Organizational unit | Role |
| --- | --- | --- | --- |
| **1** | Frozen foundation | Waves 1–19 | Done. Immutable. |
| **2** | First word + first sentence + handoff | Waves 20–22 | Decode `يَلْعَبُ`; read ال + `الْوَلَدُ يَلْعَبُ`; consolidate; **end of Waves** |
| **3** | Complete core decoding | **Modules 1–2** | `ـٌ`, both remaining madds, remaining letters, shadda, hamza, ة, ى |
| **4** | Functional sentence language | **Module 3** | Pronouns, demonstratives, prepositions, verbs, adjectives |
| **5** | Expanding reading and writing | **Modules 4–5** | Phrase/sentence copy, construction, dictation |
| **6** | Comprehension | **Module 6** | Who/what/where, sequence |
| **7** | Stories | **Module 7** | 25–30 short stories |

Stages overlap. Stage 4 begins at the first legal sentence (Wave 21) and expands in Module 3.

---

## 6. Stage-by-stage learner outcomes

### Stage 1 — Frozen foundation (Waves 1–19)

- Decode CV / CVC / CVCC with fatha, kasra, damma, sukun, madd-alif
- 26 decoded core nouns; citation cards only
- Language spark: نعم / لا / وَ / وَلَد وَبِنْت
- Trace letters / some syllables; citation writing look
- Word–picture meaning
- **Exit:** already met (`بُلْ`; all three short-vowel closed classes exist)

### Stage 2 — First word, first sentence, handoff (Waves 20–22)

- **Goals:** decode the first damma word; read ال; read the first real sentence; prove the foundation holds as connected reading
- **Phonics new in this stage:** article ال only (Wave 21)
- **Vocabulary:** `يَلْعَبُ`; `الْوَلَد` as sentence surface of known `وَلَد`
- **Language:** first SV frame with article
- **Reading:** word `يَلْعَبُ`; sentence `الْوَلَدُ يَلْعَبُ`; reuse known words
- **Writing:** no new writing mastery in Waves 20–22 (citation writing already started in Wave 17)
- **Comprehension:** picture match for “who is playing?”
- **Exit:** child reads `الْوَلَدُ يَلْعَبُ` and can re-read a small known set without a new phonics class. Ready for Modules.

### Stage 3 — Complete core decoding (Modules 1–2)

- **Goals:** `ـٌ`; madd-yaa/waw; remaining letters; shadda; hamza; ة; ى; later `ـٍ`/`ـً` and sun/moon hearing
- **Vocabulary:** grow from ~30 toward ~90–110 actively taught words
- **Exit:** decode the full alphabet + short vowels + madd + sukun + shadda + ال + `ـٌ`

### Stage 4 — Functional sentence language (Module 3)

- Everyday MSA frames without grammar labels
- **Exit:** 15–20 frame types (`هَذَا الْكِتَابُ`, `هِيَ الْبِنْتُ`, `الْكِتَابُ فِي…`)

### Stage 5 — Expanding reading/writing (Modules 4–5)

- Phrase and sentence copy of **contextual** `diacritized`
- Audio dictation of 2–4 words / short sentences
- **Exit:** dictate a known 3-word contextual sentence; copy a 5–6 word line

### Stage 6 — Comprehension (Module 6)

- Yes/no, who/what/where, 2–3 event order
- **Exit:** 3 questions about a 5–6 sentence Policy A text

### Stage 7 — Stories (Module 7)

- 25–30 stories; tap-word audio; retell
- **Exit:** read a 10–15 sentence story with support

---

## 7. Wave roadmap (1–22 only)

Numbered waves are **foundational decoding** plus the Wave 17 language spark. Transfers are grouped. **There are no waves after 22.**

### 7.1 Waves 1–19 — implemented / frozen

Do not rewrite, renumber, or merge. Historical reports are the source of educational detail.

| Waves | Role (historical, not a redesign) |
| --- | --- |
| 1–16 | Letters, fatha, kasra, sukun, madd-alif, first word bank through `بِنْت` |
| 17 | Language spark: `نَعَم` `لَا` `وَ` `وَلَد وَبِنْت`; citation writing look |
| 18 | Open damma class: `بُ` then `كُ` |
| 19 | Closed damma CVC proof: `بُلْ` |

### 7.2 Wave 20 — planned (approved; do not redesign; do not implement here)

**ONE compact unit. Word decoding only.**

| Field | Contract |
| --- | --- |
| Target | `يَلْعَبُ` |
| Record | `word.yalab` |
| Prerequisite | `unit.literacy.wave19.bul_closed` |
| Flow | SHOW يَ + لْ → يَلْ ; SHOW يَلْ + عَ → يَلْعَ ; SHOW يَلْعَ + بُ → يَلْعَبُ ; scored `audio_to_word` |
| Required live key | `word:yalab.decoding` |
| Forbidden | sentence, ال, pronoun, tanween, new phonics, writing, `وَلَد يَلْعَبُ` |

Keep Band A verb teaching form `يَلْعَبُ`. Do not strip the final ḍamma.

### 7.3 Wave 21 — planned (article + first contextual sentence)

**Role:** word decoding → functional sentence reading.

Preserve the strongest existing intention:

- introduce the definite article **ال**
- reach the first canonical contextual sentence **`الْوَلَدُ يَلْعَبُ`**

Policy A still applies. **Do not** use `وَلَد يَلْعَبُ`.

Suggested compact shape (audit at implement time; do not implement now):

| Unit | Child target | Notes |
| --- | --- | --- |
| 1 | ال + `الْوَلَدُ` | Article on known `وَلَد`. Ending is ordinary ḍamma, not tanween. |
| 2 | `الْوَلَدُ يَلْعَبُ` | Compose/read the first real sentence. Picture match. |

A one-unit slice is allowed only if the implement-time audit shows article + sentence can stay readable without a second gate. Default preference: **two compact units**.

| Check | Detail |
| --- | --- |
| Why legal | Fully vocalized MSA: definite nominative subject + indicative imperfect. No hidden tanween. |
| Phonics | Fatha, sukun, damma already productive. New skill: ال. Letters ا ل و د ي ع ب already taught. |
| Vocabulary | `word.walad` + `word.yalab` |
| Internal | `language.article.al`, `language.sentence.sv.imperfect` |
| Child-facing | “ال at the beginning means *the*”; picture of a boy playing → read `الْوَلَدُ يَلْعَبُ` |
| Not this | `وَلَد يَلْعَبُ`. `وَلَدٌ يَلْعَبُ` waits for Module 1 `ـٌ`. |

Lemma remains `ولد`. ال is sentence furniture, not a second Band A id.

### 7.4 Wave 22 — planned (FINAL WAVE: foundation consolidation + handoff)

Wave 22 is **not** “introduce every remaining mark.”  
Wave 22 is **not** automatically tanween (that was old Wave 22; retired).

**Role:** prove the learner can combine foundational skills already acquired, then hand off to Modules.

Recommended compact content (one or two units; lock at Wave 22 audit):

- reuse known short vowels, sukun, and madd-alif (no new class)
- reread a small set of already-decoded words
- reinforce `يَلْعَبُ`
- reread `الْوَلَدُ يَلْعَبُ`
- light sentence–picture match / “who is playing?”
- transition from isolated decoding to **connected reading of already-legal material**

**Do not put in Wave 22:**

- madd-yaa, madd-waw
- shadda, hamza, ة, ى
- remaining consonants
- pronouns, demonstratives, question words
- tanween `ـٌ` / `ـٍ` / `ـً`
- full story curriculum
- all Band A words

**Exit:** the Wave phase is complete. The child is a foundation reader of the first sentence and the known word bank. Next organizational unit is **Module 1**.

---

## 8. Estimated / final Wave number

**FINAL WAVE COUNT = 22**

After Wave 22, stop `wave-N`. Continue as Modules / Chapters with IDs such as `module.foundations.tanween_damm`, `module.letters.haa`, `story.early.01` — **not** `wave.23`.

---

## 9. Retired Wave 23–36 numbering

The following **wave numbers are retired**. They must not appear as future implementation targets.

| Retired wave | Former primary objective | New destination |
| --- | --- | --- |
| 22 *(old role)* | Tanween `ـٌ` | **Module 1** (Wave 22 is now consolidation) |
| 23 | Madd-yaa intro `فِي` | **Module 1** |
| 24 | Madd-yaa transfer `فِيل` `كَبِير`؛ `الْكِتَابُ كَبِيرٌ` | **Module 1** |
| 25 | Madd-waw `يَقُولُ` | **Module 1** |
| 26 | Letter ه + `هِيَ الْبِنْتُ` | **Module 2** (letter) + **Module 3** (pronoun frame) |
| 27 | `هُوَ الْوَلَدُ` `هُنَا` | **Module 3** (needs Module 2 ه) |
| 28 | Letter ذ + هذا / هذه frames | **Module 2** (letter) + **Module 3** (demonstratives) |
| 29 | Shadda `سِنّ` | **Module 2** |
| 30 | Hamza `أَب` | **Module 2** |
| 31 | ة `كُرَة` then `مَدْرَسَة` | **Module 2** |
| 32 | ى `يَرَى`; SHOW `عَلَى` | **Module 2** (ى decode) + **Module 3** (preposition frame) |
| 33 | Letters ز، خ | **Module 2** |
| 34 | ث + `ثَلْج`; ص then ض; غ `صَغِير` | **Module 2** |
| 35 | Letter ط `مَطَر` | **Module 2** (`قِطّ` only after shadda, optional / non-gating) |
| 36 | ض after ص; ظ last; sun SHOW-only after shadda; late `ـٍ`/`ـً` | **Module 2** (ض/ظ + sun SHOW) + **later Modules** (`ـٍ`/`ـً` when contextual use exists). Not Module 1. |

Suggested extras that were never their own waves remain extras: `يَشْرَبُ` / `يَلْبَسُ` as damma-word transfers inside **Module 3** (or a light Module 1 review), not a new Wave 20 redesign.

---

## 10. Post-wave Modules / Chapters

Curriculum **does not end** at Wave 22. The organizational unit changes from Wave to **Module**.

Prefer **seven** meaningful modules rather than another 14 micro-waves.

| Module | Name | Owns |
| --- | --- | --- |
| **1** | Complete Reading Foundations | madd-yaa; madd-waw; tanween-damm `ـٌ`; limited sentence transfer (`فِي`, `فِيل`, `كُوب`, `يَقُولُ`, `كَبِير`, `كِتَابٌ`, `وَلَدٌ يَلْعَبُ`, `الْكِتَابُ كَبِيرٌ`) |
| **2** | Remaining Letters & Orthographic Forms | ه ذ ز خ ث ص ض غ ط ظ; shadda; initial hamza `أ`; ة; ى; first payoff words; module-local `ثَلْج` `ظَهْر`; sun article SHOW-only after shadda. **Not** `ـٍ`/`ـً`. **Not** Module 3 frames. |
| **3** | Functional Words & Sentence Expansion | Pronouns, demonstratives, prepositions, questions, linking, negation, verbs, adjectives, gender/number meaning, possession |
| **4** | Reading + Writing | Citation → phrase → sentence **copy**; image-to-write; audio-to-write of known citation words |
| **5** | Sentence Construction & Dictation | Build 2–4 word contextual sentences; audio sentence dictation |
| **6** | Comprehension | Yes/no, who/what/where, 2–3 event order, short passages |
| **7** | Stories / Fluent Reading | 25–30 stories; narration; highlight; tap-word audio; retell |

Modules may overlap in the child’s week. They must not dump all leftover objectives into one bag.

Mastery states remain: `not_seen` → `introduced` → `practicing` → `mastered` → `needs_review`, keyed by stable skill/content IDs. Do not design the Module runtime in this freeze.

---

## 11. Damma plan (historical + Wave 20)

Already implemented: Wave 18 open → Wave 19 closed-class proof.

- **Wave 20:** `يَلْعَبُ` as a word (approved plan; do not redesign)
- **Strong later words:** `يَشْرَبُ`, `يَلْبَسُ` — Module 3 transfers, not extra Waves
- **Wave 20 must not present** the illegal string `وَلَد يَلْعَبُ`
- Keep Band A verb teaching form `يَلْعَبُ`

---

## 12. Article ال plan

**Placement: Wave 21**, immediately after `يَلْعَبُ`.

- **First use:** `الْوَلَدُ`
- **First sentence:** `الْوَلَدُ يَلْعَبُ`
- **Letters:** ا + ل already taught
- **Ending:** ordinary ḍamma, not tanween
- **Internal:** `language.article.al`
- Sun/moon: **SHOW-only** in **Module 2 Unit 7** after shadda (`الشَّمْس` vs `الْوَلَدُ`). No “14 sun letters” recitation. No sun-assimilation mastery key. Functional frames stay Module 3.

---

## 13. First real sentence

### THE canonical first real sentence

**`الْوَلَدُ يَلْعَبُ`**

Wave 21 owns it. Wave 22 rereads it. Modules expand from it.

`وَلَدٌ يَلْعَبُ` is legal **after Module 1 `ـٌ`**, not in Wave 21 or Wave 22.

---

## 14. Tanween plan

### `ـٌ` — Module 1 (retired old Wave 22)

- After damma, ال, and `الْوَلَدُ يَلْعَبُ` (Waves 20–21 done; Wave 22 consolidation done)
- Before canonical indefinite frames (`هَذَا كِتَابٌ`, `هِيَ بِنْتٌ`, `وَلَدٌ يَلْعَبُ`)
- Teach **alone**
- Internal: `skill.tanween.damm`
- Child-facing: “a light noon sound at the end”
- Recognition / decoding first; production / dictation later
- **Cards stay** `كِتَاب` `بِنْت` `وَلَد`

Module 1 may show the contrast pair:

- card `وَلَد`
- sentence `وَلَدٌ يَلْعَبُ`

### `ـٍ` — later Modules (not Module 1)

When a real prepositional / reading context needs it. Prefer definite `فِي الْبَيْتِ` first (kasra, often no tanween). Not owned by Module 1.

### `ـً` — later still

Only when a real accusative/reading need exists. Do not complete a three-mark set for symmetry. Not owned by Module 1.

**Module 2 does not mean “introduce tanween.”** `ـٌ` is Module 1. `ـٍ` and `ـً` remain deferred past Module 2.

---

## 15. Madd-yaa plan — Module 1

- Order: ـِي before ـُو
- Prerequisites: kasra + letter ي + madd concept (madd-alif already Wave 10)
- First function word: `فِي`
- Content words: `فِيل`, `كَبِير`; bonus `سَعِيد` (letters taught)
- Adjective frame: `الْكِتَابُ كَبِيرٌ` only after `ـٌ`
- Contrast: كِ vs كِي

---

## 16. Madd-waw plan — Module 1

- Prerequisites: damma + letter و + madd-yaa contrast
- First word: `يَقُولُ` (`word.yaqul`)
- Contrast: ـُ vs ـُو

---

## 17. Shadda plan — Module 2

- First **required** taught-letter word: `سِنّ` (`word:sinn.decoding`)
- Do not lead with `قِطّ` (needs ط **and** shadda). Optional SHOW `قِطّ` after shadda is legal; not required.
- Progression: see mark `ّ` → hear doubling → contrast `سِن` / `سِنّ` → decode `سِنّ`
- Child-facing: the mark makes the consonant sound pressed/doubled. No formal grammar terms.
- No `diacritic:shadda.*` mastery namespace.
- After shadda presentation, SHOW sun article `الشَّمْس` vs known moon `الْوَلَدُ`. Recycle only. One whole clip `audio.sentence.orthographic_foundations.alshamsu`. Do not concatenate.

---

## 18. Hamza / ة / ى plan — Module 2

| Skill | First payoff | Notes |
| --- | --- | --- |
| Initial hamza `أ` | `أَب` (required `word:ab.decoding`) | Contrast `ا` vs `أ`. Optional SHOW `أَسَد`. Defer `إ` `ؤ` `ئ` `ء` `آ`, medial/final hamza, `يَأْكُلُ`, `مَاء`. Do not write `letter:alif.sound` as new evidence. |
| ة | `كُرَة` then `مَدْرَسَة` | Both required. Contrast ة / ه / ت. Pause reading as -ah. No feminine grammar. No new letter id. |
| ى | Score `يَرَى` | Contrast `ى` / `ي`. SHOW-only `عَلَى` — do not score `word:ala.decoding`. Preposition frame is Module 3. |

Exposure-first; one simple contrast each. No school hamza-seat chapter.

---

## 19. Remaining-letter plan — Module 2

Payoff order as in §3. Not alphabetical. Nine units. New consonants use exactly two evidence points: `letter:{legacyId}.sound` + `word:{slug}.decoding`. Forms are SHOW-only.

| Unit | Letters | Required words |
| --- | --- | --- |
| 1 | ه (`letter.haa`, not ح `letter.ha`) | `نَهْر` |
| 2 | ذ (`letter.thal`, never `letter.dhal`) then ز | `لَذِيذ` then `مَوْز` |
| 3 | خ then ث | `خُبْز` then module-local `ثَلْج` (not `ثَلَاثَة`) |
| 4 | ص then ض | `حِصَان` then `بَيْض` — do not use `صَغِير` before غ |
| 5 | غ | `صَغِير` — do not use `غُرْفَة` (ة not taught yet) |
| 6 | ط then ظ (last) | `مَطَر` then module-local `ظَهْر` — not `قِطّ` |

After Unit 6 all 28 base letters are taught. That is derived from unit mastery. No `alphabet.complete` key.

ه and ذ come **early inside Module 2** because they unlock pronoun and demonstrative **contextual** sentences in Module 3. Module 2 does not score those frames.

---

## 20. Vocabulary progression

Do not teach all 135 Band A words in wave order.

| Tier | Role |
| --- | --- |
| Decoding core | Prove a phonics class |
| Sentence core | Build frames |
| High-frequency functional | Glue (نعم، لا، و، هنا، في) |
| Thematic | After the frame exists |
| Enrichment | Band B+ / rare letters |

| Milestone | Actively taught words |
| --- | --- |
| After Wave 19 | ~28 (26 nouns + نعم/لا) |
| First sentence (Wave 21) | ~30–35 |
| End of Wave 22 | still ~30–35 (reuse, not dump) |
| After Module 1 | ~40–50 |
| After Module 3 demonstrative frames | ~50–70 |
| First micro-story (Module 7 gate) | **70–90** |
| End of Modules 1–3 | **110–135** |
| End of early-literacy path | **200–300** |

---

## 21. Functional-language progression

Internal IDs stay precise. Child activities stay concrete. Teach contextually, not as grammar lectures.

| Internal skill | Child-facing activity | When |
| --- | --- | --- |
| `language.response.naam` | Picture question → tap نعم | Wave 17 (done) |
| `language.negation.laa` | Picture → لا | Wave 17 (done) |
| `language.conjunction.wa` | ولد **و** بنت | Wave 17 (done) |
| `language.article.al` | كتاب card vs `الْكِتَابُ` in a sentence | Wave 21 |
| `language.sentence.sv.imperfect` | Picture → `الْوَلَدُ يَلْعَبُ` | Wave 21 |
| `language.tanween.damm` | Hear/read light noon on `كِتَابٌ` in a sentence | Module 1 |
| `language.preposition.fi` | Object in a box → في | Module 1 |
| `language.adjective.kabir` | `الْكِتَابُ كَبِيرٌ` | Module 1 |
| `language.pronoun.hiya` | Match هي; read `هِيَ الْبِنْتُ` | Module 3 (after Module 2 ه) |
| `language.pronoun.huwa` | Match هو; read `هُوَ الْوَلَدُ` | Module 3 |
| `language.demonstrative.hadha` | `هَذَا الْكِتَابُ` then `هَذَا كِتَابٌ` | Module 3 (after Module 2 ذ) |
| `language.demonstrative.hadhihi` | `هَذِهِ الْبِنْتُ` then `هَذِهِ بِنْتٌ` | Module 3 |
| `language.preposition.ala` | Object on a table → على | Module 3 (after Module 2 ى) |
| `language.question.man` | `مَنْ هَذَا؟` | Module 3 |

Sequence: responses → joiner phrase → damma verb word → ال + first sentence → Wave 22 consolidate → Module 1 `ـٌ` + madd/في → Module 2 letters/orthography → Module 3 pronoun/demonstrative frames → على → questions → later dual/plural/possession.

### 21.1 Function-word sets Module 3 must eventually cover

Teach in small contextual families, not as lists to memorize:

- Demonstratives: هذا، هذه، هذان، هاتان، هؤلاء، ذلك، تلك
- Pronouns: أنا، أنتَ، أنتِ، هو، هي، نحن، هم…
- Question words: من، ما، ماذا، أين، متى، كيف، كم، لماذا
- Prepositions: في، على، من، إلى، عن، مع، لـ، بـ
- Linking: و، فـ، ثم، أو، لكن
- Negation: لا، ليس، ما
- Plus: verbs; singular / dual / plural meaning; masculine / feminine; possession; attached pronouns; adjective agreement; time/place language

Band A currently has هو / هي / هذا / هذه / في / على / هنا / نعم / لا only. Do not invent extra Band A lemmas in this freeze.

---

## 22. Demonstratives roadmap — Module 3

Do not teach the full set in the Wave phase.

| Stage | Written frames | When |
| --- | --- | --- |
| First useful pair | **`هَذَا الْكِتَابُ` / `هَذِهِ الْبِنْتُ`** | Module 3 (ه + ذ + ال). No `ـٌ` required for these |
| Indefinite contrast | **`هَذَا كِتَابٌ` / `هَذِهِ بِنْتٌ`** | Same module after Module 1 `ـٌ` |
| Later | ذلك / تلك | Optional enrichment |
| Much later | هذان / هاتان / هؤلاء | After dual/plural *meaning* |

**Rejected canonical forms:** `هَذَا كِتَاب` and `هَذِهِ بِنْت`.

---

## 23. Pronouns roadmap — Module 3

| Stage | Written frames | When |
| --- | --- | --- |
| 1 | **`هِيَ الْبِنْتُ`** | Module 3 (ه + ال + kasra) |
| 2 | **`هُوَ الْوَلَدُ`** | Module 3 (ه + damma + ال) |
| After `ـٌ` | **`هِيَ بِنْتٌ`** | Allowed once Module 1 `ـٌ` is taught |
| Later | أنا، أنتَ، أنتِ | After hamza (Module 2) |
| Later | نحن / هم | After plural meaning |
| Later | كتبي-style suffixes | Module 4–5 |

**Rejected canonical forms:** `هِيَ بِنْت` and `هُوَ وَلَد`.

Wave 27 no longer exists as a wave. Formal هُوَ teaching is Module 3, not a Wave.

---

## 24. Prepositions roadmap

| Stage | Form | Gate |
| --- | --- | --- |
| 1 | `وَ` as AND | Wave 17 phrase (done) |
| 2 | `فِي` | Madd-yaa (Module 1). In Band A |
| 3 | `عَلَى` | ى (Module 2) then frame in Module 3. In Band A |
| 4 | `مِنْ` | Letters م ن + kasra + sukun — decodable now; not in Band A; Module 3 |
| 5 | `مَعَ` | **`مَعَ`** = fatha + fatha; letters م + ع taught; **not** a damma word; **not** in Band A; Module 3 |
| 6 | إلى، عن، بـ، لـ | Module 3 later chapters |

Do not teach all eight in Wave 22.

---

## 25. Question-word roadmap — Module 3 / 6

Not in Band A function list yet. Language modules, not Waves.

| Stage | Word | Notes |
| --- | --- | --- |
| 1 | `مَنْ` | فatha + sukun. Letters م ن taught. **Not** `مِنْ` |
| 2 | `مَا` / `مَاذَا` | Oral then reading |
| 3 | `أَيْنَ` | After hamza; pair with في / على / هنا |
| 4 | كَيْفَ / كَمْ | Later |
| 5 | مَتَى / لِمَاذَا | Module 7 stories |

---

## 26. Verb roadmap

**Band A verbs (do not invent extras):** يأكل، يشرب، يلعب، ينام، يجلس، يكتب، يقرأ، يفتح، يذهب، يرى، يمشي، يقول، يأتي، يغلق، يلبس، يغسل.

| Stage | Verbs | Gate |
| --- | --- | --- |
| First word | `يَلْعَبُ` | Wave 20 |
| First sentence | `الْوَلَدُ يَلْعَبُ` | Wave 21 |
| Transfer | يشرب، يلبس | Module 3 (same phonics) |
| Later | ينام، يكتب، يجلس، يفتح | Check each teachingForm |
| After ذ | يذهب | Module 2–3 |
| After madd-yaa | يمشي | Module 1–3 |
| After madd-waw | يقول | Module 1–3 |
| After hamza | يأكل، يقرأ، يأتي | Module 2–3 |
| After ى | يرى | Module 2–3 |
| After غ | يغلق، يغسل | Module 2–3 |

`تَلْعَبُ` for بنت is a generated agreement form, not a separate Band A lemma.

---

## 27. Adjective roadmap — Module 1 then 3

**In Band A:** كبير، صغير، سعيد، حزين، طويل، قصير، بارد، سريع، حارّ, plus colors.

**Not found in Band A:** جميل، جديد، قديم، نظيف، وسخ، ساخن، بطيء.

First frame after madd-yaa + `ـٌ`: `الْكِتَابُ كَبِيرٌ`.

---

## 28. Gender / number / possession — Module 3+

- Gender: ولد / بنت (already decoded); هو / هي (Module 3); هذا / هذه (Module 3); adjective agreement after ة
- Number: singular through Module 3; dual/plural as meaning then later chapters; no tables
- Possession: Module 4–5; Band A does not yet drive كتابي teaching forms

---

## 29. Sentence-reading progression

**Before any canonical sentence:**

- every letter in that sentence taught
- every mark a taught class
- no card-form substitution inside the sentence
- `diacritized` is fully vocalized contextual MSA
- a picture carries meaning

| Order | Form | Class | Gate |
| --- | --- | --- | --- |
| 0 | `نَعَم` / `لَا` | Utterances | Wave 17 (done) |
| 0b | `وَلَد وَبِنْت` | Coordinated **phrase** | Wave 17 (done) |
| 1 | **`الْوَلَدُ يَلْعَبُ`** | First real sentence | Wave 21 |
| 1b | reread first sentence | Consolidation | Wave 22 |
| 2 | `وَلَدٌ يَلْعَبُ` | Indefinite twin | Module 1 (`ـٌ`) |
| 3 | `الْكِتَابُ كَبِيرٌ` | Adjective | Module 1 |
| 4 | `هِيَ الْبِنْتُ` / `هُوَ الْوَلَدُ` | Pronoun definite | Module 3 |
| 5 | `هِيَ بِنْتٌ` | Pronoun indefinite | Module 3 after `ـٌ` |
| 6 | `هَذَا الْكِتَابُ` / `هَذِهِ الْبِنْتُ` | Demonstrative definite | Module 3 |
| 7 | `هَذَا كِتَابٌ` / `هَذِهِ بِنْتٌ` | Demonstrative indefinite | Module 3 |
| 8 | `الْكِتَابُ فِي…` | Place | في + place noun |
| 9 | `الْقَلَمُ عَلَى…` | Place | على + ال |
| 10 | `مَنْ هَذَا؟` | Question | after `مَنْ` is catalogued |

Wave 22 may match / reread row 1. It does not jump to rows 2–10.

---

## 30. Writing policy

Writing remains **first-class**. Compressing Waves must not remove it.

| Task | Form | Example |
| --- | --- | --- |
| Trace / copy letter | letter | ب |
| Trace / copy syllable | taught CV | بِ ، مُ |
| Picture → write **word** | **citation** | `بِنْت` |
| Audio citation → write | **citation** | `وَلَد` |
| Word copy | **citation** | `كِتَاب` |
| Copy / dictate **sentence** | **contextual `diacritized`** | `الْوَلَدُ يَلْعَبُ` later `هَذَا كِتَابٌ` |

These are not two lemmas. They are card form vs sentence form.

**Wave 17 writing lift (done):** citation look. No sentence writing yet.  
**Waves 20–22:** no new writing mastery. Reading/decoding and sentence reading only.  
**Modules 4–5** own the rest of the ladder.

Progression:

1. trace letter  
2. copy letter  
3. trace syllable  
4. copy syllable  
5. trace word (citation)  
6. copy word (citation)  
7. image → choose/write citation word  
8. audio → write citation word  
9. copy 2-word **contextual** phrase (from Wave 21 material, practiced in Module 4)  
10. sentence copy  
11. audio sentence dictation  
12. independent short writing  

---

## 31. Dictation policy

| Type | Form | When |
| --- | --- | --- |
| Letter | letter sound | Wave 17+ (started) |
| Syllable | taught CV | historical Waves 18–19 |
| Word | **citation** | after the word is decoded and copied — Module 4 |
| Phrase / sentence | **contextual** | Module 5 (material may be Wave 21’s sentence) |

Never dictate unread marks. Do not dictate `كِتَابٌ` until Module 1 `ـٌ` is taught. Do not dictate `الْوَلَدُ` before Wave 21.

---

## 32. Audio policy (planning only)

Do **not** modify audio-production files in this freeze.

| Asset | Matches | Example |
| --- | --- | --- |
| `audio.word.*.citation` | standalone citation form | `بِنْت` |
| `audio.sentence.*` | that sentence’s authoritative `diacritized` | `الْوَلَدُ يَلْعَبُ` |

**Do not concatenate** citation word clips to fake a sentence.

Early `ـٌ` teaching audio (Module 1) should pronounce /un/ so the mark is audible.

Later story narration **may** use natural waqf on the last word. The **written** sentence still shows the full contextual form.

---

## 33. Comprehension progression — Wave 21 seed, Module 6 home

Word–picture (already) → sentence–picture from **`الْوَلَدُ يَلْعَبُ`** (Wave 21–22) → yes/no → who/what/where → 2–3 events → short passage → story questions (Modules 6–7).

Tap-the-picture / tap-the-word. Not exams.

---

## 34. First micro-story readiness — Module 7 gate

Appropriate only when **all** of this is true:

- contextual sentence surfaces (Policy A)
- **no card-form substitution** inside sentences
- full short vowels needed by the story (including damma)
- madd-alif
- madd-yaa
- ال
- usable pronouns and/or demonstratives in **legal** frames
- `فِي`
- at least 3 verbs
- at least 2 adjectives or place words
- about **70–90** actively taught words
- sentence–picture comprehension
- tap-word audio for every story word
- no unread letter or mark

**Earliest honest window:** after Modules **1–3** (هذا/هذه + في + several verbs + ة/ى as needed), **not** after Wave 21 or Wave 22.

Do **not** lock a sample story that contains untaught morphology.  
Do **not** place full story curriculum inside Wave 22.

Prefer **definite** frames in the first micro-stories if `ـٌ` is still new for that child.

Illustrative *pattern* only (not a locked text; `بَيْت` must be taught first):

`هِيَ بِنْتٌ. هَذِهِ بِنْتٌ. الْبِنْتُ فِي الْبَيْتِ. الْبِنْتُ تَلْعَبُ.`

If `ـٌ` should stay light, use:

`هِيَ الْبِنْتُ. هَذِهِ الْبِنْتُ. الْبِنْتُ فِي الْبَيْتِ. الْبِنْتُ تَلْعَبُ.`

---

## 35. Story progression — Module 7

Target: **25–30** short stories. **Same Policy A** as sentences.

| Stage | Length | Constraints | Features |
| --- | --- | --- | --- |
| Early | 5–6 sentences | Taught letters/marks only; 0–2 new words; full contextual vocalization; prefer definite frames | Narration, highlight, tap-word audio, 2 picture questions |
| Middle | 8–10 | ال + هذا/هذه + في/على + 4–6 verbs; ة and ى if taught | Who/what/where, 3-event sequence, oral retell |
| Advanced | 10–15 | `ـٌ` common; hamza common; still no unread glyphs | Passage questions, optional copy-one-sentence |

Later unvocalized / partial vocalization may exist as a **separate advanced challenge**. It is **not** the default story policy.

Stories share the sentence table (`sentenceId` on pages). One vocalization contract.

---

## 36. Case-ending policy

The child may read:

- `الْوَلَدُ`
- `كِتَابٌ`
- `الْبَيْتِ`

without learning case names.

Early sentences and stories remain **fully vocalized**.

| Stage | Written endings |
| --- | --- |
| First sentence (Wave 21) | Full marks; **definite** so the ending is ordinary ḍamma |
| After Module 1 | Full `ـٌ` on indefinite frames |
| After في/على | Full genitive on the object (`فِي الْبَيْتِ`) |
| `ـٍ` / `ـً` | Only when those marks appear in authored text |

Never show `وَلَد يَلْعَبُ` as simpler MSA.

---

## 37. Verb-final-damma consistency

Band A lexicalizes `يَلْعَبُ` on the verb **card**. Do not strip it.

In sentences, keep the indicative `يَلْعَبُ`.

Noun cards omit tanween (pause). Sentences supply noun inflection (`الْوَلَدُ` / `وَلَدٌ`).

Keeping verb ḍamma while omitting required noun inflection in the **same sentence** is inconsistent. That is why `وَلَد يَلْعَبُ` is rejected.

---

## 38. Function-word vocalization table

| Word | Child-facing form | Phonics | After W19? | Gate if not |
| --- | --- | --- | --- | --- |
| نعم | `نَعَم` | fatha; ن ع م | Yes — Wave 17 | done |
| لا | `لَا` | fatha + madd-alif | Yes — Wave 17 | done |
| و | `وَ` | fatha | Yes — Wave 17 | done |
| في | `فِي` | kasra + madd-yaa | No | Module 1 |
| على | `عَلَى` | fatha + ى | No | Module 2 + Module 3 |
| هو | `هُوَ` | damma + fatha; **ه** | No | Module 3 |
| هي | `هِيَ` | kasra + fatha; **ه** | No | Module 3 |
| هذا | `هَذَا` | fatha + madd-alif; ه ذ | No | Module 3 |
| هذه | `هَذِهِ` | fatha + kasra; ه ذ | No | Module 3 |
| من (prep.) | `مِنْ` | kasra + sukun; م ن | Decodable; **not in Band A** | Module 3 |
| من (question) | `مَنْ` | fatha + sukun; م ن | Decodable; **not in Band A** | Module 3; **not** `مِنْ` |
| مع | `مَعَ` | **fatha + fatha**; م ع | Decodable; **not in Band A**; **no damma** | Module 3 |

---

## 39. مع correction

`مَعَ` is fatḥa + fatḥa. Letters م and ع are already taught. It does **not** need damma.

It is **not** in Band A. Do **not** add it to Wave 20–22. Introduce later via a catalog + Module 3 decision.

Keep distinct: `مَعَ` ≠ `مِنْ` ≠ `مَنْ`.

---

## 40. Parent-dashboard mastery groups (do not implement)

Letters; short vowels; madd; sukun; shadda; tanween; word decoding; vocabulary; sentence reading; functional language; writing; dictation; comprehension; stories.

The Wave → Module change does **not** abandon mastery.

---

## 41. When numbered waves stop

Stop at **Wave 22** when:

- the child decodes `يَلْعَبُ`
- the child reads ال and `الْوَلَدُ يَلْعَبُ`
- foundational short vowels, sukun, madd-alif, and known words still hold in connected reading

Remaining consonants, remaining madds, shadda, hamza, ة, ى, `ـٌ`, and function-word families continue as **Modules 1–7**.

---

## 42. Age / difficulty guidance

Mastery gates advancement, never birthday.

| Band | Rough age | Typical stage |
| --- | --- | --- |
| Foundation | 4–5 | Waves 1–22 through `الْوَلَدُ يَلْعَبُ` + consolidation |
| Emerging reader | 5–6 | Modules 1–3 |
| Early independent reader | 6–7+ | Modules 4–7 |

---

## 43. Major curriculum risks

1. Putting citation nouns inside sentences (`وَلَد يَلْعَبُ`)
2. Cramming old Waves 23–36 into Wave 22
3. Teaching هذا frames as `هَذَا كِتَاب` without ال or `ـٌ`
4. Teaching all tanween together
5. Alphabetical remaining letters (parking ه/ذ)
6. Concatenating citation audio into “sentences”
7. Runtime iʿrāb generation
8. Dumping all 135 Band A words into Waves 20–22
9. Calling Wave 17 or Wave 22 a dump of leftover phonics
10. Treating React routes as the curriculum source of truth
11. Dropping writing because Waves were compressed
12. Placing full stories in Wave 22
13. Silently keeping “Wave 23” as an implementation target

---

## 44. Portability

- Curriculum source of truth: portable JSON + stable IDs + this document’s contracts
- Same records for React now and Kotlin + Jetpack Compose later
- Do not author curriculum in React components or Compose UI
- Skill IDs (`skill.tanween.damm`, `language.article.al`, later `module.*`) must remain platform-neutral
- The Wave → Module rename is organizational. It is not a React-specific architecture

---

## 45. What this freeze does not change

- Waves 1–19 production JSON
- Band A JSON
- Runtime code, schemas, validators, LessonPlayer, progress store
- Audio/image production pipelines
- No Wave 20 / 21 / 22 implementation
- No Module implementation

---

## 46. Immediate next implementation step (after this freeze)

**Implement Wave 20 only** (separate task), following the already-approved 1-unit `يَلْعَبُ` plan.

Then: plan/implement Wave 21 (ال + `الْوَلَدُ يَلْعَبُ`).  
Then: plan/implement Wave 22 (consolidation + handoff).  
Then: Module 1 (`ـٌ` + madds), not Wave 23.

Do **not** start Wave 20 in the same change set as this freeze.

---

## Consistency audit (re-frozen v1)

| # | Check | Result |
| --- | --- | --- |
| 1 | No canonical `وَلَد يَلْعَبُ` | Pass — rejected only |
| 2 | No canonical `هِيَ بِنْت` | Pass — rejected only |
| 3 | No canonical `هَذَا كِتَاب` | Pass — rejected only |
| 4 | First real sentence is `الْوَلَدُ يَلْعَبُ` | Pass — Wave 21 |
| 5 | ال is not parked at old Wave ~31 | Pass — Wave 21 |
| 6 | `ـٌ` is not first introduced as leftover Wave-36 content | Pass — Module 1 |
| 7 | Wave 17 does not claim a complete sentence | Pass — implemented utterances + phrase |
| 8 | Wave 20 does not claim `وَلَد يَلْعَبُ` | Pass — word `يَلْعَبُ` only |
| 9 | `وَلَد وَبِنْت` labeled phrase/activity | Pass |
| 10 | `مَعَ` has no damma dependency | Pass — fatha+fatha |
| 11 | Standalone writing remains citation-form | Pass |
| 12 | Sentence writing is contextual | Pass |
| 13 | Story text follows Policy A | Pass |
| 14 | Band A noun cards remain unchanged | Pass — freeze forbids JSON edits |
| 15 | No morphology engine proposed | Pass |
| 16 | Waves 1–19 remain frozen | Pass |
| 17 | Waves 20–22 are not implemented in this freeze | Pass |
| 18 | Final Wave = 22 | Pass |
| 19 | No active future Wave 23–36 plan | Pass — numbering retired; objectives migrated |
| 20 | Wave 22 is consolidation, not a phonics dump | Pass |

---

MASTER CURRICULUM ROADMAP RE-FROZEN — FINAL WAVE = 22
