# Arabic Word Curriculum Audit

**Scope:** analysis only. No dataset words, diacritics, categories, or app files were modified.  
**Language policy:** Hurufi Al Arabiya teaches **العربية الفصحى المعاصرة الواضحة والمناسبة للأطفال** (clear, child-appropriate contemporary Modern Standard Arabic), with vocabulary that can travel across the Arabic-speaking world.  
**Sources inspected:** `src/content/words/part1.ts`, `part2.ts`, `part3.ts`, `part4.ts`, plus `types.ts` / `index.ts` for ID rules.  
**IDs:** assigned by `build()` as `{category}-{1-based index}` in source-array order.  
**Count method:** Node parsed every `["…", "…"]` tuple in the four part files (whitespace-tolerant). A stricter parser reported 719 because `clothes-20` (`جَيْب`) has extra spaces before the comma (`["جَيْب"  , "👖"]`).  
**Pass 2:** every one of the 720 entries was re-scored for MSA status and curriculum action. Linguistic validity and beginner priority are separate questions. Valid MSA that is rare for ages 4–8 is `KEEP_ADVANCED`, not deletion. Regional culture is not the same as dialect.

---

# 1. Dataset Overview

| Metric | Value |
| --- | ---: |
| Exact total words | **720** |
| Exact number of categories | **19** |

## Count per category

| Category ID | Arabic label (UI) | Count |
| --- | --- | ---: |
| animals | حيوانات | 60 |
| food | طعام | 60 |
| fruits | فواكه | 35 |
| vegetables | خضار | 30 |
| family | عائلتي | 40 |
| body | جسمي | 40 |
| colors | ألوان | 20 |
| numbers | أرقام | 20 |
| home | في البيت | 50 |
| school | المدرسة | 40 |
| clothes | ملابس | 35 |
| nature | الطبيعة | 45 |
| transport | مواصلات | 35 |
| jobs | مهن | 35 |
| birds | طيور وحشرات | 35 |
| sea | البحر | 25 |
| sky | السماء | 20 |
| verbs | أفعال | 50 |
| adjectives | صفات | 45 |
| **Total** | | **720** |

The dataset is a flat noun/verb/adjective card list. There are no time words, place names, toys, shapes, or meals as categories. Several categories mix multiple semantic fields (see §6).

---

# 2. High-Priority Problems

1. **Malformed / wrong lemmas:** `أُورَانْغ` is truncated (orangutan). `ظَرِيف` means “witty/charming”, not hamster. `قُنْدُسُ البَحْر` is “beaver of the sea”, not otter.
2. **Age-inappropriate or unfortunate items for ages 4–8:** `حَبِيب` (romantic), `نَسِيب` / `سَلَف` (in-laws), `كَاكَا` (persimmon; in much child speech this is “poop”).
3. **Exact cross-category duplicates:** `تَمْر` (food + fruits), `ذُرَة` (food + vegetables), `مُعَلِّم` (school + jobs).
4. **Homographs taught as if they were the same word:** `وَرَقَة` (paper vs leaf), `نَجْمَة` (reward star vs sky star), `زَوْج` (husband vs pair), `قَرِيب` (relative vs near).
5. **Core beginner words are missing:** especially `بِنْت` and `وَلَد`, plus time words, places, toys, and several high-frequency verbs (`يَذْهَب`, `يَأْتِي`, `يَرَى`, `يَقُول`, `يُرِيد`).
6. **Diacritic / phonology errors:** `مِثَلَّجَات` (should be `مُثَلَّجَات`), `فِطْر` for mushroom (should be `فُطْر`), word-initial sukuun on `كْرُوَاسَان` and `بْرُوكُلِي`.
7. **Family category is not a family list:** friends, neighbors, guests, man/woman, in-laws, and “beloved” are mixed in.
8. **Emoji failures that teach the wrong concept:** sugar as salt, bulgur as a hamburger, fig as an olive, table as a chair, steering wheel as a Ferris wheel, head as a brain, and several more (see §8).
9. **Pedagogical inconsistency:** most lemmas are pause-form without tanween; a minority use tanween, iḍāfa, or full adjective phrases. Mix of singular, plural, dual, collective, and masculine/feminine pairs is unplanned.
10. **Order and quality, not shrinkage.** 720 is a reasonable long-term inventory if leveled. The problem is teaching order, a handful of wrong lemmas, missing universal child words (time, places, toys, بنت/ولد), and MSA/diacritic cleanup — not deleting the app down to ~100 words.

---

# 3. Suspected Errors

| Word | Current category | Problem | Recommended action |
| --- | --- | --- | --- |
| أُورَانْغ | animals | Truncated form of أُورَانْغُوتَان | Replace lemma, or drop (L4 exotic) |
| ظَرِيف | animals | Means “witty”; hamster emoji; next entry is already هَامْسْتَر | Remove; likely a translation of “cute” |
| قُنْدُسُ البَحْر | sea | Calque: “sea beaver”. Otter is قَضَّاعَة / كَلْبُ البَحْر | Replace lemma |
| مِثَلَّجَات | food | Pattern is اسم مفعول: expected مُثَلَّجَات | Correct diacritics later; do not silently change now |
| فِطْر | nature | فِطْر = breaking fast / breakfast; mushroom is فُطْر | Correct later; high confusion risk |
| كْرُوَاسَان | food | Word-initial sukuun is not Arabic phonotactics | Recast as كُرْوَاسَان |
| بْرُوكُلِي | vegetables | Same initial-cluster problem | Recast as بُرُوكْلِي / بْروكلي with a helping vowel |
| يُوسُفِي | fruits | Nisba normally يُوسُفِيّ (shadda on yāʾ) | Review diacritics |
| كَاكَا | fruits | Rare fruit; strong child-language homophone “poop” | Remove from children’s set |
| حَبِيب | family | Romantic “beloved” for ages 4–8 | Remove |
| نَسِيب | family | In-law; adult kinship | Remove |
| سَلَف | family | In-law or “ancestor”; ambiguous and adult | Remove |
| زَوْج | numbers | Same spelling as “husband”; emoji is plus-sign; “pair/even” is not a counting numeral | Remove or replace with أَرْبَعُون / عَدَد |
| بُرْغُر | food | 🍔 hamburger does not denote bulgur | Change emoji later; keep word at L3 |
| سُكَّر | food | 🧂 is salt (already used for مِلْح) | Change emoji later |
| تِين | fruits | 🫒 is olive (زيتون already exists in food) | Change emoji later |
| رَأْس | body | 🧠 is brain (دِمَاغ is a separate entry) | Change emoji later |
| طَاوِلَة | home | 🪑 is chair (كُرْسِي is the previous entry) | Change emoji later |
| مِقْوَد | transport | 🎡 is a Ferris wheel, not a steering wheel | Change emoji later |
| غَوَّاصَة | transport | 🛥️ is a motorboat, not a submarine | Change emoji later |
| عَيْن مَاء | nature | Iḍāfa missing case vowel: expected عَيْنُ مَاء | Review diacritics |
| نَبَاتٌ صَغِير | nature | Awkward two-word definition, not a lexical item | Replace with نَبْتَة / شَتْلَة |
| طَائِرٌ طَنَّان | birds | Awkward phrase for hummingbird | Replace with طَائِرُ الطَّنَّان or similar |
| جَيْب | clothes | Source tuple is malformed: extra spaces before comma | Fix source formatting later; keep concept |
| مَعْجُون | home | Too generic (“paste”); intended toothpaste | Replace with مَعْجُونُ أَسْنَان |
| سَرَطَان | sea | Also the disease “cancer” | Prefer سَرَطَانُ البَحْر for children |
| فِطْر / بَرَد / حَمَل | nature / nature / animals | Homographs with unrelated common words | Prefer clearer lemmas or extra context |
| أُسْرَة vs عَائِلَة | family | Near-synonyms occupying two beginner slots | Keep one as core |
| تُوتُ الأَرْض vs فَرَاوِلَة | fruits | Same fruit (strawberry): MSA vs loanword | Keep فَرَاوِلَة for beginners; move توت الأرض to enrichment |
| قَرْع vs يَقْطِين | vegetables | Overlapping pumpkin/gourd senses | Keep one as core |

---

# 4. Difficult / Inappropriate Beginner Words

These are mostly **valid MSA** that belong later, not words to delete. Suggested level is teaching order. Only malformed or inappropriate items should leave the beginner path (`REPLACE` / `REMOVE`). Regional dishes such as كسكس are valid MSA names for cultural concepts: they are Level 3, not “non-MSA.”

| Word | Category | Why difficult | Suggested level |
| --- | --- | --- | --- |
| غُورِيلَا | animals | Loanword; low local frequency | 3 |
| وَحِيدُ القَرْن | animals | Compound; also confused with unicorn in children’s media | 3 |
| فَرَسُ النَّهْر | animals | Compound iḍāfa | 3 |
| كُوَالَا | animals | Exotic loanword | 4 |
| لَامَا | animals | Exotic loanword | 4 |
| أُورَانْغ | animals | Malformed + exotic | 4 |
| وَرَل | animals | Specialized herpetology | 4 |
| يَرْبُوع | animals | Rare outside desert science contexts | 4 |
| بَغْل | animals | Low usefulness vs حمار/حصان | 4 |
| خِنْزِير | animals | Culturally sensitive in many Arabic-speaking homes | 3 |
| هَامْسْتَر | animals | Loanword | 3 |
| ظَرِيف | animals | Wrong word | 4 |
| مَنْسَف / مَقْلُوبَة / كُسْكُس | food | Regional dishes, not universal first food words | 3 |
| كْرُوَاسَان / دُونَتْ | food | Loans + (croissant) illegal initial cluster | 3 |
| مُحَامٍ / قَاضٍ | jobs | Adult civic roles; defective-noun grammar | 4 |
| نَسِيب / سَلَف / حَبِيب | family | Adult / romantic | 4 |
| زَوْج / زَوْجَة | family | Adult marital terms for 4-year-olds | 3 |
| عَجُوز | family | Can sound rude | 3 |
| مَجَرَّة / شِهَاب / مُذَنَّب / كُسُوف | sky | Astronomy enrichment, not beginner | 4 |
| نَارِنْج / سَفَرْجَل / كَرَمْبُولَا / لِيتْشِي / بَابَايَا / عُنَّاب / كَاكَا / تُوتُ العُلَّيْق | fruits | Rare or exotic; some have extra problems | 4 |
| عَالٍ / مُحَامٍ / قَاضٍ / وَادٍ | adjectives / jobs / nature | Defective nouns + tanween | 3–4 |
| اِمْتِحَان | school | School-test culture; heavy for preschool | 3 |
| عِلْم | school | Abstract “science/knowledge” | 3 |
| كَهْرَبَائِيّ | jobs | Long nisba | 3 |
| رَائِدُ فَضَاء | jobs | Compound; uncommon everyday role | 3 |
| طَحْلُب | sea | Specialized | 4 |
| زَنْجَبِيل | vegetables | Spice more than vegetable | 3 |
| يَسْتَيْقِظ / يُفَكِّر / يَتَكَلَّم | verbs | Longer derived forms (still useful meanings) | 2–3 |
| رَطْب | adjectives | Also “ripe date”; weak for “wet” | 3 |
| سَرَطَان | sea | Disease homograph | 3 |
| قُنْدُسُ البَحْر | sea | Wrong referent | 4 |
| دِمَاغ / رِئَة / مَعِدَة | body | Internal anatomy | 3 |
| نِيلِيّ / فَيْرُوزِيّ | colors | Fine color-splitting beyond beginner needs | 3–4 |

---

# 5. Duplicates and Near-Duplicates

Duplicates are not all the same problem. This pass uses five types.

## A. Exact duplicate (same lexical item twice)

| Lemma | Occurrences | Recommendation |
| --- | --- | --- |
| تمر | food-54 `تَمْر` · fruits-17 `تَمْر` | One lemma, two categories. Prefer fruits as home, or share the record. Not two different words. |
| ذرة | food-39 `ذُرَة` · vegetables-20 `ذُرَة` | One lemma. Vegetables is the better home. |
| معلم | school-2 `مُعَلِّم` · jobs-4 `مُعَلِّم` | Same word. Keep school as the child’s label; jobs may reuse it, but it is not a second vocabulary item. |

## B. Useful semantic pair

Keep masculine/feminine kin and roles children need: أم/أب، أخ/أخت، جد/جدة، عم/عمة، خال/خالة، معلم/معلمة، طبيب/طبيبة، صديق/صديقة. ابن/ابنة is valid MSA; **بنت** and **ولد** are still the missing everyday pair.

## C. Synonyms worth teaching (level them)

عائلة then أسرة; ثعبان then أفعى; زهرة then وردة; فراولة (L1) then توت الأرض (L3 MSA name); شوربة then native حساء; قط with قطة (preferred) rather than هرة alone.

## D. Redundant synonyms for a beginner lesson

Cattle, sheep, gazelle, pumpkin, and coat stacks are valid MSA. Teach the clearest child word at L1–2; park the rest at L3–4. Do not delete them.

## E. Same spelling / different meaning (not duplicates)

| Lemma | Senses | Action |
| --- | --- | --- |
| ورقة | paper (school) · leaf (nature) | Keep both; disambiguate |
| نجمة | reward sticker · sky star | Sky is primary |
| زوج | husband · pair/even | Keep family; replace numbers entry |
| قريب | relative · near | Keep both |
| لبن | milk vs yogurt drink by region | HUMAN_REVIEW |
| حمل | lamb · “he carried” | Keep animal |
| فطر | breakfast vs mushroom | Vocalize as فُطْر |
| سرطان | crab · cancer | Prefer سرطان البحر |

## Other concept clusters

| Cluster | Items | Note |
| --- | --- | --- |
| Cat | قِطّ · هِرَّة | Missing the common pet word قِطَّة |
| Snake | أَفْعَى · ثُعْبَان | Keep ثعبان as the generic child word |
| Gazelle/deer-like | غَزَال · ظَبْي · وَعْل | Overlap + deer emojis |
| Sheep group | خَرُوف · حَمَل · كَبْش | Fine as enrichment, not as three L1/L2 slots |
| Cattle group | بَقَرَة · بَقَر · عِجْل · ثَوْر · جَامُوس | Too many for beginners |
| Equids | حِصَان · مُهْر · حِمَار · بَغْل | بغل is the weakest |
| Soup | شُورْبَة · حَسَاء | Synonyms |
| Milk/yogurt drinks | حَلِيب · لَبَن · زَبَادِي | لبن is regionally ambiguous (milk vs yogurt drink) |
| Family | عَائِلَة · أُسْرَة | Near-synonyms |
| Children plurals | أَبْنَاء · بَنَات · أَوْلَاد | Overlap; singular بنت/ولد missing |
| Flower | زَهْرَة · وَرْدَة | Related; both useful if levels differ |
| Pumpkin/gourd | قَرْع · يَقْطِين | Regional overlap |
| Strawberry | فَرَاوِلَة · تُوتُ الأَرْض | Loan vs MSA |
| Apple/grape color variants | تُفَّاح · تُفَّاحٌ أَخْضَر · عِنَب · عِنَبٌ أَحْمَر | Split a basic word into color variants |
| Citrus | بُرْتُقَال · نَارِنْج · يُوسُفِي | نارنج is the weak extra |
| Coat | مِعْطَف · سُتْرَة · مِعْطَفُ مَطَر | Stacked |
| Beach | شَاطِئ · شَاطِئٌ رَمْلِيّ | Second is an adjective phrase |
| Fish | سَمَك (food) · سَمَكَة · سَمَكَةٌ مُلَوَّنَة | Collectives vs individuals vs “colored fish” |
| Chicken | دَجَاج (food) · دَجَاجَة · دِيك · كَتْكُوت | Food vs animals is OK; all four as core is heavy |
| Bread | خُبْز · خُبْزٌ مُحَمَّص | Second is a phrase |
| Ice/snow | ثَلْج · جَلِيد · بَرَد | Fine if leveled |
| Garden | حَدِيقَة (home) · بُسْتَان (nature) | Near |
| Phone/clock/bag compounds | سَاعَة / سَاعَةُ يَد · حَقِيبَة / حَقِيبَةُ يَد · جَرَس / جَرَسُ المَدْرَسَة | Compounds repeat bases |
| Hamster | ظَرِيف (wrong) · هَامْسْتَر | Double slot |
| Blues | أَزْرَق · سَمَاوِيّ · فَيْرُوزِيّ · نِيلِيّ | Too many blues |
| Teacher | مُعَلِّم twice + مُعَلِّمَة | Gender pair useful; cross-category clone is not |

## Masculine / feminine pairs

Useful for family (أم/أب, أخ/أخت, عم/عمة, خال/خالة, جد/جدة).  
Uneven elsewhere: طبيب/طبيبة exist; معلمة exists only under school; most jobs are masculine-only; verbs and adjectives are masculine-only; تلميذ has no تلميذة.

---

# 6. Category Problems

| Word | Current | Better home | Why |
| --- | --- | --- | --- |
| صَدِيق / صَدِيقَة | family | people / social | Friends are not kin |
| جَار / جَارَة | family | people / neighborhood | Neighbors |
| ضَيْف | family | people / social | Guest |
| رَجُل / اِمْرَأَة / شَابّ / فَتَاة / عَجُوز | family | people | General humans |
| زَوْج / زَوْجَة | family | people (older) | Not “my family” labels for a young child |
| نَسِيب / سَلَف / حَبِيب | family | remove | Adult/romantic |
| نِصْف | numbers | quantity | Not a counting number |
| زَوْج | numbers | remove or math | Not a numeral |
| أَلْوَان | school | colors, or “crayons” lemma | Currently means “colors” |
| نَجْمَة | school | keep only in sky; school can use نَجْمَةُ تَقْدِير later | Same lemma as sky |
| وَرَقَة (paper) | school | school is fine | Must be distinguished from leaf |
| مُعَلِّم | jobs | drop jobs copy; keep school (+ معلمة) | Duplicate |
| تَمْر | food vs fruits | pick fruits (or food if treating as staple) | Duplicate |
| ذُرَة | food vs vegetables | vegetables | Duplicate |
| خَاتَم / سِوَار / قِلَادَة / حَقِيبَةُ يَد / مِحْفَظَة | clothes | accessories / jewelry | Not garments |
| بَقْدُونِس / نَعْنَاع / كُزْبَرَة / جِرْجِير | vegetables | herbs | Culinary herbs |
| زَنْجَبِيل | vegetables | spices | Not a vegetable |
| حَلَزُون | birds (طيور وحشرات) | animals / mini-beasts | Snail is neither |
| عَنْكَبُوت / عَقْرَب | birds | mini-beasts | Arachnids |
| مِظَلَّة | home | weather / outdoors | Not a room object |
| حَدِيقَة | home | nature / places | Borderline |
| فِطْر | nature | food if mushroom; else fix lemma | Semantic mix |
| قَمْح | nature | farm / food | Crop |
| عَرَبَة | transport | household / shopping | 🛒 cart |
| خُوذَة | transport | clothes / safety | Worn object |
| حِزَامُ أَمَان | transport | OK if “car safety” | Not a vehicle |
| غَوَّاص | sea | jobs | Person, not a sea animal |
| شِرَاع / مِرْسَاة / مَنَارَة | sea | transport / places | Equipment/places |
| أَرْض | sky | nature or “space” | Polysemous (Earth / ground / floor) |
| ضَوْء | sky | nature / home | Not specifically sky |
| insects in `birds` | birds | split “طيور” vs “حشرات” | UI label already admits the mix |

---

# 7. Diacritics / Arabic Quality Review

Do not silently correct the dataset. Current form → proposed later form.

| Current form | Proposed corrected form | Issue |
| --- | --- | --- |
| مِثَلَّجَات | مُثَلَّجَات | First vowel should be ḍamma (passive participle of ثلّج) |
| فِطْر | فُطْر | Mushroom vs breakfast/fiṭr homograph |
| أُورَانْغ | أُورَانْغُوتَان | Truncation |
| ظَرِيف | — (not a hamster) | Wrong lexeme |
| قُنْدُسُ البَحْر | قَضَّاعَة / كَلْبُ البَحْر | Wrong lexeme |
| كْرُوَاسَان | كُرْوَاسَان | Cannot begin with sukuun |
| بْرُوكُلِي | بُرُوكْلِي | Cannot begin with sukuun |
| يُوسُفِي | يُوسُفِيّ | Missing nisba shadda |
| عَيْن مَاء | عَيْنُ مَاء | Iḍāfa vowel omitted |
| بِسْكُوِيت | بِسْكُوِيت / بَسْكَوِيت | Kasra on wāw is awkward for a loan |
| هَامْسْتَر | هَمْسْتَر | Extra ʾalif; loan spelling varies |
| كَرَمْبُولَا | كَارَامْبُولَا | Unusual vowelling of carambola |
| جَمْبَرِي | إِرْبِيَان (MSA) or keep as common loan | Colloquial-leaning |
| فَرَاوِلَة | keep; MSA alternate تُوتُ الأَرْض already present | Loan vs MSA split |
| مَعْكَرُونَة | مَعْكَرُونَة or مَكَرُونَة | Both exist; pick one policy |
| أَرُزّ | أَرُزّ or أُرْز | Both exist; pick one |
| إِجَّاص | إِجَّاص or كُمَّثْرَى | إجاص is widely used; كمثرى is more classical MSA |
| شَمَنْدَر | شَمَنْدَر / بَنْجَر | Regional names for beet |
| طَمَاطِم | طَمَاطَة (sg.) / طَمَاطِم (pl.) | Plural/collective used as the card |
| رُمُوش | رَمْش | Plural among mostly singular body words |
| زَعَانِف | زَعْنَفَة | Plural among mostly singular sea words |
| وَادٍ / عَالٍ / مُحَامٍ / قَاضٍ | keep form, delay to L3–4 | Defective + tanween is advanced |
| دُبٌّ قُطْبِيّ, تُفَّاحٌ أَخْضَر, سَمَكَةٌ مُلَوَّنَة, … | either all tanween or none | Policy split vs pause-form majority |
| قِطّ, دُبّ, أُمّ, سِنّ, … | قِطٌّ etc. if full iʿrāb is the policy | Shadda often lacks a following vowel |
| اِبْن, اِثْنَان, اِمْرَأَة | keep | Hamzat waṣl written as ا + kasra: good educational choice |
| أَحَدَ عَشَر | keep | Frozen fatha is correct |
| حِمَار وَحْشِيّ | حِمَارٌ وَحْشِيّ | Missing connecting tanween/iʿrāb |
| نَبَاتٌ صَغِير / طَائِرٌ طَنَّان | replace with a single lexeme | Definitions, not headwords |

**Tanween / ḥaraka policy (current):** most cards use pause form (no final tanween). A minority of indefinite noun+adjective phrases use tanween (`خُبْزٌ مُحَمَّص`, `دَرَّاجَةٌ نَارِيَّة`, `قَمِيصٌ دَاخِلِيّ`, `شَاطِئٌ رَمْلِيّ`, `سَمَكَةٌ مُلَوَّنَة`, `تُفَّاحٌ أَخْضَر`, `عِنَبٌ أَحْمَر`, `طَائِرٌ طَنَّان`, `نَبَاتٌ صَغِير`, `دُبٌّ قُطْبِيّ`). Defective adjectives/nouns use tanween kasra. This mix will look random to learners.

**Singular/plural/collective mix:** collectives (`بَيْض`, `دَجَاج`, `سَمَك`, `بَقَر`, `شَعْر`), dual (`وَالِدَان`), plurals (`أَوْلَاد`, `مُكَسَّرَات`, `مِثَلَّجَات`, `أَلْوَان`), and singulars sit side by side with no stated rule.

---

# 8. Emoji Review

Misleading, unclear, or culturally/semantically weak mappings:

| Word | Emoji | Problem |
| --- | --- | --- |
| سُكَّر | 🧂 | Identical to salt |
| بُرْغُر | 🍔 | Hamburger ≠ bulgur |
| تِين | 🫒 | Olive; olive is already زيتون |
| رُمَّان | 🍎 | Apple; apple is already تفاح |
| تَمْر | 🌴 | Palm tree, not the fruit |
| مُرَبَّى | 🍓 | Jam is not specifically strawberry |
| عَدَس | 🍛 | Curry plate |
| حُمُّص | 🥙 | Wrap/sandwich |
| كُسْكُس | 🍚 | Rice |
| لَوْز / جَوْز | 🌰 | Chestnut for both |
| زَبَادِي | 🥛 | Same as milk |
| رَأْس | 🧠 | Brain |
| صَدْر | 🫀 | Anatomical heart (قلب is separate) |
| بَطْن | 🤰 | Pregnancy |
| مَعِدَة | 🫃 | Pregnancy |
| رَقَبَة | 🧣 | Scarf |
| طَاوِلَة | 🪑 | Chair |
| خِزَانَة | 🚪 | Door |
| سَجَّادَة | 🧶 | Yarn |
| بَطَّانِيَة | 🧣 | Scarf |
| ثَلَّاجَة | 🧊 | Ice |
| فُرْن | 🔥 | Fire |
| مِكْوَاة | 👕 | Shirt |
| مِنْشَفَة / مِنْدِيل | 🧻 | Toilet paper |
| مِمْحَاة | 🩹 | Bandage |
| سَبُّورَة | 📋 | Clipboard |
| طَبَاشِير / أَلْوَان | 🖍️ | Crayon, not chalk |
| كَنْزَة | 🧶 | Yarn, not sweater |
| حِزَام | 🎗️ | Awareness ribbon |
| ثَوْب | 🥻 | Sari, not an Arab thawb |
| سِوَار / قِلَادَة | 📿 | Prayer beads |
| غَزَال / ظَبْي | 🦌 | Deer, not gazelle |
| ضَبُع | 🐺 | Wolf (ذئب already uses this) |
| فَهْد | 🐆 | Leopard vs cheetah sense |
| عِجْل | 🐄 | Same as cow |
| وَعْل / جَدْي / مَاعِز | 🐐 | Collide |
| نَعَامَة | 🪶 | Feather |
| يَعْسُوب | 🪰 | Fly |
| نَجْمُ البَحْر | ⭐ | Same as sky star |
| مِقْوَد | 🎡 | Ferris wheel |
| غَوَّاصَة | 🛥️ | Motorboat |
| عَرَبَة | 🛒 | Shopping cart |
| نَفَق | 🚇 | Same as مترو |
| خُوذَة | 🪖 | Military helmet |
| حِزَامُ أَمَان | 🔗 | Chain link |
| كَهْف | 🕳️ | Hole |
| مَنَارَة | 🗼 | Tower |
| لُؤْلُؤَة | 🫧 | Bubbles |
| ذَهَبِيّ / فِضِّيّ | 🥇🥈 | Medals, not color swatches |
| بَيْج | 🟫 | Brown square |
| زَوْج (numbers) | ➕ | Plus sign |
| فُسْحَة | ⏰ | Clock |
| شَمَنْدَر | 🍠 | Sweet potato (بطاطا حلوة uses this too) |
| قَرْنَبِيط | 🥦 | Broccoli |
| كُوسَا | 🥒 | Cucumber |
| قَصِير (adj.) | 🐇 | Rabbit as “short” is opaque |
| مُتَّسِخ | 🧹 | Broom = cleaning, not dirty |
| كَبِير / صَغِير / طَوِيل / سَرِيع | 🐘🐜🦒🐆 | Recycle animal emojis; clashes with the animals category |

Many other emojis are acceptable approximations (no Unicode glyph for the referent). Those are not listed.

---

# 9. Proposed Curriculum Distribution

The app should stay a **progressive** curriculum. Do not permanently reduce it to a tiny core. Wrong or inappropriate items can be replaced; rare-but-valid MSA stays at Level 3–4. The long-term list may grow to 750–1000+ by **adding** missing universal child words.

**Recommended teaching order (strategy, not a deletion plan):**

| Track | Target size | What belongs there |
| --- | ---: | --- |
| Level 1 | **120–150** | Foundational concrete MSA: family, body, home, water/food staples, pets/farm animals, 1–10, core verbs/adjectives, sun/moon/door/hand |
| Level 2 | **150–200 additional** | School, clothes, everyday food, colors, local animals, 11–20 and tens, daily actions, common places once added |
| Level 3 | **expanded** | Jobs, transport, nature detail, regional-but-valid culture words, longer verbs |
| Level 4 | **enrichment** | Rare animals, astronomy, specialized jobs, uncommon fruit, adult kinship |

Exact Level 1–4 counts for the **current 720** are in the final summary after the full table. A few REPLACE/REMOVE items free slots for بنت، ولد، and other missing foundations — they do not justify cutting the catalog.

---

# 10. Missing Essential Vocabulary

High-value **universal** beginner MSA not in the current 720 (or only present as a weaker substitute). Suggested additions should be correct MSA, widely understood, concrete, illustratable, and reusable in sentences.

### People / family
- **بِنْت** (dataset has اِبْنَة / فَتَاة / بَنَات but not the everyday singular)
- **وَلَد** (has أَوْلَاد / اِبْن / طِفْل)
- قِطَّة (has قِطّ / هِرَّة)
- اِسْم، أَنَا / أَنْتَ / أَنْتِ as later function words if the app expands beyond picture nouns

### Home
- غُرْفَةُ نَوْم، غُرْفَةُ الجُلُوس، مِرْحَاض / مِرْحَاض (حمام is the room)
- تِلْفَاز is present; جَوَّال if هاتف stays generic

### School
- مُدِير / مُدِيرَة، صَفّ (فَصْل is present), تِلْمِيذَة

### Food
- فَاكِهَة، خُضَار (hypernyms), فَطُور، غَدَاء، عَشَاء، وَجْبَة، أَكْل / طَعَام

### Body
- Coverage is strong. Optional: أَسْنَان (plural), كَوع if distinct from مرفق

### Actions
- يَذْهَب، يَأْتِي، يَرَى، يَقُول، يُرِيد، يَعْرِف، يَسْأَل، يَعْمَل، يَفْهَم، يَرْجِع، يَسْكُن

### Adjectives
- جَيِّد، سَيِّئ، كَثِير، قَلِيل، شُجَاع، نَاعِم، خَشِن

### Emotions / states
- جَوْعَان، عَطْشَان، مَرِيض، نَعْسَان (سعيد/حزين/خائف already exist)

### Toys
- لُعْبَة، كُرَة، دُمْيَة، طَائِرَةٌ وَرَقِيَّة، أُرْجُوحَة

### Places
- مَسْجِد، سُوق، مُسْتَشْفَى، مَطْعَم، مَدِينَة، قَرْيَة، بَلَد، مَتْجَر / دُكَّان، حَدِيقَةُ حَيَوَانَات

### Time
- صَبَاح، مَسَاء، يَوْم، أُسْبُوع، شَهْر، سَنَة، اليَوْم، أَمْس، غَدًا، الآن، دَقِيقَة
- Days of the week; seasons (رَبِيع، صَيْف، خَرِيف، شِتَاء)

### Weather / nature
- Weather is already strong (مطر، ثلج، ريح، سحاب). Hypernyms: حَيَوَان، طَائِر، حَشَرَة

### Position / direction
- فَوْق، تَحْت، يَمِين، يَسَار، أَمَام، خَلْف، هُنَا، هُنَاكَ، دَاخِل، خَارِج

### Daily routines
- يَسْتَيْقِظ / يَأْكُل / يَلْبَس already exist. Add: يَذْهَبُ إِلَى المَدْرَسَة as a phrase later; وُضُوء، قُرْآن with مَسْجِد

### Shapes
- مُرَبَّع، دَائِرَة، مُثَلَّث، مُسْتَطِيل

---

# Modern Standard Arabic (MSA) Review

## Language Policy

Hurufi Al Arabiya teaches:

> **العربية الفصحى المعاصرة الواضحة والمناسبة للأطفال**
> Clear, contemporary Modern Standard Arabic that is suitable for children.

The curriculum prefers words that are:

1. Valid in contemporary MSA (العربية الفصحى المعاصرة)
2. Widely understandable across Arab countries
3. Natural in children’s books and school materials
4. Useful for ages about 4–8
5. Reusable later in sentences and stories

**Not automatic rejection:**

- A Maghreb, Levantine, or Gulf **dish/object** with a valid MSA name stays (example: كُسْكُس). Ask whether the *term* is MSA, whether the *concept* is worth a beginner slot, and whether a more universal concept should come first.
- Established loanwords (تِلْفَاز، بَنْطَال، مَدْرَسَة-era طَمَاطِم) can be `LOANWORD_ACCEPTED`.
- Rare but correct MSA is `KEEP_ADVANCED`, not `REMOVE`.

**Do reject or replace:** dialect-only forms, baby-talk, malformed lemmas, wrong referents, and adult/romantic items that cannot be framed for this age.

MSA status labels used below:

| Label | Meaning |
| --- | --- |
| STANDARD_MSA | Core native contemporary MSA |
| ACCEPTABLE_MSA | Valid MSA, slightly literary, schoolish, or less common |
| REGIONAL_STANDARD | Valid MSA name for a regional/cultural concept |
| DIALECTAL | Primarily colloquial, not educational fusḥā |
| LOANWORD_ACCEPTED | Established in contemporary MSA |
| LOANWORD_REVIEW | Loan that needs a better form or a native alternative |
| NONSTANDARD | Incorrect, truncated, or the wrong lexeme |
| UNCERTAIN | Human linguist should confirm |

Curriculum actions: `KEEP` · `KEEP_ADVANCED` · `MOVE_CATEGORY` · `REPLACE` · `REMOVE` · `HUMAN_REVIEW`.

## Non-MSA / Dialectal Candidates

These are **candidates**, not a claim that the whole row is unusable. Several are widely printed in children’s MSA but still deserve a linguist’s eye.

| Word | Category | MSA Status | Issue | Recommended Action | Suggested Replacement |
| --- | --- | --- | --- | --- | --- |
| ظَرِيف | animals | NONSTANDARD | Means “witty”; hamster emoji | REMOVE | — (هَامْسْتَر already exists) |
| أُورَانْغ | animals | NONSTANDARD | Truncated | REPLACE | أُورَانْغُوتَان |
| قُنْدُسُ البَحْر | sea | NONSTANDARD | “Sea beaver”; otter intended | REPLACE | قَضَّاعَة / كَلْبُ البَحْر |
| كَاكَا | fruits | NONSTANDARD | Child-speech homophone “poop”; poor persimmon form | REMOVE | كَاكِي if the fruit is wanted later |
| مِثَلَّجَات | food | NONSTANDARD | Wrong first vowel; intended MSA is مُثَلَّجَات | REPLACE | مُثَلَّجَات (not dialectal بُوظَة) |
| فِطْر | nature | NONSTANDARD | Fiṭr/breakfast vs mushroom | REPLACE | فُطْر |
| كْرُوَاسَان | food | LOANWORD_REVIEW | Initial sukuun | REPLACE | كُرْوَاسَان |
| بْرُوكُلِي | vegetables | LOANWORD_REVIEW | Initial sukuun | REPLACE | بُرُوكْلِي |
| جَمْبَرِي | sea | LOANWORD_REVIEW | Common spoken form; school MSA often إِرْبِيَان | HUMAN_REVIEW | إِرْبِيَان |
| كَتْكُوت | birds | ACCEPTABLE_MSA | Child-directed; dictionaries list it | HUMAN_REVIEW | صُوص if a more formal chick is wanted |
| كَنْزَة | clothes | ACCEPTABLE_MSA | Strong Levantine/Maghrebi sweater use; also in MSA lexica | HUMAN_REVIEW | سُتْرَة already in the list |
| فُشَار | food | ACCEPTABLE_MSA | Egyptian-origin popcorn; now widely printed | HUMAN_REVIEW | ذُرَة مُفَجَّرَة (heavy for L2) |
| شُورْت | clothes | LOANWORD_REVIEW | English shorts | KEEP | سِرْوَال قَصِير as a later native phrase |
| سَمْبُوسَك | food | REGIONAL_STANDARD | Regional pastry name/form | KEEP_ADVANCED | سَمُّوسَة / سَمْبُوسَة |
| يُوسُفِي | fruits | REGIONAL_STANDARD | Mandarin; Egyptian/Levant school name | KEEP | يُوسُفِيّ ; alternate مَنْدَرِين |
| لَبَن | food | UNCERTAIN | Meaning shifts by region (milk vs yogurt drink) | HUMAN_REVIEW | Keep حَلِيب for milk; specify لبن رايب if yogurt drink |
| بَطَاطَا | vegetables | LOANWORD_ACCEPTED | Vs Egyptian بَطَاطِس; both appear in MSA | HUMAN_REVIEW | Pick one lemma for the app |
| مِرْيَلَة | clothes | LOANWORD_ACCEPTED | Apron; schoolbooks use it | KEEP | مِئْزَر as native alternate |
| هِرَّة | animals | ACCEPTABLE_MSA | Literary feminine cat | KEEP | Prefer adding قِطَّة for children |
| بُرْغُل | food | LOANWORD_ACCEPTED | Established; emoji is the problem | KEEP | — |

No dataset row is a clear **pure dialect** replacement for a standard MSA word in the way بَنَدُورَة would be (the list correctly uses طَمَاطِم). The risky rows are loans, regional names, and wrong lemmas.

## Regional Vocabulary

Regional **culture** ≠ linguistic error.

| Word | Region/Culture | Linguistically valid in MSA? | Beginner priority | Recommendation |
| --- | --- | --- | --- | --- |
| كُسْكُس | Maghreb staple | Yes — MSA name for couscous | L3, after خبز/أرز/ماء | KEEP_ADVANCED. Do not flag as dialect. |
| مَنْسَف | Levant / Jordan | Yes | L3 | KEEP_ADVANCED |
| مَقْلُوبَة | Levant | Yes | L3 | KEEP_ADVANCED |
| كُبَّة | Levant | Yes | L3 | KEEP_ADVANCED |
| فَلَافِل | Levant / Egypt | Yes, widely MSA now | L2–3 | KEEP |
| حُمُّص | Levant (dip); chickpeas pan-Arab | Yes | L2 | KEEP |
| فُول | Egypt / pan-Arab | Yes | L2 | KEEP |
| طَحِينَة | Levant | Yes | L3 | KEEP |
| عَبَاءَة / حِجَاب / ثَوْب / كُوفِيَّة | Dress across Arab societies | Yes (كوفية more Levant/Gulf) | L2–3 | KEEP / KEEP_ADVANCED for كوفية |
| نَخْلَة / تَمْر / جَمَل / صَحْرَاء | Shared Arab environment | Yes | High | KEEP — universal for this audience, not “too regional” |
| يُوسُفِي | Egypt / Levant mandarin | Acceptable MSA name | L2 | KEEP; fix shadda |
| شَمَنْدَر | Beet (vs بنجر) | Yes, regional MSA variants | L3 | KEEP |
| بَامْيَة | Pan-Arab | Yes | L3 | KEEP |
| جِرْجِير | Levant / Egypt greens | Yes | L3 | KEEP |
| سَفَرْجَل / نَارِنْج / عُنَّاب | Less common fruit | Yes | L4 | KEEP_ADVANCED |
| يَرْبُوع | Desert fauna | Yes | L4 | KEEP_ADVANCED |

## Loanwords

| Word | Origin/Type | MSA Usage | Keep/Replace | Recommended Form |
| --- | --- | --- | --- | --- |
| بَنْطَال | Italian | Contemporary MSA (also سِرْوَال) | KEEP | بَنْطَال |
| فُسْتَان | Persian/Turkish | School MSA | KEEP | فُسْتَان |
| تَنُّورَة | Loan | School MSA | KEEP | تَنُّورَة |
| تِلْفَاز | French | Preferred MSA vs تلفزيون | KEEP | تِلْفَاز |
| حَاسُوب | Arabic coinage | Standard MSA | KEEP | حَاسُوب |
| بِيتْزَا | Italian | Established | KEEP | بِيتْزَا |
| سَنْدَوِيش | English | Established | KEEP | سَنْدَوِيش |
| مَعْكَرُونَة | Italian, Arabicized | Established | KEEP | مَعْكَرُونَة |
| شُوكُولَاتَة | French/Nahuatl | Established | KEEP | شُوكُولَاتَة |
| بِسْكُوِيت | French/English | Established; vowelling awkward | KEEP / HUMAN_REVIEW form | بِسْكُوِيت or بِسْكُويت |
| سَلَطَة | Italian/Turkish | Established | KEEP | سَلَطَة |
| شُورْبَة | Turkish/Persian | Established; native حَسَاء exists | KEEP | شُورْبَة |
| طَمَاطِم | Nahuatl via European | School MSA (not dialectal بندورة) | KEEP | طَمَاطِم |
| بَطَاطَا | Taino via European | MSA variant vs بطاطس | KEEP | بَطَاطَا (pick one policy) |
| فَرَاوِلَة | Italian fragola | Pan-Arab child word | KEEP | فَرَاوِلَة |
| بِيجَامَة | Persian/English | Established | KEEP | بِيجَامَة |
| شُورْت | English | Informal MSA | KEEP | شُورْت |
| تَاكْسِي | English/French | Established | KEEP | تَاكْسِي |
| مِتْرُو | French | Established | KEEP | مِتْرُو |
| دُلْفِين | French/Greek | Established | KEEP | دُلْفِين |
| غُورِيلَا / كَنْغَر / كُوَالَا / بَنْدَا / لَامَا / هَامْسْتَر | European/zoo | Accepted zoo MSA | KEEP_ADVANCED | Keep current (except أورانغ) |
| فَلَامِنْغُو | French | Zoo MSA; native نُحَام | KEEP_ADVANCED | فَلَامِنْغُو or نُحَام |
| أَفُوكَادُو / مَانْجُو / كِيوِي / بَابَايَا | American/global fruit | Contemporary MSA | KEEP / KEEP_ADVANCED | Current forms |
| لِيتْشِي / كَرَمْبُولَا | Chinese/Spanish | Rare | KEEP_ADVANCED | Better vowelling later |
| دُونَتْ | English | Optional | KEEP_ADVANCED | دُونَات |
| كْرُوَاسَان | French | Form is phonologically illegal | REPLACE | كُرْوَاسَان |
| بْرُوكُلِي | Italian/English | Initial sukuun | REPLACE | بُرُوكْلِي |
| بَيْج | French | Color loan | KEEP | بَيْج |
| شَاي | Chinese, fully nativized | Standard | KEEP | شَاي |

## Child-Inappropriate or Adult-Oriented Vocabulary

| Word | Reason | Proposed Level/Action |
| --- | --- | --- |
| حَبِيب | Romantic reading with ❤️; also parental “حبيبي” | HUMAN_REVIEW — do not auto-delete; if kept, L4 and change framing/emoji |
| نَسِيب | In-law; adult kinship | KEEP_ADVANCED (L4) |
| سَلَف | In-law or ancestor; ambiguous | HUMAN_REVIEW / KEEP_ADVANCED (L4) |
| زَوْج / زَوْجَة | Valid MSA; marital, not first family words | KEEP_ADVANCED (L3) |
| عَجُوز | Can sound rude | KEEP_ADVANCED (L3); prefer كَبِيرُ السِّنّ later |
| كَاكَا | Baby-talk / taboo homophone | REMOVE |
| ظَرِيف as hamster | Wrong word | REMOVE |
| خِنْزِير | Valid MSA; culturally sensitive in many homes | KEEP_ADVANCED (L3) |
| مُحَامٍ / قَاضٍ | Adult civic roles | KEEP_ADVANCED (L4) |
| سَرَطَان | Disease homograph | KEEP (L3) with سَرَطَانُ البَحْر preferred later |

## MSA Diacritics Review

Do not silently change the dataset. CURRENT → PROPOSED.

| Current | Proposed | Problem | Confidence |
| --- | --- | --- | --- |
| مِثَلَّجَات | مُثَلَّجَات | اسم مفعول of ثلّج takes ḍamma | HIGH |
| فِطْر | فُطْر | Mushroom is fuṭr; fiṭr is breakfast/ʿīd al-fiṭr | HIGH |
| كْرُوَاسَان | كُرْوَاسَان | Arabic cannot start with sukuun | HIGH |
| بْرُوكُلِي | بُرُوكْلِي | Same initial-cluster issue | HIGH |
| أُورَانْغ | أُورَانْغُوتَان | Truncation | HIGH |
| عَيْن مَاء | عَيْنُ مَاء | Iḍāfa needs case vowel on عين | HIGH |
| يُوسُفِي | يُوسُفِيّ | Nisba usually has shadda on yāʾ | MEDIUM |
| حِمَار وَحْشِيّ | حِمَارٌ وَحْشِيّ | Missing tanween/link if full iʿrāb is the policy | MEDIUM |
| بِسْكُوِيت | بِسْكُويت / بَسْكَوِيت | Kasra on wāw is awkward | MEDIUM |
| هَامْسْتَر | هَمْسْتَر | Extra ʾalif in a loan | LOW |
| أَرُزّ | أَرُزّ or أُرْز | Both occur in MSA | MEDIUM |
| أُخْطُبُوط | أُخْطُبُوط (keep) or أَخْطَبُوط | Both vocalizations exist | LOW |
| كَرَمْبُولَا | كَارَامْبُولَا | Guessy loan vowelling | LOW |
| قِطّ / دُبّ / أُمّ | قِطٌّ etc. if full tanween policy | Citation-form inconsistency, not errors | MEDIUM |
| دُبٌّ قُطْبِيّ and similar phrases | Keep or drop tanween app-wide | Policy split vs pause-form majority | MEDIUM |
| وَادٍ / عَالٍ / مُحَامٍ / قَاضٍ | Keep | Correct defective tanween; teach late | HIGH |
| اِبْن / اِثْنَان / اِمْرَأَة | Keep | Hamzat waṣl written clearly — good | HIGH |
| أَحَدَ عَشَر | Keep | Frozen fatha is correct | HIGH |
| نَبَاتٌ صَغِير | نَبْتَة / شَتْلَة | Not a diacritic issue; bad headword | HIGH |
| طَائِرٌ طَنَّان | طَائِرُ الطَّنَّان | Awkward indefinite phrase | MEDIUM |
| جَيْب`  ` (extra spaces in source) | جَيْب | Source-tuple spacing | HIGH |

Anything **LOW** must not be changed without a human linguist.

## Missing Universal Beginner Vocabulary

See §10 for the grouped list (people, home, school, food, body, actions, adjectives, emotions, toys, places, time, weather/nature, position/direction, daily routines). Highest-value gaps: **بنت، ولد، time words, places, toys, core verbs (يذهب/يأتي/يرى/يقول/يريد), جوعان/عطشان/مريض**.

---

# 11. Full Word Classification

MSA status: `STANDARD_MSA` · `ACCEPTABLE_MSA` · `REGIONAL_STANDARD` · `DIALECTAL` · `LOANWORD_ACCEPTED` · `LOANWORD_REVIEW` · `NONSTANDARD` · `UNCERTAIN`

Curriculum action: `KEEP` · `KEEP_ADVANCED` · `MOVE_CATEGORY` · `REPLACE` · `REMOVE` · `HUMAN_REVIEW`

Levels: `1` foundation · `2` everyday · `3` expanded · `4` enrichment.

Notes are audit notes, not instructions to edit the dataset. Linguistic validity and beginner priority are scored separately.

## animals (60)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| animals-1 | قط | قِطّ | animals | 1 | STANDARD_MSA | KEEP | Core; prefer also teaching قطة; shadda without final vowel |
| animals-2 | كلب | كَلْب | animals | 1 | STANDARD_MSA | KEEP | |
| animals-3 | أسد | أَسَد | animals | 2 | STANDARD_MSA | KEEP | |
| animals-4 | فيل | فِيل | animals | 2 | STANDARD_MSA | KEEP | |
| animals-5 | حصان | حِصَان | animals | 2 | STANDARD_MSA | KEEP | |
| animals-6 | بقرة | بَقَرَة | animals | 1 | STANDARD_MSA | KEEP | |
| animals-7 | خروف | خَرُوف | animals | 2 | STANDARD_MSA | KEEP | |
| animals-8 | ماعز | مَاعِز | animals | 2 | STANDARD_MSA | KEEP | |
| animals-9 | جمل | جَمَل | animals | 2 | STANDARD_MSA | KEEP | |
| animals-10 | أرنب | أَرْنَب | animals | 1 | STANDARD_MSA | KEEP | |
| animals-11 | فأر | فَأْر | animals | 2 | STANDARD_MSA | KEEP | |
| animals-12 | دب | دُبّ | animals | 2 | STANDARD_MSA | KEEP | |
| animals-13 | ذئب | ذِئْب | animals | 2 | STANDARD_MSA | KEEP | |
| animals-14 | ثعلب | ثَعْلَب | animals | 2 | STANDARD_MSA | KEEP | |
| animals-15 | نمر | نَمِر | animals | 2 | STANDARD_MSA | KEEP | |
| animals-16 | فهد | فَهْد | animals | 3 | STANDARD_MSA | KEEP | Cheetah vs leopard emoji 🐆 |
| animals-17 | قرد | قِرْد | animals | 2 | STANDARD_MSA | KEEP | |
| animals-18 | غوريلا | غُورِيلَا | animals | 3 | LOANWORD_ACCEPTED | KEEP_ADVANCED | Loanword |
| animals-19 | زرافة | زَرَافَة | animals | 2 | STANDARD_MSA | KEEP | |
| animals-20 | حمار وحشي | حِمَار وَحْشِيّ | animals | 3 | STANDARD_MSA | KEEP | Two-word; missing tanween on حمار |
| animals-21 | وحيد القرن | وَحِيدُ القَرْن | animals | 3 | STANDARD_MSA | KEEP_ADVANCED | Compound; unicorn confusion risk |
| animals-22 | فرس النهر | فَرَسُ النَّهْر | animals | 3 | STANDARD_MSA | KEEP | |
| animals-23 | غزال | غَزَال | animals | 2 | STANDARD_MSA | KEEP | Emoji is deer |
| animals-24 | خنزير | خِنْزِير | animals | 3 | STANDARD_MSA | KEEP_ADVANCED | Cultural sensitivity |
| animals-25 | أفعى | أَفْعَى | animals | 3 | STANDARD_MSA | KEEP_ADVANCED | Near-duplicate of ثعبان |
| animals-26 | ثعبان | ثُعْبَان | animals | 2 | STANDARD_MSA | KEEP | Better generic snake |
| animals-27 | سلحفاة | سُلَحْفَاة | animals | 2 | STANDARD_MSA | KEEP | |
| animals-28 | تمساح | تِمْسَاح | animals | 2 | STANDARD_MSA | KEEP | |
| animals-29 | ضفدع | ضِفْدَع | animals | 2 | STANDARD_MSA | KEEP | |
| animals-30 | سحلية | سَحْلِيَة | animals | 3 | STANDARD_MSA | KEEP | |
| animals-31 | سنجاب | سِنْجَاب | animals | 2 | STANDARD_MSA | KEEP | |
| animals-32 | قنفذ | قُنْفُذ | animals | 3 | STANDARD_MSA | KEEP | |
| animals-33 | قندس | قُنْدُس | animals | 3 | STANDARD_MSA | KEEP_ADVANCED | Low local frequency; later “sea beaver” error |
| animals-34 | خفاش | خُفَّاش | animals | 3 | STANDARD_MSA | KEEP | |
| animals-35 | كنغر | كَنْغَر | animals | 3 | LOANWORD_ACCEPTED | KEEP_ADVANCED | Loan |
| animals-36 | كوالا | كُوَالَا | animals | 4 | LOANWORD_ACCEPTED | KEEP_ADVANCED | Exotic; not beginner-useful |
| animals-37 | بندا | بَنْدَا | animals | 3 | STANDARD_MSA | KEEP | |
| animals-38 | لاما | لَامَا | animals | 4 | LOANWORD_ACCEPTED | KEEP_ADVANCED | Exotic |
| animals-39 | حمار | حِمَار | animals | 2 | STANDARD_MSA | KEEP | |
| animals-40 | ثور | ثَوْر | animals | 3 | STANDARD_MSA | KEEP | Cattle cluster |
| animals-41 | عجل | عِجْل | animals | 3 | STANDARD_MSA | KEEP | Same emoji as cow |
| animals-42 | جرو | جَرْو | animals | 2 | STANDARD_MSA | KEEP | |
| animals-43 | هرة | هِرَّة | animals | 2 | ACCEPTABLE_MSA | KEEP | Literary female cat; redundant with قط |
| animals-44 | وعل | وَعْل | animals | 3 | STANDARD_MSA | KEEP_ADVANCED | Ibex; goat emoji; near ماعز |
| animals-45 | ظبي | ظَبْي | animals | 3 | STANDARD_MSA | KEEP_ADVANCED | Near غزال; deer emoji |
| animals-46 | جاموس | جَامُوس | animals | 3 | STANDARD_MSA | KEEP | |
| animals-47 | بغل | بَغْل | animals | 4 | STANDARD_MSA | KEEP_ADVANCED | Low usefulness |
| animals-48 | مهر | مُهْر | animals | 3 | STANDARD_MSA | KEEP | Foal |
| animals-49 | حمل | حَمَل | animals | 3 | STANDARD_MSA | KEEP | Also past verb “he carried” |
| animals-50 | جدي | جَدْي | animals | 3 | STANDARD_MSA | KEEP | |
| animals-51 | كبش | كَبْش | animals | 3 | STANDARD_MSA | KEEP | |
| animals-52 | شبل | شِبْل | animals | 3 | STANDARD_MSA | KEEP | |
| animals-53 | ضبع | ضَبُع | animals | 3 | STANDARD_MSA | KEEP | Wolf emoji |
| animals-54 | ورل | وَرَل | animals | 4 | STANDARD_MSA | KEEP_ADVANCED | Specialized |
| animals-55 | يربوع | يَرْبُوع | animals | 4 | STANDARD_MSA | KEEP_ADVANCED | Specialized |
| animals-56 | دب قطبي | دُبٌّ قُطْبِيّ | animals | 3 | STANDARD_MSA | KEEP_ADVANCED | Tanween phrase |
| animals-57 | أورانغ | أُورَانْغ | animals | 4 | NONSTANDARD | REPLACE | Truncated orangutan |
| animals-58 | ظريف | ظَرِيف | animals | 4 | NONSTANDARD | REMOVE | Means witty, not hamster |
| animals-59 | هامستر | هَامْسْتَر | animals | 3 | LOANWORD_ACCEPTED | KEEP_ADVANCED | Loan; concept dup with 58 |
| animals-60 | بقر | بَقَر | animals | 3 | STANDARD_MSA | KEEP | Collective next to بقرة |

## food (60)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| food-1 | خبز | خُبْز | food | 1 | STANDARD_MSA | KEEP | |
| food-2 | أرز | أَرُزّ | food | 1 | STANDARD_MSA | HUMAN_REVIEW | Alternate أُرْز |
| food-3 | حليب | حَلِيب | food | 1 | STANDARD_MSA | KEEP | |
| food-4 | جبن | جُبْن | food | 1 | STANDARD_MSA | KEEP | |
| food-5 | زبدة | زُبْدَة | food | 2 | STANDARD_MSA | KEEP | |
| food-6 | بيض | بَيْض | food | 1 | STANDARD_MSA | KEEP | Collective |
| food-7 | لحم | لَحْم | food | 1 | STANDARD_MSA | KEEP | |
| food-8 | دجاج | دَجَاج | food | 1 | STANDARD_MSA | KEEP | Collective vs دجاجة |
| food-9 | سمك | سَمَك | food | 1 | STANDARD_MSA | KEEP | Collective vs سمكة |
| food-10 | سلطة | سَلَطَة | food | 2 | LOANWORD_ACCEPTED | KEEP | Established school MSA |
| food-11 | شوربة | شُورْبَة | food | 2 | LOANWORD_ACCEPTED | KEEP | Established; native حساء also present |
| food-12 | معكرونة | مَعْكَرُونَة | food | 2 | LOANWORD_ACCEPTED | KEEP | Arabicized pasta |
| food-13 | بيتزا | بِيتْزَا | food | 2 | LOANWORD_ACCEPTED | KEEP | Loan |
| food-14 | سندويش | سَنْدَوِيش | food | 2 | LOANWORD_ACCEPTED | KEEP | Loan |
| food-15 | فطيرة | فَطِيرَة | food | 3 | STANDARD_MSA | KEEP | |
| food-16 | كعكة | كَعْكَة | food | 2 | STANDARD_MSA | KEEP | |
| food-17 | بسكويت | بِسْكُوِيت | food | 2 | LOANWORD_ACCEPTED | HUMAN_REVIEW | Odd kasra on wāw |
| food-18 | شوكولاتة | شُوكُولَاتَة | food | 2 | LOANWORD_ACCEPTED | KEEP | |
| food-19 | عسل | عَسَل | food | 2 | STANDARD_MSA | KEEP | |
| food-20 | مربى | مُرَبَّى | food | 2 | STANDARD_MSA | KEEP | Strawberry emoji |
| food-21 | سكر | سُكَّر | food | 1 | STANDARD_MSA | KEEP | Salt emoji |
| food-22 | ملح | مِلْح | food | 1 | STANDARD_MSA | KEEP | |
| food-23 | زيت | زَيْت | food | 2 | STANDARD_MSA | KEEP | |
| food-24 | دقيق | دَقِيق | food | 3 | STANDARD_MSA | KEEP | |
| food-25 | حساء | حَسَاء | food | 3 | STANDARD_MSA | KEEP | Synonym of شوربة |
| food-26 | فول | فُول | food | 2 | STANDARD_MSA | KEEP | |
| food-27 | عدس | عَدَس | food | 2 | STANDARD_MSA | KEEP | Weak emoji |
| food-28 | حمص | حُمُّص | food | 2 | REGIONAL_STANDARD | KEEP | Wrap emoji |
| food-29 | فلافل | فَلَافِل | food | 2 | STANDARD_MSA | KEEP | |
| food-30 | شاورما | شَاوَرْمَا | food | 3 | STANDARD_MSA | KEEP | |
| food-31 | كسكس | كُسْكُس | food | 3 | REGIONAL_STANDARD | KEEP_ADVANCED | Maghreb staple |
| food-32 | منسف | مَنْسَف | food | 3 | REGIONAL_STANDARD | KEEP_ADVANCED | Regional |
| food-33 | مقلوبة | مَقْلُوبَة | food | 3 | REGIONAL_STANDARD | KEEP_ADVANCED | Regional |
| food-34 | كبة | كُبَّة | food | 3 | REGIONAL_STANDARD | KEEP_ADVANCED | Levant dish; valid MSA name |
| food-35 | سمبوسك | سَمْبُوسَك | food | 3 | REGIONAL_STANDARD | KEEP_ADVANCED | Regional loan |
| food-36 | مشوي | مَشْوِيّ | food | 3 | STANDARD_MSA | KEEP | Adjective used as a dish |
| food-37 | برغر | بُرْغُر | food | 3 | LOANWORD_ACCEPTED | KEEP | Hamburger emoji; bulgur |
| food-38 | بطاطا مقلية | بَطَاطَا مَقْلِيَّة | food | 2 | STANDARD_MSA | KEEP | Phrase |
| food-39 | ذرة | ذُرَة | food | 2 | STANDARD_MSA | KEEP | Exact duplicate of vegetables-20 |
| food-40 | فشار | فُشَار | food | 2 | ACCEPTABLE_MSA | HUMAN_REVIEW | Egyptian-origin popcorn, now widely printed |
| food-41 | مثلجات | مِثَلَّجَات | food | 2 | NONSTANDARD | REPLACE | Expected مُثَلَّجَات |
| food-42 | حلوى | حَلْوَى | food | 2 | STANDARD_MSA | KEEP | |
| food-43 | مصاصة | مَصَّاصَة | food | 2 | STANDARD_MSA | KEEP | |
| food-44 | دونت | دُونَتْ | food | 3 | LOANWORD_REVIEW | KEEP_ADVANCED | Loan |
| food-45 | كرواسان | كْرُوَاسَان | food | 3 | LOANWORD_REVIEW | REPLACE | Initial sukuun |
| food-46 | خبز محمص | خُبْزٌ مُحَمَّص | food | 3 | STANDARD_MSA | KEEP | Phrase; near خبز |
| food-47 | عصير | عَصِير | food | 1 | STANDARD_MSA | KEEP | |
| food-48 | ماء | مَاء | food | 1 | STANDARD_MSA | KEEP | |
| food-49 | شاي | شَاي | food | 2 | LOANWORD_ACCEPTED | KEEP | Fully nativized |
| food-50 | قهوة | قَهْوَة | food | 2 | STANDARD_MSA | KEEP | |
| food-51 | لبن | لَبَن | food | 2 | UNCERTAIN | HUMAN_REVIEW | Milk vs yogurt-drink by region |
| food-52 | زبادي | زَبَادِي | food | 2 | LOANWORD_ACCEPTED | KEEP | Milk emoji |
| food-53 | قشطة | قِشْطَة | food | 3 | STANDARD_MSA | KEEP | |
| food-54 | تمر | تَمْر | food | 1 | STANDARD_MSA | KEEP | Duplicate fruits-17; palm emoji |
| food-55 | مكسرات | مُكَسَّرَات | food | 3 | STANDARD_MSA | KEEP | Plural |
| food-56 | لوز | لَوْز | food | 2 | STANDARD_MSA | KEEP | Chestnut emoji |
| food-57 | جوز | جَوْز | food | 2 | STANDARD_MSA | HUMAN_REVIEW | Same emoji as almond |
| food-58 | فستق | فُسْتُق | food | 2 | STANDARD_MSA | KEEP | |
| food-59 | زيتون | زَيْتُون | food | 2 | STANDARD_MSA | KEEP | |
| food-60 | طحينة | طَحِينَة | food | 3 | STANDARD_MSA | KEEP | |

## family (40)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| family-1 | أم | أُمّ | family | 1 | STANDARD_MSA | KEEP | |
| family-2 | أب | أَب | family | 1 | STANDARD_MSA | KEEP | |
| family-3 | أخ | أَخ | family | 1 | STANDARD_MSA | KEEP | |
| family-4 | أخت | أُخْت | family | 1 | STANDARD_MSA | KEEP | |
| family-5 | جد | جَدّ | family | 1 | STANDARD_MSA | KEEP | |
| family-6 | جدة | جَدَّة | family | 1 | STANDARD_MSA | KEEP | |
| family-7 | عم | عَمّ | family | 2 | STANDARD_MSA | KEEP | |
| family-8 | عمة | عَمَّة | family | 2 | STANDARD_MSA | KEEP | |
| family-9 | خال | خَال | family | 2 | STANDARD_MSA | KEEP | |
| family-10 | خالة | خَالَة | family | 2 | STANDARD_MSA | KEEP | |
| family-11 | ابن | اِبْن | family | 2 | STANDARD_MSA | KEEP | Hamzat waṣl good; بنت/ولد still missing |
| family-12 | ابنة | اِبْنَة | family | 2 | STANDARD_MSA | KEEP | Formal vs everyday بنت |
| family-13 | طفل | طِفْل | family | 1 | STANDARD_MSA | KEEP | |
| family-14 | رضيع | رَضِيع | family | 2 | STANDARD_MSA | KEEP | |
| family-15 | والدان | وَالِدَان | family | 2 | STANDARD_MSA | KEEP | Dual |
| family-16 | عائلة | عَائِلَة | family | 1 | STANDARD_MSA | KEEP | |
| family-17 | حفيد | حَفِيد | family | 3 | STANDARD_MSA | KEEP | Child is the grandchild, not the label they use |
| family-18 | حفيدة | حَفِيدَة | family | 3 | STANDARD_MSA | KEEP | |
| family-19 | توأم | تَوْأَم | family | 2 | STANDARD_MSA | KEEP | |
| family-20 | صديق | صَدِيق | family | 1 | STANDARD_MSA | MOVE_CATEGORY | Not kin |
| family-21 | صديقة | صَدِيقَة | family | 1 | STANDARD_MSA | MOVE_CATEGORY | Not kin |
| family-22 | جار | جَار | family | 2 | STANDARD_MSA | MOVE_CATEGORY | Neighbor |
| family-23 | جارة | جَارَة | family | 2 | STANDARD_MSA | MOVE_CATEGORY | |
| family-24 | ضيف | ضَيْف | family | 2 | STANDARD_MSA | MOVE_CATEGORY | Guest |
| family-25 | زوج | زَوْج | family | 3 | STANDARD_MSA | KEEP_ADVANCED | Adult; homograph with numbers-20 |
| family-26 | زوجة | زَوْجَة | family | 3 | STANDARD_MSA | KEEP_ADVANCED | Adult |
| family-27 | أسرة | أُسْرَة | family | 2 | STANDARD_MSA | KEEP | Synonym of عائلة |
| family-28 | أبناء | أَبْنَاء | family | 3 | STANDARD_MSA | KEEP | Plural; overlap |
| family-29 | بنات | بَنَات | family | 2 | STANDARD_MSA | KEEP | Plural without singular بنت |
| family-30 | أولاد | أَوْلَاد | family | 2 | STANDARD_MSA | KEEP | Plural without singular ولد |
| family-31 | شاب | شَابّ | family | 2 | STANDARD_MSA | MOVE_CATEGORY | People |
| family-32 | فتاة | فَتَاة | family | 2 | STANDARD_MSA | MOVE_CATEGORY | People |
| family-33 | رجل | رَجُل | family | 1 | STANDARD_MSA | MOVE_CATEGORY | People |
| family-34 | امرأة | اِمْرَأَة | family | 1 | STANDARD_MSA | MOVE_CATEGORY | People |
| family-35 | عجوز | عَجُوز | family | 3 | STANDARD_MSA | KEEP_ADVANCED | Can be rude |
| family-36 | مربية | مُرَبِّيَة | family | 3 | STANDARD_MSA | KEEP | |
| family-37 | قريب | قَرِيب | family | 3 | STANDARD_MSA | KEEP | Homograph with adjective “near” |
| family-38 | نسيب | نَسِيب | family | 4 | STANDARD_MSA | KEEP_ADVANCED | In-law |
| family-39 | سلف | سَلَف | family | 4 | UNCERTAIN | HUMAN_REVIEW | In-law / ancestor; ambiguous |
| family-40 | حبيب | حَبِيب | family | 4 | STANDARD_MSA | HUMAN_REVIEW | Romantic |

## body (40)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| body-1 | رأس | رَأْس | body | 1 | STANDARD_MSA | KEEP | Brain emoji |
| body-2 | شعر | شَعْر | body | 1 | STANDARD_MSA | KEEP | Collective |
| body-3 | وجه | وَجْه | body | 1 | STANDARD_MSA | KEEP | |
| body-4 | عين | عَيْن | body | 1 | STANDARD_MSA | KEEP | |
| body-5 | أذن | أُذُن | body | 1 | STANDARD_MSA | KEEP | |
| body-6 | أنف | أَنْف | body | 1 | STANDARD_MSA | KEEP | |
| body-7 | فم | فَم | body | 1 | STANDARD_MSA | KEEP | Final mīm has no ḥaraka |
| body-8 | شفة | شَفَة | body | 2 | STANDARD_MSA | KEEP | Same emoji as mouth |
| body-9 | لسان | لِسَان | body | 2 | STANDARD_MSA | KEEP | |
| body-10 | سن | سِنّ | body | 1 | STANDARD_MSA | KEEP | |
| body-11 | خد | خَدّ | body | 2 | STANDARD_MSA | KEEP | |
| body-12 | ذقن | ذَقْن | body | 2 | STANDARD_MSA | KEEP | |
| body-13 | جبين | جَبِين | body | 3 | STANDARD_MSA | KEEP | |
| body-14 | رقبة | رَقَبَة | body | 2 | STANDARD_MSA | KEEP | Scarf emoji |
| body-15 | كتف | كَتِف | body | 2 | STANDARD_MSA | KEEP | Shares 💪 with arm/elbow |
| body-16 | ذراع | ذِرَاع | body | 2 | STANDARD_MSA | KEEP | |
| body-17 | يد | يَد | body | 1 | STANDARD_MSA | KEEP | |
| body-18 | إصبع | إِصْبَع | body | 1 | STANDARD_MSA | KEEP | |
| body-19 | ظفر | ظُفْر | body | 2 | STANDARD_MSA | KEEP | |
| body-20 | مرفق | مِرْفَق | body | 3 | STANDARD_MSA | KEEP | |
| body-21 | صدر | صَدْر | body | 2 | STANDARD_MSA | KEEP | Heart-organ emoji |
| body-22 | بطن | بَطْن | body | 1 | STANDARD_MSA | KEEP | Pregnant emoji |
| body-23 | ظهر | ظَهْر | body | 2 | STANDARD_MSA | KEEP | |
| body-24 | خصر | خَصْر | body | 3 | STANDARD_MSA | KEEP | |
| body-25 | ساق | سَاق | body | 2 | STANDARD_MSA | KEEP | |
| body-26 | ركبة | رُكْبَة | body | 2 | STANDARD_MSA | KEEP | |
| body-27 | قدم | قَدَم | body | 1 | STANDARD_MSA | KEEP | |
| body-28 | كعب | كَعْب | body | 3 | STANDARD_MSA | KEEP | Heel/ankle |
| body-29 | قلب | قَلْب | body | 1 | STANDARD_MSA | KEEP | |
| body-30 | دماغ | دِمَاغ | body | 3 | ACCEPTABLE_MSA | KEEP | vs رأس; مخ is “brain” in anatomy |
| body-31 | عظم | عَظْم | body | 2 | STANDARD_MSA | KEEP | |
| body-32 | جلد | جِلْد | body | 2 | STANDARD_MSA | KEEP | |
| body-33 | دم | دَم | body | 2 | STANDARD_MSA | KEEP | |
| body-34 | رئة | رِئَة | body | 3 | STANDARD_MSA | KEEP | Internal |
| body-35 | معدة | مَعِدَة | body | 3 | STANDARD_MSA | KEEP | Pregnant-man emoji |
| body-36 | حاجب | حَاجِب | body | 3 | STANDARD_MSA | KEEP | |
| body-37 | رموش | رُمُوش | body | 3 | STANDARD_MSA | KEEP | Plural among singulars |
| body-38 | كف | كَفّ | body | 2 | STANDARD_MSA | KEEP | |
| body-39 | قبضة | قَبْضَة | body | 2 | STANDARD_MSA | KEEP | |
| body-40 | جسم | جِسْم | body | 1 | STANDARD_MSA | KEEP | |

## colors (20)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| colors-1 | أحمر | أَحْمَر | colors | 1 | STANDARD_MSA | KEEP | Masculine only |
| colors-2 | أزرق | أَزْرَق | colors | 1 | STANDARD_MSA | KEEP | |
| colors-3 | أصفر | أَصْفَر | colors | 1 | STANDARD_MSA | KEEP | |
| colors-4 | أخضر | أَخْضَر | colors | 1 | STANDARD_MSA | KEEP | |
| colors-5 | برتقالي | بُرْتُقَالِيّ | colors | 2 | STANDARD_MSA | KEEP | |
| colors-6 | بنفسجي | بَنَفْسَجِيّ | colors | 2 | STANDARD_MSA | KEEP | |
| colors-7 | وردي | وَرْدِيّ | colors | 2 | STANDARD_MSA | KEEP | Flower emoji |
| colors-8 | بني | بُنِّيّ | colors | 2 | STANDARD_MSA | KEEP | |
| colors-9 | أسود | أَسْوَد | colors | 1 | STANDARD_MSA | KEEP | |
| colors-10 | أبيض | أَبْيَض | colors | 1 | STANDARD_MSA | KEEP | |
| colors-11 | رمادي | رَمَادِيّ | colors | 2 | STANDARD_MSA | KEEP | |
| colors-12 | ذهبي | ذَهَبِيّ | colors | 3 | STANDARD_MSA | KEEP | Medal emoji |
| colors-13 | فضي | فِضِّيّ | colors | 3 | STANDARD_MSA | KEEP | Medal emoji |
| colors-14 | سماوي | سَمَاوِيّ | colors | 3 | STANDARD_MSA | KEEP | Extra blue |
| colors-15 | فاتح | فَاتِح | colors | 3 | STANDARD_MSA | KEEP | Modifier, not a hue |
| colors-16 | غامق | غَامِق | colors | 3 | STANDARD_MSA | KEEP | Modifier |
| colors-17 | فيروزي | فَيْرُوزِيّ | colors | 3 | STANDARD_MSA | KEEP | |
| colors-18 | بيج | بَيْج | colors | 3 | LOANWORD_ACCEPTED | KEEP | Loan; brown-square emoji |
| colors-19 | نيلي | نِيلِيّ | colors | 4 | STANDARD_MSA | KEEP_ADVANCED | Rare split of blue |
| colors-20 | ملون | مُلَوَّن | colors | 2 | STANDARD_MSA | KEEP | Not a color name |

## numbers (20)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| numbers-1 | واحد | وَاحِد | numbers | 1 | STANDARD_MSA | KEEP | |
| numbers-2 | اثنان | اِثْنَان | numbers | 1 | STANDARD_MSA | KEEP | |
| numbers-3 | ثلاثة | ثَلَاثَة | numbers | 1 | STANDARD_MSA | KEEP | Feminine 3–10 form (correct MSA) |
| numbers-4 | أربعة | أَرْبَعَة | numbers | 1 | STANDARD_MSA | KEEP | |
| numbers-5 | خمسة | خَمْسَة | numbers | 1 | STANDARD_MSA | KEEP | |
| numbers-6 | ستة | سِتَّة | numbers | 1 | STANDARD_MSA | KEEP | |
| numbers-7 | سبعة | سَبْعَة | numbers | 1 | STANDARD_MSA | KEEP | |
| numbers-8 | ثمانية | ثَمَانِيَة | numbers | 1 | STANDARD_MSA | KEEP | |
| numbers-9 | تسعة | تِسْعَة | numbers | 1 | STANDARD_MSA | KEEP | |
| numbers-10 | عشرة | عَشَرَة | numbers | 1 | STANDARD_MSA | KEEP | |
| numbers-11 | صفر | صِفْر | numbers | 1 | STANDARD_MSA | KEEP | |
| numbers-12 | أحد عشر | أَحَدَ عَشَر | numbers | 2 | STANDARD_MSA | KEEP | |
| numbers-13 | اثنا عشر | اِثْنَا عَشَر | numbers | 2 | STANDARD_MSA | KEEP | Nominative citation form |
| numbers-14 | عشرون | عِشْرُون | numbers | 2 | STANDARD_MSA | KEEP | Missing 40/60/70/80/90 |
| numbers-15 | ثلاثون | ثَلَاثُون | numbers | 2 | STANDARD_MSA | KEEP | |
| numbers-16 | خمسون | خَمْسُون | numbers | 2 | STANDARD_MSA | KEEP | |
| numbers-17 | مئة | مِئَة | numbers | 2 | STANDARD_MSA | KEEP | |
| numbers-18 | ألف | أَلْف | numbers | 2 | STANDARD_MSA | KEEP | |
| numbers-19 | نصف | نِصْف | numbers | 2 | STANDARD_MSA | MOVE_CATEGORY | Quantity, not a numeral |
| numbers-20 | زوج | زَوْج | numbers | 4 | STANDARD_MSA | REPLACE | Husband homograph; plus emoji; not a count word |

## home (50)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| home-1 | بيت | بَيْت | home | 1 | STANDARD_MSA | KEEP | |
| home-2 | باب | بَاب | home | 1 | STANDARD_MSA | KEEP | |
| home-3 | نافذة | نَافِذَة | home | 1 | STANDARD_MSA | KEEP | |
| home-4 | غرفة | غُرْفَة | home | 1 | STANDARD_MSA | KEEP | |
| home-5 | سرير | سَرِير | home | 1 | STANDARD_MSA | KEEP | |
| home-6 | وسادة | وِسَادَة | home | 2 | STANDARD_MSA | KEEP | Same emoji as bed |
| home-7 | بطانية | بَطَّانِيَة | home | 2 | STANDARD_MSA | KEEP | Scarf emoji |
| home-8 | كرسي | كُرْسِيّ | home | 1 | STANDARD_MSA | KEEP | |
| home-9 | طاولة | طَاوِلَة | home | 1 | LOANWORD_ACCEPTED | KEEP | Chair emoji |
| home-10 | خزانة | خِزَانَة | home | 2 | STANDARD_MSA | KEEP | Door emoji |
| home-11 | مرآة | مِرْآة | home | 2 | STANDARD_MSA | KEEP | |
| home-12 | سجادة | سَجَّادَة | home | 2 | STANDARD_MSA | KEEP | Yarn emoji |
| home-13 | مصباح | مِصْبَاح | home | 2 | STANDARD_MSA | KEEP | |
| home-14 | ساعة | سَاعَة | home | 1 | STANDARD_MSA | KEEP | Clock; also “hour” |
| home-15 | تلفاز | تِلْفَاز | home | 2 | LOANWORD_ACCEPTED | KEEP | Preferred MSA form |
| home-16 | ثلاجة | ثَلَّاجَة | home | 2 | STANDARD_MSA | KEEP | Ice emoji |
| home-17 | فرن | فُرْن | home | 2 | STANDARD_MSA | KEEP | Fire emoji |
| home-18 | مكواة | مِكْوَاة | home | 3 | STANDARD_MSA | KEEP | Shirt emoji |
| home-19 | مكنسة | مِكْنَسَة | home | 2 | STANDARD_MSA | KEEP | |
| home-20 | مطبخ | مَطْبَخ | home | 1 | STANDARD_MSA | KEEP | |
| home-21 | حمام | حَمَّام | home | 1 | STANDARD_MSA | KEEP | |
| home-22 | صابون | صَابُون | home | 1 | STANDARD_MSA | KEEP | |
| home-23 | منشفة | مِنْشَفَة | home | 2 | STANDARD_MSA | KEEP | Toilet-paper emoji |
| home-24 | فرشاة | فُرْشَاة | home | 2 | STANDARD_MSA | KEEP | Ambiguous brush vs toothbrush |
| home-25 | معجون | مَعْجُون | home | 2 | STANDARD_MSA | REPLACE | Too generic; intend toothpaste |
| home-26 | مشط | مُشْط | home | 2 | STANDARD_MSA | KEEP | |
| home-27 | كوب | كُوب | home | 1 | STANDARD_MSA | KEEP | |
| home-28 | صحن | صَحْن | home | 1 | STANDARD_MSA | KEEP | |
| home-29 | ملعقة | مِلْعَقَة | home | 1 | STANDARD_MSA | KEEP | |
| home-30 | شوكة | شَوْكَة | home | 2 | STANDARD_MSA | KEEP | Also “thorn” |
| home-31 | سكين | سِكِّين | home | 2 | STANDARD_MSA | KEEP | |
| home-32 | قدر | قِدْر | home | 3 | STANDARD_MSA | KEEP | |
| home-33 | مقلاة | مِقْلَاة | home | 3 | STANDARD_MSA | KEEP | |
| home-34 | إبريق | إِبْرِيق | home | 2 | STANDARD_MSA | KEEP | |
| home-35 | سلة | سَلَّة | home | 2 | STANDARD_MSA | KEEP | |
| home-36 | درج | دَرَج | home | 2 | STANDARD_MSA | KEEP | Stairs vs ladder emoji |
| home-37 | سقف | سَقْف | home | 2 | STANDARD_MSA | KEEP | |
| home-38 | جدار | جِدَار | home | 2 | STANDARD_MSA | KEEP | |
| home-39 | أرضية | أَرْضِيَّة | home | 3 | STANDARD_MSA | KEEP | |
| home-40 | حديقة | حَدِيقَة | home | 2 | STANDARD_MSA | KEEP | Could be nature/places |
| home-41 | مفتاح | مِفْتَاح | home | 1 | STANDARD_MSA | KEEP | |
| home-42 | قفل | قُفْل | home | 2 | STANDARD_MSA | KEEP | |
| home-43 | جرس | جَرَس | home | 2 | STANDARD_MSA | KEEP | |
| home-44 | ستارة | سِتَارَة | home | 2 | STANDARD_MSA | KEEP | |
| home-45 | أريكة | أَرِيكَة | home | 2 | STANDARD_MSA | KEEP | |
| home-46 | رف | رَفّ | home | 2 | STANDARD_MSA | KEEP | Books emoji |
| home-47 | صندوق | صُنْدُوق | home | 2 | STANDARD_MSA | KEEP | |
| home-48 | مروحة | مِرْوَحَة | home | 2 | STANDARD_MSA | KEEP | |
| home-49 | هاتف | هَاتِف | home | 1 | STANDARD_MSA | KEEP | |
| home-50 | مظلة | مِظَلَّة | home | 2 | STANDARD_MSA | KEEP | Outdoors/weather |

## school (40)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| school-1 | مدرسة | مَدْرَسَة | school | 1 | STANDARD_MSA | KEEP | |
| school-2 | معلم | مُعَلِّم | school | 1 | STANDARD_MSA | KEEP | Duplicate jobs-4 |
| school-3 | معلمة | مُعَلِّمَة | school | 1 | STANDARD_MSA | KEEP | |
| school-4 | تلميذ | تِلْمِيذ | school | 1 | STANDARD_MSA | KEEP | No تلميذة |
| school-5 | فصل | فَصْل | school | 1 | STANDARD_MSA | KEEP | Also “season/chapter” |
| school-6 | كتاب | كِتَاب | school | 1 | STANDARD_MSA | KEEP | |
| school-7 | دفتر | دَفْتَر | school | 1 | STANDARD_MSA | KEEP | |
| school-8 | قلم | قَلَم | school | 1 | STANDARD_MSA | KEEP | |
| school-9 | ممحاة | مِمْحَاة | school | 1 | STANDARD_MSA | KEEP | Bandage emoji |
| school-10 | مسطرة | مِسْطَرَة | school | 2 | STANDARD_MSA | KEEP | |
| school-11 | حقيبة | حَقِيبَة | school | 1 | STANDARD_MSA | KEEP | |
| school-12 | سبورة | سَبُّورَة | school | 1 | STANDARD_MSA | KEEP | Clipboard emoji |
| school-13 | طباشير | طَبَاشِير | school | 2 | STANDARD_MSA | KEEP | Crayon emoji; plural/collective |
| school-14 | ألوان | أَلْوَان | school | 2 | STANDARD_MSA | KEEP | Means “colors”; crayon sense unclear |
| school-15 | مقص | مِقَصّ | school | 2 | STANDARD_MSA | KEEP | |
| school-16 | غراء | غِرَاء | school | 2 | STANDARD_MSA | KEEP | Lotion emoji |
| school-17 | ورقة | وَرَقَة | school | 1 | STANDARD_MSA | KEEP | Homograph with leaf |
| school-18 | رسم | رَسْم | school | 2 | STANDARD_MSA | KEEP | |
| school-19 | درس | دَرْس | school | 1 | STANDARD_MSA | KEEP | |
| school-20 | واجب | وَاجِب | school | 2 | STANDARD_MSA | KEEP | |
| school-21 | امتحان | اِمْتِحَان | school | 3 | STANDARD_MSA | KEEP_ADVANCED | Heavy for preschool |
| school-22 | سؤال | سُؤَال | school | 2 | STANDARD_MSA | KEEP | |
| school-23 | جواب | جَوَاب | school | 2 | STANDARD_MSA | KEEP | |
| school-24 | حرف | حَرْف | school | 1 | STANDARD_MSA | KEEP | |
| school-25 | كلمة | كَلِمَة | school | 1 | STANDARD_MSA | KEEP | |
| school-26 | جملة | جُمْلَة | school | 2 | STANDARD_MSA | KEEP | |
| school-27 | قصة | قِصَّة | school | 1 | STANDARD_MSA | KEEP | |
| school-28 | قراءة | قِرَاءَة | school | 2 | STANDARD_MSA | KEEP | Maṣdar |
| school-29 | كتابة | كِتَابَة | school | 2 | STANDARD_MSA | KEEP | Maṣdar |
| school-30 | حساب | حِسَاب | school | 2 | STANDARD_MSA | KEEP | |
| school-31 | علم | عِلْم | school | 3 | STANDARD_MSA | KEEP_ADVANCED | Abstract |
| school-32 | مكتبة | مَكْتَبَة | school | 2 | STANDARD_MSA | KEEP | |
| school-33 | مكتب | مَكْتَب | school | 2 | STANDARD_MSA | KEEP | Desk/office |
| school-34 | جرس المدرسة | جَرَسُ المَدْرَسَة | school | 3 | STANDARD_MSA | KEEP | Long; near جرس |
| school-35 | فسحة | فُسْحَة | school | 2 | STANDARD_MSA | KEEP | Clock emoji |
| school-36 | ملعب | مَلْعَب | school | 2 | STANDARD_MSA | KEEP | |
| school-37 | صديق الصف | صَدِيقُ الصَّفّ | school | 3 | STANDARD_MSA | KEEP | Phrase |
| school-38 | نجمة | نَجْمَة | school | 3 | STANDARD_MSA | KEEP | Duplicate sky-3 |
| school-39 | شهادة | شَهَادَة | school | 3 | STANDARD_MSA | KEEP | |
| school-40 | حاسوب | حَاسُوب | school | 2 | STANDARD_MSA | KEEP | |

## clothes (35)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| clothes-1 | قميص | قَمِيص | clothes | 1 | STANDARD_MSA | KEEP | |
| clothes-2 | بنطال | بَنْطَال | clothes | 1 | LOANWORD_ACCEPTED | KEEP | Contemporary MSA; also سِرْوَال |
| clothes-3 | فستان | فُسْتَان | clothes | 2 | LOANWORD_ACCEPTED | KEEP | |
| clothes-4 | تنورة | تَنُّورَة | clothes | 2 | LOANWORD_ACCEPTED | KEEP | Same dress emoji |
| clothes-5 | معطف | مِعْطَف | clothes | 2 | STANDARD_MSA | KEEP | |
| clothes-6 | سترة | سُتْرَة | clothes | 2 | STANDARD_MSA | KEEP | Near معطف |
| clothes-7 | كنزة | كَنْزَة | clothes | 2 | ACCEPTABLE_MSA | HUMAN_REVIEW | Yarn emoji |
| clothes-8 | جورب | جَوْرَب | clothes | 1 | STANDARD_MSA | KEEP | |
| clothes-9 | حذاء | حِذَاء | clothes | 1 | STANDARD_MSA | KEEP | |
| clothes-10 | صندل | صَنْدَل | clothes | 2 | STANDARD_MSA | KEEP | |
| clothes-11 | حزام | حِزَام | clothes | 2 | STANDARD_MSA | KEEP | Ribbon emoji |
| clothes-12 | قبعة | قُبَّعَة | clothes | 2 | STANDARD_MSA | KEEP | |
| clothes-13 | وشاح | وِشَاح | clothes | 2 | STANDARD_MSA | KEEP | |
| clothes-14 | قفاز | قُفَّاز | clothes | 2 | STANDARD_MSA | KEEP | |
| clothes-15 | نظارة | نَظَّارَة | clothes | 2 | STANDARD_MSA | KEEP | |
| clothes-16 | ساعة يد | سَاعَةُ يَد | clothes | 2 | STANDARD_MSA | KEEP | Near home ساعة |
| clothes-17 | حقيبة يد | حَقِيبَةُ يَد | clothes | 3 | STANDARD_MSA | MOVE_CATEGORY | Accessory |
| clothes-18 | محفظة | مِحْفَظَة | clothes | 3 | STANDARD_MSA | MOVE_CATEGORY | Accessory |
| clothes-19 | زر | زِرّ | clothes | 2 | STANDARD_MSA | KEEP | |
| clothes-20 | جيب | جَيْب | clothes | 3 | STANDARD_MSA | KEEP | Malformed spaces in source tuple |
| clothes-21 | منديل | مِنْدِيل | clothes | 2 | STANDARD_MSA | KEEP | Toilet-paper emoji |
| clothes-22 | مريلة | مِرْيَلَة | clothes | 3 | LOANWORD_ACCEPTED | KEEP | |
| clothes-23 | بيجامة | بِيجَامَة | clothes | 2 | LOANWORD_ACCEPTED | KEEP | Loan |
| clothes-24 | شورت | شُورْت | clothes | 2 | LOANWORD_REVIEW | KEEP | Loan |
| clothes-25 | ثوب | ثَوْب | clothes | 2 | STANDARD_MSA | KEEP | Sari emoji for Arab thawb |
| clothes-26 | عباءة | عَبَاءَة | clothes | 2 | STANDARD_MSA | KEEP | |
| clothes-27 | حجاب | حِجَاب | clothes | 2 | STANDARD_MSA | KEEP | |
| clothes-28 | كوفية | كُوفِيَّة | clothes | 3 | REGIONAL_STANDARD | KEEP_ADVANCED | Levant/Gulf headdress; valid MSA |
| clothes-29 | قميص داخلي | قَمِيصٌ دَاخِلِيّ | clothes | 3 | STANDARD_MSA | KEEP | Tanween phrase |
| clothes-30 | ملابس رياضة | مَلَابِسُ رِيَاضَة | clothes | 3 | STANDARD_MSA | KEEP | Plural construct |
| clothes-31 | معطف مطر | مِعْطَفُ مَطَر | clothes | 3 | STANDARD_MSA | KEEP | Near معطف |
| clothes-32 | حذاء مطر | حِذَاءُ مَطَر | clothes | 3 | STANDARD_MSA | KEEP | |
| clothes-33 | خاتم | خَاتَم | clothes | 3 | STANDARD_MSA | MOVE_CATEGORY | Jewelry |
| clothes-34 | سوار | سِوَار | clothes | 3 | STANDARD_MSA | MOVE_CATEGORY | Jewelry; beads emoji |
| clothes-35 | قلادة | قِلَادَة | clothes | 3 | STANDARD_MSA | MOVE_CATEGORY | Jewelry |

## nature (45)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| nature-1 | شجرة | شَجَرَة | nature | 1 | STANDARD_MSA | KEEP | |
| nature-2 | زهرة | زَهْرَة | nature | 1 | STANDARD_MSA | KEEP | |
| nature-3 | وردة | وَرْدَة | nature | 2 | STANDARD_MSA | KEEP | |
| nature-4 | ورقة | وَرَقَة | nature | 1 | STANDARD_MSA | KEEP | Homograph with paper |
| nature-5 | عشب | عُشْب | nature | 2 | STANDARD_MSA | KEEP | |
| nature-6 | غصن | غُصْن | nature | 2 | STANDARD_MSA | KEEP | |
| nature-7 | جذر | جَذْر | nature | 3 | STANDARD_MSA | KEEP | |
| nature-8 | بذرة | بَذْرَة | nature | 2 | STANDARD_MSA | KEEP | |
| nature-9 | نبات صغير | نَبَاتٌ صَغِير | nature | 3 | STANDARD_MSA | REPLACE | Definition, not a lexeme |
| nature-10 | غابة | غَابَة | nature | 2 | STANDARD_MSA | KEEP | |
| nature-11 | جبل | جَبَل | nature | 1 | STANDARD_MSA | KEEP | |
| nature-12 | تل | تَلّ | nature | 2 | STANDARD_MSA | KEEP | |
| nature-13 | واد | وَادٍ | nature | 2 | STANDARD_MSA | KEEP | Defective + tanween |
| nature-14 | صحراء | صَحْرَاء | nature | 2 | STANDARD_MSA | KEEP | |
| nature-15 | رمل | رَمْل | nature | 1 | STANDARD_MSA | KEEP | |
| nature-16 | حجر | حَجَر | nature | 1 | STANDARD_MSA | KEEP | |
| nature-17 | تراب | تُرَاب | nature | 2 | STANDARD_MSA | KEEP | |
| nature-18 | نهر | نَهْر | nature | 2 | STANDARD_MSA | KEEP | |
| nature-19 | بحيرة | بُحَيْرَة | nature | 2 | STANDARD_MSA | KEEP | |
| nature-20 | شلال | شَلَّال | nature | 2 | STANDARD_MSA | KEEP | Weak emoji |
| nature-21 | عين ماء | عَيْن مَاء | nature | 3 | STANDARD_MSA | HUMAN_REVIEW | Missing iḍāfa vowel |
| nature-22 | مطر | مَطَر | nature | 1 | STANDARD_MSA | KEEP | |
| nature-23 | ثلج | ثَلْج | nature | 2 | STANDARD_MSA | KEEP | |
| nature-24 | برد | بَرَد | nature | 3 | STANDARD_MSA | KEEP | Also “cold” |
| nature-25 | ريح | رِيح | nature | 1 | STANDARD_MSA | KEEP | |
| nature-26 | عاصفة | عَاصِفَة | nature | 2 | STANDARD_MSA | KEEP | |
| nature-27 | سحاب | سَحَاب | nature | 1 | STANDARD_MSA | KEEP | Collective |
| nature-28 | ضباب | ضَبَاب | nature | 2 | STANDARD_MSA | KEEP | |
| nature-29 | قوس قزح | قَوْسُ قُزَح | nature | 2 | STANDARD_MSA | KEEP | |
| nature-30 | برق | بَرْق | nature | 2 | STANDARD_MSA | KEEP | |
| nature-31 | رعد | رَعْد | nature | 2 | STANDARD_MSA | KEEP | |
| nature-32 | نار | نَار | nature | 1 | STANDARD_MSA | KEEP | |
| nature-33 | دخان | دُخَان | nature | 2 | STANDARD_MSA | KEEP | |
| nature-34 | جليد | جَلِيد | nature | 3 | STANDARD_MSA | KEEP | Near ثلج |
| nature-35 | طين | طِين | nature | 2 | STANDARD_MSA | KEEP | |
| nature-36 | كهف | كَهْف | nature | 3 | STANDARD_MSA | KEEP | Hole emoji |
| nature-37 | جزيرة | جَزِيرَة | nature | 2 | STANDARD_MSA | KEEP | |
| nature-38 | شاطئ | شَاطِئ | nature | 2 | STANDARD_MSA | KEEP | |
| nature-39 | بستان | بُسْتَان | nature | 2 | STANDARD_MSA | KEEP | Near حديقة |
| nature-40 | مزرعة | مَزْرَعَة | nature | 2 | STANDARD_MSA | KEEP | |
| nature-41 | حقل | حَقْل | nature | 3 | STANDARD_MSA | KEEP | |
| nature-42 | قمح | قَمْح | nature | 3 | STANDARD_MSA | KEEP | Crop |
| nature-43 | نخلة | نَخْلَة | nature | 2 | STANDARD_MSA | KEEP | |
| nature-44 | صبار | صَبَّار | nature | 2 | STANDARD_MSA | KEEP | |
| nature-45 | فطر | فِطْر | nature | 3 | NONSTANDARD | REPLACE | Expected فُطْر for mushroom |

## transport (35)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| transport-1 | سيارة | سَيَّارَة | transport | 1 | STANDARD_MSA | KEEP | |
| transport-2 | حافلة | حَافِلَة | transport | 1 | STANDARD_MSA | KEEP | |
| transport-3 | دراجة | دَرَّاجَة | transport | 1 | STANDARD_MSA | KEEP | |
| transport-4 | دراجة نارية | دَرَّاجَةٌ نَارِيَّة | transport | 2 | STANDARD_MSA | KEEP | Tanween phrase |
| transport-5 | قطار | قِطَار | transport | 1 | STANDARD_MSA | KEEP | |
| transport-6 | طائرة | طَائِرَة | transport | 1 | STANDARD_MSA | KEEP | |
| transport-7 | سفينة | سَفِينَة | transport | 2 | STANDARD_MSA | KEEP | |
| transport-8 | قارب | قَارِب | transport | 2 | STANDARD_MSA | KEEP | |
| transport-9 | شاحنة | شَاحِنَة | transport | 2 | STANDARD_MSA | KEEP | |
| transport-10 | سيارة إسعاف | سَيَّارَةُ إِسْعَاف | transport | 2 | STANDARD_MSA | KEEP | |
| transport-11 | سيارة إطفاء | سَيَّارَةُ إِطْفَاء | transport | 2 | STANDARD_MSA | KEEP | |
| transport-12 | سيارة شرطة | سَيَّارَةُ شُرْطَة | transport | 2 | STANDARD_MSA | KEEP | |
| transport-13 | جرار | جَرَّار | transport | 3 | STANDARD_MSA | KEEP | |
| transport-14 | مروحية | مِرْوَحِيَّة | transport | 3 | STANDARD_MSA | KEEP | |
| transport-15 | صاروخ | صَارُوخ | transport | 3 | STANDARD_MSA | KEEP | |
| transport-16 | غواصة | غَوَّاصَة | transport | 3 | STANDARD_MSA | KEEP | Motorboat emoji |
| transport-17 | مترو | مِتْرُو | transport | 3 | LOANWORD_ACCEPTED | KEEP | |
| transport-18 | تاكسي | تَاكْسِي | transport | 2 | LOANWORD_ACCEPTED | KEEP | |
| transport-19 | عربة | عَرَبَة | transport | 3 | STANDARD_MSA | KEEP | Shopping-cart emoji |
| transport-20 | مزلجة | مِزْلَجَة | transport | 3 | STANDARD_MSA | KEEP | |
| transport-21 | لوح تزلق | لَوْحُ تَزَلُّج | transport | 3 | STANDARD_MSA | KEEP | Skateboard vs ski/snowboard |
| transport-22 | منطاد | مِنْطَاد | transport | 3 | STANDARD_MSA | KEEP | Party-balloon emoji |
| transport-23 | عجلة | عَجَلَة | transport | 2 | STANDARD_MSA | KEEP | Also “haste” |
| transport-24 | مقود | مِقْوَد | transport | 3 | STANDARD_MSA | KEEP | Ferris-wheel emoji |
| transport-25 | طريق | طَرِيق | transport | 2 | STANDARD_MSA | KEEP | |
| transport-26 | جسر | جِسْر | transport | 2 | STANDARD_MSA | KEEP | |
| transport-27 | نفق | نَفَق | transport | 3 | STANDARD_MSA | KEEP | Same emoji as metro |
| transport-28 | محطة | مَحَطَّة | transport | 2 | STANDARD_MSA | KEEP | |
| transport-29 | مطار | مَطَار | transport | 2 | STANDARD_MSA | KEEP | |
| transport-30 | ميناء | مِينَاء | transport | 3 | STANDARD_MSA | KEEP | |
| transport-31 | إشارة مرور | إِشَارَةُ مُرُور | transport | 2 | STANDARD_MSA | KEEP | |
| transport-32 | موقف | مَوْقِف | transport | 3 | STANDARD_MSA | KEEP | |
| transport-33 | وقود | وَقُود | transport | 3 | STANDARD_MSA | KEEP | |
| transport-34 | خوذة | خُوذَة | transport | 2 | STANDARD_MSA | KEEP | Military helmet; could be clothes |
| transport-35 | حزام أمان | حِزَامُ أَمَان | transport | 2 | STANDARD_MSA | KEEP | Link emoji |

## jobs (35)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| jobs-1 | طبيب | طَبِيب | jobs | 1 | STANDARD_MSA | KEEP | |
| jobs-2 | طبيبة | طَبِيبَة | jobs | 1 | STANDARD_MSA | KEEP | |
| jobs-3 | ممرض | مُمَرِّض | jobs | 2 | STANDARD_MSA | KEEP | No ممرضة |
| jobs-4 | معلم | مُعَلِّم | jobs | 1 | STANDARD_MSA | KEEP | Duplicate school-2; no معلمة here |
| jobs-5 | مهندس | مُهَنْدِس | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-6 | شرطي | شُرْطِيّ | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-7 | إطفائي | إِطْفَائِيّ | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-8 | طيار | طَيَّار | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-9 | بحار | بَحَّار | jobs | 3 | STANDARD_MSA | KEEP | Anchor emoji |
| jobs-10 | سائق | سَائِق | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-11 | فلاح | فَلَّاح | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-12 | خباز | خَبَّاز | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-13 | طباخ | طَبَّاخ | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-14 | جزار | جَزَّار | jobs | 3 | STANDARD_MSA | KEEP | |
| jobs-15 | بقال | بَقَّال | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-16 | نجار | نَجَّار | jobs | 3 | STANDARD_MSA | KEEP | |
| jobs-17 | حداد | حَدَّاد | jobs | 3 | STANDARD_MSA | KEEP | |
| jobs-18 | بناء | بَنَّاء | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-19 | سباك | سَبَّاك | jobs | 3 | STANDARD_MSA | KEEP | |
| jobs-20 | كهربائي | كَهْرَبَائِيّ | jobs | 3 | STANDARD_MSA | KEEP | Long nisba |
| jobs-21 | خياط | خَيَّاط | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-22 | حلاق | حَلَّاق | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-23 | رسام | رَسَّام | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-24 | موسيقي | مُوسِيقِيّ | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-25 | كاتب | كَاتِب | jobs | 3 | STANDARD_MSA | KEEP | |
| jobs-26 | صحفي | صَحَفِيّ | jobs | 3 | STANDARD_MSA | KEEP | |
| jobs-27 | عالم | عَالِم | jobs | 3 | STANDARD_MSA | KEEP | |
| jobs-28 | صيدلي | صَيْدَلِيّ | jobs | 3 | STANDARD_MSA | KEEP | |
| jobs-29 | طبيب أسنان | طَبِيبُ أَسْنَان | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-30 | محام | مُحَامٍ | jobs | 4 | STANDARD_MSA | KEEP_ADVANCED | Adult; defective noun |
| jobs-31 | قاض | قَاضٍ | jobs | 4 | STANDARD_MSA | KEEP_ADVANCED | Adult; defective noun |
| jobs-32 | ساعي البريد | سَاعِي البَرِيد | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-33 | حارس | حَارِس | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-34 | رياضي | رِيَاضِيّ | jobs | 2 | STANDARD_MSA | KEEP | |
| jobs-35 | رائد فضاء | رَائِدُ فَضَاء | jobs | 3 | STANDARD_MSA | KEEP | |

## fruits (35)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fruits-1 | تفاح | تُفَّاح | fruits | 1 | STANDARD_MSA | KEEP | |
| fruits-2 | موز | مَوْز | fruits | 1 | STANDARD_MSA | KEEP | |
| fruits-3 | برتقال | بُرْتُقَال | fruits | 1 | STANDARD_MSA | KEEP | |
| fruits-4 | عنب | عِنَب | fruits | 1 | STANDARD_MSA | KEEP | |
| fruits-5 | فراولة | فَرَاوِلَة | fruits | 1 | LOANWORD_ACCEPTED | KEEP | Common loan |
| fruits-6 | بطيخ | بِطِّيخ | fruits | 1 | STANDARD_MSA | KEEP | |
| fruits-7 | شمام | شَمَّام | fruits | 2 | STANDARD_MSA | KEEP | |
| fruits-8 | أناناس | أَنَانَاس | fruits | 2 | LOANWORD_ACCEPTED | KEEP | |
| fruits-9 | مانجو | مَانْجُو | fruits | 2 | LOANWORD_ACCEPTED | KEEP | |
| fruits-10 | كيوي | كِيوِي | fruits | 3 | LOANWORD_ACCEPTED | KEEP_ADVANCED | Loan |
| fruits-11 | خوخ | خَوْخ | fruits | 2 | STANDARD_MSA | KEEP | Peach/plum by dialect |
| fruits-12 | إجاص | إِجَّاص | fruits | 2 | STANDARD_MSA | KEEP | vs كمثرى |
| fruits-13 | كرز | كَرَز | fruits | 2 | STANDARD_MSA | KEEP | |
| fruits-14 | ليمون | لَيْمُون | fruits | 2 | STANDARD_MSA | KEEP | |
| fruits-15 | تين | تِين | fruits | 2 | STANDARD_MSA | KEEP | Olive emoji |
| fruits-16 | رمان | رُمَّان | fruits | 2 | STANDARD_MSA | KEEP | Apple emoji |
| fruits-17 | تمر | تَمْر | fruits | 1 | STANDARD_MSA | KEEP | Duplicate food-54 |
| fruits-18 | مشمش | مِشْمِش | fruits | 2 | STANDARD_MSA | KEEP | Peach emoji shared with خوخ |
| fruits-19 | برقوق | بَرْقُوق | fruits | 3 | STANDARD_MSA | KEEP | Blueberry emoji |
| fruits-20 | توت | تُوت | fruits | 2 | STANDARD_MSA | KEEP | |
| fruits-21 | جوافة | جَوَافَة | fruits | 3 | STANDARD_MSA | KEEP | Pear emoji |
| fruits-22 | أفوكادو | أَفُوكَادُو | fruits | 3 | LOANWORD_ACCEPTED | KEEP_ADVANCED | Loan |
| fruits-23 | نارنج | نَارِنْج | fruits | 4 | STANDARD_MSA | KEEP_ADVANCED | Rare; near برتقال |
| fruits-24 | يوسفي | يُوسُفِي | fruits | 2 | REGIONAL_STANDARD | HUMAN_REVIEW | Missing nisba shadda |
| fruits-25 | جوز الهند | جَوْزُ الهِنْد | fruits | 2 | STANDARD_MSA | KEEP | |
| fruits-26 | كاكا | كَاكَا | fruits | 4 | NONSTANDARD | REMOVE | Child-speech homophone “poop”; rare persimmon |
| fruits-27 | سفرجل | سَفَرْجَل | fruits | 4 | STANDARD_MSA | KEEP_ADVANCED | Rare |
| fruits-28 | تفاح أخضر | تُفَّاحٌ أَخْضَر | fruits | 3 | STANDARD_MSA | KEEP | Color split of تفاح |
| fruits-29 | عنب أحمر | عِنَبٌ أَحْمَر | fruits | 3 | STANDARD_MSA | KEEP | Color split of عنب |
| fruits-30 | توت العليق | تُوتُ العُلَّيْق | fruits | 4 | STANDARD_MSA | KEEP_ADVANCED | Rare compound |
| fruits-31 | كرمبولا | كَرَمْبُولَا | fruits | 4 | LOANWORD_REVIEW | KEEP_ADVANCED | Exotic loan |
| fruits-32 | بابايا | بَابَايَا | fruits | 4 | LOANWORD_ACCEPTED | KEEP_ADVANCED | Exotic |
| fruits-33 | ليتشي | لِيتْشِي | fruits | 4 | LOANWORD_REVIEW | KEEP_ADVANCED | Exotic |
| fruits-34 | توت الأرض | تُوتُ الأَرْض | fruits | 3 | STANDARD_MSA | KEEP_ADVANCED | MSA strawberry; dup فراولة |
| fruits-35 | عناب | عُنَّاب | fruits | 4 | STANDARD_MSA | KEEP_ADVANCED | Rare |

## vegetables (30)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| vegetables-1 | طماطم | طَمَاطِم | vegetables | 1 | LOANWORD_ACCEPTED | KEEP | Plural/collective as headword |
| vegetables-2 | خيار | خِيَار | vegetables | 1 | STANDARD_MSA | KEEP | |
| vegetables-3 | جزر | جَزَر | vegetables | 1 | STANDARD_MSA | KEEP | |
| vegetables-4 | بطاطا | بَطَاطَا | vegetables | 1 | LOANWORD_ACCEPTED | HUMAN_REVIEW | vs بطاطس |
| vegetables-5 | بصل | بَصَل | vegetables | 1 | STANDARD_MSA | KEEP | |
| vegetables-6 | ثوم | ثُوم | vegetables | 2 | STANDARD_MSA | KEEP | |
| vegetables-7 | فلفل | فُلْفُل | vegetables | 2 | STANDARD_MSA | KEEP | Bell vs black pepper |
| vegetables-8 | باذنجان | بَاذِنْجَان | vegetables | 2 | STANDARD_MSA | KEEP | |
| vegetables-9 | كوسا | كُوسَا | vegetables | 2 | LOANWORD_ACCEPTED | KEEP | Cucumber emoji |
| vegetables-10 | ملفوف | مَلْفُوف | vegetables | 2 | STANDARD_MSA | KEEP | |
| vegetables-11 | خس | خَسّ | vegetables | 2 | STANDARD_MSA | KEEP | |
| vegetables-12 | سبانخ | سَبَانِخ | vegetables | 2 | STANDARD_MSA | KEEP | |
| vegetables-13 | بقدونس | بَقْدُونِس | vegetables | 3 | LOANWORD_ACCEPTED | MOVE_CATEGORY | Herb |
| vegetables-14 | نعناع | نَعْنَاع | vegetables | 2 | STANDARD_MSA | MOVE_CATEGORY | Herb |
| vegetables-15 | فجل | فِجْل | vegetables | 3 | STANDARD_MSA | KEEP | |
| vegetables-16 | شمندر | شَمَنْدَر | vegetables | 3 | REGIONAL_STANDARD | KEEP | Sweet-potato emoji; vs بنجر |
| vegetables-17 | لفت | لِفْت | vegetables | 3 | STANDARD_MSA | KEEP | Potato emoji |
| vegetables-18 | قرنبيط | قَرْنَبِيط | vegetables | 2 | STANDARD_MSA | KEEP | Broccoli emoji |
| vegetables-19 | بروكلي | بْرُوكُلِي | vegetables | 2 | LOANWORD_REVIEW | REPLACE | Initial sukuun |
| vegetables-20 | ذرة | ذُرَة | vegetables | 2 | STANDARD_MSA | KEEP | Duplicate food-39 |
| vegetables-21 | بازلاء | بَازِلَّاء | vegetables | 2 | STANDARD_MSA | KEEP | |
| vegetables-22 | فاصوليا | فَاصُولْيَا | vegetables | 2 | STANDARD_MSA | KEEP | |
| vegetables-23 | بامية | بَامْيَة | vegetables | 3 | STANDARD_MSA | KEEP | |
| vegetables-24 | كرفس | كَرَفْس | vegetables | 3 | STANDARD_MSA | KEEP | |
| vegetables-25 | قرع | قَرْع | vegetables | 2 | STANDARD_MSA | KEEP | |
| vegetables-26 | يقطين | يَقْطِين | vegetables | 3 | STANDARD_MSA | KEEP | Overlaps قرع |
| vegetables-27 | زنجبيل | زَنْجَبِيل | vegetables | 3 | STANDARD_MSA | MOVE_CATEGORY | Spice |
| vegetables-28 | كزبرة | كُزْبَرَة | vegetables | 3 | STANDARD_MSA | MOVE_CATEGORY | Herb |
| vegetables-29 | جرجير | جِرْجِير | vegetables | 3 | STANDARD_MSA | KEEP | Leafy; could be herb |
| vegetables-30 | بطاطا حلوة | بَطَاطَا حُلْوَة | vegetables | 2 | STANDARD_MSA | KEEP | |

## birds (35) — UI label is “طيور وحشرات”

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| birds-1 | عصفور | عُصْفُور | birds | 1 | STANDARD_MSA | KEEP | |
| birds-2 | حمامة | حَمَامَة | birds | 2 | STANDARD_MSA | KEEP | |
| birds-3 | ببغاء | بَبَّغَاء | birds | 2 | STANDARD_MSA | KEEP | |
| birds-4 | نسر | نَسْر | birds | 2 | STANDARD_MSA | KEEP | |
| birds-5 | صقر | صَقْر | birds | 2 | STANDARD_MSA | KEEP | Same eagle emoji as نسر |
| birds-6 | بومة | بُومَة | birds | 2 | STANDARD_MSA | KEEP | |
| birds-7 | طاووس | طَاوُوس | birds | 2 | STANDARD_MSA | KEEP | |
| birds-8 | بجعة | بَجَعَة | birds | 3 | STANDARD_MSA | KEEP | Swan emoji shared with إوزة |
| birds-9 | نعامة | نَعَامَة | birds | 2 | STANDARD_MSA | KEEP | Feather emoji |
| birds-10 | غراب | غُرَاب | birds | 2 | STANDARD_MSA | KEEP | |
| birds-11 | ديك | دِيك | birds | 1 | STANDARD_MSA | KEEP | |
| birds-12 | دجاجة | دَجَاجَة | birds | 1 | STANDARD_MSA | KEEP | |
| birds-13 | كتكوت | كَتْكُوت | birds | 1 | ACCEPTABLE_MSA | HUMAN_REVIEW | Child-friendly |
| birds-14 | بطة | بَطَّة | birds | 1 | STANDARD_MSA | KEEP | |
| birds-15 | إوزة | إِوَزَّة | birds | 2 | STANDARD_MSA | KEEP | |
| birds-16 | فلامنغو | فَلَامِنْغُو | birds | 3 | LOANWORD_ACCEPTED | KEEP_ADVANCED | Loan |
| birds-17 | بطريق | بَطْرِيق | birds | 2 | STANDARD_MSA | KEEP | |
| birds-18 | طائر طنان | طَائِرٌ طَنَّان | birds | 3 | STANDARD_MSA | REPLACE | Awkward phrase |
| birds-19 | لقلق | لَقْلَق | birds | 3 | STANDARD_MSA | KEEP | |
| birds-20 | سنونو | سُنُونُو | birds | 3 | STANDARD_MSA | KEEP | |
| birds-21 | نحلة | نَحْلَة | birds | 1 | STANDARD_MSA | KEEP | Insect |
| birds-22 | فراشة | فَرَاشَة | birds | 1 | STANDARD_MSA | KEEP | Insect |
| birds-23 | نملة | نَمْلَة | birds | 1 | STANDARD_MSA | KEEP | Insect |
| birds-24 | صرصور | صُرْصُور | birds | 2 | STANDARD_MSA | KEEP | Insect |
| birds-25 | جندب | جُنْدُب | birds | 2 | STANDARD_MSA | KEEP | Insect |
| birds-26 | عنكبوت | عَنْكَبُوت | birds | 2 | STANDARD_MSA | MOVE_CATEGORY | Arachnid |
| birds-27 | ذبابة | ذُبَابَة | birds | 2 | STANDARD_MSA | KEEP | Insect |
| birds-28 | بعوضة | بَعُوضَة | birds | 2 | STANDARD_MSA | KEEP | Insect |
| birds-29 | خنفساء | خُنْفَسَاء | birds | 2 | STANDARD_MSA | KEEP | Insect |
| birds-30 | دودة | دُودَة | birds | 2 | STANDARD_MSA | KEEP | |
| birds-31 | يرقة | يَرَقَة | birds | 3 | STANDARD_MSA | KEEP | Near دودة |
| birds-32 | عقرب | عَقْرَب | birds | 3 | STANDARD_MSA | MOVE_CATEGORY | Arachnid; scary |
| birds-33 | حلزون | حَلَزُون | birds | 2 | STANDARD_MSA | MOVE_CATEGORY | Snail |
| birds-34 | دعسوقة | دَعْسُوقَة | birds | 2 | STANDARD_MSA | KEEP | Good MSA ladybug |
| birds-35 | يعسوب | يَعْسُوب | birds | 3 | STANDARD_MSA | KEEP | Fly emoji; dragonfly |

## sea (25)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sea-1 | بحر | بَحْر | sea | 1 | STANDARD_MSA | KEEP | |
| sea-2 | موجة | مَوْجَة | sea | 2 | STANDARD_MSA | KEEP | |
| sea-3 | سمكة | سَمَكَة | sea | 1 | STANDARD_MSA | KEEP | |
| sea-4 | سمكة ملونة | سَمَكَةٌ مُلَوَّنَة | sea | 3 | STANDARD_MSA | KEEP | Phrase; near سمكة |
| sea-5 | حوت | حُوت | sea | 2 | STANDARD_MSA | KEEP | |
| sea-6 | دلفين | دُلْفِين | sea | 2 | LOANWORD_ACCEPTED | KEEP | |
| sea-7 | قرش | قِرْش | sea | 2 | STANDARD_MSA | KEEP | Also “piastre” |
| sea-8 | أخطبوط | أُخْطُبُوط | sea | 2 | STANDARD_MSA | KEEP | |
| sea-9 | حبار البحر | حَبَّارُ البَحْر | sea | 3 | STANDARD_MSA | KEEP | Squid |
| sea-10 | سرطان | سَرَطَان | sea | 3 | STANDARD_MSA | KEEP | Also “cancer”; prefer سرطان البحر |
| sea-11 | جمبري | جَمْبَرِي | sea | 3 | LOANWORD_REVIEW | HUMAN_REVIEW | Common loan vs إربيان |
| sea-12 | نجم البحر | نَجْمُ البَحْر | sea | 2 | STANDARD_MSA | KEEP | Star emoji = sky star |
| sea-13 | قندس البحر | قُنْدُسُ البَحْر | sea | 4 | NONSTANDARD | REPLACE | Wrong: beaver, not otter |
| sea-14 | فقمة | فَقْمَة | sea | 3 | STANDARD_MSA | KEEP | |
| sea-15 | محارة | مَحَارَة | sea | 3 | STANDARD_MSA | KEEP | Near صدفة |
| sea-16 | صدفة | صَدَفَة | sea | 2 | STANDARD_MSA | KEEP | |
| sea-17 | لؤلؤة | لُؤْلُؤَة | sea | 3 | STANDARD_MSA | KEEP | Bubbles emoji |
| sea-18 | مرجان | مَرْجَان | sea | 3 | STANDARD_MSA | KEEP | |
| sea-19 | طحلب | طُحْلُب | sea | 4 | STANDARD_MSA | KEEP | Enrichment |
| sea-20 | شراع | شِرَاع | sea | 3 | STANDARD_MSA | MOVE_CATEGORY | Equipment |
| sea-21 | مرساة | مِرْسَاة | sea | 3 | STANDARD_MSA | MOVE_CATEGORY | Equipment |
| sea-22 | غواص | غَوَّاص | sea | 3 | STANDARD_MSA | MOVE_CATEGORY | Person / job |
| sea-23 | زعانف | زَعَانِف | sea | 3 | STANDARD_MSA | KEEP | Plural |
| sea-24 | شاطئ رملي | شَاطِئٌ رَمْلِيّ | sea | 3 | STANDARD_MSA | KEEP | Near nature شاطئ |
| sea-25 | منارة | مَنَارَة | sea | 3 | STANDARD_MSA | KEEP | Tower emoji; place not creature |

## sky (20)

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sky-1 | شمس | شَمْس | sky | 1 | STANDARD_MSA | KEEP | |
| sky-2 | قمر | قَمَر | sky | 1 | STANDARD_MSA | KEEP | |
| sky-3 | نجمة | نَجْمَة | sky | 1 | STANDARD_MSA | KEEP | Duplicate school-38 |
| sky-4 | سماء | سَمَاء | sky | 1 | STANDARD_MSA | KEEP | |
| sky-5 | كوكب | كَوْكَب | sky | 2 | STANDARD_MSA | KEEP | |
| sky-6 | أرض | أَرْض | sky | 2 | STANDARD_MSA | KEEP | Earth/ground/floor |
| sky-7 | فضاء | فَضَاء | sky | 3 | STANDARD_MSA | KEEP | |
| sky-8 | مجرة | مَجَرَّة | sky | 4 | STANDARD_MSA | KEEP_ADVANCED | Too abstract for 4–8 beginner |
| sky-9 | شهاب | شِهَاب | sky | 4 | STANDARD_MSA | KEEP_ADVANCED | Specialized; same emoji as comet |
| sky-10 | مذنب | مُذَنَّب | sky | 4 | STANDARD_MSA | KEEP_ADVANCED | Specialized |
| sky-11 | هلال | هِلَال | sky | 2 | STANDARD_MSA | KEEP | |
| sky-12 | بدر | بَدْر | sky | 2 | STANDARD_MSA | KEEP | |
| sky-13 | كسوف | كُسُوف | sky | 4 | STANDARD_MSA | KEEP_ADVANCED | Specialized |
| sky-14 | شروق | شُرُوق | sky | 2 | STANDARD_MSA | KEEP | |
| sky-15 | غروب | غُرُوب | sky | 2 | STANDARD_MSA | KEEP | |
| sky-16 | نهار | نَهَار | sky | 2 | STANDARD_MSA | KEEP | |
| sky-17 | ليل | لَيْل | sky | 1 | STANDARD_MSA | KEEP | |
| sky-18 | فجر | فَجْر | sky | 2 | STANDARD_MSA | KEEP | |
| sky-19 | ظل | ظِلّ | sky | 2 | STANDARD_MSA | KEEP | |
| sky-20 | ضوء | ضَوْء | sky | 2 | STANDARD_MSA | KEEP | Not specifically sky |

## verbs (50)

All are 3rd-person masculine imperfect — a coherent citation choice, but feminine and “I/you” forms are absent.

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| verbs-1 | يأكل | يَأْكُل | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-2 | يشرب | يَشْرَب | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-3 | ينام | يَنَام | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-4 | يستيقظ | يَسْتَيْقِظ | verbs | 2 | STANDARD_MSA | KEEP | Form X |
| verbs-5 | يلعب | يَلْعَب | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-6 | يجري | يَجْرِي | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-7 | يمشي | يَمْشِي | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-8 | يقفز | يَقْفِز | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-9 | يجلس | يَجْلِس | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-10 | يقف | يَقِف | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-11 | يقرأ | يَقْرَأ | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-12 | يكتب | يَكْتُب | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-13 | يرسم | يَرْسُم | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-14 | يغني | يُغَنِّي | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-15 | يرقص | يَرْقُص | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-16 | يضحك | يَضْحَك | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-17 | يبكي | يَبْكِي | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-18 | يبتسم | يَبْتَسِم | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-19 | يتكلم | يَتَكَلَّم | verbs | 1 | STANDARD_MSA | KEEP | Form V |
| verbs-20 | يسمع | يَسْمَع | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-21 | ينظر | يَنْظُر | verbs | 2 | STANDARD_MSA | KEEP | “Look”; missing يرى “see” |
| verbs-22 | يشم | يَشُمّ | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-23 | يلمس | يَلْمِس | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-24 | يفتح | يَفْتَح | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-25 | يغلق | يُغْلِق | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-26 | يساعد | يُسَاعِد | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-27 | يشكر | يَشْكُر | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-28 | يصلي | يُصَلِّي | verbs | 1 | STANDARD_MSA | KEEP | Culturally essential |
| verbs-29 | يغسل | يَغْسِل | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-30 | يلبس | يَلْبَس | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-31 | يطبخ | يَطْبُخ | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-32 | ينظف | يُنَظِّف | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-33 | يزرع | يَزْرَع | verbs | 3 | STANDARD_MSA | KEEP | |
| verbs-34 | يسقي | يَسْقِي | verbs | 3 | STANDARD_MSA | KEEP | |
| verbs-35 | يبني | يَبْنِي | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-36 | يشتري | يَشْتَرِي | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-37 | يعطي | يُعْطِي | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-38 | يأخذ | يَأْخُذ | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-39 | يحمل | يَحْمِل | verbs | 2 | STANDARD_MSA | KEEP | Homograph risk with حمل “lamb” in undiacritized lists |
| verbs-40 | يرمي | يَرْمِي | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-41 | يصعد | يَصْعَد | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-42 | ينزل | يَنْزِل | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-43 | يطير | يَطِير | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-44 | يسبح | يَسْبَح | verbs | 1 | STANDARD_MSA | KEEP | |
| verbs-45 | يركب | يَرْكَب | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-46 | يبحث | يَبْحَث | verbs | 3 | STANDARD_MSA | KEEP | |
| verbs-47 | يجد | يَجِد | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-48 | يفكر | يُفَكِّر | verbs | 3 | STANDARD_MSA | KEEP | |
| verbs-49 | يتعلم | يَتَعَلَّم | verbs | 2 | STANDARD_MSA | KEEP | |
| verbs-50 | يحب | يُحِبّ | verbs | 1 | STANDARD_MSA | KEEP | |

## adjectives (45)

All masculine singular. No feminine, dual, or plural.

| ID | Word | Diacritized | Category | Proposed Level | MSA Status | Curriculum Action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| adjectives-1 | كبير | كَبِير | adjectives | 1 | STANDARD_MSA | KEEP | Elephant emoji clashes with animals |
| adjectives-2 | صغير | صَغِير | adjectives | 1 | STANDARD_MSA | KEEP | |
| adjectives-3 | طويل | طَوِيل | adjectives | 1 | STANDARD_MSA | KEEP | |
| adjectives-4 | قصير | قَصِير | adjectives | 1 | STANDARD_MSA | KEEP | Rabbit as “short” is opaque |
| adjectives-5 | سريع | سَرِيع | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-6 | بطيء | بَطِيء | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-7 | قوي | قَوِيّ | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-8 | ضعيف | ضَعِيف | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-9 | جميل | جَمِيل | adjectives | 1 | STANDARD_MSA | KEEP | |
| adjectives-10 | نظيف | نَظِيف | adjectives | 1 | STANDARD_MSA | KEEP | |
| adjectives-11 | متسخ | مُتَّسِخ | adjectives | 2 | STANDARD_MSA | KEEP | Broom emoji |
| adjectives-12 | جديد | جَدِيد | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-13 | قديم | قَدِيم | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-14 | سعيد | سَعِيد | adjectives | 1 | STANDARD_MSA | KEEP | |
| adjectives-15 | حزين | حَزِين | adjectives | 1 | STANDARD_MSA | KEEP | |
| adjectives-16 | غاضب | غَاضِب | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-17 | خائف | خَائِف | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-18 | هادئ | هَادِئ | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-19 | متعب | مُتْعَب | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-20 | نشيط | نَشِيط | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-21 | حار | حَارّ | adjectives | 1 | STANDARD_MSA | KEEP | Hot, not “spicy” only |
| adjectives-22 | بارد | بَارِد | adjectives | 1 | STANDARD_MSA | KEEP | |
| adjectives-23 | دافئ | دَافِئ | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-24 | رطب | رَطْب | adjectives | 3 | UNCERTAIN | HUMAN_REVIEW | Also “ripe date”; weak for “wet” |
| adjectives-25 | جاف | جَافّ | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-26 | حلو | حُلْو | adjectives | 1 | STANDARD_MSA | KEEP | |
| adjectives-27 | مالح | مَالِح | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-28 | حامض | حَامِض | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-29 | مر | مُرّ | adjectives | 2 | STANDARD_MSA | KEEP | Coffee emoji |
| adjectives-30 | لذيذ | لَذِيذ | adjectives | 1 | STANDARD_MSA | KEEP | |
| adjectives-31 | ثقيل | ثَقِيل | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-32 | خفيف | خَفِيف | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-33 | ممتلئ | مُمْتَلِئ | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-34 | فارغ | فَارِغ | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-35 | مفتوح | مَفْتُوح | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-36 | مغلق | مُغْلَق | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-37 | عال | عَالٍ | adjectives | 3 | STANDARD_MSA | KEEP | Defective + tanween |
| adjectives-38 | منخفض | مُنْخَفِض | adjectives | 3 | STANDARD_MSA | KEEP | Hole emoji |
| adjectives-39 | قريب | قَرِيب | adjectives | 2 | STANDARD_MSA | KEEP | Homograph with family-37 |
| adjectives-40 | بعيد | بَعِيد | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-41 | سهل | سَهْل | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-42 | صعب | صَعْب | adjectives | 2 | STANDARD_MSA | KEEP | |
| adjectives-43 | مضيء | مُضِيء | adjectives | 3 | STANDARD_MSA | KEEP | |
| adjectives-44 | مظلم | مُظْلِم | adjectives | 3 | STANDARD_MSA | KEEP | |
| adjectives-45 | لطيف | لَطِيف | adjectives | 2 | STANDARD_MSA | KEEP | |

---

## Status totals (from §11)

Every one of the 720 rows has an MSA status and a curriculum action. **DIALECTAL = 0** in the full table: no lemma was confidently tagged as dialect-only. Borderline items are listed in the MSA Review as candidates (`HUMAN_REVIEW`, `LOANWORD_REVIEW`, `ACCEPTABLE_MSA`).

### MSA status

| MSA Status | Count |
| --- | ---: |
| STANDARD_MSA | 653 |
| ACCEPTABLE_MSA | 5 |
| REGIONAL_STANDARD | 9 |
| DIALECTAL | 0 |
| LOANWORD_ACCEPTED | 37 |
| LOANWORD_REVIEW | 7 |
| NONSTANDARD | 6 |
| UNCERTAIN | 3 |
| **Total** | **720** |

### Curriculum action

| Curriculum Action | Count |
| --- | ---: |
| KEEP | 623 |
| KEEP_ADVANCED | 46 |
| MOVE_CATEGORY | 25 |
| REPLACE | 10 |
| REMOVE | 2 |
| HUMAN_REVIEW | 14 |
| **Total** | **720** |

### Proposed level (teaching order, not deletion)

| Level | Count |
| --- | ---: |
| 1 Foundation | 177 |
| 2 Everyday | 342 |
| 3 Expanded | 173 |
| 4 Enrichment | 28 |
| **Total** | **720** |

---

# 12. Final Summary

## 1. Top 20 highest-priority corrections

1. `ظَرِيف` — wrong lexeme (witty ≠ hamster) → **REMOVE**
2. `كَاكَا` — child-speech/taboo homophone → **REMOVE**
3. `أُورَانْغ` — truncated → **REPLACE** أُورَانْغُوتَان
4. `قُنْدُسُ البَحْر` — beaver, not otter → **REPLACE** قَضَّاعَة
5. `مِثَلَّجَات` → `مُثَلَّجَات` (HIGH)
6. `فِطْر` (mushroom) → `فُطْر` (HIGH)
7. `كْرُوَاسَان` → `كُرْوَاسَان` (initial sukuun)
8. `بْرُوكُلِي` → `بُرُوكْلِي` (initial sukuun)
9. `نَبَاتٌ صَغِير` → `نَبْتَة` / `شَتْلَة`
10. `طَائِرٌ طَنَّان` → clearer hummingbird lemma
11. `مَعْجُون` → `مَعْجُونُ أَسْنَان`
12. `زَوْج` in numbers → replace with `أَرْبَعُون` (keep husband in family)
13. Add **بِنْت** (everyday girl)
14. Add **وَلَد** (everyday boy)
15. `لَبَن` — regional meaning split; disambiguate vs حليب
16. `سُكَّر` emoji is salt (illustration, not lemma)
17. `بُرْغُل` hamburger emoji (illustration)
18. `رَأْس` brain emoji; `طَاوِلَة` chair emoji
19. `تِين` olive emoji
20. Exact duplicates `تمر` / `ذرة` / `معلم` — one lemma, shared across categories

## 2. Top 30 missing foundational words

بِنْت، وَلَد، قِطَّة، صَبَاح، مَسَاء، يَوْم، أُسْبُوع، شَهْر، سَنَة، أَمْس، غَدًا، مَسْجِد، سُوق، مُسْتَشْفَى، مَطْعَم، مَدِينَة، لُعْبَة، كُرَة، دُمْيَة، فَطُور، غَدَاء، عَشَاء، جَوْعَان، عَطْشَان، مَرِيض، يَذْهَب، يَأْتِي، يَرَى، يَقُول، يُرِيد

## 3. Entries requiring human linguistic verification

From the 720-row table (`HUMAN_REVIEW`): أَرُزّ vocalization; بِسْكُوِيت; فُشَار; لَبَن; جَوْز (walnut vs regional “nuts/coconut”); سَلَف; حَبِيب; كَنْزَة; عَيْن مَاء iḍāfa; يُوسُفِي shadda; بَطَاطَا vs بَطَاطِس; كَتْكُوت; جَمْبَرِي vs إِرْبِيَان; رَطْب.

Plus LOW-confidence diacritics: هَامْسْتَر, أُخْطُبُوط, كَرَمْبُولَا.

## 4. Recommended Level 1 target size

**120–150 words** for the first teaching tier (not the whole app). The current set already contains about 177 items scored Level 1; trim that list by postponing weaker L1s (some loans, extra body parts) and **insert** بنت/ولد/time/toys/places into the 120–150.

## 5. Recommended total vocabulary strategy for Levels 1–4

- **Do not shrink the app to ~100 words.** 720 is a viable catalog if ordered.
- **Level 1 (120–150):** core MSA children can reuse in sentences.
- **Level 2 (150–200 more):** school, clothes, everyday food, colors, daily verbs.
- **Level 3:** jobs, transport, nature detail, **valid regional MSA** (كسكس, منسف, فلافل) after universals.
- **Level 4:** zoo exotics, astronomy, in-laws, rare fruit — stay in the app as enrichment.
- **Grow toward 750–1000+** by adding missing universal domains (time, places, toys, high-frequency verbs), not by deleting valid MSA.
- **REMOVE only 2** current lemmas (ظريف, كاكا). **REPLACE 10** forms. Everything else is KEEP, KEEP_ADVANCED, MOVE_CATEGORY, or HUMAN_REVIEW.

**كسكس:** valid MSA name for a Maghreb staple → `REGIONAL_STANDARD` / `KEEP_ADVANCED` (L3). Not dialect. Not a beginner-first slot ahead of خبز/ماء/حليب.

---

*End of audit. Dataset files were not modified. Only `docs/word-curriculum-audit.md` changed.*
