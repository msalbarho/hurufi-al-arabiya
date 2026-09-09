# Literacy Wave 9 — implementation report

Ninth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–8 remain frozen educational v1. Band A v1 is unchanged. **Wave 10 is not implemented.** This is the last planned consonant-only wave. The next major direction is **madd-alif**, not another consonant.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-9.json`  
Meta id: `hurufi.production.literacy.wave9`  
Path: `path.literacy.wave9`  
Route slug: `wave-9`

Progression:

ع → عَ → عـ → ـسـ → ـل → عَسَل

Exactly **two** units. One new letter. One new word.

---

## Why ع was selected

After Wave 8 the child reads ش and شَمْس. The last compact Band A one-letter fatha unlock that stays content-only is **عَسَل**.

ع wins because it:

- unlocks a strong A1 food word immediately
- stays fatha-only
- needs no sukun, madd, hamza, or a second missing letter
- stays content-only

ن / ه / خ / ط remain blocked by madd, hamza, or another missing letter. They are not Wave 10.

---

## Why it follows ش

Wave 7 taught س. Wave 8 taught the س-family partner ش and reused س inside شَمْس. ع is the remaining compact guttural that unlocks a real word without a new phonics rule.

It is articulatorily harder than س / ش, but the existing SHOW → hear → identify → fatha → decode path is enough. No new articulation engine is added.

---

## Why عَسَل is the target

Canonical: `word.asal`  
Legacy: `food-19`  
Band: A / A1  
teachingForm: عَسَل  
Letters: ع س ل  
Phonics: fatha only

It is familiar food vocabulary, visually suitable (prototype 🍯), and strictly decodable after ع plus already-taught س and ل. It does not need sukun, madd, kasra, damma, hamza, ة, or ى.

There is **no عَسَل presentation**. First evidence is `audio_to_word`. Choices are already-decoded **سَمَك** and **جَمَل**.

---

## Why fatha-only decoding is appropriate

Inspected teachingForm: عَسَل = ع + َ + س + َ + ل.

No new phonics rule is required. Wave 4 sukun stays unused. Madd-alif is later.

---

## Why Wave 9 has only 2 units

There is one new letter and one new word. A third unit would be empty padding.

The approved compact flow is:

1. teach ع and عَ
2. prepare the printed forms used in عَسَل, then decode عَسَل

---

## Actual positional-form audit

Scored positional forms through Wave 8:

| Wave | Scored form |
| --- | --- |
| 1 | medial ـلـ |
| 2 | final ـر, medial ـبـ, initial فـ |
| 3 | initial حـ, medial ـجـ |
| 4 | final ـب |
| 5 | initial كـ, initial بـ |
| 6 | initial تـ, medial ـتـ |
| 7 | initial سـ, final ـك |
| 8 | initial شـ, final ـس |

عَسَل prints عـ + ـسـ + ـل.

- initial عـ: never scored → required  
- medial ـسـ: Wave 7 scored سـ, Wave 8 scored ـس, never ـسـ → required  
- final ـل: Wave 1 scored only medial ـلـ → **never scored** → required  

---

## Final-ل decision

**New scored prep is required.**

`letter:lam.form.final` is part of the Wave 9 mastery contract. Historical `letter:lam.form.medial` cannot substitute.

Do not quiz isolated/medial/final ع, unused س forms, or extra ل forms.

---

## Why no second target word was forced

No other Band A word becomes strictly decodable from ع alone under known fatha. Remaining letters need madd, hamza, or another untaught consonant. Forcing a weak second word would pad the wave.

---

## Why no review gate was added

Known words already appear as foils. A `word:*.review.wave9` key would need a store facet and would not teach the new letter. Required evidence stays:

- new letter
- needed positional forms
- عَسَل decoding

---

## Why articulation does not need new architecture

ع is harder to produce than س / ش. The child still uses the existing path: see ع, hear ع, choose ع, blend عَ, then read عَسَل.

The Unit 1 SHOW prompt is a short listening cue (`اِسْتَمِعْ: هَذَا حَرْفُ ع`). There is no technical phonetics text and no new scored articulation exercise type.

---

## Why consonant-only expansion stops after this wave

The remaining unused consonants do not unlock a clean one-letter fatha word. The next educational jump is a **rule**, not another letter.

Do not plan Wave 10 as ه, ط, ن, or خ merely because those letters remain.

---

## Why madd-alif is next

مَدّ is a new major phonics rule (بَ vs بَا). The engine does not yet present or score madd. Likely first vocabulary: بَاب / لَا / دَجَاج.

**Madd-alif is not implemented here.**

---

## Unit flow

| # | Unit id | Child title | Teaches | Required evidence |
| --- | --- | --- | --- | --- |
| 1 | `unit.literacy.wave9.ain` | تَعَلَّمْ حَرْفَ ع | SHOW ع, SHOW عَ, scored ع (foils ح م س), scored عَ | `letter:ain.sound`, `letter:ain.fatha` |
| 2 | `unit.literacy.wave9.asal` | نَقْرَأُ مَعًا | initial عـ, medial ـسـ, final ـل, then عَسَل vs سَمَك / جَمَل | `letter:ain.form.initial`, `letter:sin.form.medial`, `letter:lam.form.final`, `word:asal.decoding` |

Optional tracing ع is in Unit 1 and does **not** gate. Optional honey picture is reinforcement after decoding.

Prerequisite: Unit 1 `prereqUnitIds` = `unit.literacy.wave8.shams`. Unit 2 unlocks sequentially. No `wave9Unlocked` flag.

---

## Mastery contract

Same engine and thresholds as Waves 4–8 (`minAttempts: 3`, `minAccuracy: 0.7`, `minStreak: 2`, `minSessions: 1`).

| Unit | Required live keys | Must not gate |
| --- | --- | --- |
| 1 | `letter:ain.sound`, `letter:ain.fatha` | presentation, tracing |
| 2 | `letter:ain.form.initial`, `letter:sin.form.medial`, `letter:lam.form.final`, `word:asal.decoding` | picture; old `letter:lam.form.medial`; any review key |

Kasra/damma/madd/hamza/sukun-discrimination/closed-chunk/articulation skills are not required. Presentations stay attempts 0.

---

## Canonical word mapping

Copied from Band A v1. Band A itself is not mutated.

| Word | Canonical | Legacy | Band | Letters |
| --- | --- | --- | --- | --- |
| عَسَل | `word.asal` | `food-19` | A1 | ع س ل |

---

## No new engine capability

Content-only plus normal wave registration:

- `wave9Bundle.ts`
- `validateLiteracyWave9.ts`
- slug `wave-9` on `LEARN_WAVE_SLUGS`
- prototype emoji override (🍯)

No new exercise type. No LessonPlayer change. No mastery/store change. No `hurufi-progress-v1` change. No sukun/closed-chunk change. No articulation facet.

---

## Routing

`/learn` lists `wave-1` → … → `wave-8` → `wave-9`. Finish still returns to `/learn`. **No Wave 10 CTA and no `/learn/wave-10/...` route.**

---

## Sukun

عَسَل contains no sukun. Wave 9 does not recycle sukun, add mark discrimination, or add a closed chunk.

---

## Known prototype limitations

- Logical audio/image ids are reserved. There is no final production audio or image set in this slice.
- Picture exercises still use prototype emoji fallbacks (`🍯` for عَسَل).
- Tracing uses the existing isolated canvas; stroke order is later.
- Optional pictures/tracing may be skipped after required mastery (accepted reinforcement-skip).

---

## Wave 10

**Wave 10 is not implemented.** This slice stops after Wave 9 Unit 2.

The next planned phase is **madd-alif**, not another consonant wave.
