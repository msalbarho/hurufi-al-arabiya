# Technical filename transliteration

Used only when a 720-word row has no Band A slug. Output is a basename, not a linguistic transcription.

## Consonants (letters.ts short forms)

| Arabic | Basename letters |
| --- | --- |
| ا أ إ آ ء | vowel / madd only (no `alif` in the middle of a word slug) |
| ب | b |
| ت | t |
| ث | th |
| ج | j |
| ح | h |
| خ | kh |
| د | d |
| ذ | dh |
| ر | r |
| ز | z |
| س | s |
| ش | sh |
| ص | s |
| ض | d |
| ط | t |
| ظ | z |
| ع | (omit; keep the haraka vowel, `aa` if it follows `a`) |
| غ | gh |
| ف | f |
| ق | q |
| ك | k |
| ل | l |
| م | m |
| ن | n |
| ه | h |
| و | w (or madd `u` after damma) |
| ي | y (or madd `i` after kasra) |
| ة ى | a |
| ؤ | w + vowel |
| ئ | y + vowel |
| ال (word-initial after space or start) | al |

## Vowels

| Mark | Latin |
| --- | --- |
| fatha / tanween fatha | a |
| kasra / tanween kasra | i |
| damma / tanween damma | u |
| sukun | (none) |
| shadda | double the consonant |

Diacritics never appear in filenames.

## Collisions

If two **different** undiacritized lemmas slug to the same basename, the later lemma in `CATEGORIES` order gets `_2`, `_3`, … That assignment is frozen in `audio-naming-contract.csv`.
