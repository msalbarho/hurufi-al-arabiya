# Literacy Wave 14 — implementation report

Fourteenth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–13 remain frozen educational v1. Band A v1 is unchanged. **Wave 15 is not implemented.**

This is **CONTENT + EXISTING KASRA + FORM + WORD ENGINES**. Wave 14 does **not** introduce a new phonics rule. It **transfers** productive kasra from historical `letter:kaf.kasra` onto a new carrier **عِ**, prepares the genuinely new positional form **medial ن = ـنـ**, then decodes **عِنَب**.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-14.json`  
Meta id: `hurufi.production.literacy.wave14`  
Path: `path.literacy.wave14`  
Route slug: `wave-14`

Progression (live, existing unseen-presentation scheduler):

عَ → ع + ِ → عِ → SHOW ـنـ → scored عِ → scored ـنـ → عِ + نَ → عِنَ → عِنَ + ب → عِنَب → audio decode عِنَب

Exactly **two** units. No new consonant. No new short-vowel rule. No sukun, damma, madd-yaa / madd-waw, hamza, shadda, tanween, ة, ى, diphthong, sentence, or ال.

---

## Why this is kasra transfer, not a new rule

Wave 13 already taught kasra productively on **كِ** and wrote `letter:kaf.kasra`. Wave 14 reuses `skill.short_vowel.kasra` on a **new carrier**. Historical kaf kasra must not substitute. Historical `letter:ain.fatha` must not substitute either: fatha on ع is not kasra on ع.

The child is not retaught كَ → كِ as mastery. An unscored reminder of familiar **عَ** is allowed so the new contrast عِ / عَ is honest.

---

## Why عِنَب wins over جِسْم

Canonical: `word.inab`  
Legacy: `fruits-4`  
Band: A / A3  
teachingForm: **عِنَب**  
Letters: ع ن ب (all already taught)  
Phonics: **kasra + fatha only**  
Prototype: 🍇

**جِسْم** would bundle the first kasra *transfer* with a **kasra-onset closed chunk**. Historical sukun evidence is fatha-closed (رَمْ, قَلْ, كَلْ). That is a new syllable job, not a transfer job. The 🧍 picture is also weaker than 🍇. **جِسْم is postponed to Wave 15.**

Other postponed words:

- **بِنْت / مَسْجِد / مِفْتَاح** — sukun (and extra length)
- **فِيل / حَلِيب** — madd-yaa
- **سَرِير** — madd-yaa
- **قِطّ / سِنّ** — shadda

---

## Why ع is the new kasra carrier

ع is already scored for sound, fatha, and **initial form** (Wave 9 عَسَل). Transferring kasra onto a known dual-joining letter keeps the new work to **one vowel on a new carrier**, then a real word.

كِ remains available as a **foil**, proving the child must hear عِ rather than reuse historical kaf kasra.

---

## Why medial ن must be prepared

Connection determines shape, not string index.

For **عِنَب**:

- ع is dual-joining → **initial عـ**
- ن receives inbound from ع and connects into ب → **medial ـنـ**
- ب receives inbound from ن and has nothing after → **final ـب**

Wave 12 scored only `letter:nun.form.initial` for نَار. **Initial ن must not substitute for medial ن.** That shape is genuinely required here and was missing.

Historical `letter:ain.form.initial` (Wave 9) and `letter:ba.form.final` (Wave 4 قَلْب) already exist. Wave 14 does not re-gate them. Final ب here is a true final after a connecting letter, unlike Wave 10’s frozen “ب after alif is isolated” case.

---

## Why no sukun is involved

عِنَب decomposes as **عِ + نَ + ب**, not عِنْ, not bare letters. There is no sukun, no closed chunk, and no new `.closed` key. Wave 14 must not reuse جِسْم planning logic.

---

## Why no mark-discrimination gate

Wave 14 is a **carrier transfer**, not a new mark-class lesson. Direct syllable evidence **عِ vs عَ** (with historical **كِ** as foil) writes `letter:ain.kasra`.

Do not require `missing_haraka` or `diacritic:ain.kasra.discrimination`. That would over-test a mark the child already produced on كِ.

---

## Why two units are sufficient

1. **عِ + medial ن** — transfer kasra onto ع, and teach the one missing form the word needs  
2. **عِنَب** — compose then decode the word  

A third unit would only pad review. Picture is reinforcement after decode, not a third gate.

---

## Why picture is reinforcement only

First scored word evidence is `audio_to_word` against already-decoded print words **عَسَل** and **كِتَاب**. 🍇 may follow. Picture does not unlock the unit and is not required mastery.

---

## Units

| Unit | ID | Child title | Required live keys |
| --- | --- | --- | --- |
| 1 | `unit.literacy.wave14.ain_kasra_nun_medial` | عِ | `letter:ain.kasra`, `letter:nun.form.medial` |
| 2 | `unit.literacy.wave14.inab` | عِنَب | `word:inab.decoding` |

Prerequisite: `unit.literacy.wave13.kitab`. Sequential unlock. Finish CTA still `/learn`. No `wave14Unlocked` flag.

Must **not** gate: presentations, `letter:kaf.kasra`, `letter:ain.fatha`, `letter:nun.form.initial`, `letter:nun.fatha`, `letter:ba.form.final`, `letter:ain.form.initial`, mark-discrimination, review, picture, any `.closed` key.

---

## Joining in عِنَب

Recorded `requiredLetterForms`:

- `letter.ain` **initial**
- `letter.nun` **medial**
- `letter.ba` **final**

Compose uses existing 2-slot `show:"chunk"`. The second-slot operand **ب** may look isolated; the **result** `عِنَب` shapes it as final ـب through normal joining. No new final-ba quiz.

Medial-nun SHOW also uses existing `show:"chunk"` (`ـ + ـن → ـنـ`) because letter-mode presentations only render isolated glyphs. The scored form quiz prompt is `letter.forms.medial` = **ـنـ**, not نـ, not isolated ن.

---

## Generic engine proof

No `if ain` / `if nun` / `if wave14` was added to engine code.

```ts
getSyllableLiveKey({ letterLegacyId: "ain", vowelSkillId: "skill.short_vowel.kasra" })
// → letter:ain.kasra

getLetterFormLiveKey({ letterLegacyId: "nun", form: "medial" })
// → letter:nun.form.medial

getWordLiveKey({ wordId: "word.inab" })
// → word:inab.decoding
```

`show:"cv"` uses `harakaCarrier` (tatweel + ِ). Form identification uses existing `letter_recognition` + `targetForm: "medial"`.

---

## Routing

`wave-1` → … → `wave-13` → `wave-14`

Wave 14 locked until Wave 13 Unit 3. After Wave 13: Unit 1 open, Unit 2 locked.

---

## Known prototype limitations

- Logical audio/image ids are reserved. There is no final production audio or image set in this slice.
- Picture exercises still use prototype emoji fallbacks (`🍇` for عِنَب).
- Optional pictures may be skipped after required mastery (accepted reinforcement-skip, same as Waves 10–13).
- Form-quiz **choices** still show isolated identity glyphs; the **prompt** is the positional form ـنـ (same letter-recognition limitation as Wave 12).
- Unit 1 has two required scored items, so `LessonPlayer` rotates between them. Existing `unit.mastery` treats `minAttempts` as an **aggregate** across required refs, not “repeat each activity three times.” The headed walk therefore wrote `letter:ain.kasra` 2/2 and `letter:nun.form.medial` 1/1, then finished Unit 1 once both keys had a correct attempt and the aggregate reached 3. The unit-mastery script still proves that missing either key prevents mastery. Do not change LessonPlayer for this.

---

## Headed browser verification

Seeded Waves 1–13 in `hurufi-progress-v1`, then walked Wave 14 in headed Chrome against the running app at `http://localhost:8080`. Clicked **عِ**, **ن** (for medial ـنـ), and **عِنَب** explicitly.

| Check | Result |
| --- | --- |
| `/learn` shows Wave 14 with exactly 2 units | Pass |
| No Wave 15 | Pass |
| Wave 14 locked before Wave 13 Unit 3 mastery | Pass |
| After Wave 13: Unit 1 unlocked, Unit 2 locked | Pass |
| Unscored familiar عَ SHOW | Pass |
| Unscored ع + ِ → عِ; kasra under ع (`ع`, `ـِ`, `عِ`) | Pass |
| Unscored medial ـنـ, not نـ | Pass |
| First scored item: hear عِ | Pass |
| Choices عِ / عَ / كِ; clicked عِ | Pass |
| Live key `letter:ain.kasra`; historical `letter:kaf.kasra` unchanged (seeded 2026-03-01) | Pass |
| No `diacritic:ain.kasra.discrimination` gate | Pass |
| Scored form prompt ـنـ; chose ن | Pass |
| Live key `letter:nun.form.medial` | Pass |
| Unscored عِ + نَ → عِنَ then عِنَ + ب → عِنَب | Pass |
| Joined result عِنَب; no new ba quiz | Pass |
| First scored word is audio/print عِنَب vs عَسَل / كِتَاب; clicked عِنَب | Pass |
| Picture not first evidence | Pass |
| Optional 🍇 after decode | Accepted skip after mastery (same as Waves 10–13) |
| No sukun, damma, madd-yaa/waw, hamza/shadda/tanween, or review gate | Pass |
| Finish CTA → `/learn`; Unit 2 mastered | Pass |
| Wave 13 still shows كِ / تَا / كِتَاب; no Wave 14 leak | Pass |

IndexedDB after the walk: new `letter:ain.kasra`, `letter:nun.form.medial`, `word:inab.decoding`. Historical `letter:kaf.kasra`, `letter:ain.fatha`, `letter:nun.form.initial`, `letter:ba.form.final`, `letter:ain.form.initial` keep their seeded timestamps. No `diacritic:ain.kasra.discrimination`. Presentation rows stay attempts 0. No new `.closed` key from Wave 14 (`letter:ram.closed` is historical Wave 4). The generic player also writes seen identity rows; that is existing `markSeen` behavior.

`npm run check` **PASS** (typecheck, validate:curriculum including Wave 14, validate:unit-mastery, build).

---

## Wave 15

**Wave 15 is not implemented.** This slice stops after Wave 14 Unit 2.

Recommended later: further kasra transfer with **جِسْم** (kasra-onset closed chunk), not madd-yaa and not sentences.
