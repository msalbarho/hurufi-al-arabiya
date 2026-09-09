# Literacy Wave 13 — implementation report

Thirteenth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–12 remain frozen educational v1. Band A v1 is unchanged. **Wave 14 is not implemented.**

This is **CONTENT + EXISTING SHORT-VOWEL + MADD ENGINES**. Wave 13 introduces exactly one new productive phonics rule, **kasra (ِ)**, on already-taught **ك**, transfers already-established madd-alif onto **تَا**, then decodes **كِتَاب**.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-13.json`  
Meta id: `hurufi.production.literacy.wave13`  
Path: `path.literacy.wave13`  
Route slug: `wave-13`

Progression (live, existing unseen-presentation scheduler):

كَ → ك + ِ → كِ → scored كِ → تَ + ا → تَا → scored تَا → كِ + تَا → كِتَا → كِتَا + ب → كِتَاب → audio decode كِتَاب

Exactly **three** units. No new consonant. No damma. No madd-yaa / madd-waw. No hamza, shadda, tanween, ة, ى, diphthong, sentence, or ال.

---

## Why kasra is the only new phonics rule

After Wave 12 the child can read with fatha, sukun, closed/CVCC decoding, and madd-alif /ā/. Kasra has appeared only as a **foil** (Wave 1 missing-haraka on م). Foil exposure is not mastery.

The next productive short-vowel contrast is **َ vs ِ** on a known consonant, then transfer into a real word. Damma, madd-yaa, and madd-waw stay later.

---

## Why ك is the carrier

كَ vs كِ is the smallest honest first contrast:

- ك is established (Wave 5 sound/fatha; initial كـ in كَلْب; final ـك in سَمَك)
- Isolated كَ / كِ does not fight positional-form teaching
- /a/ vs /i/ on a stop is easy to hear
- The same carrier feeds **كِتَاب**

مَ / بَ / جَ were weaker first carriers: no equally strong A1 picture noun without extra rules.

---

## Why direct syllable discrimination is enough

Wave 4 needed **mark discrimination + closed chunk** because sukun is a new mark class plus a new syllable shape.

Kasra is another **short vowel on the existing CV engine**. SHOW already displays ك + ِ → كِ. The scored beat is hear **كِ**, choose **كِ / كَ / مِ**.

That writes `letter:kaf.kasra`. A second gate `diacritic:kaf.kasra.discrimination` would over-test.

---

## Why no mark-only kasra gate

Do not require `missing_haraka` or `diacritic:kaf.kasra.discrimination` in this wave.

Historical Wave 1 kasra foils wrote fatha discrimination, not kasra mastery. Mark-only kasra can wait for a later transfer wave.

---

## Why كِتَاب wins

Canonical: `word.kitab`  
Legacy: `school-6`  
Band: A / A1  
teachingForm: **كِتَاب**  
Letters: ك ت ا ب  
Phonics: kasra + fatha + existing madd-alif  
Prototype: 📕

It is a high-frequency school noun in a reading app. Alternatives were worse as a **first** kasra word:

- **فِيل / حَلِيب** need madd-yaa
- **عِنَب** needs medial ن
- **جِسْم / بِنْت** bundle sukun (and extra forms)
- **مِفْتَاح** is heavier than كِتَاب (sukun + تَا + five letters)

---

## Why تَا must be explicitly prepared

كِتَاب is **كِ + تَا + ب**, not كِ + تَ + ا + ب.

Madd-alif on ت has never been scored. `letter:ta.fatha` is short تَ. Historical `letter:ba.madd_alif` / `letter:jim.madd_alif` / `letter:nun.madd_alif` cannot substitute.

Decoding كِتَاب right after Unit 1 would smuggle an unscored madd carrier.

---

## Why `letter:ta.madd_alif` is required

Same transfer contract as Waves 11–12: score the new carrier’s CVV (`syllable_blending`) before the word.

Live key: **`letter:ta.madd_alif`** from generic `getSyllableLiveKey({ letterLegacyId: "ta", vowelSkillId: "skill.long_vowel.madd" })`.

Foils: **تَ** (length) and **بَا** (carrier).

---

## Why historical madd carriers cannot substitute

They remain Wave 10 / 11 / 12 evidence. Unit 2 requires only `letter:ta.madd_alif`. بَا is a foil, not a gate.

---

## Joining behavior of كِتَاب

Connection determines shape, not character index.

ك is dual-joining and connects into ت → **initial كـ** (already scored Wave 5).

ت receives inbound from ك and connects into ا → **medial ـتـ** (already scored Wave 6).

ا accepts inbound and **breaks forward**.

ب after that break has no inbound join and nothing after → **isolated ب**, not final ـب.

Wave 13 follows Waves 11–12 connection logic. It does **not** repeat Wave 10’s frozen “final ب” label from بَاب.

---

## Why no new form quiz is needed

Historical form evidence already covers the shapes that appear:

- `letter:kaf.form.initial`
- `letter:ta.form.medial`

Do not quiz medial/final ك, final ت, final/isolated ب, or `letter:alif.sound`. Isolated ب after alif is letter identity, not a new gate.

---

## Why 3 units are pedagogically justified

كِتَاب needs three honest firsts: **new short vowel**, **new madd carrier**, **word decode**.

- Wave 10: new rule + word, no extra carrier → 2
- Wave 11: transfer + word, no new vowel → 2
- Wave 12: new letter + transfer + word → 2
- Wave 13: new **vowel** + extra transfer + word → **3**

Packing kasra with تَا, or تَا with first decode, overloads a first. Three units is not padding.

---

## Why madd-yaa is postponed

فِيل / حَلِيب need /ī/. Current `skill.long_vowel.madd` facets to **`madd_alif`**. Wave 13 does not retarget that engine.

---

## Why sentences remain postponed

كِتَاب is a noun. الْكِتَاب / هَذَا كِتَابٌ need ال, هذا, and tanween. UI chrome does not count. Same postpone as after نَار.

---

## Units

| # | Unit id | Child title | Teaches | Required evidence |
| --- | --- | --- | --- | --- |
| 1 | `unit.literacy.wave13.kaf_kasra` | كِ | SHOW كَ; SHOW ك + ِ → كِ; scored كِ vs كَ / مِ | `letter:kaf.kasra` |
| 2 | `unit.literacy.wave13.ta_madd_alif` | تَا | SHOW تَ + ا → تَا; scored تَا vs تَ / بَا | `letter:ta.madd_alif` |
| 3 | `unit.literacy.wave13.kitab` | كِتَاب | unscored كِ + تَا → كِتَا then كِتَا + ب → كِتَاب; audio/print كِتَاب vs دَفْتَر / كَلْب; optional 📕 | `word:kitab.decoding` |

Prerequisite: `unit.literacy.wave12.nar`. Later units unlock sequentially. No `wave13Unlocked` flag.

Presentations stay attempts 0. Picture is reinforcement and does not gate. No review key. No tracing.

---

## Review

No required review. Historical keys are not reused as gates. Recycled كَ / مِ / تَ / بَا / دَفْتَر / كَلْب are foils only.

---

## Routing

`/learn` lists `wave-1` → … → `wave-12` → `wave-13`. Finish still returns to `/learn`. **No Wave 14 CTA and no `/learn/wave-14/...` route.**

Wave 13 stays locked until Wave 12 Unit 2 is mastered. After Wave 12: Unit 1 unlocked, Units 2–3 locked.

---

## No new engine capability

Wave 13 is **CONTENT + EXISTING SHORT-VOWEL + MADD ENGINES**.

Existing generic helpers already produce:

```ts
getSyllableLiveKey({ letterLegacyId: "kaf", vowelSkillId: "skill.short_vowel.kasra" })
// → letter:kaf.kasra

getSyllableLiveKey({ letterLegacyId: "ta", vowelSkillId: "skill.long_vowel.madd" })
// → letter:ta.madd_alif
```

`show:"cv"` uses `harakaCarrier` (tatweel + ِ). `show:"chunk"` reads `left` / `right` / `result`. No `if kaf` / `if kasra` / `if wave13` was added to engine code.

The generic lesson scheduler always plays unseen presentations first, then continues forward through required indexes. Each unit’s JSON therefore opens with its SHOW beats.

---

## Known prototype limitations

- Logical audio/image ids are reserved. There is no final production audio or image set in this slice.
- Picture exercises still use prototype emoji fallbacks (`📕` for كِتَاب).
- Optional pictures may be skipped after required mastery (accepted reinforcement-skip, same as Waves 10–12).

---

## Headed browser verification

Seeded Waves 1–12 in `hurufi-progress-v1`, then walked Wave 13 in headed Chrome against the running app. Clicked **كِ**, **تَا**, and **كِتَاب** explicitly.

| Check | Result |
| --- | --- |
| `/learn` shows Wave 13 with exactly 3 units | Pass |
| No Wave 14 | Pass |
| Wave 13 locked before Wave 12 Unit 2 mastery | Pass |
| After Wave 12: Unit 1 unlocked, Units 2–3 locked | Pass |
| Unscored familiar كَ SHOW | Pass |
| Unscored ك + ِ → كِ; kasra on tatweel and on كِ | Pass |
| No damma in the kasra SHOW glyphs | Pass (`ك`, `ـِ`, `كِ`) |
| First scored item: hear كِ | Pass |
| Choices كِ / كَ / مِ; clicked كِ | Pass |
| Live key `letter:kaf.kasra`; no `diacritic:kaf.kasra.discrimination` | Pass |
| Unscored تَ + ا → تَا with plain ا | Pass |
| Scored تَا vs تَ / بَا; clicked تَا | Pass |
| Live key `letter:ta.madd_alif` | Pass |
| Historical ta fatha and ba/jim/nun madd unchanged | Pass |
| Unscored كِ + تَا → كِتَا then كِتَا + isolated ب → كِتَاب | Pass |
| Joined result كِتَاب; no final ـب quiz | Pass |
| First scored word is audio/print كِتَاب vs دَفْتَر / كَلْب; clicked كِتَاب | Pass |
| Picture not first evidence | Pass |
| Optional 📕 after decode | Accepted skip after mastery (same as Waves 10–12) |
| No damma, madd-yaa, madd-waw, hamza, shadda/tanween, ة/ى, or review gate | Pass |
| Finish CTA → `/learn`; Unit 3 mastered | Pass |
| Wave 12 still shows نَ / نَا / نَار; no كِتَاب leak | Pass |

IndexedDB after the walk: new `letter:kaf.kasra`, `letter:ta.madd_alif`, `word:kitab.decoding` (each 3/3 correct). Historical `letter:kaf.fatha`, `letter:ta.fatha`, `letter:ba.madd_alif`, `letter:jim.madd_alif`, `letter:nun.madd_alif` keep their seeded timestamps. No `diacritic:kaf.kasra.discrimination`. Presentation rows stay attempts 0. No new `.closed` key from kasra. The generic player also writes `letter:kaf` / `letter:ta` as seen (attempts 0) identity rows; that is existing `markSeen` behavior, not a Wave 13 special case.

---

## Wave 14

**Wave 14 is not implemented.** This slice stops after Wave 13 Unit 3.

Recommended later: **kasra transfer** onto another taught-letter picture noun (after any missing form prep), not madd-yaa and not sentences.
