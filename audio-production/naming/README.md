# Audio naming contract

Authoritative filenames for Hurufi Al Arabiya word (and letter) audio.
When a long TTS file is split, every clip **must** use `audio_filename` from the matching manifest row. Do not rename afterward.

## Identities

| Identity | Example | Stable when |
| --- | --- | --- |
| Content ID | `word.qalam` or 720-only `word.himar` | Lexical item, not array index |
| Legacy ID | `school-8` | Prototype 720-bank positional id (`category-n`) |
| Logical audio ID | `audio.word.qalam` | Same slug as content id after `word.` |
| Physical file | `qalam.mp3` | `audio_basename` + distribution extension |

A reorder of `src/content/words` must not change an already published `audio_filename`. This folder is the freeze.

## Distribution format

- `audio_filename` ends in **`.mp3`** (offline app asset).
- `audio_basename` has no extension (`qalam`).
- A WAV master is the same basename: `qalam.wav`.
- No `.mp3` / `.wav` / `.m4a` files ship in the repo today. Docs mention `.m4a` only as an `AudioManager.register` *example*. This contract adopts **MP3** for distribution names.

## Filename rules

- lowercase ASCII `[a-z][a-z0-9_]*`
- no Arabic, spaces, or punctuation other than underscore
- Android-asset-safe (no leading digits)
- derived from Band A slugs when the 720 row maps to Band A; otherwise from the technical slugger (see below)

## Letter IDs (existing prototype — do not “fix” to baa/taa/jiim)

From `src/content/letters.ts`:

`alif ba ta tha jim ha kha dal thal ra zay sin shin sad dad tah zah ain ghain fa qaf kaf lam mim nun haa waw ya`

ح = `ha`, ه = `haa`. ج = `jim` (not jeem/jiim). ب = `ba` (not baa).

Letter files (not produced in this word export):

- `audio.letter.ba.name` → `ba_name.mp3`
- `audio.letter.ba.sound` → `ba_sound.mp3`

Wave 1 uses `.sound` (not architecture `.phoneme`). This contract follows the live Wave 1 id. Do not mass-rename; there are **no** physical letter files yet.

## Word slugger (720 rows not in Band A)

Not academic romanization. Harakat → `a i u`; sukun → no vowel; shadda → doubled consonant; ة/ى → `a`; ذ → `dh`; ث → `th`; خ → `kh`; غ → `gh`; ع → omitted (vowel only); ص/س → `s`; ض/د → `d`; ط/ت → `t`; ظ/ز → `z`. See `transliteration.md`.

Band A slugs already assigned (`qalam`, `qitt`, `maa`, `udhun`, …) **win** over the slugger when the 720 row matches that lexical item.

Do **not** trust a Band A `legacyId` if the 720 row at that positional id is a different lemma (the 720 `category-n` ids shift if the array is edited). Match by lemma / teaching form instead. Positional `legacyId` is used only when it still names the same word.

## Duplicates

Same **exact diacritized** string → one `audio_asset_id` / `audio_filename`. Later 720 rows get `status=shared_duplicate`. They still appear in that category’s `tts.txt` so spoken order = manifest order. After splitting, keep the first produced file for that `audio_filename`; later identical filenames reuse it.

Different diacritics on the same undiacritized lemma → different assets.

## Splitting invariant

When a long TTS recording is produced from:

`audio-production/words/part-XX-<category>/tts.txt`

the recording must be split according to:

`audio-production/words/part-XX-<category>/manifest.csv`

If N spoken segments are detected:

N MUST equal the number of manifest data rows.

If the counts differ: **STOP**.

- Do not guess filenames.
- Do not shift assignments.
- Do not silently discard a segment.

Spoken segment 1 = manifest row `index` 1 = that row’s `audio_filename`.
Spoken segment 2 = manifest row `index` 2 = that row’s `audio_filename`.

Manifests are authoritative during splitting.
