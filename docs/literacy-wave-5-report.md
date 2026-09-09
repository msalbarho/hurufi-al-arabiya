# Literacy Wave 5 — implementation report

Fifth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–4 remain frozen SHOW → PRACTICE → TEST references. Band A v1 is unchanged. **Wave 6 is not implemented.**

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-5.json`  
Meta id: `hurufi.production.literacy.wave5`  
Path: `path.literacy.wave5`  
Route slug: `wave-5`

---

## Why ك won over ن and خ

Wave 4 introduced a real phonics rule (sukun + first CVCC words). Wave 5 consolidates: **one new consonant + known fatha**, with sukun reused inside words.

Band A has no fatha-only ن or خ word whose other letters are already taught:

- **نَار** needs madd (a new major rule). قَمَر is fatha-only and does not unlock madd.
- **نَعَم** is fatha-only but needs ع.
- **لَبَن** is 720-only; Band A v1 rejected it in favor of حَلِيب.
- **أَخ** needs hamza.
- **خُبْز** needs damma + ز.

**كَلْب** is Band A A1, core, letters ك + ل + ب, phonics fatha + already-taught sukun.

---

## Why كَلْب is the first target

It is the only high-payoff Band A word that becomes decodable after teaching ك alone, without kasra, damma, madd, hamza, ة, or a second new letter.

Pause/citation form is CVCC (`/kalb/`), the same class as قَلْب. Child UI never says “CVCC”.

There is **no كَلْب presentation**. LessonPlayer drains presentations first.

---

## كَلْب vs قَلْب

The first scored decode choices are **كَلْب**, **قَلْب**, and foil **قَلَم**.

This is the same contrast family as حَمَل vs جَمَل. The child must pick the new word, not the already-known heart.

---

## Why Wave 5 reuses rather than re-teaches sukun

Wave 4 already scored:

- `diacritic:mim.sukun.discrimination`
- `letter:ram.closed`
- `word:raml.decoding`
- `word:qalb.decoding`

Wave 5 does **not** add a sukun-mark lesson, a closed-chunk SHOW, or a new `letter:*.closed` key. Sukun appears only inside كَلْب and بَحْر, plus compact قَلْب review.

---

## Why بَحْر is the second target

After كَلْب, Band A has no second fatha/sukun ك word with only known letters (كِتَاب / كُوب need extra rules).

**بَحْر** uses already-taught ب ح ر and reused sukun. It expands useful nature vocabulary (pairs with جَبَل / رَمْل) without a new letter or new rule.

Initial ب was never scored in Waves 1–4 (only medial and final ب). FORM PREP BEFORE DEPENDENT WORD: scored **بـ** comes first.

---

## Unit flow

| # | Unit id | Child title | Teaches | Required evidence |
| --- | --- | --- | --- | --- |
| 1 | `unit.literacy.wave5.kaf` | تَعَلَّمْ حَرْفَ ك | SHOW ك, SHOW كَ, scored ك, scored كَ | `letter:kaf.sound`, `letter:kaf.fatha` |
| 2 | `unit.literacy.wave5.kalb` | نَقْرَأُ مَعًا | initial كـ, then كَلْب vs قَلْب | `letter:kaf.form.initial`, `word:kalb.decoding` |
| 3 | `unit.literacy.wave5.bahr` | اِقْرَأْ كَلِمَاتِي | initial بـ, then بَحْر, compact قَلْب | `letter:ba.form.initial`, `word:bahr.decoding`, `word:qalb.review` |

Optional tracing ك is in Unit 1 and does **not** gate. Optional dog/sea pictures are reinforcement after decoding.

Prerequisite: Unit 1 `prereqUnitIds` = `unit.literacy.wave4.qalb`. Later units unlock sequentially. No `wave5Unlocked` flag.

---

## Mastery contract

Same engine and thresholds as Wave 4 (`minAttempts: 3`, `minAccuracy: 0.7`, `minStreak: 2`, `minSessions: 1`).

| Unit | Required live keys | Must not gate |
| --- | --- | --- |
| 1 | `letter:kaf.sound`, `letter:kaf.fatha` | presentation, tracing |
| 2 | `letter:kaf.form.initial`, `word:kalb.decoding` | picture; `word:qalb.decoding` |
| 3 | `letter:ba.form.initial`, `word:bahr.decoding`, `word:qalb.review` | picture; `word:qalb.decoding` must not substitute for `.review` |

Kasra/damma/madd/hamza skills are not required. Presentations stay attempts 0.

---

## No new engine capability

Content-only plus normal wave registration:

- `wave5Bundle.ts`
- `validateLiteracyWave5.ts`
- slug `wave-5` on `LEARN_WAVE_SLUGS`
- prototype emoji overrides (🐶 / 🌊)

No new exercise type. No LessonPlayer change. No mastery/store change. No missing_haraka or closed-chunk change.

---

## Routing

`/learn` lists `wave-1` → `wave-2` → `wave-3` → `wave-4` → `wave-5`. Finish still returns to `/learn`. **No Wave 6 CTA and no `/learn/wave-6/...` route.**

---

## Known prototype limitations

- Logical audio/image ids are reserved. There is no final production audio or image set in this slice.
- Picture exercises still use prototype emoji fallbacks (`🐶` for كَلْب, `🌊` for بَحْر).
- Tracing uses the existing isolated canvas; stroke order is later.
- Child UI does not expose CVCC terminology.

---

## Wave 6

**Wave 6 is not implemented.** This slice stops after Wave 5 Unit 3.
