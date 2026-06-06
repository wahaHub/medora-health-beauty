import { describe, expect, it } from 'vitest';

import { translations, type LanguageCode } from '@/i18n/translations';

const hairTranslationKeys = [
  'exploreHair',
  'categoryHair',
  'categoryHairSubtitle',
  'categoryHairDescription',
  'categoryHairItem1',
  'categoryHairItem2',
  'categoryHairItem3',
  'categoryHairItem4',
] as const;

describe('Hair category translations', () => {
  it('defines visible Hair section copy for every supported language', () => {
    for (const [language, dictionary] of Object.entries(translations) as Array<[LanguageCode, typeof translations.en]>) {
      for (const key of hairTranslationKeys) {
        expect(dictionary[key], `${language}.${key}`).toBeTruthy();
        expect(dictionary[key], `${language}.${key}`).not.toBe(key);
      }
    }
  });
});
