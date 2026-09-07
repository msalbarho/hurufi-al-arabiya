# Word TTS batches

Part order = `CATEGORIES` in `src/content/words/index.ts` (live app order). Do not merge categories.

| Part | Category ID | Arabic name | Items | TTS | Manifest |
| --- | --- | --- | --- | --- | --- |
| part-01-animals | animals | حيوانات | 60 | `audio-production/words/part-01-animals/tts.txt` | `audio-production/words/part-01-animals/manifest.csv` |
| part-02-food | food | طعام | 60 | `audio-production/words/part-02-food/tts.txt` | `audio-production/words/part-02-food/manifest.csv` |
| part-03-fruits | fruits | فواكه | 35 | `audio-production/words/part-03-fruits/tts.txt` | `audio-production/words/part-03-fruits/manifest.csv` |
| part-04-vegetables | vegetables | خضار | 30 | `audio-production/words/part-04-vegetables/tts.txt` | `audio-production/words/part-04-vegetables/manifest.csv` |
| part-05-family | family | عائلتي | 40 | `audio-production/words/part-05-family/tts.txt` | `audio-production/words/part-05-family/manifest.csv` |
| part-06-body | body | جسمي | 40 | `audio-production/words/part-06-body/tts.txt` | `audio-production/words/part-06-body/manifest.csv` |
| part-07-colors | colors | ألوان | 20 | `audio-production/words/part-07-colors/tts.txt` | `audio-production/words/part-07-colors/manifest.csv` |
| part-08-numbers | numbers | أرقام | 20 | `audio-production/words/part-08-numbers/tts.txt` | `audio-production/words/part-08-numbers/manifest.csv` |
| part-09-home | home | في البيت | 50 | `audio-production/words/part-09-home/tts.txt` | `audio-production/words/part-09-home/manifest.csv` |
| part-10-school | school | المدرسة | 40 | `audio-production/words/part-10-school/tts.txt` | `audio-production/words/part-10-school/manifest.csv` |
| part-11-clothes | clothes | ملابس | 35 | `audio-production/words/part-11-clothes/tts.txt` | `audio-production/words/part-11-clothes/manifest.csv` |
| part-12-nature | nature | الطبيعة | 45 | `audio-production/words/part-12-nature/tts.txt` | `audio-production/words/part-12-nature/manifest.csv` |
| part-13-transport | transport | مواصلات | 35 | `audio-production/words/part-13-transport/tts.txt` | `audio-production/words/part-13-transport/manifest.csv` |
| part-14-jobs | jobs | مهن | 35 | `audio-production/words/part-14-jobs/tts.txt` | `audio-production/words/part-14-jobs/manifest.csv` |
| part-15-birds | birds | طيور وحشرات | 35 | `audio-production/words/part-15-birds/tts.txt` | `audio-production/words/part-15-birds/manifest.csv` |
| part-16-sea | sea | البحر | 25 | `audio-production/words/part-16-sea/tts.txt` | `audio-production/words/part-16-sea/manifest.csv` |
| part-17-sky | sky | السماء | 20 | `audio-production/words/part-17-sky/tts.txt` | `audio-production/words/part-17-sky/manifest.csv` |
| part-18-verbs | verbs | أفعال | 50 | `audio-production/words/part-18-verbs/tts.txt` | `audio-production/words/part-18-verbs/manifest.csv` |
| part-19-adjectives | adjectives | صفات | 45 | `audio-production/words/part-19-adjectives/tts.txt` | `audio-production/words/part-19-adjectives/manifest.csv` |

**Total items:** 720
**Parts:** 19
**Shared-pronunciation groups:** 7

Master lookup: `audio-production/words/manifest-all.csv` (production order = all parts concatenated).

## Split rule

When a long TTS recording is produced from `part-XX-category/tts.txt`, split it using `part-XX-category/manifest.csv` only.

If N spoken segments are detected, N MUST equal the number of manifest data rows.

If the counts differ: STOP. Do not guess filenames. Do not shift assignments. Do not silently discard a segment.

Spoken segment 1 = manifest row 1 = that row’s `audio_filename`.
