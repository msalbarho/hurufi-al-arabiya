# Band A v1 migration report

Traceability for the first production vocabulary migration. Curriculum decisions stay in `docs/band-a-vocabulary-plan.md`.

**Bundle:** `src/content/curriculum/data/production/band-a.json`  
**Meta id:** `hurufi.production.band-a.v1`  
**Generator:** `scripts/generate-band-a-production.ts` (JSON is the production artifact)

The live React `/words` route still uses `src/content/words/` (720). This bundle is not wired to UI.

---

## Totals

| Metric | Count |
| --- | ---: |
| Migrated word records | **135** |
| Existing 720 → portable (`legacyId` present) | **113** |
| NEW_REQUIRED → portable (no `legacyId`) | **22** |
| Canonical word IDs | **135** (all unique) |
| High-frequency (`highFrequency: true`) | **34** |
| A1 / A2 / A3 / A4 | 28 / 35 / 37 / 35 |
| Readable number words | 4 (`واحد` `ثلاثة` `أربعة` `خمسة`) |

---

## Canonical ID collision resolutions

Slugs are semantic ASCII, not numeric. Near-collisions were disambiguated by lemma, not by `-2` suffixes:

| Arabic | Canonical ID | Why this slug |
| --- | --- | --- |
| قط | `word.qitt` | Matches content-contract example |
| قطة | `word.qitta` | Feminine counterpart, not `qitt-2` |
| دجاج | `word.dajaj` | Food collective |
| دجاجة | `word.dajaja` | Animal unit |
| جد | `word.jadd` | |
| جدة | `word.jadda` | |
| طاولة | `word.tawila` | |
| طويل | `word.tawil` | |
| لا | `word.laa` | Avoids the too-short / ambiguous `la` |
| نعم | `word.naam` | |
| شعر | `word.shaar` | Avoids `shar` |
| سعيد | `word.saeed` | Avoids English `said` |
| على | `word.ala` | Preposition; not `aala` |
| في | `word.fi` | Distinct from `word.fil` (فيل) |

No two Arabic lemmas share a slug.

---

## Letter / hamza convention (not a 29th letter)

| Written sign | `letterIds` | Skill |
| --- | --- | --- |
| ا | `letter.alif` | `skill.long_vowel.madd` |
| أ إ آ | `letter.alif` | `skill.hamza.reading` (آ also madd) |
| ء (isolated, e.g. ماء، يقرأ) | none — no hamza tile | `skill.hamza.reading` |
| ة | `letter.ta` | `skill.taa_marbuta.reading` |
| ى | `letter.ya` | `skill.alif_maqsura.reading` |
| Harakat | not letters | fatha / kasra / damma / sukun / shadda |

`letter.zah` is in the 28-letter catalog (similar-letter links) but no Band A teaching form requires ظ.

---

## Skills added (9)

Only the minimum phonics/orthography skills needed to make Band A references resolve:

- `skill.short_vowel.fatha`
- `skill.short_vowel.kasra`
- `skill.short_vowel.damma`
- `skill.sukun.basic`
- `skill.long_vowel.madd`
- `skill.shadda.basic`
- `skill.hamza.reading`
- `skill.taa_marbuta.reading`
- `skill.alif_maqsura.reading`

No per-letter recognition skills. No Form IV skill for `يُغْلِقُ` (prefix ḍamma is already `skill.short_vowel.damma`). No numbers skill domain yet — digit/quantity curriculum is separate from these four readable number *words*.

---

## Asset-reference strategy

Logical IDs only. No audio/image files were generated.

- `audio.word.{slug}` — citation audio
- `image.word.{slug}` — picture

Each is listed in the bundle `assets[]` so validation can resolve references. Platforms map these later. `AudioManager` was not changed.

---

## Omitted optional metadata (and why)

| Field | Why omitted |
| --- | --- |
| `gender` / `number` | Not fully evidenced for every lemma without a new linguistic pass |
| `learnerLevel` | A1–A4 are packing clusters, not levels 1–8 |
| `difficulty` | Would be a new guess on top of `subBand` |
| `concreteness` | Function words vs nouns not scored in the approved plan |
| `syllableCount` / `syllablePattern` / `syllables` | Not in the frozen table |
| `packId` | Packs not created in this migration |
| `reviewPriority` | Not in the approved spine beyond `highFrequency` |
| `curriculumAction` | Audit field; not required for production Band A rows |
| `audioAssetIds.slow` | No slow-audio inventory |
| `homographGroup` | No Band A homograph groups approved |

`highFrequency` / `frequencyBand: core` only on the 34-word spine in the plan §11. Other words omit the flag (not `false` noise).

`msaStatus`: `STANDARD_MSA` except `شاي` and `طاولة` (`LOANWORD_ACCEPTED` from the word audit).

---

## Unresolved issues

1. Isolated hamza `ء` has no letter id (intentional; architecture forbids a 29th alphabet tile). Decoding of `مَاء` / `يَقْرَأُ` depends on `skill.hamza.reading` plus surrounding letters.
2. The **numbers skill domain** (digits, quantity) is specified in policy but not implemented as `SkillDefinition`s in this bundle. Only the four readable number words were migrated.
3. `يُغْلِقُ` is Form IV; only ḍamma (and other surface phonics) are required, not a derived-verb skill.
4. Production letters are a portable snapshot of the 28 prototype letters; they are not yet consumed by `/letters`.

No Band A v1 lemma was skipped as ambiguous.

---

## Mapping table (all 135)

| Canonical ID | Legacy ID | Arabic | Teaching Form | Sub-band |
| --- | --- | --- | --- | --- |
| word.bab | home-2 | باب | بَاب | A1 |
| word.bayt | home-1 | بيت | بَيْت | A1 |
| word.yad | body-17 | يد | يَد | A1 |
| word.ab | family-2 | أب | أَب | A1 |
| word.maa | food-47 | ماء | مَاء | A1 |
| word.kalb | animals-2 | كلب | كَلْب | A1 |
| word.qalam | school-8 | قلم | قَلَم | A1 |
| word.shams | sky-1 | شمس | شَمْس | A1 |
| word.qamar | sky-2 | قمر | قَمَر | A1 |
| word.nar | nature-32 | نار | نَار | A1 |
| word.fam | body-7 | فم | فَم | A1 |
| word.khubz | food-1 | خبز | خُبْز | A1 |
| word.tamr | food-54 | تمر | تَمْر | A1 |
| word.bayd | food-6 | بيض | بَيْض | A1 |
| word.mawz | fruits-2 | موز | مَوْز | A1 |
| word.asal | food-19 | عسل | عَسَل | A1 |
| word.jamal | animals-9 | جمل | جَمَل | A1 |
| word.fil | animals-4 | فيل | فِيل | A1 |
| word.hajar | nature-16 | حجر | حَجَر | A1 |
| word.qadam | body-27 | قدم | قَدَم | A1 |
| word.wajh | body-3 | وجه | وَجْه | A1 |
| word.bahr | sea-1 | بحر | بَحْر | A1 |
| word.layl | sky-17 | ليل | لَيْل | A1 |
| word.nahr | nature-18 | نهر | نَهْر | A1 |
| word.samak | food-9 | سمك | سَمَك | A1 |
| word.raml | nature-15 | رمل | رَمْل | A1 |
| word.kitab | school-6 | كتاب | كِتَاب | A1 |
| word.asad | animals-3 | أسد | أَسَد | A1 |
| word.umm | family-1 | أم | أُمّ | A2 |
| word.akh | family-3 | أخ | أَخ | A2 |
| word.ukht | family-4 | أخت | أُخْت | A2 |
| word.bint | — | بنت | بِنْت | A2 |
| word.walad | — | ولد | وَلَد | A2 |
| word.jadd | family-5 | جد | جَدّ | A2 |
| word.jadda | family-6 | جدة | جَدَّة | A2 |
| word.qitt | animals-1 | قط | قِطّ | A2 |
| word.qitta | — | قطة | قِطَّة | A2 |
| word.arnab | animals-10 | أرنب | أَرْنَب | A2 |
| word.baqara | animals-6 | بقرة | بَقَرَة | A2 |
| word.dajaja | birds-12 | دجاجة | دَجَاجَة | A2 |
| word.ayn | body-4 | عين | عَيْن | A2 |
| word.anf | body-6 | أنف | أَنْف | A2 |
| word.udhun | body-5 | أذن | أُذُن | A2 |
| word.shaar | body-2 | شعر | شَعْر | A2 |
| word.ghurfa | home-4 | غرفة | غُرْفَة | A2 |
| word.sarir | home-5 | سرير | سَرِير | A2 |
| word.tawila | home-9 | طاولة | طَاوِلَة | A2 |
| word.kub | home-26 | كوب | كُوب | A2 |
| word.halib | food-3 | حليب | حَلِيب | A2 |
| word.tuffah | fruits-1 | تفاح | تُفَّاح | A2 |
| word.dajaj | food-8 | دجاج | دَجَاج | A2 |
| word.shajara | nature-1 | شجرة | شَجَرَة | A2 |
| word.matar | nature-21 | مطر | مَطَر | A2 |
| word.sama | sky-4 | سماء | سَمَاء | A2 |
| word.yakul | verbs-1 | يأكل | يَأْكُلُ | A2 |
| word.yashrab | verbs-2 | يشرب | يَشْرَبُ | A2 |
| word.yalab | verbs-5 | يلعب | يَلْعَبُ | A2 |
| word.yanam | verbs-3 | ينام | يَنَامُ | A2 |
| word.yajlis | verbs-9 | يجلس | يَجْلِسُ | A2 |
| word.ahmar | colors-1 | أحمر | أَحْمَر | A2 |
| word.azraq | colors-2 | أزرق | أَزْرَق | A2 |
| word.asfar | colors-3 | أصفر | أَصْفَر | A2 |
| word.akhdar | colors-4 | أخضر | أَخْضَر | A2 |
| word.ras | body-1 | رأس | رَأْس | A3 |
| word.jism | body-40 | جسم | جِسْم | A3 |
| word.qalb | body-29 | قلب | قَلْب | A3 |
| word.sinn | body-10 | سن | سِنّ | A3 |
| word.madrasa | school-1 | مدرسة | مَدْرَسَة | A3 |
| word.muallima | school-3 | معلمة | مُعَلِّمَة | A3 |
| word.daftar | school-7 | دفتر | دَفْتَر | A3 |
| word.harf | school-24 | حرف | حَرْف | A3 |
| word.qissa | school-27 | قصة | قِصَّة | A3 |
| word.qamis | clothes-1 | قميص | قَمِيص | A3 |
| word.hidha | clothes-9 | حذاء | حِذَاء | A3 |
| word.sayyara | transport-1 | سيارة | سَيَّارَة | A3 |
| word.hafila | transport-2 | حافلة | حَافِلَة | A3 |
| word.wahid | numbers-1 | واحد | وَاحِد | A3 |
| word.thalatha | numbers-3 | ثلاثة | ثَلَاثَة | A3 |
| word.kura | — | كرة | كُرَة | A3 |
| word.luba | — | لعبة | لُعْبَة | A3 |
| word.masjid | — | مسجد | مَسْجِد | A3 |
| word.suq | — | سوق | سُوق | A3 |
| word.yawm | — | يوم | يَوْم | A3 |
| word.sabah | — | صباح | صَبَاح | A3 |
| word.usfur | birds-1 | عصفور | عُصْفُور | A3 |
| word.hisan | animals-5 | حصان | حِصَان | A3 |
| word.inab | fruits-4 | عنب | عِنَب | A3 |
| word.laymun | fruits-14 | ليمون | لَيْمُون | A3 |
| word.warda | nature-3 | وردة | وَرْدَة | A3 |
| word.miftah | home-41 | مفتاح | مِفْتَاح | A3 |
| word.yaktub | verbs-12 | يكتب | يَكْتُبُ | A3 |
| word.yaqra | verbs-11 | يقرأ | يَقْرَأُ | A3 |
| word.yaftah | verbs-24 | يفتح | يَفْتَحُ | A3 |
| word.yadhhab | — | يذهب | يَذْهَبُ | A3 |
| word.yara | — | يرى | يَرَى | A3 |
| word.yamshi | verbs-7 | يمشي | يَمْشِي | A3 |
| word.kabir | adjectives-1 | كبير | كَبِير | A3 |
| word.saghir | adjectives-2 | صغير | صَغِير | A3 |
| word.saeed | adjectives-14 | سعيد | سَعِيد | A3 |
| word.hazin | adjectives-15 | حزين | حَزِين | A3 |
| word.hadha | — | هذا | هَذَا | A4 |
| word.hadhihi | — | هذه | هَذِهِ | A4 |
| word.huwa | — | هو | هُوَ | A4 |
| word.hiya | — | هي | هِيَ | A4 |
| word.fi | — | في | فِي | A4 |
| word.ala | — | على | عَلَى | A4 |
| word.huna | — | هنا | هُنَا | A4 |
| word.naam | — | نعم | نَعَم | A4 |
| word.laa | — | لا | لَا | A4 |
| word.arbaa | numbers-4 | أربعة | أَرْبَعَة | A4 |
| word.khamsa | numbers-5 | خمسة | خَمْسَة | A4 |
| word.aswad | colors-9 | أسود | أَسْوَد | A4 |
| word.abyad | colors-10 | أبيض | أَبْيَض | A4 |
| word.tawil | adjectives-3 | طويل | طَوِيل | A4 |
| word.qasir | adjectives-4 | قصير | قَصِير | A4 |
| word.harr | adjectives-21 | حار | حَارّ | A4 |
| word.barid | adjectives-22 | بارد | بَارِد | A4 |
| word.sari | adjectives-5 | سريع | سَرِيع | A4 |
| word.sadiq | family-20 | صديق | صَدِيق | A4 |
| word.tabib | jobs-1 | طبيب | طَبِيب | A4 |
| word.darraja | transport-3 | دراجة | دَرَّاجَة | A4 |
| word.qitar | transport-5 | قطار | قِطَار | A4 |
| word.matbakh | home-20 | مطبخ | مَطْبَخ | A4 |
| word.hammam | home-21 | حمام | حَمَّام | A4 |
| word.nafidha | home-3 | نافذة | نَافِذَة | A4 |
| word.kursi | home-8 | كرسي | كُرْسِيّ | A4 |
| word.nahla | birds-21 | نحلة | نَحْلَة | A4 |
| word.farasha | birds-22 | فراشة | فَرَاشَة | A4 |
| word.yaqul | — | يقول | يَقُولُ | A4 |
| word.yati | — | يأتي | يَأْتِي | A4 |
| word.yughliq | verbs-25 | يغلق | يُغْلِقُ | A4 |
| word.yalbas | verbs-30 | يلبس | يَلْبَسُ | A4 |
| word.yaghsil | verbs-29 | يغسل | يَغْسِلُ | A4 |
| word.ladhidh | adjectives-30 | لذيذ | لَذِيذ | A4 |
| word.shay | food-48 | شاي | شَاي | A4 |
