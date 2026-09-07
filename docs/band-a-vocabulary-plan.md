# Band A Vocabulary — v1 (approved)

**Status:** **Band A v1 APPROVED** — 135-word production lexicon. Portable JSON: `src/content/curriculum/data/production/band-a.json`. The live React `/words` route still uses the 720-word prototype bank.  
**Language policy:** العربية الفصحى المعاصرة الواضحة والمناسبة للأطفال  
**Companion documents:** `docs/word-curriculum-audit.md`, `docs/curriculum-architecture.md`, `docs/content-contract.md`  
**Inventory:** `src/content/words/` (720 lemmas; prototype IDs `{category}-{1-based index}`)

This file is the source of truth for **which words belong to Band A**. It is not a lesson sequence.

Canonical JSON records now live at `src/content/curriculum/data/production/band-a.json`. UI, routes, letters, progress, audio, and the 720-word files are **not** switched in this migration.

---

# 0. What a band is (architectural rule)

**Band = curriculum vocabulary scope.**  
**Band ≠ teaching order.**

A word in Band A is a foundational lexical concept the product intends to teach during the early literacy journey. Whether the child may **decode** that word today is decided by:

- skill prerequisites
- learned letters
- phonics prerequisites
- learner mastery

Example: `مَاء` belongs to Band A even if it stays locked until hamza and madd are available. Do **not** drop an essential concept only because it is not decodable in the earliest phonics wave.

Indicative clusters **A1–A4** below are packing hints (typical phonics load), not unlock gates.

---

# 1. Approved policies

## 1.1 Noun teaching form

Foundational **noun** cards use the **pause / citation form without tanween**.

| Layer | Example |
| --- | --- |
| Lexical lemma | كتاب |
| Child-facing card | كِتَاب |
| Inside a future sentence | هَذَا كِتَابٌ / الْكِتَابُ كَبِيرٌ |

Do not store `كِتَاب` and `كِتَابٌ` as two vocabulary records.

## 1.2 Verb teaching form

Child-facing foundational **verb** cards use:

- imperfect
- third person
- masculine singular
- fully vocalized (including the final ḍamma on sound verbs)

Examples: `يَأْكُلُ` `يَشْرَبُ` `يَلْعَبُ` `يَكْتُبُ` `يَقْرَأُ` `يَرَى` `يَأْتِي` `يُغْلِقُ`

Feminine (`تَأْكُلُ`), plural, past, and imperative are **generated in grammar/sentence activities**, not extra Band A ids.

Internal model (portable schema):

| Field | Role |
| --- | --- |
| `lemma` | Lexical key (unvocalized; no `ال`) |
| `teachingForm` | Child-facing card (optional until migration; if omitted, `diacritized` is the card) |
| `diacritized` | Required vocalized string; for Band A v1 this **is** the teaching form |

The 720-word prototype still stores pause-form verbs (`يَأْكُل`). Do not duplicate records as `يَأْكُل` vs `يَأْكُلُ`.

## 1.3 Definite article

Canonical lemmas do **not** include `ال`.

Teach `قِطَّة`, not a second entry `القِطَّة`. Definiteness and sun-letter assimilation belong to later sentence/grammar usage.

## 1.4 Numbers

**Numbers are both:**

1. **A skill domain** — digits, quantity, and matching may start before the child can decode the written words.
2. **Vocabulary items** — a number *word* counts toward Band A only when it is a readable/writable lemma.

**Band A v1 readable number words:** `وَاحِد` `ثَلَاثَة` `أَرْبَعَة` `خَمْسَة` (four words).

`اِثْنَان` is **not** in the Band A vocabulary allocation. It remains available to the **numbers curriculum** later (digit `2` can appear in the skill domain immediately).

`سِتَّة`–`عَشَرَة`, `صِفْر`, and teens stay out of Band A as literacy words.

---

# 2. Applied human decisions (closed)

Do not reopen these unless implementation finds an objective technical or linguistic contradiction.

| Item | Decision | Band A v1 |
| --- | --- | --- |
| دجاج | KEEP; teaching form `دَجَاج` | In |
| ماء | KEEP `مَاء`; gated by phonics, not removed | In |
| بيض | KEEP `بَيْض`; require ض and related phonics | In |
| اثنان | REMOVE from the 140 allocation; numbers curriculum later | Out |
| يأتي | KEEP in cluster A4 as `يَأْتِي` | In (A4) |
| يريد | POSTPONE to Band B | Out |
| زهرة | REMOVE/POSTPONE (وردة remains) | Out |
| يرى | KEEP `يَرَى` for sentence/story value | In |
| طماطم | POSTPONE | Out |
| جوعان | REMOVE | Out |
| على | KEEP `عَلَى` in A4; language item **and** future grammar/function content | In |
| يغلق | KEEP in A4 as `يُغْلِقُ`; pair with `يَفْتَحُ` | In (A4) |
| بطيء | POSTPONE | Out |
| عطشان | POSTPONE | Out |
| نَعَم | MANDATORY ADD | In |
| لَا | MANDATORY ADD | In |

Net: **140 − 7 + 2 = 135**.

---

# 3. Band A v1 size

| Metric | Count |
| --- | ---: |
| **Band A v1 total** | **135** |
| Indicative cluster A1 / A2 / A3 / A4 | 28 / 35 / 37 / 35 |
| From existing 720 | **113** |
| NEW_REQUIRED (not in 720 yet) | **22** |
| Verbs | **16** |
| Function / interaction words | **9** |
| Readable number words | **4** |

Target band size remains **120–150**. 135 is inside that range. Do not add fillers to recreate 140.

---

# 4. Indicative clusters (not unlock order)

Learner levels 1–8 stay the child-facing map. A1–A4 only describe **typical phonics load** for future packs of 5–8 words.

| Cluster | Name | n | Typical load | Educational job |
| --- | --- | ---: | --- | --- |
| **A1** | First high-value short words | 28 | CVC / madd; **no shadda, no ة, no ى**, no function words as a set | Real words as soon as letters + short vowels + sukun/madd exist. `مَاء` and `بَيْض` sit here as *scope*, locked until hamza / ض. |
| **A2** | Early everyday | 35 | Shadda, tāʾ marbūṭa, core verbs | Family, pets, home, eat/drink/play |
| **A3** | Expanded foundational | 37 | Broader letters, school, motion | Captions about school, play, going |
| **A4** | Sentence glue | 35 | Function words, Form IV `يُغْلِقُ`, `ى`, hamza-heavy verbs | `هَذَا` / `فِي` / `عَلَى` / `نَعَم` / `لَا` |

---

# 5. Full Band A v1 list

**Lemma:** unvocalized, no `ال`, no tanween.  
**Teaching form:** child-facing card (noun pause form; verb 3ms imperfect fully vocalized).  
**Source:** `EXISTING_720` or `NEW_REQUIRED`.  
**Cluster:** packing hint only.

| # | Lemma | Teaching form | Cluster | Source | Prototype ID | Category | Unlock / phonics notes |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | باب | بَاب | A1 | EXISTING_720 | home-2 | home | madd ا |
| 2 | بيت | بَيْت | A1 | EXISTING_720 | home-1 | home | ay + sukun |
| 3 | يد | يَد | A1 | EXISTING_720 | body-17 | body | short vowels |
| 4 | أب | أَب | A1 | EXISTING_720 | family-2 | family | hamzat qaṭʿ |
| 5 | ماء | مَاء | A1 | EXISTING_720 | food-47 | food | **Hamza + madd.** Keep in Band A; do not teach as first-wave decode until those skills exist. |
| 6 | كلب | كَلْب | A1 | EXISTING_720 | animals-2 | animals | sukun; letter ك |
| 7 | قلم | قَلَم | A1 | EXISTING_720 | school-8 | school | letter ق |
| 8 | شمس | شَمْس | A1 | EXISTING_720 | sky-1 | nature | sukun; letter ش. Sun-letter assimilation only with `ال` later |
| 9 | قمر | قَمَر | A1 | EXISTING_720 | sky-2 | nature | letter ق |
| 10 | نار | نَار | A1 | EXISTING_720 | nature-32 | nature | madd |
| 11 | فم | فَم | A1 | EXISTING_720 | body-7 | body | letter ف |
| 12 | خبز | خُبْز | A1 | EXISTING_720 | food-1 | food | خ + sukun |
| 13 | تمر | تَمْر | A1 | EXISTING_720 | food-54 | food | One lemma (ignore fruits-17 duplicate) |
| 14 | بيض | بَيْض | A1 | EXISTING_720 | food-6 | food | **Requires ض** + ay + sukun. Band A member; locked until ض |
| 15 | موز | مَوْز | A1 | EXISTING_720 | fruits-2 | food | aw + sukun |
| 16 | عسل | عَسَل | A1 | EXISTING_720 | food-19 | food | letter ع |
| 17 | جمل | جَمَل | A1 | EXISTING_720 | animals-9 | animals | short vowels |
| 18 | فيل | فِيل | A1 | EXISTING_720 | animals-4 | animals | madd ي; letter ف |
| 19 | حجر | حَجَر | A1 | EXISTING_720 | nature-16 | nature | short vowels |
| 20 | قدم | قَدَم | A1 | EXISTING_720 | body-27 | body | letter ق |
| 21 | وجه | وَجْه | A1 | EXISTING_720 | body-3 | body | sukun |
| 22 | بحر | بَحْر | A1 | EXISTING_720 | sea-1 | nature | sukun |
| 23 | ليل | لَيْل | A1 | EXISTING_720 | sky-17 | nature | ay + sukun |
| 24 | نهر | نَهْر | A1 | EXISTING_720 | nature-18 | nature | sukun |
| 25 | سمك | سَمَك | A1 | EXISTING_720 | food-9 | food | Collective; سمكة later |
| 26 | رمل | رَمْل | A1 | EXISTING_720 | nature-15 | nature | sukun |
| 27 | كتاب | كِتَاب | A1 | EXISTING_720 | school-6 | school | madd; letter ك. Card **without** tanween |
| 28 | أسد | أَسَد | A1 | EXISTING_720 | animals-3 | animals | hamzat qaṭʿ |
| 29 | أم | أُمّ | A2 | EXISTING_720 | family-1 | family | **shadda** |
| 30 | أخ | أَخ | A2 | EXISTING_720 | family-3 | family | |
| 31 | أخت | أُخْت | A2 | EXISTING_720 | family-4 | family | tāʾ (not ة) |
| 32 | بنت | بِنْت | A2 | NEW_REQUIRED | — | family | kasra + sukun |
| 33 | ولد | وَلَد | A2 | NEW_REQUIRED | — | family | Two fatha; may unlock as soon as و ل د exist |
| 34 | جد | جَدّ | A2 | EXISTING_720 | family-5 | family | shadda |
| 35 | جدة | جَدَّة | A2 | EXISTING_720 | family-6 | family | shadda + ة |
| 36 | قط | قِطّ | A2 | EXISTING_720 | animals-1 | animals | shadda |
| 37 | قطة | قِطَّة | A2 | NEW_REQUIRED | — | animals | shadda + ة. Not a second `ال` lemma |
| 38 | أرنب | أَرْنَب | A2 | EXISTING_720 | animals-10 | animals | hamza + sukun |
| 39 | بقرة | بَقَرَة | A2 | EXISTING_720 | animals-6 | animals | ة |
| 40 | دجاجة | دَجَاجَة | A2 | EXISTING_720 | birds-12 | animals | Animal (unit) |
| 41 | عين | عَيْن | A2 | EXISTING_720 | body-4 | body | ay |
| 42 | أنف | أَنْف | A2 | EXISTING_720 | body-6 | body | hamza + sukun |
| 43 | أذن | أُذُن | A2 | EXISTING_720 | body-5 | body | **ذ** — pack-gate on ذ (before هذا/يذهب is fine if ذ is known) |
| 44 | شعر | شَعْر | A2 | EXISTING_720 | body-2 | body | sukun |
| 45 | غرفة | غُرْفَة | A2 | EXISTING_720 | home-4 | home | غ + ة |
| 46 | سرير | سَرِير | A2 | EXISTING_720 | home-5 | home | madd |
| 47 | طاولة | طَاوِلَة | A2 | EXISTING_720 | home-9 | home | ط; 3 syllables |
| 48 | كوب | كُوب | A2 | EXISTING_720 | home-26 | home | madd و |
| 49 | حليب | حَلِيب | A2 | EXISTING_720 | food-3 | food | madd; not لبن |
| 50 | تفاح | تُفَّاح | A2 | EXISTING_720 | fruits-1 | food | shadda |
| 51 | دجاج | دَجَاج | A2 | EXISTING_720 | food-8 | food | **KEEP.** Food collective vs دجاجة animal. Teaching form `دَجَاج` |
| 52 | شجرة | شَجَرَة | A2 | EXISTING_720 | nature-1 | nature | ة |
| 53 | مطر | مَطَر | A2 | EXISTING_720 | nature-21 | nature | ط |
| 54 | سماء | سَمَاء | A2 | EXISTING_720 | sky-4 | nature | hamza |
| 55 | يأكل | يَأْكُلُ | A2 | EXISTING_720 | verbs-1 | verbs | Card `يَأْكُلُ`. Hamza + sukun |
| 56 | يشرب | يَشْرَبُ | A2 | EXISTING_720 | verbs-2 | verbs | `يَشْرَبُ` |
| 57 | يلعب | يَلْعَبُ | A2 | EXISTING_720 | verbs-5 | verbs | `يَلْعَبُ` |
| 58 | ينام | يَنَامُ | A2 | EXISTING_720 | verbs-3 | verbs | `يَنَامُ` |
| 59 | يجلس | يَجْلِسُ | A2 | EXISTING_720 | verbs-9 | verbs | `يَجْلِسُ` |
| 60 | أحمر | أَحْمَر | A2 | EXISTING_720 | colors-1 | colors | hamza |
| 61 | أزرق | أَزْرَق | A2 | EXISTING_720 | colors-2 | colors | hamza |
| 62 | أصفر | أَصْفَر | A2 | EXISTING_720 | colors-3 | colors | hamza |
| 63 | أخضر | أَخْضَر | A2 | EXISTING_720 | colors-4 | colors | hamza + **ض** (gate on ض, same letter as بيض) |
| 64 | رأس | رَأْس | A3 | EXISTING_720 | body-1 | body | hamza + sukun. Dataset emoji is brain — art later, lemma is head |
| 65 | جسم | جِسْم | A3 | EXISTING_720 | body-40 | body | |
| 66 | قلب | قَلْب | A3 | EXISTING_720 | body-29 | body | |
| 67 | سن | سِنّ | A3 | EXISTING_720 | body-10 | body | shadda |
| 68 | مدرسة | مَدْرَسَة | A3 | EXISTING_720 | school-1 | school | 3 syllables |
| 69 | معلمة | مُعَلِّمَة | A3 | EXISTING_720 | school-3 | school | 4 syllables + shadda |
| 70 | دفتر | دَفْتَر | A3 | EXISTING_720 | school-7 | school | |
| 71 | حرف | حَرْف | A3 | EXISTING_720 | school-24 | school | App-relevant |
| 72 | قصة | قِصَّة | A3 | EXISTING_720 | school-27 | school | shadda |
| 73 | قميص | قَمِيص | A3 | EXISTING_720 | clothes-1 | clothes | madd |
| 74 | حذاء | حِذَاء | A3 | EXISTING_720 | clothes-9 | clothes | ذ + hamza |
| 75 | سيارة | سَيَّارَة | A3 | EXISTING_720 | transport-1 | transport | shadda |
| 76 | حافلة | حَافِلَة | A3 | EXISTING_720 | transport-2 | transport | Better MSA than باص |
| 77 | واحد | وَاحِد | A3 | EXISTING_720 | numbers-1 | numbers | Number **word**. Digit 1 may exist earlier in the numbers skill |
| 78 | ثلاثة | ثَلَاثَة | A3 | EXISTING_720 | numbers-3 | numbers | Letter **ث**. Digit 3 may exist earlier |
| 79 | كرة | كُرَة | A3 | NEW_REQUIRED | — | toys | ة |
| 80 | لعبة | لُعْبَة | A3 | NEW_REQUIRED | — | toys | ة |
| 81 | مسجد | مَسْجِد | A3 | NEW_REQUIRED | — | places | |
| 82 | سوق | سُوق | A3 | NEW_REQUIRED | — | places | madd و |
| 83 | يوم | يَوْم | A3 | NEW_REQUIRED | — | time | aw |
| 84 | صباح | صَبَاح | A3 | NEW_REQUIRED | — | time | madd |
| 85 | عصفور | عُصْفُور | A3 | EXISTING_720 | birds-1 | animals | madd |
| 86 | حصان | حِصَان | A3 | EXISTING_720 | animals-5 | animals | madd |
| 87 | عنب | عِنَب | A3 | EXISTING_720 | fruits-4 | food | |
| 88 | ليمون | لَيْمُون | A3 | EXISTING_720 | fruits-14 | food | ay |
| 89 | وردة | وَرْدَة | A3 | EXISTING_720 | nature-3 | nature | Flower slot (زهرة postponed) |
| 90 | مفتاح | مِفْتَاح | A3 | EXISTING_720 | home-41 | home | Pairs with يفتح |
| 91 | يكتب | يَكْتُبُ | A3 | EXISTING_720 | verbs-12 | verbs | `يَكْتُبُ` |
| 92 | يقرأ | يَقْرَأُ | A3 | EXISTING_720 | verbs-11 | verbs | `يَقْرَأُ` — final hamza mini-skill, not a sight word |
| 93 | يفتح | يَفْتَحُ | A3 | EXISTING_720 | verbs-24 | verbs | `يَفْتَحُ` — pair with يغلق (A4) |
| 94 | يذهب | يَذْهَبُ | A3 | NEW_REQUIRED | — | verbs | `يَذْهَبُ` — letter ذ |
| 95 | يرى | يَرَى | A3 | NEW_REQUIRED | — | verbs | `يَرَى` — alif maqṣūra. Keep for stories. Gate on ى |
| 96 | يمشي | يَمْشِي | A3 | EXISTING_720 | verbs-7 | verbs | `يَمْشِي` |
| 97 | كبير | كَبِير | A3 | EXISTING_720 | adjectives-1 | adjectives | madd |
| 98 | صغير | صَغِير | A3 | EXISTING_720 | adjectives-2 | adjectives | madd |
| 99 | سعيد | سَعِيد | A3 | EXISTING_720 | adjectives-14 | adjectives | madd |
| 100 | حزين | حَزِين | A3 | EXISTING_720 | adjectives-15 | adjectives | madd |
| 101 | هذا | هَذَا | A4 | NEW_REQUIRED | — | function | Decode; do not sight-teach. Letter ذ |
| 102 | هذه | هَذِهِ | A4 | NEW_REQUIRED | — | function | Gender pair by pictures |
| 103 | هو | هُوَ | A4 | NEW_REQUIRED | — | function | Aligns with 3ms verbs |
| 104 | هي | هِيَ | A4 | NEW_REQUIRED | — | function | Feminine prefix later in sentences |
| 105 | في | فِي | A4 | NEW_REQUIRED | — | function | Locative; vocab **and** grammar |
| 106 | على | عَلَى | A4 | NEW_REQUIRED | — | function | **KEEP.** High-frequency item **and** future grammar. Gate on ى. Not أَعْلَى |
| 107 | هنا | هُنَا | A4 | NEW_REQUIRED | — | function | Captions: `الْأُمُّ هُنَا` until clitics |
| 108 | نعم | نَعَم | A4 | NEW_REQUIRED | — | function | **Mandatory.** Letters ن ع م + fatha. Listening/interaction may precede decoding |
| 109 | لا | لَا | A4 | NEW_REQUIRED | — | function | **Mandatory.** Lam + madd ا. Easy phonics; may unlock as soon as those skills exist |
| 110 | أربعة | أَرْبَعَة | A4 | EXISTING_720 | numbers-4 | numbers | Number word; digit 4 may exist earlier |
| 111 | خمسة | خَمْسَة | A4 | EXISTING_720 | numbers-5 | numbers | Number word; digit 5 may exist earlier |
| 112 | أسود | أَسْوَد | A4 | EXISTING_720 | colors-9 | colors | hamza |
| 113 | أبيض | أَبْيَض | A4 | EXISTING_720 | colors-10 | colors | hamza + ض |
| 114 | طويل | طَوِيل | A4 | EXISTING_720 | adjectives-3 | adjectives | |
| 115 | قصير | قَصِير | A4 | EXISTING_720 | adjectives-4 | adjectives | |
| 116 | حار | حَارّ | A4 | EXISTING_720 | adjectives-21 | adjectives | shadda |
| 117 | بارد | بَارِد | A4 | EXISTING_720 | adjectives-22 | adjectives | |
| 118 | سريع | سَرِيع | A4 | EXISTING_720 | adjectives-5 | adjectives | Pair بطيء postponed; سريع stays |
| 119 | صديق | صَدِيق | A4 | EXISTING_720 | family-20 | family | |
| 120 | طبيب | طَبِيب | A4 | EXISTING_720 | jobs-1 | jobs | One job |
| 121 | دراجة | دَرَّاجَة | A4 | EXISTING_720 | transport-3 | transport | shadda |
| 122 | قطار | قِطَار | A4 | EXISTING_720 | transport-5 | transport | |
| 123 | مطبخ | مَطْبَخ | A4 | EXISTING_720 | home-20 | home | |
| 124 | حمام | حَمَّام | A4 | EXISTING_720 | home-21 | home | Room (not مرحاض) |
| 125 | نافذة | نَافِذَة | A4 | EXISTING_720 | home-3 | home | ذ |
| 126 | كرسي | كُرْسِيّ | A4 | EXISTING_720 | home-8 | home | Final yāʾ + shadda |
| 127 | نحلة | نَحْلَة | A4 | EXISTING_720 | birds-21 | animals | |
| 128 | فراشة | فَرَاشَة | A4 | EXISTING_720 | birds-22 | animals | |
| 129 | يقول | يَقُولُ | A4 | NEW_REQUIRED | — | verbs | `يَقُولُ` |
| 130 | يأتي | يَأْتِي | A4 | NEW_REQUIRED | — | verbs | `يَأْتِي` — hamza + madd ي |
| 131 | يغلق | يُغْلِقُ | A4 | EXISTING_720 | verbs-25 | verbs | `يُغْلِقُ` Form IV. Pedagogical pair with `يَفْتَحُ`. Prefix ḍamma is a skill |
| 132 | يلبس | يَلْبَسُ | A4 | EXISTING_720 | verbs-30 | verbs | `يَلْبَسُ` |
| 133 | يغسل | يَغْسِلُ | A4 | EXISTING_720 | verbs-29 | verbs | `يَغْسِلُ` |
| 134 | لذيذ | لَذِيذ | A4 | EXISTING_720 | adjectives-30 | adjectives | |
| 135 | شاي | شَاي | A4 | EXISTING_720 | food-48 | food | Established MSA loan |

**Checksum:** 28 + 35 + 37 + 35 = **135**.

---

# 6. NEW_REQUIRED (22)

Not in `src/content/words/`. Do not add to `part1.ts`–`part4.ts` in this pass.

| Lemma | Teaching form | Cluster | Category |
| --- | --- | --- | --- |
| بنت | بِنْت | A2 | family |
| ولد | وَلَد | A2 | family |
| قطة | قِطَّة | A2 | animals |
| كرة | كُرَة | A3 | toys |
| لعبة | لُعْبَة | A3 | toys |
| مسجد | مَسْجِد | A3 | places |
| سوق | سُوق | A3 | places |
| يوم | يَوْم | A3 | time |
| صباح | صَبَاح | A3 | time |
| يذهب | يَذْهَبُ | A3 | verbs |
| يرى | يَرَى | A3 | verbs |
| هذا | هَذَا | A4 | function |
| هذه | هَذِهِ | A4 | function |
| هو | هُوَ | A4 | function |
| هي | هِيَ | A4 | function |
| في | فِي | A4 | function |
| على | عَلَى | A4 | function |
| هنا | هُنَا | A4 | function |
| نعم | نَعَم | A4 | function |
| لا | لَا | A4 | function |
| يقول | يَقُولُ | A4 | verbs |
| يأتي | يَأْتِي | A4 | verbs |

Dropped from the earlier NEW_REQUIRED draft: يريد، جوعان، عطشان.

---

# 7. Postponed (not Band A v1)

| Item | Where it goes | Why |
| --- | --- | --- |
| اثنان | Numbers curriculum / Band B literacy | Dual + hamzat waṣl; digit 2 still teachable |
| زهرة | Band B | وردة covers the flower |
| يريد | Band B | Form IV meaning is beginner; pattern is not |
| طماطم | Band B | Loan-origin; not needed in the first 135 |
| جوعان | Band B or replace later with جائع | Not conservative MSA for Band A |
| بطيء | Band B | Hamza-final pair postponed; سريع remains |
| عطشان | Band B | Hunger/thirst pair postponed with جوعان |
| من | Band B | More abstract than في / على |
| 6–10, صفر, teens | Numbers skill + later literacy | |

---

# 8. Function-word set (v1)

| Word | Teaching form | Band A? | Vocab / grammar |
| --- | --- | --- | --- |
| هذا | هَذَا | Yes | Both |
| هذه | هَذِهِ | Yes | Both |
| هو | هُوَ | Yes | Both |
| هي | هِيَ | Yes | Both |
| في | فِي | Yes | Both |
| على | عَلَى | Yes | Both (language + future grammar) |
| هنا | هُنَا | Yes | Vocab + adverb |
| نعم | نَعَم | Yes | Interaction, listening, sentences |
| لا | لَا | Yes | Interaction, listening, sentences |
| من | — | **No** | Band B |

Decode these; do not teach them as unanalyzed logos.

---

# 9. Verbs (16)

Teaching form = 3ms imperfect, fully vocalized.

يَأْكُلُ، يَشْرَبُ، يَلْعَبُ، يَنَامُ، يَجْلِسُ، يَكْتُبُ، يَقْرَأُ، يَفْتَحُ، يُغْلِقُ، يَذْهَبُ، يَأْتِي، يَرَى، يَمْشِي، يَقُولُ، يَلْبَسُ، يَغْسِلُ

`يُرِيدُ` is Band B.

---

# 10. Semantic balance (v1)

| Domain | Count |
| --- | ---: |
| People / family | 9 |
| Animals | 13 |
| Body | 12 |
| Home | 11 |
| School | 7 |
| Food / drink | 13 |
| Clothes | 2 |
| Colors | 6 |
| Number words | 4 |
| Nature / weather / sky / sea | 12 |
| Transport | 4 |
| Toys | 2 |
| Places (مسجد، سوق) | 2 |
| Time (يوم، صباح) | 2 |
| Verbs | 16 |
| Adjectives (not colors) | 10 |
| Function / interaction | 9 |
| Other (طبيب) | 1 |
| **Total** | **135** |

Nature is 12 (زهرة removed). Food is 13 (طماطم removed). Adjectives 10 (جوعان، عطشان، بطيء removed). Function 9 (نعم، لا added). Numbers 4 (اثنان removed). Verbs 16 (يريد removed).

---

# 11. High-frequency spine (~35)

`highFrequency` on a future record means **more recycling**, not skipping decode. Do not mark all 135 as YES.

**People:** أم، أب، بنت، ولد  
**Core world:** بيت، باب، ماء، يد، كتاب، قلم، مدرسة، كرة  
**Pets:** قط، قطة، كلب  
**Glue:** هذا، هذه، هو، هي، في، على، هنا، نعم، لا  
**Verbs:** يأكل، يشرب، يلعب، ينام، يذهب، يرى، يقول  
**Description:** كبير، صغير، سعيد

---

# 12. Sentence readiness (tests only, not production copy)

Masculine citation verbs/adjectives. `ال` is grammatical furniture, not a Band A lemma. No `أُمِّي` until clitics.

Patterns that Band A v1 can support once function words and `ال` skill exist:

1. هَذَا بَابٌ  
2. هَذِهِ بِنْتٌ  
3. هَذَا وَلَدٌ  
4. الْأُمُّ هُنَا  
5. الْوَلَدُ يَأْكُلُ  
6. الْوَلَدُ يَشْرَبُ مَاءً  
7. الْقِطُّ يَلْعَبُ  
8. الْبَيْتُ كَبِيرٌ  
9. الْمَاءُ بَارِدٌ  
10. الْوَلَدُ فِي الْبَيْتِ  
11. الْبِنْتُ فِي الْمَدْرَسَةِ  
12. الْكِتَابُ عَلَى الطَّاوِلَةِ  
13. هُوَ سَعِيدٌ  
14. الْوَلَدُ يَذْهَبُ  
15. الْوَلَدُ يَرَى الْقَمَرَ  
16. نَعَمْ. / لَا.  
17. الْبَابُ يُغْلِقُ / الْوَلَدُ يَفْتَحُ الْبَابَ  

Do not use حديقة, جوعان, يريد, or اثنان in Band A tests.

Meaningful **who + does** reading starts after ولد/بنت + a verb, even if `هذا` is still locked. Full glue sentences wait for A4 skills (`هذا`, `في`, `على`).

---

# 13. What this pass does not do

- Does not edit `src/content/words/`
- Does not write 135 canonical `word.*` JSON records
- Does not change UI, routes, letters, progress, or audio
- Does not promote the curriculum fixture to production
- Does not create packs yet (`pack.bandA.*`)

**Next content phase:** assign canonical ids (`word.bab`, `word.naam`, …), `legacyId` for the 113 existing rows, `letterIds` / `requiredSkillIds` / `phonicsSkillIds` per row, and `teachingForm` where it differs from today’s 720 pause-form verbs.

---

*Band A v1 closed at 135 words. Historical draft was 140 (proposal + QC in earlier revisions of this file).*
